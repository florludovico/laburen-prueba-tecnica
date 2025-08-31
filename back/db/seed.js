const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { pool } = require('../src/services/database');

const seedDatabase = async () => {
  const client = await pool.connect();
  const results = [];

  const csvPath = path.join(__dirname, '../products.csv');
  fs.createReadStream(csvPath)
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim().toLowerCase().replace('í', 'i').replace('ó', 'o')
    }))

    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        console.log('Iniciando el proceso de seeding...');
        await client.query('BEGIN');

        console.log('Limpiando la tabla de productos...');
        await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');

        const productsToInsert = results; 
        console.log(`Insertando ${productsToInsert.length} productos...`);

        for (const product of productsToInsert) {
          
          const name = `${product.tipo_prenda} ${product.categoria}`;
          const description = `${product.descripcion} Talla: ${product.talla}, Color: ${product.color}.`;
          const price = parseFloat(product.precio_50_u) || 0;
          const stock = parseInt(product.cantidad_disponible, 10) || 0;

          const query = `
            INSERT INTO products (name, description, price, stock)
            VALUES ($1, $2, $3, $4)
          `;
          await client.query(query, [name, description, price, stock]);
        }

        await client.query('COMMIT');
        console.log('Seeding completado con éxito.');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(' Error durante el seeding:', error);
      } finally {
        client.release();
        pool.end();
      }
    });
};

seedDatabase();