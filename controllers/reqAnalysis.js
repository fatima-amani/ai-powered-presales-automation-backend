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

module.exports = { uploadRequirement };
