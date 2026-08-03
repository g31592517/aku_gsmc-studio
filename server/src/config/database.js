const mysql = require("mysql2/promise");
require("dotenv").config();

/*
  Creates a connection pool.
  mysql2/promise gives us async/await support out of the box.
  All queries across the application use this pool.
*/
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable SSL for cloud-hosted MySQL providers.
  // Set DB_SSL=true in .env when required.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function verifyDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database.");
    connection.release();
  } catch (error) {
    console.error("Could not connect to MySQL database:", error.message);
    process.exit(1);
  }
}

module.exports = { pool, verifyDatabaseConnection };
