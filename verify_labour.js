const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function runTest() {
    try {
        console.log("Starting Integration Test...");

        // 1. Create Project
        console.log("Creating Project...");
        const projectRes = await axios.post(`${BASE_URL}/create-project`, {
            userId: "65a3f9b2c1a123456789abcd", // Dummy User ID
            projectName: "Integration Test Project",
            budget: 100000,
            startDate: "2024-01-01",
            endDate: "2024-12-31"
        });

        if (!projectRes.data.status) {
            throw new Error("Project creation failed: " + projectRes.data.message);
        }
        const projectId = projectRes.data.projectId;
        console.log("Project Created:", projectId);

        // 2. Add Contract Labour
        console.log("Adding Contract Labour...");
        await axios.post(`${BASE_URL}/labour/add`, {
            projectId: projectId,
            mode: "contract",
            contractDetails: {
                contractorName: "Integration Contractor",
                estimatedAmount: 50000,
                paidAmount: 5000
            }
        });

        // 3. Add Daily Labour
        console.log("Adding Daily Labour...");
        await axios.post(`${BASE_URL}/labour/add`, {
            projectId: projectId,
            mode: "daily",
            dailyLabourDetails: {
                labourers: [
                    { name: "Worker 1", wage: 100 },
                    { name: "Worker 2", wage: 100 }
                ]
            }
        });

        // 4. Verify Records
        console.log("Verifying Records...");
        const recordsRes = await axios.get(`${BASE_URL}/labour/project/${projectId}`);
        const records = recordsRes.data;
        console.log("Records Found:", records.length);

        if (records.length === 2) {
            console.log("✅ SUCCESS: Found 2 labour records.");
        } else {
            console.error("❌ FAILURE: Expected 2 records, found " + records.length);
        }

        // 5. Cleanup (Delete Project)
        console.log("Cleaning up...");
        await axios.delete(`${BASE_URL}/delete-project/${projectId}`);
        console.log("Cleanup Complete");

    } catch (error) {
        if (error.response) {
            console.error("API Error:", error.response.status, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

// Wait for server to be ready
setTimeout(runTest, 2000);
