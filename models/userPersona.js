const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
    step: Number,
    action: String,
    system_response: String,
    features_used: [String]
});

const WorkflowSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    steps: [StepSchema],
    success_criteria: [String]
});

const PersonaSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
    workflows: [WorkflowSchema]
});

const FeatureSchema = new mongoose.Schema({
    feature: { type: String, required: true },
    description: { type: String, required: true },
    rationale: String,
    business_impact: String,
    potential_value: String,
    strategic_value: String
});

const CategorizedFeaturesSchema = new mongoose.Schema({
    must_have: [FeatureSchema],
    nice_to_have: [FeatureSchema],
    future_enhancements: [FeatureSchema]
});

const UserPersonaSchema = new mongoose.Schema({
    personas: [PersonaSchema],
    categorized_features: {
        feature_categories: CategorizedFeaturesSchema
    }
});

const UserPersona = mongoose.model('UserPersona', UserPersonaSchema);

module.exports = UserPersona;
