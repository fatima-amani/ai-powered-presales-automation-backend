const mongoose = require("mongoose");

// Requirement Schema
const RequirementSchema = new mongoose.Schema({
    requirementText: { type: String },
    requirementFileUrl: { type: String },
    functionalRequirement: [{ type: String }], // Array of strings for functional requirements
    nonFunctionalRequirement: [{ type: String }], // Array of strings for non-functional requirements
    featureBreakdown: { type: mongoose.Schema.Types.Mixed } // Mixed type to accommodate nested structures
});

module.exports = mongoose.model("Requirement", RequirementSchema);