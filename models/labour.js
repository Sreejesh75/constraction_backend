const mongoose = require("mongoose");

const labourSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    mode: {
        type: String,
        enum: ["contract", "daily"],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // Fields for Contract Mode
    contractDetails: {
        contractorName: String,
        estimatedAmount: Number, // Total estimated cost for the whole contract
        paidAmount: Number, // Amount paid in this specific transaction
    },
    // Fields for Daily Wage Mode
    dailyLabourDetails: {
        labourers: [
            {
                name: String,
                wage: Number,
            },
        ],
        totalAmount: Number, // Sum of wages for the day
    },
});

module.exports = mongoose.model("Labour", labourSchema);
