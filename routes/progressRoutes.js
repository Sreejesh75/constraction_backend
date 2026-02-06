const express = require("express");
const router = express.Router();
const ConstructionProgress = require("../models/constructionProgress");
const Project = require("../models/project");

// Add or Update Construction Progress
router.post("/progress/add", async (req, res) => {
    try {
        const { projectId, section, progress, status, startDate, endDate, remarks } =
            req.body;

        if (!projectId || !section) {
            return res
                .status(400)
                .json({ message: "Project ID and Section are required" });
        }

        // Check if progress for this section already exists
        let constructionProgress = await ConstructionProgress.findOne({
            projectId,
            section,
        });

        if (constructionProgress) {
            // Update existing record
            constructionProgress.progress = progress;
            constructionProgress.status = status;
            constructionProgress.startDate = startDate;
            constructionProgress.endDate = endDate;
            constructionProgress.remarks = remarks;
            await constructionProgress.save();
            return res.status(200).json({
                message: "Progress updated successfully",
                data: constructionProgress,
            });
        } else {
            // Create new record
            constructionProgress = new ConstructionProgress({
                projectId,
                section,
                progress,
                status,
                startDate,
                endDate,
                remarks,
            });
            await constructionProgress.save();
            return res.status(201).json({
                message: "Progress added successfully",
                data: constructionProgress,
            });
        }
    } catch (error) {
        console.error("Error adding progress:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Get Progress for a Project
router.get("/progress/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const progressData = await ConstructionProgress.find({ projectId });

        if (!progressData) {
            return res
                .status(404)
                .json({ message: "No progress found for this project" });
        }

        res.status(200).json(progressData);
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
