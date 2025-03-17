const Project = require('../models/project');
const User = require('../models/user');

// Get all projects
module.exports.getAllProjects = async (req, res) => {
    try {
      if(req.user.role == "head") {
        const projects = await Project.find().populate("assignedUsers");
        return res.status(200).json(projects);
      }

      const userId = req.user.id; // Get user ID from JWT middleware (ensure middleware adds req.user)
      
      const projects = await Project.find({
        $or: [
          { createdBy: userId },                // Projects where user is creator
          { assignedUsers: { $in: [userId] } } // Projects where user is in assignedUsers
        ]
      }).populate("assignedUsers");
  
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Get project by ID
module.exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new project
module.exports.createProject = async (req, res) => {
    const { name } = req.body; // Extract name and createdBy from the request body
    const createdBy = req.user.id; 

    // Validate required fields
    if (!name) {
        return res.status(400).json({ message: "Project Name are required fields." });
    }

    try {
        // Check if the user exists and has the role of "head"
        const user = await User.findById(createdBy);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.role !== "head") {
            return res.status(403).json({ message: "Only users with the role 'head' can create projects." });
        }

        // Create a new project with the provided data
        const project = new Project({
            name,
            createdBy,
            requirements: [], // Initialize requirements as an empty array
        });

        // Save the project to the database
        const newProject = await project.save({ metadata: { userId: req.user.id } });

        // Return the newly created project
        res.status(201).json(newProject);
    } catch (error) {
        // Handle errors
        res.status(400).json({ message: error.message });
    }
};

module.exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, createdBy } = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only update allowed fields if they are provided
    if (name) project.name = name;
    if (createdBy) project.createdBy = createdBy;
    project.updatedAt = Date.now();

    // Save with history metadata
    await project.save({ metadata: { userId } });

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete a project
module.exports.deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.assignUserToProject = async (req, res) => {
    try {
      const { id, userId } = req.params;
  
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if already assigned
      if (project.assignedUsers.includes(userId)) {
        return res.status(400).json({ message: "User already assigned to project" });
      }
  
      project.assignedUsers.push(userId);
      await project.save({ metadata: { userId: req.user.id } });
  
      res.status(200).json({ message: "User assigned successfully", project });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Unassign user from project
  module.exports.unassignUserFromProject = async (req, res) => {
    try {
      const { id, userId } = req.params;
  
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if user is assigned
      if (!project.assignedUsers.includes(userId)) {
        return res.status(400).json({ message: "User not assigned to project" });
      }
  
      project.assignedUsers = project.assignedUsers.filter(
        (assignedUserId) => assignedUserId.toString() !== userId
      );
  
      await project.save({ metadata: { userId: req.user.id } });
  
      res.status(200).json({ message: "User unassigned successfully", project });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  module.exports.getProjectVersions = async (req, res) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      const versions = await project.getVersions(); // Retrieve all versions
  
      res.status(200).json({ versions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  // Controller to get a specific version of a project
module.exports.getProjectVersion = async (req, res) => {
  try {
    const { id, version } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const versions = await project.getVersions();
    const specificVersion = versions.find(v => v.version === version);

    if (!specificVersion) {
      return res.status(404).json({ message: 'Version not found' });
    }

    res.status(200).json({ version: specificVersion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
