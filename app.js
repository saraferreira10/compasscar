const express = require("express");

const db = require("./database/connection");

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
    res.status(200).json(...rows)
  });
});

app.use((req, res) => res.send("Hello World"));

app.listen(3000);
