const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Ish@9090",
  database: "compasscar",
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
