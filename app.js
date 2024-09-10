const express = require("express");

const db = require("./database/connection");
const connection = require("./database/connection");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/cars", (req, res) => {
  const { brand, model, year, items } = req.body;

  const query = "INSERT INTO cars (brand, model, year) VALUES (?, ?, ?)";

  const values = [brand, model, year];

  console.log(items);
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

app.get("/api/v1/cars/:id", async (req, res) => {
  const sql = "SELECT * FROM cars WHERE id = ?";

  try {
    const [rows] = await db.execute(sql, [req.params.id]);
    res.status(200).json(...rows);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
});

app.get("/api/v1/cars", async (req, res) => {
  const sql = "SELECT * FROM cars";

  try {
    const [rows] = await db.execute(sql);
    res.status(200).json(rows);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
});

app.patch("/api/v1/cars/:id", async (req, res) => {
  const { brand, model, year } = req.body;

  const queryFields = []; // armazena as partes necessárias na construção da query (ex. "field = ?")
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

  try {
    await db.execute(query, valueFields);
    res.status(204).send();
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
});

app.delete("/api/v1/cars/:id", async (req, res) => {
  const sql = "DELETE FROM cars WHERE id = ?";

  try {
    await db.execute(sql, [req.params.id]);
    res.status(204).send();
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
});

app.use((req, res) => res.send("Hello World"));

app.listen(3000);
