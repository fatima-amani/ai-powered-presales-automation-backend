const fetch = require("node-fetch");
const Project = require("../models/project");
const Wireframe = require("../models/Wireframe");
const Requirement = require("../models/Requirement");

module.exports.generateWireFrame = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.wireframe) {
      let wireframe = await Wireframe.findById(project.wireframe);
      if (wireframe) {
        return res.status(200).json({
          message: "Wireframes fetched successfully",
          wireframe: wireframe,
        });
      }
    }

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

    const requestBody = {
      featureBreakdown: latestRequirement.featureBreakdown || [],
    };

    const apiResponse = await fetch(
      "http://localhost:8000/generate-wireframe",
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

    let responseData = await apiResponse.json();
    if (typeof responseData === "string") {
      try {
        responseData = JSON.parse(responseData);
      } catch (err) {
        throw new Error(`Invalid JSON format from FastAPI: ${responseData}`);
      }
    }

    console.log("Wireframe Data:", responseData);

    if (!responseData?.data?.pages) {
      throw new Error("Wireframe pages missing in API response");
    }

    const wireframe = new Wireframe({ pages: responseData.data.pages }); // ✅ Correct!
    await wireframe.save();

    project.wireframe = wireframe._id;
    project.updatedBy = req.user.id;
    await project.save();

    return res.status(200).json({
      message: "Wireframe generated successfully",
      wireframeData: responseData,
    });
  } catch (error) {
    console.error("Wireframe Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports.getWireFrameByVersion = async (req, res) => {
  try {
    const { id, version } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
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

    if (specificVersion.object && specificVersion.object.wireframe) {
      let wireframe = await Wireframe.findById(specificVersion.object.wireframe);
      if (wireframe) {
        return res.status(200).json({
          message: "Wireframes fetched successfully",
          wireframe: wireframe,
        });
      }
    }

    return res
      .status(404)
      .json({ error: "Wireframe does not exist for this version" });
  } catch (error) {
    console.error("Wireframe Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};


