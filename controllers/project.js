const Project = require('../models/Project');
const User = require('../models/User');

// Get all projects
module.exports.getAllProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "head") {
      projects = await Project.find().populate("assignedUsers");
    } else {
      const userId = req.user.id;
      projects = await Project.find({
        $or: [
          { createdBy: userId },
          { assignedUsers: { $in: [userId] } }
        ]
      }).populate("assignedUsers");
    }

    // For each project, fetch its versions and format
    const projectsWithVersions = await Promise.all(projects.map(async (project) => {
      const versions = await project.getVersions();

      const formattedVersions = await Promise.all(versions.map(async (version) => {
        let updatedByName = "Unknown";

        // If metadata exists and userId present
        if (version.metadata && version.metadata.userId) {
          const user = await User.findById(version.metadata.userId);
          if (user) updatedByName = user.name;
        }

        return {
          version: version.version, 
          updatedBy: updatedByName,
          timestamp: version.timestamp
        };
      }));

      return {
        ...project.toObject(),
        versions: formattedVersions
      };
    }));

    res.status(200).json(projectsWithVersions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

  

module.exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("assignedUsers");
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const versions = await project.getVersions();

    const formattedVersions = await Promise.all(versions.map(async (version) => {
      let updatedByName = "Unknown";

      if (version.metadata && version.metadata.userId) {
        const user = await User.findById(version.metadata.userId);
        if (user) updatedByName = user.name;
      }

      return {
        version: version.version,
        updatedBy: updatedByName,
        timestamp: version.timestamp
      };
    }));

    const projectWithVersions = {
      ...project.toObject(),
      versions: formattedVersions
    };

    res.status(200).json(projectWithVersions);
  } catch (error) {
    console.error(error);
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
            updatedBy: createdBy,
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
    project.updatedBy = req.user.id;
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
      project.updatedBy = req.user.id;
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
      
      project.updatedBy = req.user.id;
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
  
      // First get the versions
      const versions = await project.getVersions();
      
      for (const version of versions) {
        if (version.object && version.object.updatedBy) {
          const user = await User.findById(version.object.updatedBy);
          if (user) version.object.updatedBy = {
            userId: user._id,
            name: user.name
          };
        }
      }
  
      res.status(200).json({ versions: versions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports.getProjectVersion = async (req, res) => {
    try {
      const { id, version } = req.params;
      const project = await Project.findById(id);
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Correct population with nested path
      const versions = await project.getVersions();
  
      const specificVersion = versions.find(v => v.version === version);
  
      if (!specificVersion) {
        return res.status(404).json({ message: 'Version not found' });
      }

      if (specificVersion.object && specificVersion.object.updatedBy) {
        const user = await User.findById(specificVersion.object.updatedBy);
        if (user) specificVersion.object.updatedBy = {
          userId: user._id,
          name: user.name
        };
      }
  
      res.status(200).json({ version: specificVersion });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };