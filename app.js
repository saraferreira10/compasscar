const express = require("express");

const db = require("./database/connection");

const app = express();

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar:", err);
    process.exit(1);
  }
  console.log("Conectado ao banco de dados.");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/cars", (req, res) => {
  const { brand, model, year } = req.body;

  const query = "INSERT INTO cars (brand, model, year) VALUES (?, ?, ?)";

  const values = [brand, model, year];

  try {
    db.execute(query, values, (err, result, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return;
      }

      return res
        .status(201)
        .json(Object.assign({ id: result.insertId }, { brand, model, year }));
    });
  } catch (e) {
    console.log("Error:", e);
  }
});

app.use((req, res) => res.send("Hello World"));

app.listen(3000);
