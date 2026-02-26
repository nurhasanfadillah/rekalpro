const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// Helper: Promisify SQLite operations
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

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
exports.createProduct = async (req, res) => {
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
  
  try {
    await runAsync('BEGIN TRANSACTION');
    
    // Insert product
    try {
      await runAsync(
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
        ]
      );
    } catch (err) {
      await runAsync('ROLLBACK');
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Product name already exists' });
      }
      throw err;
    }
    
    // Insert BoM items sequentially to avoid race conditions
    for (const item of bomItems) {
      await runAsync(
        'INSERT INTO bill_of_materials (id, product_id, material_id, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [item.id, id, item.material_id, item.price, item.quantity, item.subtotal]
      );
    }
    
    await runAsync('COMMIT');
    
    // Return created product
    const product = await getAsync('SELECT * FROM products WHERE id = ?', [id]);
    const bomRows = await allAsync(
      `SELECT b.*, m.name as material_name, m.unit as material_unit, c.name as category_name
       FROM bill_of_materials b
       JOIN materials m ON b.material_id = m.id
       JOIN categories c ON m.category_id = c.id
       WHERE b.product_id = ? ORDER BY m.name`,
      [id]
    );
    
    res.status(201).json({
      ...product,
      bill_of_materials: bomRows
    });
  } catch (err) {
    await runAsync('ROLLBACK').catch(() => {});
    return res.status(500).json({ error: err.message });
  }
};


// Update product with BoM
exports.updateProduct = async (req, res) => {
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
  
  try {
    await runAsync('BEGIN TRANSACTION');
    
    // Update product
    let result;
    try {
      result = await runAsync(
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
        ]
      );
    } catch (err) {
      await runAsync('ROLLBACK');
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Product name already exists' });
      }
      throw err;
    }
    
    if (result.changes === 0) {
      await runAsync('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete old BoM items
    await runAsync('DELETE FROM bill_of_materials WHERE product_id = ?', [id]);
    
    // Insert new BoM items sequentially
    for (const item of bomItems) {
      await runAsync(
        'INSERT INTO bill_of_materials (id, product_id, material_id, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [item.id, id, item.material_id, item.price, item.quantity, item.subtotal]
      );
    }
    
    await runAsync('COMMIT');
    
    // Return updated product
    const product = await getAsync('SELECT * FROM products WHERE id = ?', [id]);
    const bomRows = await allAsync(
      `SELECT b.*, m.name as material_name, m.unit as material_unit, c.name as category_name
       FROM bill_of_materials b
       JOIN materials m ON b.material_id = m.id
       JOIN categories c ON m.category_id = c.id
       WHERE b.product_id = ? ORDER BY m.name`,
      [id]
    );
    
    res.json({
      ...product,
      bill_of_materials: bomRows
    });
  } catch (err) {
    await runAsync('ROLLBACK').catch(() => {});
    return res.status(500).json({ error: err.message });
  }
};


// Delete product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Check product exists first
    const row = await getAsync('SELECT id FROM products WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await runAsync('BEGIN TRANSACTION');

    try {
      // Explicitly delete BoM records first (belt-and-suspenders, tidak hanya mengandalkan CASCADE)
      await runAsync('DELETE FROM bill_of_materials WHERE product_id = ?', [id]);
      
      // Then delete the product
      await runAsync('DELETE FROM products WHERE id = ?', [id]);
      
      await runAsync('COMMIT');
      
      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      await runAsync('ROLLBACK');
      throw err;
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Duplicate product
exports.duplicateProduct = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get original product
    const product = await getAsync('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get BoM items
    const bomItems = await allAsync(
      'SELECT material_id, price, quantity FROM bill_of_materials WHERE product_id = ?',
      [id]
    );
    
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
    
    // Use createProduct logic by setting req.body and calling it
    req.body = newProduct;
    return exports.createProduct(req, res);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
