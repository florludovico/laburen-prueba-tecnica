require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;


const pool = new Pool({
  connectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
});


module.exports = {
  pool,
};
