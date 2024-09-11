const db = require("../database/connection");

const utils = require("../utils/car.utils");

module.exports.save = async (req, res) => {
  try {
    const { brand, model, year, items } = req.body;

    const values = [brand, model, year];

    const queryCreateCar =
      "INSERT INTO cars (brand, model, year) VALUES (?, ?, ?)";

    const [result] = await db.execute(queryCreateCar, values);
    const carId = result.insertId;

    let uniqueItems = [];

    if (items) {
      uniqueItems = [...new Set(items)];
      await utils.updateCarItems(carId, uniqueItems);
    }

    res
      .status(201)
      .json(
        Object.assign({ id: carId }, { brand, model, year, items: uniqueItems })
      );
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports.findByID = async (req, res) => {
  try {
    const car = req.car;

    const [items] = await db.execute(
      "SELECT * FROM cars_items WHERE car_id = ?",
      [req.params.id]
    );

    car.items = items.map((item) => item.name);
    res.status(200).json(car);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports.findAll = async (req, res) => {
  let { page, limit } = req.query;

  limit = limit && limit > 10 ? 10 : limit * 1;
  limit = limit && limit > 0 ? limit * 1 : 5;

  page = +page || 1;
  const skip = (page - 1) * limit;

  const sql = `SELECT * FROM cars LIMIT ${limit} OFFSET ${skip}`;

  try {
    const [cars] = await db.execute(sql);
    const [items] = await db.execute("SELECT * FROM cars_items");
    let [count] = await db.execute("SELECT COUNT(*) FROM cars");
    count = count[0]["COUNT(*)"];

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

    if (count === 0) {
      return res.status(204).send();
    }

    res.status(200).json({
      count,
      pages: Math.ceil(count / limit),
      data: cars,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports.patchCar = async (req, res) => {
  try {
    const { brand, model, year, items } = req.body;

    const queryFields = []; // armazena as partes necessárias na construção da query (ex. "field = ?")
    const valueFields = []; // armazena os valores que serão colocados no prepared statement

    if (brand && brand.trim() !== "") {
      queryFields.push("brand = ?");
      valueFields.push(brand);
    }

    if (model && model.trim() !== "") {
      queryFields.push("model = ?");
      valueFields.push(model);
    }

    if (year) {
      const { isValid } = utils.validateCarYear(year);

      if (isValid) {
        queryFields.push("year = ?");
        valueFields.push(year);
      }
    }

    if (items) {
      const uniqueItems = [...new Set(items)];
      await utils.updateCarItems(req.params.id, uniqueItems);
    }

    if (queryFields.length > 0) {
      valueFields.push(req.params.id);
      const query = `UPDATE cars SET ${queryFields} WHERE id = ?`;
      await db.execute(query, valueFields);
    }

    res.status(204).send();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports.deleteCar = async (req, res) => {
  try {
    await db.execute("DELETE FROM cars_items WHERE car_id = ?", [
      req.params.id,
    ]);

    await db.execute("DELETE FROM cars WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "internal server error" });
  }
};
