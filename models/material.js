const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  name: String,
  category: {
    type: String,
    enum: [
      "Cement & Binders",
      "Sand & Aggregates",
      "Bricks & Blocks",
      "Steel & Metals",
      "Concrete & Ready-Mix",
      "Wood & Boards",
      "Doors & Windows",
      "Flooring Materials",
      "Plumbing Materials",
      "Sanitary Ware",
      "Bathroom Fittings",
      "Electrical Materials",
      "Lighting & Fixtures",
      "Paints & Coatings",
      "Waterproofing & Chemicals",
      "Hardware & Fasteners",
      "Ceiling & Wall Systems",
      "Glass & Glazing",
      "Roofing Materials",
      "External & Landscaping",
      "Miscellaneous"
    ],
    required: true
  },
  quantity: Number,
  price: Number,
  date: { type: Date, default: Date.now },
  lastUpdateRemark: String,
  updateHistory: [
    {
      date: { type: Date, default: Date.now },
      remark: String,
      previousQuantity: Number,
      newQuantity: Number,
      previousPrice: Number,
      newPrice: Number
    }
  ]
});

module.exports = mongoose.model("Material", materialSchema);
