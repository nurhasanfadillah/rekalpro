const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // WAJIB: Aktifkan foreign key enforcement di SQLite
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('Error enabling foreign keys:', err.message);
      } else {
        console.log('Foreign keys enabled');
        initializeTables();
      }
    });
  }
});

function initializeTables() {
  // Tabel Kategori Material
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabel Katalog Material
  db.run(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      standard_price REAL NOT NULL,
      unit TEXT NOT NULL CHECK(unit IN ('Pcs', 'Cm')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Tabel Produk
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      overhead_percentage REAL NOT NULL DEFAULT 0,
      target_margin_percentage REAL NOT NULL DEFAULT 0,
      total_material_cost REAL DEFAULT 0,
      production_cost REAL DEFAULT 0,
      estimated_selling_price REAL DEFAULT 0,
      gross_profit_per_unit REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabel Bill of Materials (BoM)
  db.run(`
    CREATE TABLE IF NOT EXISTS bill_of_materials (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES materials(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    } else {
      console.log('Database tables initialized');
    }
  });
}

module.exports = db;
