const express = require("express");
const router = express.Router();
const Material = require("../models/material");

console.log("Material Routes Loaded");

// Get material history (Placed at top to avoid conflicts)
router.get("/material-history/:materialId", async (req, res) => {
  const { materialId } = req.params;

  try {
    const material = await Material.findById(materialId, "name category updateHistory");

    if (!material) {
      return res.json({
        status: false,
        message: "Material not found"
      });
    }

    // Sort history by newest first
    const history = material.updateHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      status: true,
      data: history
    });

  } catch (error) {
    console.error("Error fetching material history:", error);
    res.json({
      status: false,
      message: "Error fetching material history",
      error
    });
  }
});

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
  const { projectId, name, category, quantity, price, usedQuantity } = req.body;

  try {
    const material = await Material.create({
      projectId,
      name,
      category,
      quantity,
      price,
      usedQuantity: usedQuantity || 0
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
// Update material
router.put("/update-material/:materialId", async (req, res) => {
  const { materialId } = req.params;
  const { name, category, quantity, price, addedQuantity, unitPriceAtPurchase } = req.body;

  try {
    const existingMaterial = await Material.findById(materialId);

    if (!existingMaterial) {
      return res.json({
        status: false,
        message: "Material not found"
      });
    }

    let remark = "";
    let finalQuantity = quantity;
    let finalPrice = price;
    let historyEntry = {};

    // Check if this is an "Add Stock" operation
    if (addedQuantity !== undefined && addedQuantity !== null) {
      const addedQty = parseFloat(addedQuantity);
      const purchasePrice = parseFloat(unitPriceAtPurchase || 0); // Default to 0 if not provided, or handle error

      // Calculate new values
      const oldTotalValue = existingMaterial.quantity * existingMaterial.price;
      const newStockValue = addedQty * purchasePrice;
      const totalValue = oldTotalValue + newStockValue;

      finalQuantity = existingMaterial.quantity + addedQty;
      finalPrice = finalQuantity > 0 ? totalValue / finalQuantity : 0; // Avoid NaN

      remark = `Added ${addedQty} units @ ${purchasePrice}/unit. Total extra cost: ${newStockValue}. New Avg Price: ${finalPrice.toFixed(2)}`;

      historyEntry = {
        date: new Date(),
        remark,
        previousQuantity: existingMaterial.quantity,
        newQuantity: finalQuantity,
        previousPrice: existingMaterial.price,
        newPrice: finalPrice,
        addedQuantity: addedQty,
        unitPriceAtPurchase: purchasePrice,
        totalPurchaseCost: newStockValue
      };
    } else {
      // Standard Update (Directly setting quantity/price)
      finalQuantity = quantity !== undefined ? parseFloat(quantity) : existingMaterial.quantity;
      finalPrice = price !== undefined ? parseFloat(price) : existingMaterial.price;

      if (existingMaterial.quantity !== finalQuantity) {
        const diff = finalQuantity - existingMaterial.quantity;
        remark += `Quantity changed from ${existingMaterial.quantity} to ${finalQuantity} (${diff > 0 ? "+" : ""}${diff}). `;
      }
      if (existingMaterial.price !== finalPrice) {
        const diff = finalPrice - existingMaterial.price;
        remark += `Price changed from ${existingMaterial.price} to ${finalPrice} (${diff > 0 ? "+" : ""}${diff}). `;
      }

      // Calculate extra cost added (value difference)
      const oldTotal = existingMaterial.quantity * existingMaterial.price;
      const newTotal = finalQuantity * finalPrice;
      const costDiff = newTotal - oldTotal;

      if (costDiff !== 0) {
        remark += `Total value change: ${costDiff > 0 ? "+" : ""}${costDiff}.`;
      }

      historyEntry = {
        date: new Date(),
        remark,
        previousQuantity: existingMaterial.quantity,
        newQuantity: finalQuantity,
        previousPrice: existingMaterial.price,
        newPrice: finalPrice
      };
    }

    const updateData = {
      name: name || existingMaterial.name, // Keep existing name if not provided
      category: category || existingMaterial.category, // Keep existing category if not provided
      quantity: finalQuantity,
      price: finalPrice,
      lastUpdateRemark: remark
    };

    const updatedMaterial = await Material.findByIdAndUpdate(
      materialId,
      {
        $set: updateData,
        $push: { updateHistory: historyEntry }
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
    console.error("Error updating material:", error);
    res.json({
      status: false,
      message: "Error updating material",
      error
    });
  }
});

// Get material history
router.get("/material-history/:materialId", async (req, res) => {
  console.log("HIT material-history route with ID:", req.params.materialId);
  const { materialId } = req.params;

  try {
    const material = await Material.findById(materialId, "name category updateHistory");

    if (!material) {
      return res.json({
        status: false,
        message: "Material not found"
      });
    }

    // Sort history by newest first
    const history = material.updateHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      status: true,
      data: history
    });

  } catch (error) {
    console.error("Error fetching material history:", error);
    res.json({
      status: false,
      message: "Error fetching material history",
      error
    });
  }
});

// Log material usage
router.put("/log-usage/:materialId", async (req, res) => {
  const { materialId } = req.params;
  const { quantityUsed, date, remark } = req.body;

  try {
    const existingMaterial = await Material.findById(materialId);

    if (!existingMaterial) {
      return res.json({
        status: false,
        message: "Material not found"
      });
    }

    const usedQty = parseFloat(quantityUsed);
    if (isNaN(usedQty) || usedQty <= 0) {
      return res.json({
        status: false,
        message: "Invalid quantity"
      });
    }

    const newUsedQuantity = (existingMaterial.usedQuantity || 0) + usedQty;
    const usageRemark = remark || `Used ${usedQty} units.`;

    const historyEntry = {
      date: date ? new Date(date) : new Date(),
      remark: usageRemark,
      previousQuantity: existingMaterial.quantity,
      newQuantity: existingMaterial.quantity, // Total quantity doesn't change here
      previousPrice: existingMaterial.price,
      newPrice: existingMaterial.price
    };

    const updatedMaterial = await Material.findByIdAndUpdate(
      materialId,
      {
        $set: {
          usedQuantity: newUsedQuantity,
          lastUpdateRemark: usageRemark
        },
        $push: { updateHistory: historyEntry }
      },
      { new: true }
    );

    res.json({
      status: true,
      message: "Material usage logged successfully",
      material: updatedMaterial
    });

  } catch (error) {
    console.error("Error logging material usage:", error);
    res.json({
      status: false,
      message: "Error logging material usage",
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
