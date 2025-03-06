const express = require('express');
const projectController = require('../controllers/project');

const router = express.Router();

// Route to get all projects
router.get('/', projectController.getAllProjects);

// Route to get a single project by ID
router.get('/:id', projectController.getProjectById);

// Route to create a new project
router.post('/', projectController.createProject);

// Route to update an existing project by ID
// router.put('/:id', projectController.updateProject);

// Route to delete a project by ID
router.delete('/:id', projectController.deleteProject);

module.exports = router;