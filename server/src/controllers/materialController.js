const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// Get all materials with category info
exports.getAllMaterials = (req, res) => {
  const query = `
    SELECT m.*, c.name as category_name 
    FROM materials m 
    JOIN categories c ON m.category_id = c.id 
    ORDER BY m.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Get material by ID
exports.getMaterialById = (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT m.*, c.name as category_name 
    FROM materials m 
    JOIN categories c ON m.category_id = c.id 
    WHERE m.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(row);
  });
};

// Create material
exports.createMaterial = (req, res) => {
  const { name, category_id, standard_price, unit } = req.body;
  
  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Material name is required' });
  }
  if (!category_id) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (standard_price === undefined || standard_price < 0) {
    return res.status(400).json({ error: 'Valid standard price is required' });
  }
  if (!unit || !['Pcs', 'Cm'].includes(unit)) {
    return res.status(400).json({ error: 'Unit must be Pcs or Cm' });
  }
  
  const id = uuidv4();
  
  db.run(
    'INSERT INTO materials (id, name, category_id, standard_price, unit) VALUES (?, ?, ?, ?, ?)',
    [id, name.trim(), category_id, standard_price, unit],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const query = `
        SELECT m.*, c.name as category_name 
        FROM materials m 
        JOIN categories c ON m.category_id = c.id 
        WHERE m.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(row);
      });
    }
  );
};

// Update material
exports.updateMaterial = (req, res) => {
  const { id } = req.params;
  const { name, category_id, standard_price, unit } = req.body;
  
  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Material name is required' });
  }
  if (!category_id) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (standard_price === undefined || standard_price < 0) {
    return res.status(400).json({ error: 'Valid standard price is required' });
  }
  if (!unit || !['Pcs', 'Cm'].includes(unit)) {
    return res.status(400).json({ error: 'Unit must be Pcs or Cm' });
  }
  
  db.run(
    'UPDATE materials SET name = ?, category_id = ?, standard_price = ?, unit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name.trim(), category_id, standard_price, unit, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Material not found' });
      }
      
      const query = `
        SELECT m.*, c.name as category_name 
        FROM materials m 
        JOIN categories c ON m.category_id = c.id 
        WHERE m.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
};

// Delete material
exports.deleteMaterial = (req, res) => {
  const { id } = req.params;
  
  // Check if material is used in any BoM
  db.get('SELECT COUNT(*) as count FROM bill_of_materials WHERE material_id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus: Material masih digunakan dalam komposisi produk.' 
      });
    }
    
    db.run('DELETE FROM materials WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Material not found' });
      }
      
      res.json({ message: 'Material deleted successfully' });
    });
  });
};
