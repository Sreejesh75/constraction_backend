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
        logMsg("1. Adding new material...");
        const addRes = await axios.post(`${BASE_URL}/add-material`, {
            projectId: DUMMY_PROJECT_ID,
            name: "Test Material " + Date.now(),
            category: "Cement & Binders",
            quantity: 10,
            price: 200
        });

        if (!addRes.data.status) {
            logMsg("Failed to add material: " + JSON.stringify(addRes.data));
            fs.writeFileSync('test_result.txt', log);
            return;
        }

        const materialId = addRes.data.materialId;
        logMsg(`Material created: ${materialId}`);

        logMsg("\n2. Adding stock (10 units @ 300/unit)...");
        const updateRes = await axios.put(`${BASE_URL}/update-material/${materialId}`, {
            addedQuantity: 10,
            unitPriceAtPurchase: 300
        });

        if (!updateRes.data.status) {
            logMsg("Failed to add stock: " + JSON.stringify(updateRes.data));
        } else {
            const m = updateRes.data.material;
            logMsg("Updated Material:");
            logMsg(`- Quantity: ${m.quantity} (Expected: 20)`);
            logMsg(`- Price: ${m.price} (Expected: 250)`);
            logMsg(`- Last Remark: ${m.lastUpdateRemark}`);

            const history = m.updateHistory[m.updateHistory.length - 1];
            logMsg("Last History Entry: " + JSON.stringify(history));

            if (m.quantity === 20 && m.price === 250) {
                logMsg("SUCCESS: Stock addition logic verify!");
            } else {
                logMsg("FAILURE: Stock addition logic incorrect.");
            }
        }

        logMsg("\n3. Testing cleanup (Deleting material)...");
        await axios.delete(`${BASE_URL}/delete-material/${materialId}`);
        logMsg("Material deleted.");

    } catch (error) {
        logMsg("Test failed: " + error.message);
        if (error.response) {
            logMsg("Response data: " + JSON.stringify(error.response.data));
        }
    }

    fs.writeFileSync('test_result.txt', log);
}

runTest();
