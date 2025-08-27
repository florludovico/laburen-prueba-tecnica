const { pool } = require('./database');

const findAllProducts = async (queryFilter) => {
  let query;
  const queryParams = [];

  if (queryFilter && queryFilter.trim().length > 0) {
    query = `
      SELECT id, name, description, price, stock
      FROM products
      WHERE to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')) @@ plainto_tsquery('simple', $1)
      ORDER BY id ASC
      LIMIT 50;
    `;
    queryParams.push(queryFilter);
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
  const query = 'SELECT id, name, description, price, stock FROM products WHERE id = $1';
  const result = await pool.query(query, [id]);

  return result.rows[0];
};


module.exports = {
  findAllProducts,
  findProductById,
};