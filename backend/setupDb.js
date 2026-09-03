const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const setup = async () => {
  try {
    const db = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Read and execute schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.exec(schema);
    console.log('Schema created.');

    // Read and execute seed
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await db.exec(seed);
    console.log('Seed data inserted.');

    console.log('Database setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Setup error:', err);
    process.exit(1);
  }
};

setup();
