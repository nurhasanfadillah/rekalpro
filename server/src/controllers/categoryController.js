const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (catError) throw catError;
    
    // Get material counts
    const { data: materials, error: matError } = await supabase
      .from('materials')
      .select('category_id');
    
    if (matError) throw matError;
    
    // Count materials per category
    const materialCounts = {};
    materials.forEach(m => {
      materialCounts[m.category_id] = (materialCounts[m.category_id] || 0) + 1;
    });
    
    // Merge counts with categories
    const result = categories.map(c => ({
      ...c,
      material_count: materialCounts[c.id] || 0
    }));
    
    res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Get category by ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Create category
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  const id = uuidv4();
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({ id, name: name.trim() })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      throw error;
    }
    
    res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Update category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Delete category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if category has materials
    const { data: materials, error: checkError } = await supabase
      .from('materials')
      .select('id')
      .eq('category_id', id);
    
    if (checkError) throw checkError;
    
    if (materials && materials.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus: Kosongkan material dalam kategori ini terlebih dahulu.' 
      });
    }
    
    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
