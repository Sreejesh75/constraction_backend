const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';

// For testing, we'll use a dummy project ID (valid ObjectId format)
const testProjectId = '65b1a8f2d91abc456789abcd';

async function runTests() {
    console.log('--- Starting Equipment Verification Tests ---');
    let equipmentId = null;
    let logId = null;

    try {
        // 1. Add Equipment
        console.log('\n1. Testing Add Equipment...');
        const addRes = await axios.post(`${BASE_URL}/add-equipment`, {
            projectId: testProjectId,
            name: 'Test Excavator',
            type: 'Excavator',
            rentalRate: 5000,
            rentalUnit: 'Per Day',
            fuelType: 'Diesel'
        });

        if (addRes.data.status) {
            console.log('✅ Add Equipment successful.');
            equipmentId = addRes.data.data._id;
            console.log('   Equipment ID:', equipmentId);
        } else {
            console.error('❌ Add Equipment failed:', addRes.data);
            throw new Error("Test Failed");
        }

        // 2. Add Equipment Log
        console.log('\n2. Testing Log Equipment Usage...');
        const logRes = await axios.post(`${BASE_URL}/add-equipment-log`, {
            equipmentId: equipmentId,
            date: new Date().toISOString(),
            hoursUsed: 8,
            fuelConsumed: 20,
            fuelCost: 2000,
            remarks: 'Daily operations'
        });

        if (logRes.data.status) {
            console.log('✅ Log Equipment Usage successful.');
            logId = logRes.data.data._id;
            console.log('   Log ID:', logId);
            console.log(`   Calculated Total Cost: ${logRes.data.data.totalCost} (Rental: ${logRes.data.data.rentalCost} + Fuel: ${logRes.data.data.fuelCost})`);
        } else {
            console.error('❌ Log Equipment Usage failed:', logRes.data);
            throw new Error("Test Failed");
        }

        // 3. Get Equipment Logs
        console.log('\n3. Testing Get Equipment Logs...');
        const getLogsRes = await axios.get(`${BASE_URL}/equipment-logs/${equipmentId}`);
        if (getLogsRes.data.status && getLogsRes.data.data.length > 0) {
            console.log('✅ Get Equipment Logs successful.');
            console.log(`   Found ${getLogsRes.data.data.length} logs.`);
        } else {
            console.error('❌ Get Equipment Logs failed or empty:', getLogsRes.data);
            throw new Error("Test Failed");
        }

        // 4. Get All Equipment for Project
        console.log('\n4. Testing Get All Equipment...');
        const getAllRes = await axios.get(`${BASE_URL}/equipment/${testProjectId}`);
        if (getAllRes.data.status && getAllRes.data.data.length > 0) {
            console.log('✅ Get All Equipment successful.');
            console.log(`   Found ${getAllRes.data.data.length} equipment entries.`);
        } else {
            console.error('❌ Get All Equipment failed or empty:', getAllRes.data);
            throw new Error("Test Failed");
        }

        // 5. Delete Equipment (will delete logs inside the endpoint)
        console.log('\n5. Testing Delete Equipment...');
        const deleteRes = await axios.delete(`${BASE_URL}/delete-equipment/${equipmentId}`);
        if (deleteRes.data.status) {
            console.log('✅ Delete Equipment successful.');
        } else {
            console.error('❌ Delete Equipment failed:', deleteRes.data);
            throw new Error("Test Failed");
        }

        console.log('\n--- All Tests Passed Successfully ---');

    } catch (error) {
        if (error.response) {
            console.error('\n❌ Error Payload:', error.response.data);
        } else {
            console.error('\n❌ Unexpected Error:', error.message);
        }
    }
}

// Check if server is accessible first
axios.get('http://localhost:3000/')
    .then(() => runTests())
    .catch(err => {
        console.error('❌ Server is not running on http://localhost:3000. Please start the backend server before verifying.');
    });
