const express = require('express');
const projectController = require('../controllers/project');
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to get all projects
router.get('/', verifyToken, projectController.getAllProjects);

// Route to get a single project by ID
router.get('/:id', verifyToken, checkProjectAccess, projectController.getProjectById);

// Route to create a new project
router.post('/', verifyToken, projectController.createProject);

// Route to update an existing project by ID
// router.put('/:id', projectController.updateProject);

// Route to delete a project by ID
router.delete('/:id', verifyToken, checkProjectAccess, projectController.deleteProject);

module.exports = router;