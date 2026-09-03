import { initDb } from './src/config/db';
import fs from 'fs';
import path from 'path';

const setup = async () => {
  try {
    const db = await initDb();
    
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
