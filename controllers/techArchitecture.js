const fetch = require("node-fetch");
const Project = require("../models/Project");
const TechStack = require("../models/techStack");
const ArchitectureDiagram = require("../models/architectureDiagram");
const Requirement = require("../models/Requirement");
require("dotenv").config();

module.exports.generateTechStack = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project ID
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Fetch the project without using repopulate
    // Instead, manually fetch related documents
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.techStacks) {
      techStacks = await TechStack.findById(project.techStacks);
      if (techStacks) {
        return res.status(200).json({
          message: "Tech stack fetched successfully",
          techStack: techStacks,
        });
      }
    }

    // Check if a tech stack already exists

    // Manually fetch requirements
    if (project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    const requirements = await Requirement.find({
      _id: { $in: project.requirements },
    });

    // Get the latest requirement
    const latestRequirement =
      requirements.length > 0 ? requirements[requirements.length - 1] : null;
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first.",
      });
    }
    

    // Prepare FastAPI request
    const techStackRequestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
      latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
      requirement_tech_stack: JSON.stringify(latestRequirement.techStackPreferences),
      requirement_platforms: JSON.stringify(latestRequirement.platforms),
    };

    // console.log(techStackRequestBody);

    const techStackResponse = await fetch(
      `${process.env.BACKEND_URL}/tech-stack-recommendation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(techStackRequestBody),
      }
    );

    if (!techStackResponse.ok) {
      const errorText = await techStackResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    let techStackResult = await techStackResponse.json();

    // Check if the response is a stringified JSON, and parse it if needed
    if (typeof techStackResult === "string") {
      try {
        techStackResult = JSON.parse(techStackResult);
      } catch (err) {
        throw new Error(`Invalid JSON format from FastAPI: ${techStackResult}`);
      }
    }

    // Ensure the response is an object
    if (typeof techStackResult !== "object" || techStackResult === null) {
      throw new Error(
        `Unexpected response format: ${JSON.stringify(techStackResult)}`
      );
    }

    // Create a new TechStack document
    const newTechStack = new TechStack(techStackResult);
    await newTechStack.save();

    // Update the project reference
    project.techStacks = newTechStack._id;
    project.updatedBy = req.user.id;
    await project.save();

    return res.status(200).json({
      message: "Tech stack generated and saved successfully",
      techStack: newTechStack,
    });
  } catch (error) {
    console.error("Tech Stack Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports.reGenerateTechStack = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project ID
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Fetch the project without using repopulate
    // Instead, manually fetch related documents
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    // Manually fetch requirements
    if (project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    const requirements = await Requirement.find({
      _id: { $in: project.requirements },
    });

    // Get the latest requirement
    const latestRequirement =
      requirements.length > 0 ? requirements[requirements.length - 1] : null;
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first.",
      });
    }
    

    // Prepare FastAPI request
    const techStackRequestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
      latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
      requirement_tech_stack: JSON.stringify(latestRequirement.techStackPreferences),
      requirement_platforms: JSON.stringify(latestRequirement.platforms),
    };

    // console.log(techStackRequestBody);

    const techStackResponse = await fetch(
      `${process.env.BACKEND_URL}/tech-stack-recommendation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(techStackRequestBody),
      }
    );

    if (!techStackResponse.ok) {
      const errorText = await techStackResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    let techStackResult = await techStackResponse.json();

    // Check if the response is a stringified JSON, and parse it if needed
    if (typeof techStackResult === "string") {
      try {
        techStackResult = JSON.parse(techStackResult);
      } catch (err) {
        throw new Error(`Invalid JSON format from FastAPI: ${techStackResult}`);
      }
    }

    // Ensure the response is an object
    if (typeof techStackResult !== "object" || techStackResult === null) {
      throw new Error(
        `Unexpected response format: ${JSON.stringify(techStackResult)}`
      );
    }

    // Create a new TechStack document
    const newTechStack = new TechStack(techStackResult);
    await newTechStack.save();

    // Update the project reference
    project.techStacks = newTechStack._id;
    project.updatedBy = req.user.id;
    await project.save();

    return res.status(200).json({
      message: "Tech stack generated and saved successfully",
      techStack: newTechStack,
    });
  } catch (error) {
    console.error("Tech Stack Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports.generateArchitectureDiagram = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Fetch project without repopulate
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Manually fetch related documents
    let architectureDiagram = null;
    if (project.architectureDiagram) {
      architectureDiagram = await ArchitectureDiagram.findById(
        project.architectureDiagram
      );
    }

    // Check if architecture diagram already exists
    if (architectureDiagram) {
      return res.status(200).json({
        message: "Architecture diagram fetched successfully",
        architectureDiagram: architectureDiagram,
      });
    }

    if (project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    if (!project.techStacks) {
      return res
        .status(400)
        .json({ error: "Tech stack is missing. Generate tech stack first." });
    }

    const requirements = await Requirement.find({
      _id: { $in: project.requirements },
    });
    const latestRequirement =
      requirements.length > 0 ? requirements[requirements.length - 1] : null;
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first.",
      });
    }

    const requestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
        latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
      
    };

    const techStack = await TechStack.findById(project.techStacks);
    if (!techStack) {
      return res
        .status(400)
        .json({ error: "Invalid TechStack reference in project." });
    }

    const apiResponse = await fetch(
      `${process.env.BACKEND_URL}/architecture-diagram`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: requestBody,
          tech_stack: techStack,
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    const diagramData = await apiResponse.json();

    const newArchitectureDiagram = new ArchitectureDiagram({
      project: project._id,
      diagramData,
    });
    await newArchitectureDiagram.save();

    // project.architectureDiagram = newArchitectureDiagram._id;
    await Project.findByIdAndUpdate(project._id, {
      architectureDiagram: newArchitectureDiagram._id,
    });

    return res.status(200).json({
      message: "Architecture diagram generated and stored successfully",
      architectureDiagram: newArchitectureDiagram,
    });
  } catch (error) {
    console.error("Architecture Diagram Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports.reGenerateArchitectureDiagram = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Fetch project without repopulate
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    if (!project.techStacks) {
      return res
        .status(400)
        .json({ error: "Tech stack is missing. Generate tech stack first." });
    }

    const requirements = await Requirement.find({
      _id: { $in: project.requirements },
    });
    const latestRequirement =
      requirements.length > 0 ? requirements[requirements.length - 1] : null;
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first.",
      });
    }

    const requestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
        latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
      
    };

    const techStack = await TechStack.findById(project.techStacks);
    if (!techStack) {
      return res
        .status(400)
        .json({ error: "Invalid TechStack reference in project." });
    }

    const apiResponse = await fetch(
      `${process.env.BACKEND_URL}/architecture-diagram`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: requestBody,
          tech_stack: techStack,
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    const diagramData = await apiResponse.json();

    const newArchitectureDiagram = new ArchitectureDiagram({
      project: project._id,
      diagramData,
    });
    await newArchitectureDiagram.save();

    // project.architectureDiagram = newArchitectureDiagram._id;
    await Project.findByIdAndUpdate(project._id, {
      architectureDiagram: newArchitectureDiagram._id,
    });

    return res.status(200).json({
      message: "Architecture diagram generated and stored successfully",
      architectureDiagram: newArchitectureDiagram,
    });
  } catch (error) {
    console.error("Architecture Diagram Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Controller to get a specific version of a tech stack
module.exports.getTechStackByVersion = async (req, res) => {
  try {
    const { id, version } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get versions without using repopulate
    const versions = await project.getVersions();
    const specificVersion = versions.find((v) => v.version === version);

    if (!specificVersion) {
      return res.status(404).json({ error: "Version not found" });
    }
    console.log("Found version:", specificVersion);

    // Check if the specific version has a techStacks reference
    if (specificVersion.object && specificVersion.object.techStacks) {
      const techStackData = await TechStack.findById(
        specificVersion.object.techStacks
      );

      if (techStackData) {
        return res.status(200).json({
          message: "Tech stack fetched successfully",
          techStack: techStackData,
        });
      }
    }

    // If no tech stack is found or the reference doesn't exist in this version
    // First check if requirements exist in this version
    if (
      !specificVersion.object.requirements ||
      specificVersion.object.requirements.length === 0
    ) {
      return res.status(400).json({
        error: "No requirements found in this version of the project.",
      });
    }

    // Get requirements from the project version manually
    let requirements = [];
    try {
      if (specificVersion.object.requirements.length > 0) {
        // Fetch the requirement using findById for a single document
        const requirement = await Requirement.findById(
          specificVersion.object.requirements[0]
        );
        if (!requirement) {
          return res.status(404).json({
            error: "Requirement not found.",
          });
        }
        requirements = [requirement]; // Assign as an array to maintain existing logic
        console.log("All requirements:", requirements);
      } else {
        return res.status(400).json({
          error: "Invalid requirements format in this version.",
        });
      }
    } catch (reqError) {
      console.error("Error accessing requirements:", reqError);
      return res.status(400).json({
        error:
          "Error accessing requirements in this version: " + reqError.message,
      });
    }

    // Filter out any null or undefined requirements
    if (requirements.length === 0) {
      return res.status(400).json({
        error: "No valid requirements found in this version.",
      });
    }

    // Get the latest requirement from the requirements array
    const latestRequirement = requirements[requirements.length - 1];
    console.log("Latest requirement:", latestRequirement);

    if (!latestRequirement.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first.",
      });
    }

    // Prepare FastAPI request
    const techStackRequestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
        latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
    };

    const techStackResponse = await fetch(
      `${process.env.BACKEND_URL}/tech-stack-recommendation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(techStackRequestBody),
      }
    );

    if (!techStackResponse.ok) {
      const errorText = await techStackResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    let techStackResult = await techStackResponse.json();

    // Check if the response is a stringified JSON, and parse it if needed
    if (typeof techStackResult === "string") {
      try {
        techStackResult = JSON.parse(techStackResult);
      } catch (err) {
        throw new Error(`Invalid JSON format from FastAPI: ${techStackResult}`);
      }
    }

    // Ensure the response is an object
    if (typeof techStackResult !== "object" || techStackResult === null) {
      throw new Error(
        `Unexpected response format: ${JSON.stringify(techStackResult)}`
      );
    }

    // Create a new TechStack document
    const newTechStack = new TechStack(techStackResult);
    await newTechStack.save();

    await Project.findByIdAndUpdate(project._id, {
      techStacks: newTechStack._id,
    });

    return res.status(200).json({
      message: "Tech stack generated and saved successfully for this version",
      techStack: newTechStack,
    });
  } catch (error) {
    console.error("Tech Stack Version Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Controller to get a specific version of an architecture diagram
module.exports.getArchitectureDiagramByVersion = async (req, res) => {
  try {
    const { id, version } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get versions without repopulate
    const versions = await project.getVersions();
    const specificVersion = versions.find((v) => v.version === version);

    console.log("Found version:", specificVersion);
    if (!specificVersion) {
      return res.status(404).json({ error: "Version not found" });
    }

    // Check if the specific version has an architectureDiagram reference
    if (specificVersion.object && specificVersion.object.architectureDiagram) {
      const diagramData = await ArchitectureDiagram.findById(
        specificVersion.object.architectureDiagram
      );

      if (diagramData) {
        return res.status(200).json({
          message: "Architecture diagram fetched successfully",
          architectureDiagram: diagramData,
        });
      }
    }

    // If no diagram is found or the reference doesn't exist in this version
    // First check if techStacks exist in this version
    if (!specificVersion.object.techStacks) {
      return res.status(400).json({
        error: "Tech stack is missing. Generate tech stack first.",
      });
    }

    // Check if requirements exist in this version
    if (
      !specificVersion.object.requirements ||
      specificVersion.object.requirements.length === 0
    ) {
      return res.status(400).json({
        error: "No requirements found in this version of the project.",
      });
    }

    const requirements = await Requirement.find({
      _id: { $in: project.requirements },
    });
    const latestRequirement =
      requirements.length > 0 ? requirements[requirements.length - 1] : null;
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first.",
      });
    }

    const requestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement:
        latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
    };

    const techStack = await TechStack.findById(project.techStacks);
    if (!techStack) {
      return res
        .status(400)
        .json({ error: "Invalid TechStack reference in project." });
    }

    const apiResponse = await fetch(
      `${process.env.BACKEND_URL}/architecture-diagram`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: requestBody,
          tech_stack: techStack,
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    const diagramData = await apiResponse.json();

    const newArchitectureDiagram = new ArchitectureDiagram({
      project: project._id,
      diagramData,
    });
    await newArchitectureDiagram.save();

    // project.architectureDiagram = newArchitectureDiagram._id;
    await Project.findByIdAndUpdate(project._id, {
      architectureDiagram: newArchitectureDiagram._id,
    });

    return res.status(200).json({
      message: "Architecture diagram generated and stored successfully",
      architectureDiagram: newArchitectureDiagram,
    });
  } catch (error) {
    console.error("Architecture Diagram Version Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
