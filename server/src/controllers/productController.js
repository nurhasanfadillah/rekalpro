const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { uploadImage, deleteImage } = require('../services/storageService');

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
exports.getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, image_url, total_material_cost, production_cost, estimated_selling_price, gross_profit_per_unit, created_at')
      .order('name');
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Get product by ID with BoM details
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (prodError) throw prodError;
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get BoM with material details
    const { data: bomItems, error: bomError } = await supabase
      .from('bill_of_materials')
      .select(`
        *,
        materials (
          name,
          unit,
          categories (name)
        )
      `)
      .eq('product_id', id)
      .order('materials(name)');
    
    if (bomError) throw bomError;
    
    // Transform BoM data to match expected format
    const transformedBom = (bomItems || []).map(b => ({
      ...b,
      material_name: b.materials?.name,
      material_unit: b.materials?.unit,
      category_name: b.materials?.categories?.name
    }));
    
    res.json({
      ...product,
      bill_of_materials: transformedBom
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
    // Insert product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .insert({
        id,
        name: name.trim(),
        description: description || '',
        image_url: image_url || '',
        overhead_percentage,
        target_margin_percentage,
        total_material_cost: Math.round(totalMaterialCost * 100) / 100,
        production_cost: costs.productionCost,
        estimated_selling_price: costs.estimatedSellingPrice,
        gross_profit_per_unit: costs.grossProfitPerUnit
      })
      .select()
      .single();
    
    if (prodError) {
      if (prodError.code === '23505' || prodError.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Product name already exists' });
      }
      throw prodError;
    }
    
    // Insert BoM items
    const bomData = bomItems.map(item => ({
      ...item,
      product_id: id
    }));
    
    const { error: bomError } = await supabase
      .from('bill_of_materials')
      .insert(bomData);
    
    if (bomError) throw bomError;
    
    // Get BoM with material details
    const { data: bomRows, error: bomRowsError } = await supabase
      .from('bill_of_materials')
      .select(`
        *,
        materials (
          name,
          unit,
          categories (name)
        )
      `)
      .eq('product_id', id)
      .order('materials(name)');
    
    if (bomRowsError) throw bomRowsError;
    
    // Transform BoM data
    const transformedBom = (bomRows || []).map(b => ({
      ...b,
      material_name: b.materials?.name,
      material_unit: b.materials?.unit,
      category_name: b.materials?.categories?.name
    }));
    
    res.status(201).json({
      ...product,
      bill_of_materials: transformedBom
    });
  } catch (err) {
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
    // Update product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        description: description || '',
        image_url: image_url || '',
        overhead_percentage,
        target_margin_percentage,
        total_material_cost: Math.round(totalMaterialCost * 100) / 100,
        production_cost: costs.productionCost,
        estimated_selling_price: costs.estimatedSellingPrice,
        gross_profit_per_unit: costs.grossProfitPerUnit
      })
      .eq('id', id)
      .select()
      .single();
    
    if (prodError) {
      if (prodError.code === '23505' || prodError.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Product name already exists' });
      }
      throw prodError;
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete old BoM items
    const { error: deleteError } = await supabase
      .from('bill_of_materials')
      .delete()
      .eq('product_id', id);
    
    if (deleteError) throw deleteError;
    
    // Insert new BoM items
    const bomData = bomItems.map(item => ({
      ...item,
      product_id: id
    }));
    
    const { error: bomError } = await supabase
      .from('bill_of_materials')
      .insert(bomData);
    
    if (bomError) throw bomError;
    
    // Get BoM with material details
    const { data: bomRows, error: bomRowsError } = await supabase
      .from('bill_of_materials')
      .select(`
        *,
        materials (
          name,
          unit,
          categories (name)
        )
      `)
      .eq('product_id', id)
      .order('materials(name)');
    
    if (bomRowsError) throw bomRowsError;
    
    // Transform BoM data
    const transformedBom = (bomRows || []).map(b => ({
      ...b,
      material_name: b.materials?.name,
      material_unit: b.materials?.unit,
      category_name: b.materials?.categories?.name
    }));
    
    res.json({
      ...product,
      bill_of_materials: transformedBom
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



// Delete product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Check product exists and get image URL
    const { data: product, error: checkError } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();
    
    if (checkError) throw checkError;
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete BoM records first
    const { error: bomError } = await supabase
      .from('bill_of_materials')
      .delete()
      .eq('product_id', id);
    
    if (bomError) throw bomError;
    
    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    // Delete image from storage if exists
    if (product.image_url) {
      await deleteImage(product.image_url);
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



// Duplicate product
exports.duplicateProduct = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get original product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (prodError) throw prodError;
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get BoM items
    const { data: bomItems, error: bomError } = await supabase
      .from('bill_of_materials')
      .select('material_id, price, quantity')
      .eq('product_id', id);
    
    if (bomError) throw bomError;
    
    // Create new product with "Copy of" prefix
    const newProduct = {
      name: `${product.name} (Copy)`,
      description: product.description,
      image_url: product.image_url,
      overhead_percentage: product.overhead_percentage,
      target_margin_percentage: product.target_margin_percentage,
      bill_of_materials: (bomItems || []).map(item => ({
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
