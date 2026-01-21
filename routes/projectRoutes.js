const express = require("express");
const router = express.Router();
const Project = require("../models/project");
/**
 * @swagger
 * /api/create-project:
 *   post:
 *     summary: Create a new project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - projectName
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 65a3f9b2c1a123456789abcd
 *               projectName:
 *                 type: string
 *                 example: House Construction
 *               budget:
 *                 type: number
 *                 example: 2500000
 *               startDate:
 *                 type: string
 *                 example: 2026-01-10
 *               endDate:
 *                 type: string
 *                 example: 2026-12-31
 *     responses:
 *       200:
 *         description: Project created successfully
 */
/**
 * @swagger
 * /api/projects/{userId}:
 *   get:
 *     summary: Get all projects of a user
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65a3f9b2c1a123456789abcd
 *     responses:
 *       200:
 *         description: List of projects
 */
/**
 * @swagger
 * /api/update-project/{projectId}:
 *   put:
 *     summary: Update project details
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65b1a8f2d91abc456789abcd
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: Villa Construction
 *               budget:
 *                 type: number
 *                 example: 3000000
 *               startDate:
 *                 type: string
 *                 example: 2026-02-01
 *               endDate:
 *                 type: string
 *                 example: 2026-11-30
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
/**
 * @swagger
 * /api/delete-project/{projectId}:
 *   delete:
 *     summary: Delete a project and its materials
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65b1a8f2d91abc456789abcd
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */




router.post("/create-project", async (req, res) => {
  const { userId, projectName, budget, startDate, endDate } = req.body;

  try {
    const project = await Project.create({
      userId,
      projectName,
      budget,
      startDate,
      endDate
    });

    res.json({
      status: true,
      message: "Project created successfully",
      projectId: project._id
    });

  } catch (error) {
    res.json({ status: false, message: "Error", error });
  }
});

// Get all projects of a user
router.get("/projects/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    res.json({
      status: true,
      projects
    });

  } catch (error) {
    res.json({ status: false, message: "Error", error });
  }
});

// Update project
router.put("/update-project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const { projectName, budget, startDate, endDate } = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        projectName,
        budget,
        startDate,
        endDate
      },
      { new: true }  // return updated document
    );

    if (!updatedProject) {
      return res.json({ status: false, message: "Project not found" });
    }

    res.json({
      status: true,
      message: "Project updated successfully",
      project: updatedProject
    });

  } catch (error) {
    res.json({ status: false, message: "Error updating project", error });
  }
});

// Delete project + all materials
router.delete("/delete-project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const Material = require("../models/material");

  try {
    // Delete all materials belonging to this project
    await Material.deleteMany({ projectId });

    // Delete the project itself
    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.json({ status: false, message: "Project not found" });
    }

    res.json({
      status: true,
      message: "Project and related materials deleted successfully"
    });

  } catch (error) {
    res.json({ status: false, message: "Error deleting project", error });
  }
});



module.exports = router;
