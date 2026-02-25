const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const materialRoutes = require('./routes/materialRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Cleanup orphaned BoM records on startup (safety measure)
setTimeout(() => {
  db.run(
    'DELETE FROM bill_of_materials WHERE product_id NOT IN (SELECT id FROM products)',
    function(err) {
      if (err) {
        console.error('Error cleaning orphaned BoM records:', err.message);
      } else if (this.changes > 0) {
        console.log(`Cleaned up ${this.changes} orphaned BoM record(s)`);
      }
    }
  );
}, 1000);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ReKal API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
