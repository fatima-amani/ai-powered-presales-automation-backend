const fetch = require("node-fetch");
const multer = require("multer");
const { cloudinary, storage } = require("../config/cloudinaryConfig");
const Project = require("../models/Project");
const Requirement = require("../models/Requirement");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

// Initialize multer with cloudinary storage
const upload = multer({ storage });

module.exports.generateEffortEstimation = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role == "junior") {
      return res.status(403).json({
        error:
          "Access denied. Only users with the role 'head' and 'associate' can perform this action.",
      });
    }

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Return existing estimation URL if available
    if (project.effortEstimationUrl) {
      return res.status(200).json({
        message: "Effort estimation fetched successfully",
        effortEstimationUrl: project.effortEstimationUrl,
      });
    }

    // Ensure requirements exist
    if (!project.requirements || project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    let latestRequirement = await Requirement.findById(
      project.requirements[project.requirements.length - 1]
    );


    // Prepare request body
    const requestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
        latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
    };

    // Call FastAPI endpoint
    const apiResponse = await fetch(`${process.env.BACKEND_URL}/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    // Save response as an Excel file locally
    const fileBuffer = await apiResponse.buffer();
    const filePath = path.join(
      __dirname,
      `../uploads/effort_estimation_${id}.xlsx`
    );

    await fs.writeFile(filePath, fileBuffer);

    // Upload to Cloudinary using Multer
    req.file = { path: filePath }; // Simulating a file upload
    upload.single("file")(req, res, async function (err) {
      if (err) {
        console.error("Multer Error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
          resource_type: "raw", // Important for non-image files
          folder: "pre_sales_automation_dev",
          public_id: `effort_estimation_${id}`,
          overwrite: true,
        });

        // Delete local file after upload
        await fs.unlink(filePath);

        // Store Cloudinary URL directly in the Project schema
        project.effortEstimationUrl = cloudinaryResponse.secure_url;
        await project.save();

        return res.status(200).json({
          message: "Effort estimation generated and stored successfully",
          effortEstimationUrl: cloudinaryResponse.secure_url,
        });
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        res.status(500).json({ error: "Failed to upload file to Cloudinary" });
      }
    });
  } catch (error) {
    console.error("Effort Estimation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports.reGenerateEffortEstimation = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role == "junior") {
      return res.status(403).json({
        error:
          "Access denied. Only users with the role 'head' and 'associate' can perform this action.",
      });
    }

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure requirements exist
    if (!project.requirements || project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    let latestRequirement = await Requirement.findById(
      project.requirements[project.requirements.length - 1]
    );


    // Prepare request body
    const requestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
        latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
    };

    // Call FastAPI endpoint
    const apiResponse = await fetch(`${process.env.BACKEND_URL}/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    // Save response as an Excel file locally
    const fileBuffer = await apiResponse.buffer();
    const filePath = path.join(
      __dirname,
      `../uploads/effort_estimation_${id}.xlsx`
    );

    await fs.writeFile(filePath, fileBuffer);

    // Upload to Cloudinary using Multer
    req.file = { path: filePath }; // Simulating a file upload
    upload.single("file")(req, res, async function (err) {
      if (err) {
        console.error("Multer Error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
          resource_type: "raw", // Important for non-image files
          folder: "pre_sales_automation_dev",
          public_id: `effort_estimation_${id}`,
          overwrite: true,
        });

        // Delete local file after upload
        await fs.unlink(filePath);

        // Store Cloudinary URL directly in the Project schema
        project.effortEstimationUrl = cloudinaryResponse.secure_url;
        await project.save();

        return res.status(200).json({
          message: "Effort estimation generated and stored successfully",
          effortEstimationUrl: cloudinaryResponse.secure_url,
        });
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        res.status(500).json({ error: "Failed to upload file to Cloudinary" });
      }
    });
  } catch (error) {
    console.error("Effort Estimation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};



module.exports.getEffortEstimationbyVersion = async (req, res) => {
  if (req.user.role == "junior") {
    return res.status(403).json({
      error:
        "Access denied. Only users with the role 'head' and 'associate' can perform this action.",
    });
  }

  try {
    const { id, version } = req.params;

    if (!id || !version) {
      return res
        .status(400)
        .json({ error: "Project ID and version are required" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const versions = await project.getVersions();
    const specificVersion = versions.find((v) => v.version === version);

    if (!specificVersion) {
      return res.status(404).json({ error: "Version not found" });
    }

    if (specificVersion.object.effortEstimationUrl) {
      return res.status(200).json({
        message: "Effort estimation fetched successfully",
        effortEstimationUrl: specificVersion.object.effortEstimationUrl,
      });
    }

    return res
      .status(404)
      .json({ error: "Effort estimation does not exist for this version" });
  } catch (error) {
    console.error("Effort Estimation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
