import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const inicializarBaseDatos = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("usuarios.db");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
  }

  return db;
};
