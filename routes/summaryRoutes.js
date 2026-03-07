const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const Material = require("../models/material");
/**
 * @swagger
 * /api/project-summary/{projectId}:
 *   get:
 *     summary: Get project budget summary and statistics
 *     description: Returns budget, total spent, remaining budget, material count, and project duration
 *     tags: [Summary]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65b1a8f2d91abc456789abcd
 *     responses:
 *       200:
 *         description: Project summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 projectName:
 *                   type: string
 *                   example: House Construction
 *                 budget:
 *                   type: number
 *                   example: 1000000
 *                 totalSpent:
 *                   type: number
 *                   example: 450000
 *                 remainingBudget:
 *                   type: number
 *                   example: 550000
 *                 materialsCount:
 *                   type: number
 *                   example: 12
 *                 startDate:
 *                   type: string
 *                   example: 2025-01-01
 *                 endDate:
 *                   type: string
 *                   example: 2025-06-01
 */


router.get("/project-summary/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    // 1. Get project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ status: false, message: "Project not found" });
    }

    // 2. Get materials for this project
    const materials = await Material.find({ projectId });

    // 3. Calculate totals
    let totalSpent = 0;
    materials.forEach((m) => {
      totalSpent += m.quantity * m.price;
    });

    let remainingBudget = project.budget - totalSpent;

    res.json({
      status: true,
      projectName: project.projectName,
      budget: project.budget,
      totalSpent,
      remainingBudget,
      materialsCount: materials.length,
      startDate: project.startDate,
      endDate: project.endDate,
    });

  } catch (error) {
    res.json({ status: false, message: "Error fetching summary", error });
  }
});

router.get("/daily-summary/:projectId", async (req, res) => {
  const { projectId } = req.params;
  let dateQuery = req.query.date ? new Date(req.query.date) : new Date();

  // Set start and end of the given date
  const startOfDay = new Date(dateQuery);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateQuery);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const Labour = require("../models/labour");
    const Equipment = require("../models/equipment");
    const EquipmentLog = require("../models/equipmentLog");

    // 1. Get today's Materials
    const materials = await Material.find({ projectId });
    let todayMaterials = [];
    materials.forEach((m) => {
      let dailyAdded = 0;
      let dailyUsed = 0;
      let dailyCost = 0;

      m.updateHistory.forEach(history => {
        const histDate = new Date(history.date);
        if (histDate >= startOfDay && histDate <= endOfDay) {
          if (history.addedQuantity > 0) {
            dailyAdded += history.addedQuantity;
            dailyCost += (history.totalPurchaseCost || 0);
          } else if (history.remark && history.remark.startsWith("Used")) {
            // we infer usage from remark (e.g., Used 10 units.)
            const match = history.remark.match(/Used ([\d.]+) units/);
            if (match) {
              dailyUsed += parseFloat(match[1]);
            }
          }
        }
      });
      if (dailyAdded > 0 || dailyUsed > 0) {
        todayMaterials.push({
          name: m.name,
          added: dailyAdded,
          used: dailyUsed,
          cost: dailyCost
        });
      }
    });

    // 2. Get today's Labour
    const labours = await Labour.find({
      projectId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    let totalLabourCost = 0;
    labours.forEach(l => {
      if (l.mode === "contract") {
        totalLabourCost += (l.contractDetails.paidAmount || 0);
      } else if (l.mode === "daily") {
        totalLabourCost += (l.dailyLabourDetails.totalAmount || 0);
      }
    });

    // 3. Get today's Equipment
    const equipments = await Equipment.find({ projectId });
    const equipmentIds = equipments.map(e => e._id);

    const equipmentLogs = await EquipmentLog.find({
      equipmentId: { $in: equipmentIds },
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate("equipmentId", "name");

    let totalEquipmentCost = 0;
    let equipmentUsage = [];

    equipmentLogs.forEach(log => {
      totalEquipmentCost += (log.totalCost || 0);
      equipmentUsage.push({
        name: log.equipmentId?.name || "Unknown",
        hoursUsed: log.hoursUsed,
        totalCost: log.totalCost
      });
    });

    res.json({
      status: true,
      date: startOfDay,
      materials: todayMaterials,
      labour: labours.map(l => ({
        mode: l.mode,
        cost: l.mode === "contract" ? l.contractDetails.paidAmount : l.dailyLabourDetails.totalAmount
      })),
      totalLabourCost,
      equipment: equipmentUsage,
      totalEquipmentCost,
      totalDailyCost: totalLabourCost + totalEquipmentCost + todayMaterials.reduce((sum, m) => sum + m.cost, 0)
    });

  } catch (error) {
    console.error("Error fetching daily summary:", error);
    res.json({ status: false, message: "Error fetching daily summary", error });
  }
});

module.exports = router;
