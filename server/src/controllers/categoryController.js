const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// Get all categories
exports.getAllCategories = (req, res) => {
  const query = `
    SELECT c.*, COUNT(m.id) as material_count 
    FROM categories c 
    LEFT JOIN materials m ON c.id = m.category_id 
    GROUP BY c.id 
    ORDER BY c.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Get category by ID
exports.getCategoryById = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(row);
  });
};

// Create category
exports.createCategory = (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  const id = uuidv4();
  
  db.run(
    'INSERT INTO categories (id, name) VALUES (?, ?)',
    [id, name.trim()],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Category name already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(row);
      });
    }
  );
};

// Update category
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  db.run(
    'UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name.trim(), id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Category name already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
};

// Delete category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;
  
  // Check if category has materials
  db.get('SELECT COUNT(*) as count FROM materials WHERE category_id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus: Kosongkan material dalam kategori ini terlebih dahulu.' 
      });
    }
    
    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    });
  });
};
