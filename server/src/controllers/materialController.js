const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Get all materials with category info
exports.getAllMaterials = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        categories (name)
      `)
      .order('name');
    
    if (error) throw error;
    
    // Transform data to match expected format
    const result = data.map(m => ({
      ...m,
      category_name: m.categories?.name
    }));
    
    res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Get material by ID
exports.getMaterialById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        categories (name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Transform to match expected format
    const result = {
      ...data,
      category_name: data.categories?.name
    };
    
    res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Create material
exports.createMaterial = async (req, res) => {
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
  
  try {
    const { data, error } = await supabase
      .from('materials')
      .insert({
        id,
        name: name.trim(),
        category_id,
        standard_price,
        unit
      })
      .select(`
        *,
        categories (name)
      `)
      .single();
    
    if (error) throw error;
    
    // Transform to match expected format
    const result = {
      ...data,
      category_name: data.categories?.name
    };
    
    res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Update material
exports.updateMaterial = async (req, res) => {
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
  
  try {
    const { data, error } = await supabase
      .from('materials')
      .update({
        name: name.trim(),
        category_id,
        standard_price,
        unit
      })
      .eq('id', id)
      .select(`
        *,
        categories (name)
      `)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Transform to match expected format
    const result = {
      ...data,
      category_name: data.categories?.name
    };
    
    res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Delete material
exports.deleteMaterial = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if material is used in any BoM
    const { data: bomItems, error: checkError } = await supabase
      .from('bill_of_materials')
      .select('id')
      .eq('material_id', id);
    
    if (checkError) throw checkError;
    
    if (bomItems && bomItems.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus: Material masih digunakan dalam komposisi produk.' 
      });
    }
    
    // Delete material
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
