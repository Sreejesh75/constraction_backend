const axios = require('axios');
const mongoose = require('mongoose');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Project = require('./models/project');
const Document = require('./models/document');

const BASE_URL = 'http://localhost:3000/api';

async function runVerification() {
    let projectId;
    const testFilePath = path.join(__dirname, 'test_doc.txt');

    try {
        // Create a dummy file for upload
        fs.writeFileSync(testFilePath, 'This is a test document content.');

        // 1. Connect to MongoDB
        await mongoose.connect("mongodb+srv://sreejeshos7510_db_user:Dbnode1405@cluster0.mih1sk8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Connected to MongoDB for verification");

        // 2. Create a dummy project
        const project = new Project({
            projectName: "Document Verification Project",
            budget: 50000,
            startDate: new Date(),
        });
        await project.save();
        projectId = project._id;
        console.log(`Created dummy project with ID: ${projectId}`);

        // 3. Test Upload with Custom Category
        console.log("Testing Upload with Custom Category 'Invoice-123'...");
        const formData1 = new FormData();
        formData1.append('projectId', projectId.toString());
        formData1.append('category', 'Invoice-123');
        formData1.append('file', fs.createReadStream(testFilePath));

        try {
            const uploadResponse1 = await axios.post(`${BASE_URL}/upload-document`, formData1, {
                headers: { ...formData1.getHeaders() }
            });
            console.log("Upload 1 Status:", uploadResponse1.status);
            console.log("Upload 1 Data:", uploadResponse1.data);
        } catch (err) {
            console.error("Upload 1 Failed:", err.message);
            if (err.response) console.error(err.response.data);
        }

        // 4. Test Upload without Category (Should default or be allowed)
        console.log("Testing Upload without Category...");
        const formData2 = new FormData();
        formData2.append('projectId', projectId.toString());
        formData2.append('file', fs.createReadStream(testFilePath));

        try {
            const uploadResponse2 = await axios.post(`${BASE_URL}/upload-document`, formData2, {
                headers: { ...formData2.getHeaders() }
            });
            console.log("Upload 2 Status:", uploadResponse2.status);
            console.log("Upload 2 Data:", uploadResponse2.data);
        } catch (err) {
            console.error("Upload 2 Failed:", err.message);
            if (err.response) console.error(err.response.data);
        }

        // 5. Verify Documents in DB
        const docs = await Document.find({ projectId: projectId });
        console.log(`Found ${docs.length} documents for project.`);
        docs.forEach(doc => {
            console.log(`- ID: ${doc._id}, Category: ${doc.category}, File: ${doc.originalName}`);
        });

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        // Cleanup
        if (projectId) {
            await Project.findByIdAndDelete(projectId);
            const docs = await Document.find({ projectId: projectId });
            for (const doc of docs) {
                // Try to delete file if it exists (local path)
                if (fs.existsSync(doc.fileUrl)) {
                    fs.unlinkSync(doc.fileUrl);
                }
            }
            await Document.deleteMany({ projectId: projectId });
            console.log("Cleanup done.");
        }

        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }

        await mongoose.disconnect();
    }
}

runVerification();
