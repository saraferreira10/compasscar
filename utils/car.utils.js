module.exports.insertAndUpdateCarItems = async (connection, id, items) => {
  try {
    const uniqueItems = [...new Set(items)];

    await connection.execute("DELETE FROM cars_items WHERE car_id = ?", [id]); // deleta os itens caso existam

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

module.exports.calculatePaginationValues = (limit, page) => {
  try {
    limit = limit && limit > 10 ? 10 : limit;
    limit = limit && limit > 0 ? limit * 1 : 5;

    page = page > 0 ? page * 1 : 1;

    const offset = (page - 1) * limit;

    return { limit, offset };
  } catch (e) {
    throw e;
  }
};

module.exports.createCarFilterQueries = (limit, offset, brand, model, year) => {
  try {
    let sqlCars = `SELECT * FROM cars LIMIT ${limit} OFFSET ${offset}`;
    let sqlCount = "SELECT COUNT(*) AS count FROM cars";

    const filterQuery = [];

    if (brand) filterQuery.push(`brand LIKE '%${brand}%'`);

    if (model) filterQuery.push(`model LIKE '%${model}%'`);

    if (year) filterQuery.push(`year >= ${year}`);

    if (filterQuery.length > 0) {
      sqlCars = `SELECT * FROM cars WHERE ${filterQuery.join(
        " AND "
      )} LIMIT ${limit} OFFSET ${offset}`;

      sqlCount = `SELECT COUNT(*) AS count FROM cars WHERE ${filterQuery.join(
        " AND "
      )}`;
    }

    return { sqlCount, sqlCars };
  } catch (e) {
    throw e;
  }
};

module.exports.createUpdateCarQuery = (brand, model, year, id) => {
  try {
    let query;

    const queryFields = [];
    const valueFields = [];

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

    if (queryFields.length > 0) {
      query = `UPDATE cars SET ${queryFields} WHERE id = ?`;
      valueFields.push(id);
    }

    return { query, valueFields };
  } catch (e) {
    throw e;
  }
};
