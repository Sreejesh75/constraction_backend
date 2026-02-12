const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3000/api';
const DUMMY_PROJECT_ID = '65b1a8f2d91abc456789abcd'; // Valid format ObjectId

async function runTest() {
    try {
        console.log("1. Adding new material...");
        const addRes = await axios.post(`${BASE_URL}/add-material`, {
            projectId: DUMMY_PROJECT_ID,
            name: "Test Material " + Date.now(),
            category: "Cement & Binders",
            quantity: 10,
            price: 200
        });

        if (!addRes.data.status) {
            console.error("Failed to add material:", addRes.data);
            return;
        }

        const materialId = addRes.data.materialId;
        console.log(`Material created: ${materialId}`);

        console.log("\n2. Adding stock (10 units @ 300/unit)...");
        // Expected New Price: ((10*200) + (10*300)) / 20 = (2000 + 3000) / 20 = 5000 / 20 = 250
        const updateRes = await axios.put(`${BASE_URL}/update-material/${materialId}`, {
            addedQuantity: 10,
            unitPriceAtPurchase: 300
        });

        if (!updateRes.data.status) {
            console.error("Failed to add stock:", updateRes.data);
        } else {
            const m = updateRes.data.material;
            console.log("Updated Material:");
            console.log(`- Quantity: ${m.quantity} (Expected: 20)`);
            console.log(`- Price: ${m.price} (Expected: 250)`);
            console.log(`- Last Remark: ${m.lastUpdateRemark}`);

            const history = m.updateHistory[m.updateHistory.length - 1];
            console.log("Last History Entry:", history);

            if (m.quantity === 20 && m.price === 250) {
                console.log("SUCCESS: Stock addition logic verify!");
            } else {
                console.log("FAILURE: Stock addition logic incorrect.");
            }
        }

        console.log("\n3. Testing cleanup (Deleting material)...");
        await axios.delete(`${BASE_URL}/delete-material/${materialId}`);
        console.log("Material deleted.");

    } catch (error) {
        console.error("Test failed:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

runTest();
