const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  name: String,
  quantity: Number,
  price: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Material", materialSchema);
