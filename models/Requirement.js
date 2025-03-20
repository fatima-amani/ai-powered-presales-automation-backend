const mongoose = require("mongoose");

// Requirement Schema
const RequirementSchema = new mongoose.Schema({
    requirementText: { type: String },
    requirementFileUrl: { type: String },
    functionalRequirement: [{ type: String }], // Array of strings for functional requirements
    nonFunctionalRequirement: [{ type: String }], // Array of strings for non-functional requirements
    featureBreakdown: { type: mongoose.Schema.Types.Mixed }, // Mixed type to accommodate nested structures
    platforms: [{ type: String }], // Array of strings for platforms like "Website", "Mobile App"
    techStackPreferences: { type: mongoose.Schema.Types.Mixed }, // Object to accommodate tech stack preferences (can be nested)
});

module.exports = mongoose.model("Requirement", RequirementSchema);