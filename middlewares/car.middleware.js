const db = require("../database/connection");

module.exports.checkID = async (req, res, next) => {
  try {
    const id = req.params.id * 1;
    const [car] = await db.execute("SELECT * FROM cars WHERE id = ?", [id]);

    if (car.length === 0) {
      return res.status(404).json({ status: "fail", message: "car not found" });
    }

    if (req.method === "GET") req.car = car[0];

    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

module.exports.checkRequiredFields = (req, res, next) => {
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

  next();
};
