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

// Controller to get a specific version of a tech stack
module.exports.getTechStackByVersion = async (req, res) => {
  try {
    const { id, version } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const versions = await project.getVersions();
    const specificVersion = versions.find(v => v.version === version);
    
    if (!specificVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Check if the specific version has a techStacks reference
    if (specificVersion.object && specificVersion.object.techStacks) {
      const techStackData = await TechStack.findById(specificVersion.object.techStacks);
      
      if (techStackData) {
        return res.status(200).json({ 
          message: 'Tech stack fetched successfully', 
          techStack: techStackData 
        });
      }
    }

    // If no tech stack is found or the reference doesn't exist in this version
    // First check if requirements exist in this version
    if (!specificVersion.object.requirements || specificVersion.object.requirements.length === 0) {
      return res.status(400).json({
        error: "No requirements found in this version of the project."
      });
    }

    // Get requirements from the project version
    let requirements;
    try {
      // Check if requirements is populated in the version object
      if (Array.isArray(specificVersion.object.requirements)) {
        const requirementIds = specificVersion.object.requirements;
        requirements = await Promise.all(
          requirementIds.map(reqId => typeof reqId === 'object' ? reqId : Project.findById(reqId))
        );
      } else {
        return res.status(400).json({
          error: "Cannot access requirements in this version."
        });
      }
    } catch (reqError) {
      console.error("Error accessing requirements:", reqError);
      return res.status(400).json({
        error: "Error accessing requirements in this version."
      });
    }

    // Get the latest requirement from the requirements array
    const latestRequirement = requirements[requirements.length - 1];
    
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first."
      });
    }

    // Prepare FastAPI request
    const techStackRequestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || []
    };

    const techStackResponse = await fetch(
      "http://localhost:8000/tech-stack-recommendation",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(techStackRequestBody)
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

    // Get the history model to update the versioned document
    const HistoryModel = project.constructor.historyModel;
    
    // Update the versioned document directly in the history collection
    await HistoryModel.findOneAndUpdate(
      { docId: project._id, version: version },
      { $set: { "object.techStacks": newTechStack._id } }
    );

    return res.status(200).json({
      message: "Tech stack generated and saved successfully for this version",
      techStack: newTechStack
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
      return res.status(404).json({ message: 'Project not found' });
    }

    const versions = await project.getVersions();
    const specificVersion = versions.find(v => v.version === version);
    
    if (!specificVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Check if the specific version has an architectureDiagram reference
    if (specificVersion.object && specificVersion.object.architectureDiagram) {
      const diagramData = await ArchitectureDiagram.findById(specificVersion.object.architectureDiagram);
      
      if (diagramData) {
        return res.status(200).json({ 
          message: 'Architecture diagram fetched successfully', 
          architectureDiagram: diagramData 
        });
      }
    }

    // If no diagram is found or the reference doesn't exist in this version
    // First check if techStacks exist in this version
    if (!specificVersion.object.techStacks) {
      return res.status(400).json({
        error: "Tech stack is missing. Generate tech stack first."
      });
    }

    // Check if requirements exist in this version
    if (!specificVersion.object.requirements || specificVersion.object.requirements.length === 0) {
      return res.status(400).json({
        error: "No requirements found in this version of the project."
      });
    }

    // Get requirements from the project version
    let requirements;
    try {
      if (Array.isArray(specificVersion.object.requirements)) {
        const requirementIds = specificVersion.object.requirements;
        requirements = await Promise.all(
          requirementIds.map(reqId => typeof reqId === 'object' ? reqId : Project.findById(reqId))
        );
      } else {
        return res.status(400).json({
          error: "Cannot access requirements in this version."
        });
      }
    } catch (reqError) {
      console.error("Error accessing requirements:", reqError);
      return res.status(400).json({
        error: "Error accessing requirements in this version."
      });
    }

    // Get the tech stack for this version
    const techStack = await TechStack.findById(specificVersion.object.techStacks);
    if (!techStack) {
      return res.status(400).json({
        error: "Invalid TechStack reference in this version."
      });
    }

    // Get the latest requirement from the requirements array
    const latestRequirement = requirements[requirements.length - 1];
    
    if (!latestRequirement?.featureBreakdown) {
      return res.status(400).json({
        error: "Feature breakdown missing. Extract requirements first."
      });
    }

    // Prepare FastAPI request
    const requestBody = {
      functionalRequirement: latestRequirement.functionalRequirement || [],
      nonFunctionalRequirement: latestRequirement.nonFunctionalRequirement || [],
      featureBreakdown: latestRequirement.featureBreakdown || [],
    };

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
    
    // Create a new ArchitectureDiagram document
    const newArchitectureDiagram = new ArchitectureDiagram({
      project: project._id,
      diagramData,
    });
    await newArchitectureDiagram.save();

    // Get the history model to update the versioned document
    const HistoryModel = project.constructor.historyModel;
    
    // Update the versioned document directly in the history collection
    await HistoryModel.findOneAndUpdate(
      { docId: project._id, version: version },
      { $set: { "object.architectureDiagram": newArchitectureDiagram._id } }
    );

    return res.status(200).json({
      message: "Architecture diagram generated and saved successfully for this version",
      architectureDiagram: newArchitectureDiagram
    });
  } catch (error) {
    console.error("Architecture Diagram Version Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};


