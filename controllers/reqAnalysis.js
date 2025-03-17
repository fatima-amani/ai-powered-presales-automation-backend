const { cloudinary } = require("../config/cloudinaryConfig");
const Project = require("../models/project");
const Requirement = require("../models/Requirement");


const uploadRequirement = async (req, res) => {
    try {
        const { projectId, requirementText } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "File is required" });
        }

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        // console.log("Uploaded file details:", req.file);

        // Create a new requirement
        const requirement = new Requirement({
            requirementText,
            requirementFileUrl: req.file.path,
        });

        await requirement.save();

        // Fetch project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Clear existing requirements array
        project.requirements = [];

        // Add new requirement
        project.requirements.push(requirement._id);
        project.updatedBy = req.user.id;

        // Save project
        await project.save({ metadata: { userId: req.user.id } });

        return res.status(201).json({
            message: "Requirement uploaded and project updated successfully",
            data: requirement,
        });
    } catch (error) {
        console.error("Upload Error:", error);

        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

        res.status(500).json({ error: errorMessage || "Internal Server Error" });
    }
};



const extractRequirements = async (req, res) => {
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

        // Check if the fields already exist
        if (latestRequirement.functionalRequirement && latestRequirement.nonFunctionalRequirement && latestRequirement.featureBreakdown) {
            return res.status(200).json({
                message: "Requirements already extracted",
                functionalRequirement: latestRequirement.functionalRequirement,
                nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement,
                featureBreakdown: latestRequirement.featureBreakdown
            });
        }

        // Extract the PDF URL
        const pdfUrl = latestRequirement.requirementFileUrl;
        if (!pdfUrl) {
            return res.status(400).json({ error: "Requirement file URL is missing" });
        }

        // console.log("Sending PDF URL to FastAPI server:", pdfUrl);

        // Send the PDF URL to the FastAPI server
        const response = await fetch("http://localhost:8000/extract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: pdfUrl, requirement_text: latestRequirement.requirementText }),
        });

        const result = await response.json();
        // console.log("FastAPI Response:", result);

        if (!response.ok) {
            throw new Error(`FastAPI Error: ${result.error || "Unknown error"}`);
        }

        // Parse the data from the FastAPI response
        const data = JSON.parse(result.data);

        // Update the requirement with the new fields
        latestRequirement.functionalRequirement = data.functional_requirements;
        latestRequirement.nonFunctionalRequirement = data.non_functional_requirements;
        latestRequirement.featureBreakdown = data.feature_breakdown;

        // Save the updated requirement
        await latestRequirement.save();

        return res.status(200).json({
            message: "PDF URL sent successfully and requirements extracted",
            functionalRequirement: latestRequirement.functionalRequirement,
            nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement,
            featureBreakdown: latestRequirement.featureBreakdown
        });

    } catch (error) {
        console.error("Extract Requirements Error:", error);

        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        
        res.status(500).json({ error: errorMessage || "Internal Server Error" });
    }
};

const extractRequirementsVersion = async (req, res) => {
    try {
        const { id, version } = req.params;
        const project = await Project.findById(id);
    
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
    
        // Correct population with nested path
        const versions = await project.getVersions();
    
        const specificVersion = versions.find(v => v.version === version);
    
        if (!specificVersion) {
            return res.status(404).json({ error: 'Version not found' });
        }
        if (specificVersion.object.requirements.length === 0) {
            return res.status(404).json({ error: 'Requirement does not exist for this version' });
        }

        // Find the requirement for this version
        const requirementId = specificVersion.object.requirements[0];
        const requirement = await Requirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({ error: 'Requirement not found' });
        }

        // Check if the fields already exist
        if (requirement.functionalRequirement && requirement.nonFunctionalRequirement && requirement.featureBreakdown) {
            return res.status(200).json({
                message: "Requirements already extracted",
                functionalRequirement: requirement.functionalRequirement,
                nonFunctionalRequirement: requirement.nonFunctionalRequirement,
                featureBreakdown: requirement.featureBreakdown
            });
        }

        // Extract the PDF URL
        const pdfUrl = requirement.requirementFileUrl;
        if (!pdfUrl) {
            return res.status(400).json({ error: "Requirement file URL is missing" });
        }

        // console.log("Sending PDF URL to FastAPI server:", pdfUrl);

        // Send the PDF URL to the FastAPI server
        const response = await fetch("http://localhost:8000/extract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: pdfUrl, requirement_text: requirement.requirementText }),
        });

        const result = await response.json();
        // console.log("FastAPI Response:", result);

        if (!response.ok) {
            throw new Error(`FastAPI Error: ${result.error || "Unknown error"}`);
        }

        // Parse the data from the FastAPI response
        const data = JSON.parse(result.data);

        // Update the requirement with the new fields
        requirement.functionalRequirement = data.functional_requirements;
        requirement.nonFunctionalRequirement = data.non_functional_requirements;
        requirement.featureBreakdown = data.feature_breakdown;

        // Save the updated requirement
        await requirement.save();

        return res.status(200).json({
            message: "PDF URL sent successfully and requirements extracted",
            functionalRequirement: requirement.functionalRequirement,
            nonFunctionalRequirement: requirement.nonFunctionalRequirement,
            featureBreakdown: requirement.featureBreakdown
        });
    } catch (error) {
        console.error("Extract Requirements Version Error:", error);
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        res.status(500).json({ error: errorMessage || "Internal Server Error" });
    }
};

module.exports = { uploadRequirement, extractRequirements, extractRequirementsVersion };