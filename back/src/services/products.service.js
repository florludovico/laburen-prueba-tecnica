const { pool } = require("./database");

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const singularize = (str) => {
  if (str.endsWith("es")) return str.slice(0, -2);
  if (str.endsWith("s")) return str.slice(0, -1);
  return str;
};

const findAllProducts = async (queryFilter) => {
  if (!queryFilter || queryFilter.trim().length === 0) {
    const result = await pool.query(`
      SELECT id, name, description, price, stock
      FROM products
      ORDER BY id ASC
      LIMIT 50;
    `);
    return result.rows;
  }

  const normalizedQuery = removeAccents(queryFilter.toLowerCase());
  const singularQuery = singularize(normalizedQuery);

  const words = singularQuery.split(/\s+/);

  const conditions = words.map((_, i) =>
        `(lower(translate(name, 'áéíóúÁÉÍÓÚ','aeiouaeiou')) LIKE $${i + 1} OR
      lower(translate(description, 'áéíóúÁÉÍÓÚ','aeiouaeiou')) LIKE $${i + 1})`
    )
    .join(" AND ");

  const query = `
    SELECT id, name, description, price, stock
    FROM products
    WHERE ${conditions}
    ORDER BY id ASC
    LIMIT 50;
  `;

  const queryParams = words.map((word) => `%${word}%`);

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
