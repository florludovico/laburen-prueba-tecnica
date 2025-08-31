const { pool } = require("./database");

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const singularize = (str) => {
  if (str.endsWith("es")) return str.slice(0, -2);
  if (str.endsWith("s")) return str.slice(0, -1);
  return str;
};

const findAllProducts = async (queryFilter) => {
  let query;
  const queryParams = [];

  if (queryFilter && queryFilter.trim().length > 0) {
    const normalizedQuery = removeAccents(queryFilter.toLowerCase());
    const singularQuery = singularize(normalizedQuery);

    query = `
      SELECT id, name, description, price, stock
      FROM products
      WHERE lower(translate(name, 'áéíóúÁÉÍÓÚ', 'aeiouaeiou')) LIKE $1
         OR lower(translate(description, 'áéíóúÁÉÍÓÚ', 'aeiouaeiou')) LIKE $1
      ORDER BY id ASC
      LIMIT 50;
    `;
    queryParams.push(`%${singularQuery}%`);
  } else {
    query = `
      SELECT id, name, description, price, stock
      FROM products
      ORDER BY id ASC
      LIMIT 50;
    `;
  }

  const result = await pool.query(query, queryParams);
  return result.rows;
};

const findProductById = async (id) => {
  const query =
    "SELECT id, name, description, price, stock FROM products WHERE id = $1";
  const result = await pool.query(query, [id]);

  return result.rows[0];
};

module.exports = {
  findAllProducts,
  findProductById,
};
