const Project = require('../models/project');
const User = require('../models/user');

// Get all projects
module.exports.getAllProjects = async (req, res) => {
    try {
      const userId = req.user.id; // Get user ID from JWT middleware (ensure middleware adds req.user)
  
      const projects = await Project.find({
        $or: [
          { createdBy: userId },                // Projects where user is creator
          { assignedUsers: { $in: [userId] } } // Projects where user is in assignedUsers
        ]
      }).populate("techStacks requirements assignedUsers");
  
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
    const { name, createdBy } = req.body; // Extract name and createdBy from the request body

    // Validate required fields
    if (!name || !createdBy) {
        return res.status(400).json({ message: "Name and createdBy are required fields." });
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
        const newProject = await project.save();

        // Return the newly created project
        res.status(201).json(newProject);
    } catch (error) {
        // Handle errors
        res.status(400).json({ message: error.message });
    }
};

// Update a project 
// module.exports.updateProject = async (req, res) => {
//     try {
//         const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedProject) {
//             return res.status(404).json({ message: 'Project not found' });
//         }
//         res.status(200).json(updatedProject);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

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