const axios = require('axios');
const mongoose = require('mongoose');
const Project = require('./models/project');
const ConstructionProgress = require('./models/constructionProgress');

const BASE_URL = 'http://localhost:3000/api';

const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('verify_output.txt', { flags: 'w' });
const logStdout = process.stdout;

console.log = function (d) { //
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

console.error = function (d) { //
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

async function runVerification() {
    try {
        // ... (rest of the logic)
        // 1. Connect to MongoDB (needed to create a dummy project directly)
        await mongoose.connect("mongodb+srv://sreejeshos7510_db_user:Dbnode1405@cluster0.mih1sk8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Connected to MongoDB for verification");

        // 2. Create a dummy project
        const project = new Project({
            projectName: "Integration Test Project",
            budget: 50000,
            startDate: new Date(),
        });
        await project.save();
        console.log(`Created dummy project with ID: ${project._id}`);

        const projectId = project._id;

        // 3. Add Initial Progress using existing endpoint
        console.log("Setup: Adding initial progress...");
        await axios.post(`${BASE_URL}/progress/add`, {
            projectId: projectId,
            section: "Foundation",
            progress: 30,
            status: "In Progress"
        });

        // 4. Test PUT /progress/update (Success Case)
        console.log("Testing PUT /progress/update (Success Case)...");
        const updateResponse = await axios.put(`${BASE_URL}/progress/update`, {
            projectId: projectId,
            section: "Foundation",
            progress: 60,
            status: "In Progress",
            remarks: "Foundation work verified"
        });
        console.log("Update Response Status:", updateResponse.status);
        console.log("Update Response Data:", updateResponse.data);

        // 5. Test PUT /progress/update (Not Found Case)
        console.log("Testing PUT /progress/update (Not Found Case)...");
        try {
            await axios.put(`${BASE_URL}/progress/update`, {
                projectId: projectId,
                section: "Roofing", // Doesn't exist
                progress: 10
            });
        } catch (error) {
            console.log("Expected Error Status:", error.response?.status);
            console.log("Expected Error Message:", error.response?.data);
        }

        // cleanup
        await Project.findByIdAndDelete(projectId);
        await ConstructionProgress.deleteMany({ projectId: projectId });
        console.log("Cleanup done.");

    } catch (error) {
        console.error("Verification failed:", error.message);
        if (error.response) {
            // console.error("Error Response:", error.response.data);
            logFile.write("Error Response: " + JSON.stringify(error.response.data) + '\n');
        }
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
