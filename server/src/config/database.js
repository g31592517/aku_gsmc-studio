require("dotenv").config();

/*
  SQL Server connection pool configuration.

  mssql uses a singleton pool — calling sql.connect() returns the same
  pool instance on subsequent calls once it has been initialised.

  All queries use this pool via the sql object exported below.

  Authentication:
  - If DB_USER is set, SQL Server authentication is used (tedious driver).
  - If DB_USER is empty, Windows Authentication is used via the
    msnodesqlv8 driver — the plain tedious driver's `trustedConnection`
    option does NOT perform real Windows Integrated Auth, so a separate
    native driver is required to connect as the Windows user running the app.
*/
const useWindowsAuth = !process.env.DB_USER;

const sql = require(useWindowsAuth ? "mssql/msnodesqlv8" : "mssql");

const connectionConfig = {
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  ...(useWindowsAuth
    ? { driver: "ODBC Driver 17 for SQL Server" }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
  options: {
    // Use Windows Authentication when no SQL login is configured
    trustedConnection: useWindowsAuth,

    // Required for Azure SQL and most cloud-hosted SQL Server instances.
    // Set DB_ENCRYPT=true in .env for production.
    encrypt: process.env.DB_ENCRYPT === "true",

    // Allow self-signed certificates on local development instances.
    // Always false in production.
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(connectionConfig);
  }
  return pool;
}

async function verifyDatabaseConnection() {
  try {
    const connection = await getPool();
    await connection.request().query("SELECT 1 AS connected");
    console.log("Connected to Microsoft SQL Server.");
  } catch (error) {
    console.error("Could not connect to SQL Server:", error.message);
    process.exit(1);
  }
}

module.exports = { sql, getPool, verifyDatabaseConnection };
