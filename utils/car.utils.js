const db = require("../database/connection");

module.exports.removeIdenticalItems = (items) => {
  return [...new Set(items)];
};

module.exports.updateCarItems = async (id, items) => {
  try {
    await db.execute("DELETE FROM cars_items WHERE car_id = ?", [id]); // deleta os itens antigos caso existam

    for (const item of items) {
      await db.execute(
        "INSERT INTO cars_items (name, car_id)  VALUES (?, ?)",
        [item, id]
      );
    }
  } catch (e) {
    console.error(e);
  }
};
