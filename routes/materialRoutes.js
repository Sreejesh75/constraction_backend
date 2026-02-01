const express = require("express");
const router = express.Router();
const Material = require("../models/material");
/**
 * @swagger
 * /api/add-material:
 *   post:
 *     summary: Add a material to a project
 *     tags: [Material]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - name
 *             properties:
 *               projectId:
 *                 type: string
 *                 example: 65b1a8f2d91abc456789abcd
 *               name:
 *                 type: string
 *                 example: Cement
 *               quantity:
 *                 type: number
 *                 example: 20
 *               price:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Material added successfully
 */

// Add material
/**
 * @swagger
 * /api/materials/{projectId}:
 *   get:
 *     summary: Get all materials of a project
 *     tags: [Material]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65b1a8f2d91abc456789abcd
 *     responses:
 *       200:
 *         description: List of materials
 */
/**
 * @swagger
 * /api/update-material/{materialId}:
 *   put:
 *     summary: Update material details
 *     tags: [Material]
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65c2b9d3e91abc456789abcd
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cement Bags
 *               quantity:
 *                 type: number
 *                 example: 25
 *               price:
 *                 type: number
 *                 example: 520
 *     responses:
 *       200:
 *         description: Material updated successfully
 */
/**
 * @swagger
 * /api/delete-material/{materialId}:
 *   delete:
 *     summary: Delete a material
 *     tags: [Material]
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65c2b9d3e91abc456789abcd
 *     responses:
 *       200:
 *         description: Material deleted successfully
 */


router.post("/add-material", async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  const { projectId, name, category, quantity, price } = req.body;

  try {
    const material = await Material.create({
      projectId,
      name,
      category,
      quantity,
      price
    });

    res.json({
      status: true,
      message: "Material added successfully",
      materialId: material._id
    });

  } catch (error) {
    res.json({ status: false, message: "Error adding material", error });
  }
});

// Get materials for a project
router.get("/materials/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const materials = await Material.find({ projectId }).sort({ date: -1 });

    res.json({
      status: true,
      materials
    });

  } catch (error) {
    res.json({ status: false, message: "Error fetching materials", error });
  }
});

// Update material
router.put("/update-material/:materialId", async (req, res) => {
  const { materialId } = req.params;
  const { name, category, quantity, price } = req.body;

  try {
    const updatedMaterial = await Material.findByIdAndUpdate(
      materialId,
      {
        name,
        category,
        quantity,
        price
      },
      { new: true } // return updated document
    );

    if (!updatedMaterial) {
      return res.json({
        status: false,
        message: "Material not found"
      });
    }

    res.json({
      status: true,
      message: "Material updated successfully",
      material: updatedMaterial
    });

  } catch (error) {
    res.json({
      status: false,
      message: "Error updating material",
      error
    });
  }
});

// Delete material
router.delete("/delete-material/:materialId", async (req, res) => {
  const { materialId } = req.params;

  try {
    const deletedMaterial = await Material.findByIdAndDelete(materialId);

    if (!deletedMaterial) {
      return res.json({ status: false, message: "Material not found" });
    }

    res.json({
      status: true,
      message: "Material deleted successfully"
    });

  } catch (error) {
    res.json({
      status: false,
      message: "Error deleting material",
      error
    });
  }
});



module.exports = router;
