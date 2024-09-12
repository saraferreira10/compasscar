const db = require("../database/connection");

module.exports.validateCarYear = (year) => {
  const currentYear = new Date().getFullYear() + 1;
  return {
    isValid: year >= currentYear - 10 && year <= currentYear,
    currentYear,
  };
};

module.exports.insertCarItems = async (id, items) => {
  const uniqueItems = [...new Set(items)];

  for (const item of uniqueItems) {
    await db.execute("INSERT INTO cars_items (name, car_id) VALUES (?, ?)", [
      item,
      id,
    ]);
  }
};

module.exports.updateCarItems = async (id, items) => {
  try {
    let newItems = [...new Set(items)]; // armazena os itens que devem ser adicionados
    let removeItems = []; // armazena os itens que devem ser removidos

    const [currentItems] = await db.execute(
      `SELECT cars.id, group_concat(name) AS items FROM cars 
        RIGHT JOIN cars_items ON cars_items.car_id = cars.id 
        WHERE cars.id = ?
        GROUP BY cars.id
      `,
      [id]
    ); // retorna os itens já cadastrados

    if (currentItems.length > 0) {
      const oldItems = currentItems[0].items.split(","); // armazena em um array os itens já cadastrados

      for (const old of oldItems) {
        newItems = newItems.filter((item) => item != old); // retira os itens que já estão cadastrados e não devem ser excluídos
        if (!items.includes(old)) removeItems.push(old); // adiciona em removeItems os itens que já estão cadastrados e devem ser removidos
      }
    }

    if (removeItems.length > 0) {
      for (const item of removeItems) {
        await db.execute("DELETE FROM cars_items WHERE name = ?", [item]);
      }
    }

    if (newItems.length > 0) {
      for (const item of newItems) {
        await db.execute(
          "INSERT INTO cars_items (name, car_id) VALUES (?, ?)",
          [item, id]
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};
