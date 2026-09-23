import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const inicializarBaseDatos = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("usuarios.db");

    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'PENDIENTE',
        rol TEXT
      );

      CREATE TABLE IF NOT EXISTS Cliente (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idUsuario INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        fecha TEXT,
        FOREIGN KEY (idUsuario) REFERENCES usuarios(id)
      );

      CREATE TABLE IF NOT EXISTS Producto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        valorUnitario REAL NOT NULL,
        stock INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Encabezado (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idCliente INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (idCliente) REFERENCES Cliente(id)
      );

      CREATE TABLE IF NOT EXISTS Detalles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idEncabezado INTEGER NOT NULL,
        idProducto INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        valor REAL NOT NULL,
        FOREIGN KEY (idEncabezado) REFERENCES Encabezado(id),
        FOREIGN KEY (idProducto) REFERENCES Producto(id)
      );
    `);


    // Crear administrador inicial
    const administrador = await db.getFirstAsync(
      "SELECT * FROM usuarios WHERE correo = ?",
      "admin@gmail.com"
    );

    if (!administrador) {
      await db.runAsync(
        `
        INSERT INTO usuarios
        (correo, password, estado, rol)
        VALUES (?, ?, ?, ?)
        `,
        "admin@gmail.com",
        "1234",
        "ACTIVO",
        "ADMIN"
      );

      console.log("Administrador creado correctamente");
    }

    console.log("Base de datos inicializada correctamente");
  }

  return db;
};