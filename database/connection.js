const mysql = require("mysql2/promise");

require("dotenv").config({
  path: `${__dirname}/../config/config.env`,
});

const { USER, PASSWORD, HOST, DATABASE } = process.env;

const pool = mysql.createPool({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
});

module.exports = pool;
