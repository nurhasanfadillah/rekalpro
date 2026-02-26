const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

db.all("SELECT * FROM products", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Products in database:');
    console.log('Total:', rows.length);
    rows.forEach((row, index) => {
      console.log(`\nProduct ${index + 1}:`);
      console.log('ID:', row.id);
      console.log('Name:', row.name);
      console.log('Description:', row.description);
      console.log('Production Cost:', row.production_cost);
      console.log('Selling Price:', row.estimated_selling_price);
      console.log('Material Cost:', row.total_material_cost);
      console.log('Profit:', row.gross_profit_per_unit);
    });
  }
  db.close();
});
