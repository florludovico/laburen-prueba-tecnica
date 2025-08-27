require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
});

module.exports = {
  pool,
};
