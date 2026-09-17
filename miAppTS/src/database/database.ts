/*import * as SQLite from "expo-sqlite";

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
};*/

/*import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const inicializarBaseDatos = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("usuarios.db");

    // Crear la tabla si todavía no existe
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        esAdministrador INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Agregar la columna a bases de datos que ya existían
    try {
      await db.execAsync(`
        ALTER TABLE usuarios
        ADD COLUMN esAdministrador INTEGER NOT NULL DEFAULT 0;
      `);
    } catch (error) {
      // Si la columna ya existe, ignoramos el error
    }
  }

  return db;
};*/

import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const inicializarBaseDatos = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("usuarios.db");

    // Crear la tabla
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        esAdministrador INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Agregar la columna a bases de datos antiguas
    try {
      await db.execAsync(`
        ALTER TABLE usuarios
        ADD COLUMN esAdministrador INTEGER NOT NULL DEFAULT 0;
      `);
    } catch (error) {
      // La columna ya existe, no hacemos nada
    }

    // Verificar si ya existe un administrador
    const administrador = await db.getFirstAsync(
      "SELECT * FROM usuarios WHERE correo = ?",
      "admin@gmail.com"
    );

    // Si no existe, lo creamos
    if (!administrador) {
      await db.runAsync(
        "INSERT INTO usuarios (correo, password, esAdministrador) VALUES (?, ?, ?)",
        "admin@gmail.com",
        "1234",
        1
      );

      console.log("Administrador creado correctamente");
    }
  }

  return db;
};
