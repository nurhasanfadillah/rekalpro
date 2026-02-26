const supabase = require('./supabase');

// Helper: Promisify Supabase operations to match SQLite interface
const runAsync = async (sql, params = []) => {
  // For INSERT, UPDATE, DELETE operations
  // Extract table name and operation from SQL
  const sqlLower = sql.toLowerCase().trim();
  
  if (sqlLower.startsWith('insert')) {
    const tableMatch = sql.match(/INSERT INTO\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : null;
    
    if (!table) throw new Error('Could not determine table name from INSERT');
    
    // Convert params array to object based on SQL columns
    const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    if (!columnsMatch) throw new Error('Could not parse INSERT columns');
    
    const columns = columnsMatch[1].split(',').map(c => c.trim());
    const data = {};
    columns.forEach((col, idx) => {
      data[col] = params[idx];
    });
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return { lastID: result.id, changes: 1 };
  }
  
  if (sqlLower.startsWith('update')) {
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : null;
    
    if (!table) throw new Error('Could not determine table name from UPDATE');
    
    // Parse WHERE clause to get ID
    const whereMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
    if (!whereMatch) throw new Error('UPDATE must have WHERE id = ? clause');
    
    const id = params[params.length - 1];
    const updateData = {};
    
    // Parse SET clause
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (setMatch) {
      const setClause = setMatch[1];
      const assignments = setClause.split(',').map(s => s.trim());
      
      assignments.forEach((assignment, idx) => {
        const colMatch = assignment.match(/(\w+)\s*=\s*\?/);
        if (colMatch) {
          const col = colMatch[1];
          if (col !== 'updated_at') { // Skip auto-updated fields
            updateData[col] = params[idx];
          }
        }
      });
    }
    
    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { lastID: id, changes: data ? data.length : 0 };
  }
  
  if (sqlLower.startsWith('delete')) {
    const tableMatch = sql.match(/FROM\s+(\w+)/i) || sql.match(/DELETE\s+FROM\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : null;
    
    if (!table) throw new Error('Could not determine table name from DELETE');
    
    // Parse WHERE clause
    const whereMatch = sql.match(/WHERE\s+(.+)$/i);
    if (!whereMatch) throw new Error('DELETE must have WHERE clause');
    
    let query = supabase.from(table).delete();
    
    // Handle different WHERE patterns
    const idMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
    if (idMatch) {
      const id = params[0];
      query = query.eq('id', id);
    } else {
      const productIdMatch = sql.match(/WHERE\s+product_id\s*=\s*\?/i);
      if (productIdMatch) {
        const productId = params[0];
        query = query.eq('product_id', productId);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { lastID: null, changes: data ? data.length : 0 };
  }
  
  // For BEGIN, COMMIT, ROLLBACK - Supabase handles transactions automatically
  if (sqlLower === 'begin transaction' || sqlLower === 'commit' || sqlLower === 'rollback') {
    return { lastID: null, changes: 0 };
  }
  
  throw new Error(`Unsupported SQL operation: ${sql}`);
};

const getAsync = async (sql, params = []) => {
  // For single row SELECT
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table name from SELECT');
  
  let query = supabase.from(table).select('*');
  
  // Parse WHERE clause
  const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
  if (whereMatch) {
    const column = whereMatch[1];
    const value = params[0];
    query = query.eq(column, value);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }
  
  return data;
};

const allAsync = async (sql, params = []) => {
  // For multiple row SELECT
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table name from SELECT');
  
  let query = supabase.from(table).select('*');
  
  // Parse WHERE clause
  const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
  if (whereMatch) {
    const column = whereMatch[1];
    const value = params[0];
    query = query.eq(column, value);
  }
  
  // Parse ORDER BY
  const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)/i);
  if (orderMatch) {
    const orderCol = orderMatch[1];
    const descMatch = sql.match(/ORDER\s+BY\s+\w+\s+DESC/i);
    query = query.order(orderCol, { ascending: !descMatch });
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

// Legacy db interface for backward compatibility
const db = {
  run: (sql, params, callback) => {
    if (typeof callback !== 'function') {
      // If no callback provided, params might be the callback
      callback = params;
      params = [];
    }
    if (typeof callback !== 'function') {
      callback = () => {}; // No-op callback
    }
    runAsync(sql, params)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  },
  get: (sql, params, callback) => {
    if (typeof callback !== 'function') {
      callback = params;
      params = [];
    }
    if (typeof callback !== 'function') {
      callback = () => {}; // No-op callback
    }
    getAsync(sql, params)
      .then(row => callback(null, row))
      .catch(err => callback(err));
  },
  all: (sql, params, callback) => {
    if (typeof callback !== 'function') {
      callback = params;
      params = [];
    }
    if (typeof callback !== 'function') {
      callback = () => {}; // No-op callback
    }
    allAsync(sql, params)
      .then(rows => callback(null, rows))
      .catch(err => callback(err));
  }
};


// Export both the legacy interface and new async helpers
db.runAsync = runAsync;
db.getAsync = getAsync;
db.allAsync = allAsync;
db.supabase = supabase;

console.log('Connected to Supabase database');

module.exports = db;
