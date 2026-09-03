import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database;

export const initDb = async () => {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, '../../database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return dbInstance;
};

// Polyfill pg query interface
export const query = async (text: string, params: any[] = []) => {
  if (!dbInstance) await initDb();
  
  // Convert pg positional $1, $2 to sqlite ?
  const sqliteText = text.replace(/\$\d+/g, '?');
  
  const upperText = sqliteText.trim().toUpperCase();
  const isModification = upperText.startsWith('INSERT') || upperText.startsWith('UPDATE') || upperText.startsWith('DELETE');
  const hasReturning = upperText.includes('RETURNING');

  try {
    if (isModification && !hasReturning) {
      await dbInstance.run(sqliteText, params);
      return { rows: [] };
    }
    
    const rows = await dbInstance.all(sqliteText, params);
    return { rows };
  } catch (error) {
    console.error('SQL Error:', error, '\\nQuery:', sqliteText, '\\nParams:', params);
    throw error;
  }
};
