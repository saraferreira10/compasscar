const db = require("../database/connection");

module.exports.checkID = async (req, res, next) => {
  try {
    const id = req.params.id * 1;
    const [car] = await db.execute("SELECT * FROM cars WHERE id = ?", [id]);

    if (car.length === 0) {
      return res.status(404).json({ status: "fail", message: "car not found" });
    }

    req.car = car[0];
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};
