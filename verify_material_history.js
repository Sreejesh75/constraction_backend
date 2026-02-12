const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';
const DUMMY_PROJECT_ID = '65b1a8f2d91abc456789abcd';

async function runTest() {
    let log = "";
    function logMsg(msg) {
        console.log(msg);
        log += msg + "\n";
    }

    try {
        logMsg("1. Adding material...");
        const addRes = await axios.post(`${BASE_URL}/add-material`, {
            projectId: DUMMY_PROJECT_ID,
            name: "History Test Material " + Date.now(),
            category: "Steel & Metals",
            quantity: 50,
            price: 500
        });

        if (!addRes.data.status) {
            logMsg("Failed to add material: " + JSON.stringify(addRes.data));
            fs.writeFileSync('history_test_result.txt', log);
            return;
        }

        const materialId = addRes.data.materialId;
        logMsg(`Material created: ${materialId}`);

        logMsg("\n2. Getting Initial History...");
        try {
            const histRes1 = await axios.get(`${BASE_URL}/material-history/${materialId}`);
            logMsg("Initial History Length: " + (histRes1.data.data ? histRes1.data.data.length : 0));
        } catch (e) {
            logMsg("Error fetching history: " + e.message);
        } // Expect empty or initial entry depending on implementation (currently empty for create)

        logMsg("\n3. Adding stock (Update 1)...");
        await axios.put(`${BASE_URL}/update-material/${materialId}`, {
            addedQuantity: 10,
            unitPriceAtPurchase: 550
        });

        logMsg("\n4. Adding stock (Update 2)...");
        await axios.put(`${BASE_URL}/update-material/${materialId}`, {
            addedQuantity: 20,
            unitPriceAtPurchase: 600
        });

        logMsg("\n5. Fetching History...");
        const historyRes = await axios.get(`${BASE_URL}/material-history/${materialId}`);

        if (historyRes.data.status) {
            const history = historyRes.data.data;
            logMsg(`History Entries: ${history.length}`);

            history.forEach((entry, index) => {
                logMsg(`\nEntry ${index + 1}:`);
                logMsg(`  Date: ${entry.date}`);
                logMsg(`  Remark: ${entry.remark}`);
                logMsg(`  Added Qty: ${entry.addedQuantity}`);
                logMsg(`  Purchase Price: ${entry.unitPriceAtPurchase}`);
                logMsg(`  Total Cost: ${entry.totalPurchaseCost}`);
            });

            if (history.length >= 2) {
                logMsg("\nSUCCESS: History retrieval verified.");
            } else {
                logMsg("\nFAILURE: History entries missing.");
            }
        } else {
            logMsg("\nFAILURE: Failed to fetch history.");
        }

        logMsg("\n6. Cleanup...");
        await axios.delete(`${BASE_URL}/delete-material/${materialId}`);
        logMsg("Material deleted.");

    } catch (error) {
        logMsg("Test failed: " + error.message);
        if (error.response) {
            logMsg("Response data: " + JSON.stringify(error.response.data));
        }
    }

    fs.writeFileSync('history_test_result.txt', log);
}

runTest();
