const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

// Insert test data
db.serialize(() => {
  db.run("INSERT INTO products (name, description, production_cost, estimated_selling_price, total_material_cost, gross_profit_per_unit) VALUES (?, ?, ?, ?, ?, ?)", 
    ['Produk A', 'Deskripsi produk A', 100000, 150000, 80000, 50000]);
  
  db.run("INSERT INTO products (name, description, production_cost, estimated_selling_price, total_material_cost, gross_profit_per_unit) VALUES (?, ?, ?, ?, ?, ?)", 
    ['Produk B', 'Deskripsi produk B yang lebih panjang untuk testing truncate', 200000, 250000, 150000, 50000]);
  
  db.run("INSERT INTO products (name, production_cost, estimated_selling_price, total_material_cost, gross_profit_per_unit) VALUES (?, ?, ?, ?, ?)", 
    ['Produk C', 50000, 75000, 30000, 25000]);
  
  console.log('Test data added successfully');
});

db.close();
