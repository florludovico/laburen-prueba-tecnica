const { pool } = require("./database");

const create = async (items) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const productIds = items.map((item) => item.product_id);
    const productsResult = await client.query(
      "SELECT id FROM products WHERE id = ANY($1::int[])",
      [productIds]
    );
    if (productsResult.rows.length !== productIds.length) {
      throw new Error("Uno o más productos no fueron encontrados.");
    }

    const cartResult = await client.query(
      "INSERT INTO carts DEFAULT VALUES RETURNING id"
    );
    const cartId = cartResult.rows[0].id;

    const itemInsertPromises = items.map((item) => {
      const query =
        "INSERT INTO cart_items (cart_id, product_id, qty) VALUES ($1, $2, $3)";
      return client.query(query, [cartId, item.product_id, item.qty]);
    });
    await Promise.all(itemInsertPromises);

    await client.query("COMMIT");

    return {
      cart_id: cartId,
      items: items,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};

const update = async (cartId, items) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cartResult = await client.query('SELECT 1 FROM carts WHERE id = $1', [cartId]);
    if (cartResult.rowCount === 0) {
      throw new Error('El carrito no fue encontrado.');
    }

    const productIds = items.map(item => item.product_id);
    const productsResult = await client.query('SELECT id FROM products WHERE id = ANY($1::int[])', [productIds]);
    if (productsResult.rows.length !== productIds.length) {
      throw new Error('Uno o más productos no fueron encontrados.');
    }

    for (const item of items) {
      const { product_id, qty } = item;

      if (qty <= 0) {
        await client.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, product_id]);
      } else {
        const upsertQuery = `
          INSERT INTO cart_items (cart_id, product_id, qty)
          VALUES ($1, $2, $3)
          ON CONFLICT (cart_id, product_id)
          DO UPDATE SET qty = EXCLUDED.qty;
        `;
        await client.query(upsertQuery, [cartId, product_id, qty]);
      }
    }

    await client.query('COMMIT');

    const finalCartItems = await pool.query('SELECT product_id, qty FROM cart_items WHERE cart_id = $1 ORDER BY id ASC', [cartId]);

    return {
      cart_id: Number(cartId),
      items: finalCartItems.rows,
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  create,
  update,
};
