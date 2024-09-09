const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ish@9090",
  database: "compasscar",
});

module.exports = connection;
