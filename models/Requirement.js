const mongoose = require("mongoose");

// Requirement Schema
const RequirementSchema = new mongoose.Schema({
    requirement_text: { type: String },
    requirement_file_url: { type: String }
});

module.exports = mongoose.model("Requirement", RequirementSchema);
