require('dotenv').config();
const mysql = require('mysql2/promise');

exports.db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 25060, // Default Aiven MySQL port
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false 
    }
});
