const BACKEND_URL = 'http://localhost:8081/api';

const logs = [
    { level: 'INFO', message: 'System initialized successfully', durationMs: 120 },
    { level: 'INFO', message: 'Connected to primary database cluster', durationMs: 450 },
    { level: 'WARN', message: 'Disk usage exceeding 85% on node-04', durationMs: 12 },
    { level: 'ERROR', message: 'Failed to process payment for user ID: 9482', stackTrace: 'java.lang.NullPointerException: user.getBillingInfo() is null\n at com.payments.Process.execute(Process.java:156)', durationMs: 890 },
    { level: 'INFO', message: 'Rate limiter triggered for IP 192.168.1.45', durationMs: 5 },
    { level: 'FATAL', message: 'JVM OutOfMemoryError in Garbage Collection', stackTrace: 'java.lang.OutOfMemoryError: Metaspace limit reached\n at java.lang.ClassLoader.defineClass(Native Method)', durationMs: 5200 },
    { level: 'ERROR', message: 'Invalid API Key provided', stackTrace: 'com.auth.UnauthorizedException: Key expired\n at com.auth.Filter.doFilter(Filter.java:89)', durationMs: 34 },
    { level: 'WARN', message: 'Slow query detected: SELECT * FROM audit_logs...', durationMs: 1200 },
    { level: 'INFO', message: 'Worker node-07 joined the cluster', durationMs: 250 },
    { level: 'FATAL', message: 'Database connection pool exhausted', stackTrace: 'org.hibernate.exception.JDBCConnectionException: Cannot get connection\n at org.hibernate.pool.C3P0(C3P0.java:991)', durationMs: 0 }
];

async function seed() {
    console.log('--- Starting Sentinel Demo Seeding ---');
    
    for (const log of logs) {
        try {
            const response = await fetch(`${BACKEND_URL}/ingest/log`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'sentinel-demo-key-2026'
                },
                body: JSON.stringify(log)
            });
            if (response.ok) {
                console.log(`[${log.level}] Ingested: ${log.message.substring(0, 30)}...`);
            } else {
                console.error(`Failed to ingest ${log.level}: ${response.statusText}`);
            }
        } catch (err) {
            console.error(`Error connecting to backend: ${err.message}`);
        }
        // Small delay to simulate real-time ingestion
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log('--- Seeding Complete! ---');
}

seed();
