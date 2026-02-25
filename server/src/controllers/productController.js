const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// Calculate HPP and related values
function calculateCosts(totalMaterialCost, overheadPercentage, targetMarginPercentage) {
  // HPP = Total Biaya Material / (1 - Overhead%)
  const productionCost = totalMaterialCost / (1 - overheadPercentage / 100);
  
  // Estimasi Harga Jual = HPP / (1 - Target Margin%)
  const estimatedSellingPrice = productionCost / (1 - targetMarginPercentage / 100);
  
  // Laba Kotor = Harga Jual - HPP
  const grossProfitPerUnit = estimatedSellingPrice - productionCost;
  
  return {
    productionCost: Math.round(productionCost * 100) / 100,
    estimatedSellingPrice: Math.round(estimatedSellingPrice * 100) / 100,
    grossProfitPerUnit: Math.round(grossProfitPerUnit * 100) / 100
  };
}

// Get all products
exports.getAllProducts = (req, res) => {
  db.all(
    'SELECT id, name, description, image_url, total_material_cost, production_cost, estimated_selling_price, gross_profit_per_unit, created_at FROM products ORDER BY name',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
};

// Get product by ID with BoM details
exports.getProductById = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get BoM with material details
    const bomQuery = `
      SELECT b.*, m.name as material_name, m.unit as material_unit, c.name as category_name
      FROM bill_of_materials b
      JOIN materials m ON b.material_id = m.id
      JOIN categories c ON m.category_id = c.id
      WHERE b.product_id = ?
      ORDER BY m.name
    `;
    
    db.all(bomQuery, [id], (err, bomItems) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        ...product,
        bill_of_materials: bomItems
      });
    });
  });
};

// Create product with BoM
exports.createProduct = (req, res) => {
  const {
    name,
    description,
    image_url,
    overhead_percentage,
    target_margin_percentage,
    bill_of_materials
  } = req.body;
  
  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (overhead_percentage === undefined || overhead_percentage < 0 || overhead_percentage >= 100) {
    return res.status(400).json({ error: 'Overhead percentage must be between 0 and 100' });
  }
  if (target_margin_percentage === undefined || target_margin_percentage < 0 || target_margin_percentage >= 100) {
    return res.status(400).json({ error: 'Target margin percentage must be between 0 and 100' });
  }
  if (!bill_of_materials || bill_of_materials.length === 0) {
    return res.status(400).json({ error: 'At least one material is required in BoM' });
  }
  
  const id = uuidv4();
  
  // Calculate total material cost
  let totalMaterialCost = 0;
  const bomItems = bill_of_materials.map(item => {
    const subtotal = item.price * item.quantity;
    totalMaterialCost += subtotal;
    return {
      id: uuidv4(),
      material_id: item.material_id,
      price: item.price,
      quantity: item.quantity,
      subtotal: Math.round(subtotal * 100) / 100
    };
  });
  
  // Calculate HPP and selling price
  const costs = calculateCosts(totalMaterialCost, overhead_percentage, target_margin_percentage);
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Insert product
    db.run(
      `INSERT INTO products (
        id, name, description, image_url, overhead_percentage, target_margin_percentage,
        total_material_cost, production_cost, estimated_selling_price, gross_profit_per_unit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        description || '',
        image_url || '',
        overhead_percentage,
        target_margin_percentage,
        Math.round(totalMaterialCost * 100) / 100,
        costs.productionCost,
        costs.estimatedSellingPrice,
        costs.grossProfitPerUnit
      ],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Product name already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        // Insert BoM items
        const stmt = db.prepare(
          'INSERT INTO bill_of_materials (id, product_id, material_id, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)'
        );
        
        let bomError = null;
        for (const item of bomItems) {
          stmt.run([item.id, id, item.material_id, item.price, item.quantity, item.subtotal], (err) => {
            if (err) bomError = err;
          });
        }
        stmt.finalize();
        
        if (bomError) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: bomError.message });
        }
        
        db.run('COMMIT', (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          // Return created product
          exports.getProductById({ params: { id } }, res);
        });
      }
    );
  });
};

// Update product with BoM
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    image_url,
    overhead_percentage,
    target_margin_percentage,
    bill_of_materials
  } = req.body;
  
  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (overhead_percentage === undefined || overhead_percentage < 0 || overhead_percentage >= 100) {
    return res.status(400).json({ error: 'Overhead percentage must be between 0 and 100' });
  }
  if (target_margin_percentage === undefined || target_margin_percentage < 0 || target_margin_percentage >= 100) {
    return res.status(400).json({ error: 'Target margin percentage must be between 0 and 100' });
  }
  if (!bill_of_materials || bill_of_materials.length === 0) {
    return res.status(400).json({ error: 'At least one material is required in BoM' });
  }
  
  // Calculate total material cost
  let totalMaterialCost = 0;
  const bomItems = bill_of_materials.map(item => {
    const subtotal = item.price * item.quantity;
    totalMaterialCost += subtotal;
    return {
      id: uuidv4(),
      material_id: item.material_id,
      price: item.price,
      quantity: item.quantity,
      subtotal: Math.round(subtotal * 100) / 100
    };
  });
  
  // Calculate HPP and selling price
  const costs = calculateCosts(totalMaterialCost, overhead_percentage, target_margin_percentage);
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Update product
    db.run(
      `UPDATE products SET
        name = ?,
        description = ?,
        image_url = ?,
        overhead_percentage = ?,
        target_margin_percentage = ?,
        total_material_cost = ?,
        production_cost = ?,
        estimated_selling_price = ?,
        gross_profit_per_unit = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name.trim(),
        description || '',
        image_url || '',
        overhead_percentage,
        target_margin_percentage,
        Math.round(totalMaterialCost * 100) / 100,
        costs.productionCost,
        costs.estimatedSellingPrice,
        costs.grossProfitPerUnit,
        id
      ],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Product name already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Product not found' });
        }
        
        // Delete old BoM items
        db.run('DELETE FROM bill_of_materials WHERE product_id = ?', [id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          // Insert new BoM items
          const stmt = db.prepare(
            'INSERT INTO bill_of_materials (id, product_id, material_id, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)'
          );
          
          let bomError = null;
          for (const item of bomItems) {
            stmt.run([item.id, id, item.material_id, item.price, item.quantity, item.subtotal], (err) => {
              if (err) bomError = err;
            });
          }
          stmt.finalize();
          
          if (bomError) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: bomError.message });
          }
          
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            
            // Return updated product
            exports.getProductById({ params: { id } }, res);
          });
        });
      }
    );
  });
};

// Delete product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  // Check product exists first
  db.get('SELECT id FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Explicitly delete BoM records first (belt-and-suspenders, tidak hanya mengandalkan CASCADE)
      db.run('DELETE FROM bill_of_materials WHERE product_id = ?', [id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        // Then delete the product
        db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Product deleted successfully' });
          });
        });
      });
    });
  });
};

// Duplicate product
exports.duplicateProduct = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get BoM items
    db.all('SELECT material_id, price, quantity FROM bill_of_materials WHERE product_id = ?', [id], (err, bomItems) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Create new product with "Copy of" prefix
      const newProduct = {
        name: `${product.name} (Copy)`,
        description: product.description,
        image_url: product.image_url,
        overhead_percentage: product.overhead_percentage,
        target_margin_percentage: product.target_margin_percentage,
        bill_of_materials: bomItems.map(item => ({
          material_id: item.material_id,
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      // Use createProduct logic
      req.body = newProduct;
      exports.createProduct(req, res);
    });
  });
};
