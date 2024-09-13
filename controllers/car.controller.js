const db = require("../database/connection");

const utils = require("../utils/car.utils");

module.exports.save = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { brand, model, year, items } = req.body;

    const queryCreateCar =
      "INSERT INTO cars (brand, model, year) VALUES (?, ?, ?)";
    const values = [brand, model, year];

    const [result] = await connection.execute(queryCreateCar, values);
    const carId = result.insertId;

    if (items) await utils.insertAndUpdateCarItems(connection, carId, items);
    await connection.commit();

    res
      .status(201)
      .json(Object.assign({ id: carId }, { brand, model, year, items: items }));
  } catch (e) {
    await connection.rollback();
    console.log(e);
    next(); // chama o middleware de erro
  } finally {
    connection.release();
  }
};

module.exports.findByID = async (req, res, next) => {
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
    console.log(e);
    next(); // chama o middleware de erro
  }
};

module.exports.findAll = async (req, res, next) => {
  try {
    let { brand, model, year } = req.query;

    const { limit, offset } = utils.calculatePaginationValues(
      req.query.limit,
      req.query.page
    );

    const { sqlCount, sqlCars } = utils.createCarFilterQueries(
      limit,
      offset,
      brand,
      model,
      year
    );

    const [cars] = await db.execute(sqlCars);

    if (cars.length === 0) return res.status(204).send();

    const [count] = await db.execute(sqlCount);

    res.status(200).json({
      count: count[0].count,
      pages: Math.ceil(count[0].count / limit),
      data: cars,
    });
  } catch (e) {
    console.log(e);
    next(); // chama o middleware de erro
  }
};

module.exports.patchCar = async (req, res, next) => {
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
      queryFields.push("year = ?");
      valueFields.push(year);
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
    await connection.rollback();
    console.log(e);
    next(); // chama o middleware de erro
  } finally {
    connection.release();
  }
};

module.exports.deleteCar = async (req, res, next) => {
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
    await connection.rollback();
    console.log(e);
    next(); // chama o middleware de erro
  } finally {
    connection.release();
  }
};
