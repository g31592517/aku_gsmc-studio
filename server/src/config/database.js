const { Pool } = require("pg");
require("dotenv").config();

/*
  Connection strategy:
  - On Render: DATABASE_URL is set automatically when you link a PostgreSQL
    database to your web service. The pool picks it up here.
  - Locally: If DATABASE_URL is empty, the pool uses the individual
    DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD fields instead.
*/
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        // Required on Render — their PostgreSQL databases use SSL.
        // For local databases, SSL is typically not needed and this
        // block is bypassed because DATABASE_URL will be empty.
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database.");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
  process.exit(1);
});

module.exports = pool;
