const mongoose = require("mongoose");

const constructionProgressSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    section: {
        type: String,
        required: true, // e.g., "Foundation", "Painting"
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    status: {
        type: String,
        enum: ["Start", "In Progress", "Completed"],
        default: "Start",
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    remarks: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model(
    "ConstructionProgress",
    constructionProgressSchema
);
