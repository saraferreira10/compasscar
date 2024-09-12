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

(async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("Conectado ao banco de dados");
  } catch (e) {
    console.log("Erro ao conectar ao banco de dados:", e);
  }
})();

module.exports = pool;
