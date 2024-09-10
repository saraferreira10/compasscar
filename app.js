const express = require("express");

const db = require("./database/connection");
const connection = require("./database/connection");

const app = express();

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

app.get("/api/v1/cars", (req, res) => {
  const sql = "SELECT * FROM cars";

  db.execute(sql, (err, rows) => {
    if (err instanceof Error) {
      console.log(err);
      return;
    }

    res.status(200).json(rows);
  });
});

app.get("/api/v1/cars/:id", (req, res) => {
  const sql = "SELECT * FROM cars WHERE id = ?";

  db.execute(sql, [req.params.id], (err, rows) => {
    console.log(rows);
    res.status(200).json(...rows);
  });
});

app.patch("/api/v1/cars/:id", (req, res) => {
  const { brand, model, year } = req.body;

  const queryFields = []; // armazena as querys que o usuário deseja atualizar
  const valueFields = []; // armazena os valores que serão colocados no prepared statement

  if (brand) {
    queryFields.push("brand = ?");
    valueFields.push(brand);
  }

  if (model) {
    queryFields.push("model = ?");
    valueFields.push(model);
  }

  if (year) {
    queryFields.push("year = ?");
    valueFields.push(year);
  }

  valueFields.push(req.params.id);

  const query = `UPDATE cars SET ${queryFields} WHERE id = ?`;

  connection.execute(query, valueFields, (err, result, fields) => {
    res.status(204).send();
  });
});

app.delete("/api/v1/cars/:id", (req, res) => {
  const sql = "DELETE FROM cars WHERE id = ?";

  db.execute(sql, [req.params.id], (err, rows) => {
    console.log(rows);
    res.status(204).send();
  });
});

app.use((req, res) => res.send("Hello World"));

app.listen(3000);
