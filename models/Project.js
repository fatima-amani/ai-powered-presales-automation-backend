const mongoose = require("mongoose");
const mongooseHistory = require('mongoose-history-plugin');

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

// Options for the history plugin - without mongoose parameter
const historyOptions = {
    metadata: ['userId'] // Track the user ID responsible for changes
};

// Pass mongoose as a separate parameter
ProjectSchema.plugin(mongooseHistory(mongoose), historyOptions);

module.exports = mongoose.models.Project || mongoose.model("Project", ProjectSchema);