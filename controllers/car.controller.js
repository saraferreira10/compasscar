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
      .json(Object.assign({ id: carId }, { brand, model, year, items: [...new Set(items)] }));
  } catch (e) {
    await connection.rollback();
    console.log(e);
    next();
  } finally {
    connection.release();
  }
};

module.exports.findByID = async (req, res, next) => {
  try {
    const [response] = await db.execute("SELECT * FROM cars WHERE id = ?", [
      req.params.id,
    ]);

    if (response.length === 0) {
      return res.status(404).json({ error: "car not found" });
    }

    const car = response[0];

    const [items] = await db.execute(
      "SELECT * FROM cars_items WHERE car_id = ?",
      [req.params.id]
    );

    car.items = items.map((item) => item.name);

    res.status(200).json(car);
  } catch (e) {
    console.log(e);
    next();
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
    next(); 
  }
};

module.exports.patchCar = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { brand, model, year, items } = req.body;

    const { query, valueFields } = utils.createUpdateCarQuery(
      brand,
      model,
      year,
      req.params.id
    );

    if (items && items.length > 0) {
      await utils.insertAndUpdateCarItems(connection, req.params.id, items);
    }

    if (query) await connection.execute(query, valueFields);

    await connection.commit();
    res.status(204).send();
  } catch (e) {
    await connection.rollback();
    console.log(e);
    next(); 
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
    next();
  } finally {
    connection.release();
  }
};
