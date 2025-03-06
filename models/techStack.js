const mongoose = require("mongoose");

// const techStackItemSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true }
// });

const techItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
  }, { _id: false }); // Disable automatic _id for sub-documents

  const TechStackSchema = new mongoose.Schema({
    frontend: [techItemSchema],
    backend: [techItemSchema],
    database: [techItemSchema],
    API_integrations: [techItemSchema],
    others: [techItemSchema],
    createdAt: { type: Date, default: Date.now },
  });

module.exports = mongoose.model("TechStack", TechStackSchema);
