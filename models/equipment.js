const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., Excavator, Mixer, Generator
    rentalRate: { type: Number, required: true },
    rentalUnit: { type: String, enum: ["Per Day", "Per Hour", "Fixed"], required: true },
    fuelType: { type: String, enum: ["Diesel", "Petrol", "Electric", "None"], default: "None" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Equipment", equipmentSchema);
