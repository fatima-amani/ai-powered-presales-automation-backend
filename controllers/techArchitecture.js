const fetch = require("node-fetch");
const Project = require("../models/project");
const TechStack = require("../models/techStack");
const ArchitectureDiagram = require("../models/architectureDiagram");

module.exports.generateTechStack = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project ID
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Fetch the project and populate requirements & techStacks
    const project = await Project.findById(id).populate(
      "requirements techStacks"
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if a tech stack already exists
    if (project.techStacks) {
      return res.status(200).json({
        message: "Tech stack fetched successfully",
        techStack: project.techStacks,
      });
    }

    // Get the latest requirement
    const latestRequirement =
      project.requirements[project.requirements.length - 1];
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
    };

    const techStackResponse = await fetch(
      "http://localhost:8000/tech-stack-recommendation",
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

    // console.log("🔹 Validated Tech Stack Data:", techStackResult);

    // Ensure the response is an object
    if (typeof techStackResult !== "object" || techStackResult === null) {
      throw new Error(
        `Unexpected response format: ${JSON.stringify(techStackResult)}`
      );
    }

    // console.log("🔹 Validated Tech Stack Data:", techStackResult);

    // Create a new TechStack document
    const newTechStack = new TechStack(techStackResult);
    await newTechStack.save();

    // Update the project reference
    project.techStacks = newTechStack._id;
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

      const project = await Project.findById(id).populate("requirements techStacks architectureDiagram");
      if (!project) {
          return res.status(404).json({ error: "Project not found" });
      }

      // Check if architecture diagram already exists
      if (project.architectureDiagram) {
          return res.status(200).json({
              message: "Architecture diagram fetched successfully",
              architectureDiagram: project.architectureDiagram,
          });
      }

      if (!project.requirements || project.requirements.length === 0) {
          return res.status(400).json({ error: "No requirements found for this project." });
      }

      if (!project.techStacks) {
          return res.status(400).json({ error: "Tech stack is missing. Generate tech stack first." });
      }

      const latestRequirement = project.requirements[project.requirements.length - 1];
      if (!latestRequirement?.featureBreakdown) {
          return res.status(400).json({ error: "Feature breakdown missing. Extract requirements first." });
      }

      const requestBody = {
          functionalRequirement: latestRequirement.functionalRequirement || [],
          nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement || [],
          featureBreakdown: latestRequirement.featureBreakdown || [],
      };

      const techStack = await TechStack.findById(project.techStacks);
      if (!techStack) {
          return res.status(400).json({ error: "Invalid TechStack reference in project." });
      }

      const apiResponse = await fetch("http://localhost:8000/architecture-diagram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirements: requestBody, tech_stack: techStack }),
      });

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

      project.architectureDiagram = newArchitectureDiagram._id;
      await project.save();

      return res.status(200).json({
          message: "Architecture diagram generated and stored successfully",
          architectureDiagram: newArchitectureDiagram,
      });
  } catch (error) {
      console.error("Architecture Diagram Generation Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};


