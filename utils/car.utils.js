const db = require("../database/connection");

module.exports.validateCarYear = (year) => {
  const currentYear = new Date().getFullYear() + 1;
  return {
    isValid: year >= currentYear - 10 && year <= currentYear,
    currentYear,
  };
};

module.exports.insertCarItems = async (connection, id, items) => {
  try {
    const uniqueItems = [...new Set(items)];

    await db.execute("DELETE FROM cars_items WHERE car_id = ?", [id]); // deleta os itens caso existam

    for (const item of uniqueItems) {
      await connection.execute(
        "INSERT INTO cars_items (name, car_id) VALUES (?, ?)",
        [item, id]
      );
    }
  } catch (e) {
    throw e;
  }
};
