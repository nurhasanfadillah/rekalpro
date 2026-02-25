const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Step 1: Check orphaned BoM records
db.all(
  'SELECT COUNT(*) as total FROM bill_of_materials WHERE product_id NOT IN (SELECT id FROM products)',
  [],
  (err, rows) => {
    if (err) {
      console.error('Error checking orphaned records:', err.message);
      db.close();
      return;
    }
    console.log('Orphaned BoM records found:', rows[0].total);

    // Step 2: Delete orphaned BoM records
    db.run(
      'DELETE FROM bill_of_materials WHERE product_id NOT IN (SELECT id FROM products)',
      function(err) {
        if (err) {
          console.error('Error deleting orphaned records:', err.message);
        } else {
          console.log('Deleted orphaned BoM records:', this.changes);
        }

        // Step 3: Verify remaining BoM records
        db.all(
          'SELECT bom.id, bom.product_id, p.name as product_name, m.name as material_name FROM bill_of_materials bom LEFT JOIN products p ON bom.product_id = p.id LEFT JOIN materials m ON bom.material_id = m.id',
          [],
          (err, rows) => {
            if (err) {
              console.error('Error fetching BoM:', err.message);
            } else {
              console.log('Remaining BoM records:', JSON.stringify(rows, null, 2));
            }
            db.close(() => {
              console.log('Database closed');
              process.exit(0);
            });
          }
        );
      }
    );
  }
);
