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

module.exports = router;
