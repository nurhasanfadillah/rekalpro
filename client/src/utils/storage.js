// LocalStorage utility for offline data persistence

const STORAGE_KEYS = {
  PRODUCTS: 'rekal_products',
  MATERIALS: 'rekal_materials',
  CATEGORIES: 'rekal_categories',
  LAST_SYNC: 'rekal_last_sync',
  PENDING_CHANGES: 'rekal_pending_changes',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const storage = {
  // Generic storage methods
  set: (key, value) => {
    try {
      const item = {
        data: value,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  // Check if cache is still valid
  isValid: (key) => {
    const item = storage.get(key);
    if (!item) return false;
    const age = Date.now() - item.timestamp;
    return age < CACHE_DURATION;
  },

  // Data-specific methods
  setProducts: (products) => storage.set(STORAGE_KEYS.PRODUCTS, products),
  getProducts: () => {
    const item = storage.get(STORAGE_KEYS.PRODUCTS);
    return item?.data || null;
  },
  isProductsValid: () => storage.isValid(STORAGE_KEYS.PRODUCTS),

  setMaterials: (materials) => storage.set(STORAGE_KEYS.MATERIALS, materials),
  getMaterials: () => {
    const item = storage.get(STORAGE_KEYS.MATERIALS);
    return item?.data || null;
  },
  isMaterialsValid: () => storage.isValid(STORAGE_KEYS.MATERIALS),

  setCategories: (categories) => storage.set(STORAGE_KEYS.CATEGORIES, categories),
  getCategories: () => {
    const item = storage.get(STORAGE_KEYS.CATEGORIES);
    return item?.data || null;
  },
  isCategoriesValid: () => storage.isValid(STORAGE_KEYS.CATEGORIES),

  // Pending changes for offline sync
  addPendingChange: (change) => {
    const pending = storage.get(STORAGE_KEYS.PENDING_CHANGES)?.data || [];
    pending.push({
      ...change,
      id: Date.now().toString(),
      timestamp: Date.now(),
    });
    return storage.set(STORAGE_KEYS.PENDING_CHANGES, pending);
  },

  getPendingChanges: () => {
    const item = storage.get(STORAGE_KEYS.PENDING_CHANGES);
    return item?.data || [];
  },

  removePendingChange: (changeId) => {
    const pending = storage.get(STORAGE_KEYS.PENDING_CHANGES)?.data || [];
    const filtered = pending.filter(c => c.id !== changeId);
    return storage.set(STORAGE_KEYS.PENDING_CHANGES, filtered);
  },

  clearPendingChanges: () => storage.remove(STORAGE_KEYS.PENDING_CHANGES),

  // Last sync timestamp
  setLastSync: () => storage.set(STORAGE_KEYS.LAST_SYNC, Date.now()),
  getLastSync: () => {
    const item = storage.get(STORAGE_KEYS.LAST_SYNC);
    return item?.data || null;
  },

  // Clear all app data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => storage.remove(key));
  },
};

// Check if online
export const isOnline = () => navigator.onLine;

// Network status listener
export const onNetworkChange = (callback) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
};

export default storage;
