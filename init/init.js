require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("../models/Project"); // Adjust path if needed

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected ✅");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

// Insert a new project
const insertProject = async () => {
    try {
        await connectDB();

        const newProject = new Project({
            name: "My First Project"
        });

        const savedProject = await newProject.save();
        console.log("✅ Project Inserted. ID:", savedProject._id);

        mongoose.connection.close();
    } catch (error) {
        console.error("Error inserting project:", error);
    }
};

// Run the function
insertProject();
