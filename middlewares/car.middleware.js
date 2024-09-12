const db = require("../database/connection");

module.exports.checkIfCarExist = async (req, res, next) => {
  try {
    const id = req.params.id * 1;
    const [car] = await db.execute("SELECT * FROM cars WHERE id = ?", [id]);

    if (car.length === 0) {
      return res.status(404).json({ error: "car not found" });
    }

    if (req.method !== "DELETE") req.car = car[0];

    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports.validateRequiredFields = (req, res, next) => {
  const { brand, model, year, items } = req.body;

  if (!brand || brand.trim() === "") {
    return res.status(400).json({ error: "brand is required" });
  }

  if (!model || model.trim() === "") {
    return res.status(400).json({ error: "model is required" });
  }

  if (!year) {
    return res.status(400).json({ error: "year is required" });
  }

  if (!items) {
    return res.status(400).json({ error: "items is required" });
  }

  next();
};

module.exports.checkForIdenticalCar = async (req, res, next) => {
  const { brand, model, year } = req.body;

  const sql =
    req.method === "POST"
      ? "SELECT * FROM cars WHERE brand = ? AND model = ? AND year = ?"
      : "SELECT * FROM cars WHERE brand = ? AND model = ? AND year = ? AND id != ?"; // metódo patch

  let values = [
    (brand && brand.trim()) || req.car.brand,
    (model && model.trim()) || req.car.model,
    year || req.car.year,
  ];

  if (req.method === "PATCH") values.push(+req.params.id);

  const [identicalCar] = await db.execute(sql, values);

  if (identicalCar.length !== 0) {
    return res.status(409).json({
      error: "there is already a car with this data",
    });
  }

  next();
};

module.exports.validateCarYear = (req, res, next) => {
  const year = req.body.year;
  const currentYear = new Date().getFullYear() + 1;
  const isValid = year >= currentYear - 10 && year <= currentYear;

  if (!isValid) {
    return res.status(400).json({
      error: `year should be between ${currentYear - 10} and ${currentYear}`,
    });
  }

  next();
};

module.exports.defaultErrorHandler = (req, res) => {
  return res.status(500).json({ error: "internal server error" });
};
