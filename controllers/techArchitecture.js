const fetch = require("node-fetch");
const Project = require("../models/project");

module.exports.generateTechStack = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate project ID
        if (!id) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        // Fetch the project and populate requirements
        const project = await Project.findById(id).populate("requirements");

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Get the latest updated requirement
        const latestRequirement = project.requirements[project.requirements.length - 1];

        if (!latestRequirement) {
            return res.status(404).json({ error: "No requirements found for this project" });
        }

        // Ensure functional and non-functional requirements exist before proceeding
        if (
            !latestRequirement.functionalRequirement ||
            !latestRequirement.nonFunctionalRequirement ||
            !latestRequirement.featureBreakdown
        ) {
            return res.status(400).json({ error: "Requirements are missing. Please extract requirements first." });
        }

        // Prepare the request body for tech stack recommendation
        const techStackRequestBody = {
            functionalRequirement: latestRequirement.functionalRequirement,
            nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement,
            featureBreakdown: latestRequirement.featureBreakdown
        };

        // Call FastAPI endpoint for tech stack recommendation
        const techStackResponse = await fetch("http://localhost:8000/tech-stack-recommendation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(techStackRequestBody),
        });

        const techStackResult = await techStackResponse.json();
        // console.log("FastAPI Tech Stack Response:", techStackResult);

        if (!techStackResponse.ok) {
            throw new Error(`FastAPI Tech Stack Error: ${techStackResult.error || "Unknown error"}`);
        }

        return res.status(200).json({
            message: "Tech stack recommendation generated successfully",
            techStack: techStackResult
        });

    } catch (error) {
        console.error("Tech Stack Generation Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};
