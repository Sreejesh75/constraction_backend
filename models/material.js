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
      previousPrice: Number, // This is the average unit price before update
      newPrice: Number,      // This is the average unit price after update
      addedQuantity: Number, // Quantity added in this specific update
      unitPriceAtPurchase: Number, // Unit price of the added quantity
      totalPurchaseCost: Number // Total cost of the added quantity (addedQuantity * unitPriceAtPurchase)
    }
  ]
});

module.exports = mongoose.model("Material", materialSchema);
