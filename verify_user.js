const http = require('http');

function makeRequest(path, method, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(body));
                    } else {
                        resolve(JSON.parse(body)); // Resolve even errors to check status
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    try {
        const timestamp = Date.now();
        const emailNoName = `test_noname_${timestamp}@example.com`;
        const emailWithName = `test_withname_${timestamp}@example.com`;

        console.log('--- Test 1: Create User (No Name) ---');
        let res = await makeRequest('/api/create-user', 'POST', {
            email: emailNoName
        });
        console.log('Response:', JSON.stringify(res));
        if (res.status && res.name === `test_noname_${timestamp}`) {
            console.log('PASS: Name correctly derived from email.');
        } else {
            console.log('FAIL: Name not derived correctly.');
        }
        const userId1 = res.userId;

        if (userId1) {
            console.log('\n--- Test 2: Update Name ---');
            const newName = `Updated Name ${timestamp}`;
            res = await makeRequest('/api/update-name', 'POST', {
                userId: userId1,
                name: newName
            });
            console.log('Response:', JSON.stringify(res));
            if (res.status && res.user.name === newName) {
                console.log('PASS: Name updated successfully.');
            } else {
                console.log('FAIL: Name update failed.');
            }
        }


        console.log('\n--- Test 3: Create User (With Name) ---');
        const providedName = "Explicit Name";
        res = await makeRequest('/api/create-user', 'POST', {
            email: emailWithName,
            name: providedName
        });
        console.log('Response:', JSON.stringify(res));
        if (res.status && res.name === providedName) {
            console.log('PASS: Provided name respected.');
        } else {
            console.log('FAIL: Provided name ignored.');
        }

    } catch (error) {
        console.error('Test Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Make sure the server is running on port 5000');
        }
    }
}

runTests();
