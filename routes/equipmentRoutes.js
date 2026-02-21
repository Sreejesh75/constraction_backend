const express = require("express");
const router = express.Router();
const Equipment = require("../models/equipment");
const EquipmentLog = require("../models/equipmentLog");

// Get all equipment for a project
router.get("/equipment/:projectId", async (req, res) => {
    const { projectId } = req.params;
    try {
        const equipmentList = await Equipment.find({ projectId }).sort({ createdAt: -1 });
        res.json({ status: true, data: equipmentList });
    } catch (error) {
        res.json({ status: false, message: "Error fetching equipment", error });
    }
});

// Add new equipment
router.post("/add-equipment", async (req, res) => {
    const { projectId, name, type, rentalRate, rentalUnit, fuelType, status } = req.body;
    try {
        const newEquipment = await Equipment.create({
            projectId,
            name,
            type,
            rentalRate,
            rentalUnit,
            fuelType,
            status: status || "Active"
        });
        res.json({ status: true, message: "Equipment added successfully", data: newEquipment });
    } catch (error) {
        res.json({ status: false, message: "Error adding equipment", error });
    }
});

// Update equipment
router.put("/update-equipment/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const updatedEquipment = await Equipment.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedEquipment) {
            return res.json({ status: false, message: "Equipment not found" });
        }
        res.json({ status: true, message: "Equipment updated successfully", data: updatedEquipment });
    } catch (error) {
        res.json({ status: false, message: "Error updating equipment", error });
    }
});

// Delete equipment
router.delete("/delete-equipment/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Delete associated logs as well
        await EquipmentLog.deleteMany({ equipmentId: id });
        const deletedEquipment = await Equipment.findByIdAndDelete(id);
        if (!deletedEquipment) {
            return res.json({ status: false, message: "Equipment not found" });
        }
        res.json({ status: true, message: "Equipment and associated logs deleted successfully" });
    } catch (error) {
        res.json({ status: false, message: "Error deleting equipment", error });
    }
});

// --- Equipment Logs ---

// Get logs for a specific equipment
router.get("/equipment-logs/:equipmentId", async (req, res) => {
    const { equipmentId } = req.params;
    try {
        const logs = await EquipmentLog.find({ equipmentId }).sort({ date: -1 });
        res.json({ status: true, data: logs });
    } catch (error) {
        res.json({ status: false, message: "Error fetching equipment logs", error });
    }
});

// Add equipment log
router.post("/add-equipment-log", async (req, res) => {
    const { equipmentId, date, hoursUsed, fuelConsumed, fuelCost, remarks } = req.body;

    try {
        // Determine rental cost based on equipment rate and unit
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.json({ status: false, message: "Equipment not found" });
        }

        let rentalCost = 0;
        const usedHrs = hoursUsed ? parseFloat(hoursUsed) : 0;
        if (equipment.rentalUnit === "Per Hour") {
            rentalCost = usedHrs * equipment.rentalRate;
        } else if (equipment.rentalUnit === "Per Day") {
            // If unit is Per Day, we might interpret hoursUsed as just hours, and charge a full day rate
            // or if they pass 'daysUsed' we could use that. Let's assume 1 entry = 1 day charge if rate is per day,
            // unless specified. For simplicity, we just add rentalRate if it's per day.
            rentalCost = equipment.rentalRate;
        } else if (equipment.rentalUnit === "Fixed") {
            rentalCost = 0; // Fixed rate might be charged once, not on every log. Or maybe they log monthly.
        }

        const totalCost = rentalCost + (fuelCost ? parseFloat(fuelCost) : 0);

        const newLog = await EquipmentLog.create({
            equipmentId,
            date: date || new Date(),
            hoursUsed: usedHrs,
            fuelConsumed: fuelConsumed ? parseFloat(fuelConsumed) : 0,
            fuelCost: fuelCost ? parseFloat(fuelCost) : 0,
            rentalCost,
            totalCost,
            remarks
        });

        res.json({ status: true, message: "Equipment log added successfully", data: newLog });
    } catch (error) {
        res.json({ status: false, message: "Error adding equipment log", error });
    }
});

// Delete equipment log
router.delete("/delete-equipment-log/:logId", async (req, res) => {
    const { logId } = req.params;
    try {
        const deletedLog = await EquipmentLog.findByIdAndDelete(logId);
        if (!deletedLog) {
            return res.json({ status: false, message: "Log not found" });
        }
        res.json({ status: true, message: "Equipment log deleted successfully" });
    } catch (error) {
        res.json({ status: false, message: "Error deleting equipment log", error });
    }
});

module.exports = router;
