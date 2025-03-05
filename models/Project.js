const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    requirements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Requirement" }],
});

module.exports = mongoose.model("Project", ProjectSchema);
