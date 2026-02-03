const mysql = require('mysql2/promise');

async function checkTimezone() {
    const connection = await mysql.createConnection({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: 'xCYoPu9NGb33H4D.root',
        password: 'tqW8ZkQBB7n1eMQG',
        database: 'test',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Checking database timezone settings...');

        // Check system timezone
        const [systemTz] = await connection.execute('SELECT @@system_time_zone as system_timezone');
        console.log('System timezone:', systemTz[0].system_timezone);

        // Check session timezone
        const [sessionTz] = await connection.execute('SELECT @@session.time_zone as session_timezone');
        console.log('Session timezone:', sessionTz[0].session_timezone);

        // Check current timestamp
        const [currentTime] = await connection.execute('SELECT NOW() as current_time');
        console.log('Current server time:', currentTime[0].current_time);

        // Test with a sample record if any exist
        try {
            const [sampleRecord] = await connection.execute('SELECT created_at, updated_at FROM yatra_registrations LIMIT 1');
            if (sampleRecord.length > 0) {
                console.log('Sample record timestamps:');
                console.log('Created at:', sampleRecord[0].created_at);
                console.log('Updated at:', sampleRecord[0].updated_at);
            } else {
                console.log('No registration records found to check timestamps');
            }
        } catch (error) {
            console.log('No registration records to check');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkTimezone();