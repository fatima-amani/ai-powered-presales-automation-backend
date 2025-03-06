require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("../models/project"); // Adjust path if needed

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

// Function to delete the `techStacks` field
const deleteTechStacksField = async () => {
    try {
        await connectDB();

        const projectId = "67c9b4d7c7f46698c466f16a"; // Replace with your project ID

        // Use $unset to remove the `techStacks` field
        const result = await Project.updateOne(
            { _id: projectId }, // Filter by project ID
            { $unset: { techStacks: "" } } // Remove the `techStacks` field
        );

        if (result.modifiedCount > 0) {
            console.log("✅ `techStacks` field deleted successfully.");
        } else {
            console.log("⚠️ No document was updated. Check if the project ID is correct.");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error deleting `techStacks` field:", error);
    }
};

// Run the function
deleteTechStacksField();