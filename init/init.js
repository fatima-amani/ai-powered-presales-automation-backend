require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("../models/project"); 
const Requirement = require("../models/Requirement");
const TechStack = require("../models/TechStack");
const ArchitectureDiagram = require("../models/ArchitectureDiagram");
const UserPersona = require("../models/UserPersona");
const Wireframe = require("../models/Wireframe");

async function deleteProjectAndDependencies(projectId) {
    try {
        await mongoose.connect(process.env.MONGO_URL); 

        const project = await Project.findById(projectId).exec();

        if (!project) {
            console.log("Project not found.");
            return;
        }

        // Delete Requirements
        if (project.requirements && project.requirements.length > 0) {
            await Requirement.deleteMany({ _id: { $in: project.requirements } });
            console.log(`Deleted ${project.requirements.length} requirements.`);
        }

        // Delete Tech Stack
        if (project.techStacks) {
            await TechStack.findByIdAndDelete(project.techStacks);
            console.log("Deleted Tech Stack.");
        }

        // Delete Architecture Diagram
        if (project.architectureDiagram) {
            await ArchitectureDiagram.findByIdAndDelete(project.architectureDiagram);
            console.log("Deleted Architecture Diagram.");
        }

        // Delete User Persona
        if (project.userPersona) {
            await UserPersona.findByIdAndDelete(project.userPersona);
            console.log("Deleted User Persona.");
        }

        // Delete Wireframe
        if (project.wireframe) {
            await Wireframe.findByIdAndDelete(project.wireframe);
            console.log("Deleted Wireframe.");
        }

        // Delete the Project itself
        await Project.findByIdAndDelete(projectId);
        console.log(`Deleted Project with ID ${projectId}.`);

        await mongoose.disconnect();
        console.log("Disconnected from database.");
    } catch (err) {
        console.error("Error deleting project and dependencies:", err);
        mongoose.disconnect();
    }
}

// Usage
const projectId = "67dbabad99c7b442c08d48b6"; // Replace with actual project ID
deleteProjectAndDependencies(projectId);
