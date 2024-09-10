const express = require("express");

const db = require("./database/connection");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/cars", async (req, res) => {
  const { brand, model, year, items } = req.body;

  if (!brand || brand.trim() === "") {
    return res
      .status(400)
      .json({ status: "fail", message: "brand is required" });
  }

  if (!model || model.trim() === "") {
    return res
      .status(400)
      .json({ status: "fail", message: "model is required" });
  }

  if (!year) {
    return res
      .status(400)
      .json({ status: "fail", message: "year is required" });
  }

  if (!items) {
    return res
      .status(400)
      .json({ status: "fail", message: "items is required" });
  }

  const currentYear = new Date().getFullYear() + 1;

  if (year < currentYear - 10 || year > currentYear) {
    return res.status(400).json({
      status: "fail",
      message: `year should be between ${currentYear - 10} and ${currentYear}`,
    });
  }
  const values = [brand, model, year];

  const [identicalCar] = await db.execute(
    "SELECT * FROM cars WHERE brand = ? AND model = ? AND year = ?",
    values
  );

  if (identicalCar.length !== 0) {
    return res
      .status(409)
      .json({
        status: "fail",
        message: "there is already a car with this data",
      });
  }

  const queryCreateCar =
    "INSERT INTO cars (brand, model, year) VALUES (?, ?, ?)";

  try {
    const [result] = await db.execute(queryCreateCar, values);
    const carId = result.insertId;

    let uniqueItems = [];

    if (items) {
      uniqueItems = [...new Set(items)]; // eliminando itens repetidos

      for (const item of uniqueItems) {
        const queryCreateItems =
          "INSERT INTO cars_items (name, car_id)  VALUES (?, ?)";
        await db.execute(queryCreateItems, [item, carId]);
      }
    }

    res
      .status(201)
      .json(
        Object.assign({ id: carId }, { brand, model, year, items: uniqueItems })
      );
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
});

app.get("/api/v1/cars/:id", async (req, res) => {
  const sql = "SELECT * FROM cars WHERE id = ?";

  try {
    const [cars] = await db.execute(sql, [req.params.id]);

    if (cars.length === 0) {
      return res.status(404).json({ status: "fail", message: "car not found" });
    }

    const [items] = await db.execute(
      "SELECT * FROM cars_items WHERE car_id = ?",
      [req.params.id]
    );

    cars[0].items = items.map((item) => item.name);
    res.status(200).json(...cars);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
});

app.get("/api/v1/cars", async (req, res) => {
  const sql = "SELECT * FROM cars";

  try {
    const [cars] = await db.execute(sql);
    const [items] = await db.execute("SELECT * FROM cars_items");

    // itera sobre o array de carros
    for (let j = 0; j < cars.length; j++) {
      cars[j].items = [];

      // itera sobre todos os itens
      for (let i = 0; i < items.length; i++) {
        // verifica se determinado item pertence ao carro atual
        if (items[i].car_id == cars[j].id) {
          cars[j].items.push(items[i].name);
        }
      }
    }

    res.status(200).json(cars);
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
