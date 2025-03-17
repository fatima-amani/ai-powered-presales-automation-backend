const express = require('express');
const projectController = require('../controllers/project');
const { verifyToken, checkProjectAccess,checkHeadRole } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to get all projects
router.get('/', verifyToken, projectController.getAllProjects);

// Route to get a single project by ID
router.get('/:id', verifyToken, checkProjectAccess, projectController.getProjectById);

// Route to create a new project
router.post('/', verifyToken, checkHeadRole, projectController.createProject);

// Route to update an existing project by ID
router.put('/:id', verifyToken, checkHeadRole, projectController.updateProject);

// Route to delete a project by ID
router.delete('/:id', verifyToken, checkProjectAccess,checkHeadRole, projectController.deleteProject);

// Assign user
router.post(
    "/:id/assign/:userId",
    verifyToken,
    checkProjectAccess,checkHeadRole,
    projectController.assignUserToProject
  );
  
  // Unassign user
  router.post(
    "/:id/unassign/:userId",
    verifyToken,
    checkProjectAccess,
    checkHeadRole,
    projectController.unassignUserFromProject
  );

  // Route to get project versions
router.get('/:id/versions', verifyToken, checkProjectAccess, projectController.getProjectVersions);
router.get('/:id/versions/:version', verifyToken,checkProjectAccess, projectController.getProjectVersion);


module.exports = router;