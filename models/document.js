const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Bill", "Plan", "Permit", "Contract", "Other"] // Define common categories, can be expanded
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Document", documentSchema);
