const { cloudinary } = require("../config/cloudinaryConfig");
const Project = require("../models/Project");
const Requirement = require("../models/Requirement");


const uploadRequirement = async (req, res) => {
    try {
        const { projectId, requirement_text } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "File is required" });
        }

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        console.log("Uploaded file details:", req.file);

        const requirement = new Requirement({
            requirement_text,
            requirement_file_url: req.file.path,
        });

        await requirement.save();

        await Project.findByIdAndUpdate(projectId, {
            $push: { requirements: requirement._id },
        });

        return res.status(201).json({
            message: "Requirement uploaded successfully",
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

        // Extract the PDF URL
        const pdfUrl = latestRequirement.requirement_file_url;
        if (!pdfUrl) {
            return res.status(400).json({ error: "Requirement file URL is missing" });
        }

        console.log("Sending PDF URL to FastAPI server:", pdfUrl);

        // Send the PDF URL to the FastAPI server
        const response = await fetch("http://localhost:8000/extract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: pdfUrl, requirement_text: latestRequirement.requirement_text }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`FastAPI Error: ${result.error || "Unknown error"}`);
        }

        return res.status(200).json({
            message: "PDF URL sent successfully",
            fastApiResponse: result,
        });

    } catch (error) {
        console.error("Extract Requirements Error:", error);

        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        
        res.status(500).json({ error: errorMessage || "Internal Server Error" });
    }
};


module.exports = { uploadRequirement, extractRequirements };
