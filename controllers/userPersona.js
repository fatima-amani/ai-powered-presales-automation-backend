const fetch = require("node-fetch");
const UserPersona = require("../models/UserPersona");
const Project = require("../models/project");
const Requirement = require("../models/Requirement")

module.exports.generateUserPersona = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user persona already exists
    if (project.userPersona) {
      const existingPersona = await UserPersona.findById(project.userPersona);
      return res.status(200).json({
        message: "User persona already exists",
        userPersona: existingPersona,
      });
    }

    if (!project.requirements || project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    // console.log(project);
    let latestRequirement =
      project.requirements[0];
    // console.log(latestRequirement);

    latestRequirement = await Requirement.findById(latestRequirement);
    // Prepare request body for FastAPI
    const requestBody = {
      requirement_json: {
        functionalRequirement: latestRequirement.functionalRequirement || [],
        nonFunctionalRequirement:
          latestRequirement.nonFunctionalRequirement || [],
        featureBreakdown: latestRequirement.featureBreakdown || [],
      },
    };

    // console.log("Request Body:", requestBody);

    // Call FastAPI to generate user persona
    const apiResponse = await fetch(
      "http://localhost:8000/generate-user-persona",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    const personaData = await apiResponse.json();
    // console.log("API Response:", personaData);

    if (!personaData.user_persona || !personaData.categorized_features) {
      throw new Error("Invalid response format from FastAPI");
    }

    // Store user persona in MongoDB
    const newUserPersona = new UserPersona({
      personas: personaData.user_persona.personas,
      categorized_features: {
        feature_categories: {
          must_have:
            personaData.categorized_features.feature_categories.must_have,
          nice_to_have:
            personaData.categorized_features.feature_categories.nice_to_have,
          future_enhancements:
            personaData.categorized_features.feature_categories
              .future_enhancements,
        },
      },
    });

    await newUserPersona.save();

    // Update project with user persona reference
    project.userPersona = newUserPersona._id;
    await project.save();

    // console.log("User Persona generated and stored successfully:", newUserPersona);

    return res.status(200).json({
      message: "User persona generated and stored successfully",
      userPersona: newUserPersona,
    });
  } catch (error) {
    console.error("User Persona Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports.reGenerateUserPersona = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.requirements || project.requirements.length === 0) {
      return res
        .status(400)
        .json({ error: "No requirements found for this project." });
    }

    // console.log(project);
    let latestRequirement =
      project.requirements[0];
    // console.log(latestRequirement);

    latestRequirement = await Requirement.findById(latestRequirement);
    // Prepare request body for FastAPI
    const requestBody = {
      requirement_json: {
        functionalRequirement: latestRequirement.functionalRequirement || [],
        nonFunctionalRequirement:
          latestRequirement.nonFunctionalRequirement || [],
        featureBreakdown: latestRequirement.featureBreakdown || [],
      },
    };

    // console.log("Request Body:", requestBody);

    // Call FastAPI to generate user persona
    const apiResponse = await fetch(
      "http://localhost:8000/generate-user-persona",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    const personaData = await apiResponse.json();
    // console.log("API Response:", personaData);

    if (!personaData.user_persona || !personaData.categorized_features) {
      throw new Error("Invalid response format from FastAPI");
    }

    // Store user persona in MongoDB
    const newUserPersona = new UserPersona({
      personas: personaData.user_persona.personas,
      categorized_features: {
        feature_categories: {
          must_have:
            personaData.categorized_features.feature_categories.must_have,
          nice_to_have:
            personaData.categorized_features.feature_categories.nice_to_have,
          future_enhancements:
            personaData.categorized_features.feature_categories
              .future_enhancements,
        },
      },
    });

    await newUserPersona.save();

    // Update project with user persona reference
    project.userPersona = newUserPersona._id;
    await project.save();

    // console.log("User Persona generated and stored successfully:", newUserPersona);

    return res.status(200).json({
      message: "User persona generated and stored successfully",
      userPersona: newUserPersona,
    });
  } catch (error) {
    console.error("User Persona Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports.getUserPersonaByVersion = async (req, res) => {
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

    if (specificVersion.object.userPersona) {
      let userPersonaData = await UserPersona.findById(
        specificVersion.object.userPersona
      );
      return res.status(200).json({
        message: "User Persona fetched successfully",
        userPersona: userPersonaData,
      });
    }

    return res
      .status(404)
      .json({ error: "User Persona does not exist for this version" });
  } catch (error) {
    console.error("Get User Persona Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
