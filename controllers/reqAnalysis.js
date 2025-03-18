const { cloudinary } = require("../config/cloudinaryConfig");
const Project = require("../models/project");
const Requirement = require("../models/Requirement");

const uploadRequirement = async (req, res) => {
  try {
    const { projectId, requirementText, platforms, techStack } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // console.log("Uploaded file details:", req.file);
    let platform = [];
    if (req.body.platforms) {
      const parsedPlatforms = JSON.parse(req.body.platforms);
      if (parsedPlatforms.web) platform.push("Website");
      if (parsedPlatforms.mobile) platform.push("Mobile App");
    }

    let techStacks = {};
    try {
      if (typeof techStack === "string") {
        techStacks = JSON.parse(techStack.trim()); // clean extra spaces/newlines
      } else if (typeof techStack === "object") {
        techStacks = techStack;
      }
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid techStack JSON format" });
    }

    // Create a new requirement
    const requirement = new Requirement({
      requirementText,
      requirementFileUrl: req.file.path,
      platforms: platform,
      techStackPreferences: techStacks,
      createdBy: req.user.id,
    });

    await requirement.save();

    // Fetch project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Clear existing requirements array
    project.requirements = [];
    project.techStacks = undefined;
    project.architectureDiagram = undefined;
    project.effortEstimationUrl = undefined;
    project.userPersona = undefined;

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
    console.log("Upload Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.log(errorMessage);
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
    const latestRequirement =
      project.requirements[project.requirements.length - 1];

    if (!latestRequirement) {
      return res
        .status(404)
        .json({ error: "No requirements found for this project" });
    }

    // Check if the fields already exist
    if (
      latestRequirement.functionalRequirement &&
      latestRequirement.nonFunctionalRequirement &&
      latestRequirement.featureBreakdown
    ) {
      return res.status(200).json({
        message: "Requirements already extracted",
        requirementFileUrl: latestRequirement.requirementFileUrl,
        functionalRequirement: latestRequirement.functionalRequirement,
        nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement,
        featureBreakdown: latestRequirement.featureBreakdown,
      });
    }

    // Extract the PDF URL
    const pdfUrl = latestRequirement.requirementFileUrl;
    if (!pdfUrl) {
      return res.status(400).json({ error: "Requirement file URL is missing" });
    }

    // Send the PDF URL to the FastAPI server
    const response = await fetch("http://localhost:8000/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: pdfUrl,
        requirement_text: latestRequirement.requirementText,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`FastAPI Error: ${result.error || "Unknown error"}`);
    }

    // Parse the data from the FastAPI response
    const data = JSON.parse(result.data);

    // Update the requirement with the new fields
    latestRequirement.functionalRequirement = data.functional_requirements;
    latestRequirement.nonFunctionalRequirement =
      data.non_functional_requirements;
    latestRequirement.featureBreakdown = data.feature_breakdown;

    // Save the updated requirement
    await latestRequirement.save();

    // This line had an error - fixed it
    // Previously: await project.findOneAndUpdate({requirements:latestRequirement._id});
    // No need to update the project since we're directly updating the requirement

    return res.status(200).json({
      message: "PDF URL sent successfully and requirements extracted",
      requirementFileUrl: latestRequirement.requirementFileUrl,
      functionalRequirement: latestRequirement.functionalRequirement,
      nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement,
      featureBreakdown: latestRequirement.featureBreakdown,
    });
  } catch (error) {
    console.error("Extract Requirements Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    res.status(500).json({ error: errorMessage || "Internal Server Error" });
  }
};

const extractRequirementsVersion = async (req, res) => {
  try {
    const { id, version } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const versions = await project.getVersions();
    const specificVersion = versions.find((v) => v.version === version);

    if (!specificVersion) {
      return res.status(404).json({ error: "Version not found" });
    }
    if (specificVersion.object.requirements.length === 0) {
      return res
        .status(404)
        .json({ error: "Requirement does not exist for this version" });
    }

    // Find the requirement for this version
    const requirementId = specificVersion.object.requirements[0];
    const requirement = await Requirement.findById(requirementId);

    if (!requirement) {
      return res.status(404).json({ error: "Requirement not found" });
    }

    // Check if the fields already exist
    if (
      requirement.functionalRequirement &&
      requirement.nonFunctionalRequirement &&
      requirement.featureBreakdown
    ) {
      return res.status(200).json({
        message: "Requirements already extracted",
        requirementFileUrl: requirement.requirementFileUrl,
        functionalRequirement: requirement.functionalRequirement,
        nonFunctionalRequirement: requirement.nonFunctionalRequirement,
        featureBreakdown: requirement.featureBreakdown,
      });
    }

    // Extract the PDF URL
    const pdfUrl = requirement.requirementFileUrl;
    if (!pdfUrl) {
      return res.status(400).json({ error: "Requirement file URL is missing" });
    }

    // Send the PDF URL to the FastAPI server
    const response = await fetch("http://localhost:8000/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: pdfUrl,
        requirement_text: requirement.requirementText,
      }),
    });

    const result = await response.json();

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

    // Update the versioned project with the updated requirement
    // This is already handled since we're updating the requirement directly
    // and the version references the requirement by ID

    return res.status(200).json({
      message: "PDF URL sent successfully and requirements extracted",
      requirementFileUrl: requirement.requirementFileUrl,
      functionalRequirement: requirement.functionalRequirement,
      nonFunctionalRequirement: requirement.nonFunctionalRequirement,
      featureBreakdown: requirement.featureBreakdown,
    });
  } catch (error) {
    console.error("Extract Requirements Version Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    res.status(500).json({ error: errorMessage || "Internal Server Error" });
  }
};

module.exports = {
  uploadRequirement,
  extractRequirements,
  extractRequirementsVersion,
};
