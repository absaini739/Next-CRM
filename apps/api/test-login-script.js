
const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing Login...');
        const response = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });
        console.log('Login Status:', response.status);
        console.log('Token:', response.data.token ? 'Received' : 'Missing');
        console.log('User:', response.data.user);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
