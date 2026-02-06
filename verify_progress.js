const axios = require('axios');
const mongoose = require('mongoose');
const Project = require('./models/project');
const ConstructionProgress = require('./models/constructionProgress');

const BASE_URL = 'http://localhost:3000/api';

async function runVerification() {
    try {
        // 1. Connect to MongoDB (needed to create a dummy project directly)
        await mongoose.connect("mongodb+srv://sreejeshos7510_db_user:Dbnode1405@cluster0.mih1sk8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Connected to MongoDB for verification");

        // 2. Create a dummy project
        const project = new Project({
            projectName: "Verification Project",
            budget: 100000,
            startDate: new Date(),
        });
        await project.save();
        console.log(`Created dummy project with ID: ${project._id}`);

        const projectId = project._id;

        // 3. Add Progress
        console.log("Testing POST /api/progress/add (Create)...");
        const addResponse = await axios.post(`${BASE_URL}/progress/add`, {
            projectId: projectId,
            section: "Painting",
            progress: 50,
            status: "In Progress",
            startDate: "2026-02-01",
            remarks: "Started internal painting"
        });
        console.log("Add Response Status:", addResponse.status);
        console.log("Add Response Data:", addResponse.data);

        // 4. Update Progress
        console.log("Testing POST /api/progress/add (Update)...");
        const updateResponse = await axios.post(`${BASE_URL}/progress/add`, {
            projectId: projectId,
            section: "Painting",
            progress: 75,
            status: "In Progress",
            remarks: "Internal painting almost done"
        });
        console.log("Update Response Status:", updateResponse.status);
        console.log("Update Response Data:", updateResponse.data);

        // 5. Get Progress
        console.log("Testing GET /api/progress/:projectId...");
        const getResponse = await axios.get(`${BASE_URL}/progress/${projectId}`);
        console.log("Get Response Status:", getResponse.status);
        console.log("Get Response Data:", getResponse.data);

        // cleanup
        await Project.findByIdAndDelete(projectId);
        await ConstructionProgress.deleteMany({ projectId: projectId });
        console.log("Cleanup done.");

    } catch (error) {
        console.error("Verification failed:", error.message);
        if (error.response) {
            console.error("Error Response:", error.response.data);
        }
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
