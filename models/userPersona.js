const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    steps: [
        {
            step: Number,
            action: String,
            system_response: String,
            features_used: [String]
        }
    ],
    success_criteria: [String]
});

const PersonaSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
    workflows: [WorkflowSchema]
});

const UserPersonaSchema = new mongoose.Schema({
    personas: [PersonaSchema] // This should be an array of objects, not an array of strings
});

const UserPersona = mongoose.model('UserPersona', UserPersonaSchema);

module.exports = UserPersona;
