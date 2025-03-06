const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    requirements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Requirement" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    updatedAt: { type: Date },
    techStacks: { type: mongoose.Schema.Types.ObjectId, ref: "TechStack" }, // Add this line

});

module.exports = mongoose.model("Project", ProjectSchema);
