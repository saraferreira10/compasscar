const db = require("../database/connection");

module.exports.validateCarYear = (year) => {
  const currentYear = new Date().getFullYear() + 1;
  return {
    isValid: year >= currentYear - 10 && year <= currentYear,
    currentYear,
  };
};

module.exports.updateCarItems = async (id, items) => {
  try {
    await db.execute("DELETE FROM cars_items WHERE car_id = ?", [id]); // deleta os itens antigos caso existam

    for (const item of items) {
      await db.execute("INSERT INTO cars_items (name, car_id)  VALUES (?, ?)", [
        item,
        id,
      ]);
    }
  } catch (e) {
    console.error(e);
  }
};
