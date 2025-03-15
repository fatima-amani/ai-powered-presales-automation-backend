const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    requirements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Requirement" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    updatedAt: { type: Date },
    techStacks: { type: mongoose.Schema.Types.ObjectId, ref: "TechStack" },
    architectureDiagram: { type: mongoose.Schema.Types.ObjectId, ref: "ArchitectureDiagram" },
    effortEstimationUrl: { type: String },
    userPersona: { type: mongoose.Schema.Types.ObjectId, ref: "UserPersona" },

});

module.exports = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
