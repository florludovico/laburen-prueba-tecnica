const fs = require('fs');
const path = require('path');
const { pool } = require('../src/services/database');

const runSchema = async () => {
  try {
    console.log('Leyendo el archivo schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Ejecutando el script de esquema en la base de datos...');
    await pool.query(schemaSQL);

    console.log(' Esquema creado con éxito.');
  } catch (error) {
    console.error(' Error al ejecutar el script de esquema:', error);
  } finally {
    await pool.end();
  }
};

runSchema();
