const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: { encrypt: false, trustServerCertificate: true },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', (err) => console.error('DB pool error:', err));

module.exports = { pool, poolConnect, sql };
