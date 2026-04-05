/**
 * Sentinel Analytics - Promtail Simulation Script
 * This script mimics a professional Promtail agent pushing logs to the Sentinel platform
 * using the standard Grafana Loki JSON push API.
 */

const BACKEND_URL = 'http://localhost:8080/loki/api/v1/push';
const API_KEY = 'sentinel-demo-key-2026';

const logs = [
    { level: 'api_info', msg: 'Incoming request to /user/profile from 192.168.1.1' },
    { level: 'api_debug', msg: 'Cache miss for user_id: 1045' },
    { level: 'api_warn', msg: 'Slow response detected: 1450ms for /v1/checkout' },
    { level: 'api_error', msg: 'ERROR: Database connection timeout in PaymentModule' },
    { level: 'api_fatal', msg: 'CRITICAL: OutOfMemoryError in ReportGeneratorWorker' }
];

async function simulatePromtail() {
    console.log('--- Starting Sentinel Promtail Simulation (Loki API) ---');

    // Loki Format: { "streams": [ { "stream": { "labels": "values" }, "values": [ ["nano_ts", "line"] ] } ] }
    const payload = {
        streams: [
            {
                stream: {
                    job: 'sentinel-promtail-sim',
                    env: 'production',
                    app: 'checkout-service'
                },
                values: logs.map(l => [
                    (Date.now() * 1000000).toString(), // Nanoseconds timestamp
                    `[${l.level.toUpperCase()}] ${l.msg}`
                ])
            }
        ]
    };

    try {
        const response = await fetch(`${BACKEND_URL}?api_key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`[SUCCESS] Pushed ${logs.length} logs successfully via Loki API (Code: ${response.status})`);
        } else {
            console.log(`[FAILED] Error pushing logs: ${response.status} ${await response.text()}`);
        }
    } catch (err) {
        console.error('[ERROR] Connection failed:', err.message);
    }
}

simulatePromtail();
