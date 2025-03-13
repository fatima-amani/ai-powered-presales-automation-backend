const fetch = require("node-fetch");
const Project = require("../models/project");

module.exports.generateWireFrame = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(id).populate("requirements");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const latestRequirement = project.requirements[project.requirements.length - 1];
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first."
      });
    }

    const requestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || []
    };

    const apiResponse = await fetch("http://localhost:8000/generate-wireframe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`FastAPI Error: ${errorText}`);
    }

    let responseData = await apiResponse.json();
    if (typeof responseData === "string") {
      try {
        responseData = JSON.parse(responseData);
      } catch (err) {
        throw new Error(`Invalid JSON format from FastAPI: ${responseData}`);
      }
    }

    return res.status(200).json({
      message: "Wireframe generated successfully",
      wireframeData: responseData
    });
  } catch (error) {
    console.error("Wireframe Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};