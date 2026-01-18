const axios = require('axios');

async function test_simulation() {
    try {
        console.log("Starting HCIPN Research Simulation (30 Days)...");
        const response = await axios.post('http://127.0.0.1:8000/agent/hcipn/simulate?days=30');
        console.log("Simulation Result Status:", response.status);
        console.log("Metrics:", JSON.stringify(response.data.metrics, null, 2));
    } catch (error) {
        console.error("Simulation Test Failed:", error.response ? error.response.data : error.message);
    }
}

test_simulation();
