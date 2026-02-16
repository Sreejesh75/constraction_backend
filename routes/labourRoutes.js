const express = require("express");
const router = express.Router();
const Labour = require("../models/labour");

// Add a new labour record (Contract or Daily)
router.post("/add", async (req, res) => {
    try {
        const { projectId, mode, contractDetails, dailyLabourDetails, date } = req.body;

        if (!projectId || !mode) {
            return res.status(400).json({ error: "Project ID and Mode are required" });
        }

        let newLabour;

        if (mode === "contract") {
            if (!contractDetails || !contractDetails.contractorName || contractDetails.paidAmount == null) {
                return res.status(400).json({ error: "Missing contract details" });
            }
            newLabour = new Labour({
                projectId,
                mode,
                date: date || Date.now(),
                contractDetails,
            });
        } else if (mode === "daily") {
            if (!dailyLabourDetails || !dailyLabourDetails.labourers || dailyLabourDetails.labourers.length === 0) {
                return res.status(400).json({ error: "Missing daily labour details" });
            }

            // Calculate total amount if not provided
            let total = dailyLabourDetails.totalAmount;
            if (total == null) {
                total = dailyLabourDetails.labourers.reduce((sum, labour) => sum + (labour.wage || 0), 0);
            }

            newLabour = new Labour({
                projectId,
                mode,
                date: date || Date.now(),
                dailyLabourDetails: {
                    ...dailyLabourDetails,
                    totalAmount: total
                },
            });
        } else {
            return res.status(400).json({ error: "Invalid mode. Must be 'contract' or 'daily'" });
        }

        await newLabour.save();
        res.status(201).json({ message: "Labour record added successfully", data: newLabour });

    } catch (error) {
        console.error("Error adding labour record:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all labour records for a project
router.get("/project/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const records = await Labour.find({ projectId }).sort({ date: -1 });
        res.status(200).json(records);
    } catch (error) {
        console.error("Error fetching labour records:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
