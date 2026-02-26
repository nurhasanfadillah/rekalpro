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

console.log('Starting data cleanup...');

// Delete in correct order to respect foreign keys
db.serialize(() => {
  // Step 1: Delete all bill of materials
  db.run('DELETE FROM bill_of_materials', function(err) {
    if (err) {
      console.error('Error deleting BoM:', err.message);
    } else {
      console.log('✓ Deleted BoM records:', this.changes);
    }
  });

  // Step 2: Delete all products
  db.run('DELETE FROM products', function(err) {
    if (err) {
      console.error('Error deleting products:', err.message);
    } else {
      console.log('✓ Deleted products:', this.changes);
    }
  });

  // Step 3: Delete all materials
  db.run('DELETE FROM materials', function(err) {
    if (err) {
      console.error('Error deleting materials:', err.message);
    } else {
      console.log('✓ Deleted materials:', this.changes);
    }
  });

  // Step 4: Delete all categories
  db.run('DELETE FROM categories', function(err) {
    if (err) {
      console.error('Error deleting categories:', err.message);
    } else {
      console.log('✓ Deleted categories:', this.changes);
    }
  });

  // Step 5: Reset auto-increment counters
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('categories', 'materials', 'products', 'bill_of_materials')", function(err) {
    if (err) {
      console.error('Error resetting sequences:', err.message);
    } else {
      console.log('✓ Reset auto-increment counters');
    }
    
    console.log('\n✅ Database cleanup complete!');
    console.log('The app now has a clean slate.');
    
    db.close(() => {
      process.exit(0);
    });
  });
});
