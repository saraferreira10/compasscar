const db = require("../database/connection");

const utils = require("../utils/car.utils");

module.exports.save = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { brand, model, year, items } = req.body;

    const values = [brand, model, year];

    const queryCreateCar =
      "INSERT INTO cars (brand, model, year) VALUES (?, ?, ?)";

    const [result] = await connection.execute(queryCreateCar, values);
    const carId = result.insertId;

    if (items) {
      await utils.insertAndUpdateCarItems(connection, carId, items);
    }

    await connection.commit();

    res
      .status(201)
      .json(Object.assign({ id: carId }, { brand, model, year, items: items }));
  } catch (e) {
    await connection.rollback();
    console.log(e);
    res.status(500).json({ error: "internal server error" });
  } finally {
    connection.release();
  }
};

module.exports.findByID = async (req, res) => {
  try {
    const [response] = await db.execute(
      `SELECT cars.*, group_concat(cars_items.name) AS items 
        FROM cars 
        LEFT JOIN cars_items ON cars.id = cars_items.car_id 
        WHERE cars.id = ? 
        GROUP BY cars.id`,
      [req.params.id]
    );

    if (response.length === 0) {
      return res.status(404).json({ error: "car not found" });
    }

    const car = response[0];
    car.items = car.items ? car.items.split(",") : [];

    res.status(200).json(car);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports.findAll = async (req, res) => {
  try {
    let { page, limit, brand, model, year } = req.query;

    limit = limit && limit > 10 ? 10 : limit;
    limit = limit && limit > 0 ? limit * 1 : 5;

    page = page * 1 || 1;
    const skip = (page - 1) * limit;

    let sqlCars = `SELECT * FROM cars LIMIT ${limit} OFFSET ${skip}`;
    let sqlCount = "SELECT COUNT(*) AS count FROM cars";

    const filterQuery = [];

    if (brand) {
      filterQuery.push(`brand LIKE '%${brand}%'`);
    }

    if (model) {
      filterQuery.push(`model LIKE '%${model}%'`);
    }

    if (year) {
      filterQuery.push(`year >= ${year}`);
    }

    if (filterQuery.length > 0) {
      sqlCars = `SELECT * FROM cars WHERE ${filterQuery.join(
        " AND "
      )} LIMIT ${limit} OFFSET ${skip}`;

      sqlCount = `SELECT COUNT(*) AS count FROM cars WHERE ${filterQuery.join(
        " AND "
      )} LIMIT ${limit} OFFSET ${skip}`;
    }

    let [count] = await db.execute(sqlCount);

    if (count.length === 0 || count[0].count === 0) {
      return res.status(204).send();
    }

    count = count[0].count;

    const [cars] = await db.execute(sqlCars);

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
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

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
      const { isValid, currentYear } = utils.validateCarYear(year);

      if (isValid) {
        queryFields.push("year = ?");
        valueFields.push(year);
      } else {
        return res.status(400).json({
          error: `year should be between ${
            currentYear - 10
          } and ${currentYear}`,
        });
      }
    }

    if (items) {
      await utils.insertAndUpdateCarItems(connection, req.params.id, items);
    }

    if (queryFields.length > 0) {
      valueFields.push(req.params.id);
      const query = `UPDATE cars SET ${queryFields} WHERE id = ?`;
      await connection.execute(query, valueFields);
    }

    await connection.commit();
    res.status(204).send();
  } catch (e) {
    console.log(e);
    await connection.rollback();
    res.status(500).json({ error: "internal server error" });
  } finally {
    connection.release();
  }
};

module.exports.deleteCar = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute("DELETE FROM cars_items WHERE car_id = ?", [
      req.params.id,
    ]);

    await connection.execute("DELETE FROM cars WHERE id = ?", [req.params.id]);

    await connection.commit();
    res.status(204).send();
  } catch (e) {
    console.log(e);
    await connection.rollback();
    res.status(500).json({ error: "internal server error" });
  } finally {
    connection.release();
  }
};
