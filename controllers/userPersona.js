const fetch = require("node-fetch");
const UserPersona = require("../models/userPersona");
const Project = require("../models/project");

module.exports.generateUserPersona = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        const project = await Project.findById(id).populate("requirements");
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Check if user persona is already generated
        if (project.userPersona) {
            const existingPersona = await UserPersona.findById(project.userPersona);
            return res.status(200).json({
                message: "User persona already exists",
                userPersona: existingPersona,
            });
        }

        // Ensure requirements exist
        if (!project.requirements || project.requirements.length === 0) {
            return res.status(400).json({ error: "No requirements found for this project." });
        }

        const latestRequirement = project.requirements[project.requirements.length - 1];

        // Prepare request body for FastAPI
        const requestBody = {
            requirement_json: {
                functionalRequirement: latestRequirement.functionalRequirement || [],
                nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement || [],
                featureBreakdown: latestRequirement.featureBreakdown || [],
            },
        };
        console.log("request body: ",requestBody);

        // Call FastAPI to generate user persona
        const apiResponse = await fetch("http://localhost:8000/generate-user-persona", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`FastAPI Error: ${errorText}`);
        }

        const personaData = await apiResponse.json();
        console.log("api response: ",personaData);

        // Store in MongoDB
        const newUserPersona = new UserPersona({
            project: project._id,
            personas: personaData.personas,
        });
        await newUserPersona.save();

        // Update project with persona reference
        project.userPersona = newUserPersona._id;
        await project.save();

        console.log("User Persona generated and stored successfully: ",newUserPersona);
        return res.status(200).json({
            message: "User persona generated and stored successfully",
            userPersona: newUserPersona,
        });
    } catch (error) {
        console.error("User Persona Generation Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};
