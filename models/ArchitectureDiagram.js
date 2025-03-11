const mongoose = require("mongoose");

const ArchitectureDiagramSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    diagramData: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ArchitectureDiagram", ArchitectureDiagramSchema);