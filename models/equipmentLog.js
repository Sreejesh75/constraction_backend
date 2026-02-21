const mongoose = require("mongoose");

const equipmentLogSchema = new mongoose.Schema({
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    date: { type: Date, required: true, default: Date.now },
    hoursUsed: { type: Number, required: true, default: 0 },
    fuelConsumed: { type: Number, default: 0 }, // in liters/gallons
    fuelCost: { type: Number, default: 0 },
    rentalCost: { type: Number, required: true, default: 0 },
    totalCost: { type: Number, required: true, default: 0 }, // rentalCost + fuelCost
    remarks: { type: String }
});

module.exports = mongoose.model("EquipmentLog", equipmentLogSchema);
