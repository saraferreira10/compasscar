const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ish@9090",
  database: "compasscar",
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar:", err);
  }

  console.log("Conectado ao banco de dados.");
});

module.exports = connection;
