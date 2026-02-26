import { useState, useEffect, useCallback, useRef } from 'react';
import { storage, isOnline } from '../utils/storage';

// Hook for offline-aware data fetching with localStorage caching
export function useOfflineData(fetchFn, storageKey, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!isOnline());

  const { 
    immediate = false,  // If true, show cached data immediately while fetching
    onSuccess,
    onError,
  } = options;

  // Use refs to prevent infinite loops and track mount state
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const fetchDataRef = useRef(null);
  const hasFetchedRef = useRef(false);
  
  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    const online = isOnline();
    setIsOffline(!online);

    // Try to get cached data first
    const cachedData = storage.get(storageKey)?.data;
    const isCacheValid = storage.isValid(storageKey);

    // If we have valid cached data and not forcing refresh, use it immediately
    if (cachedData && isCacheValid && !forceRefresh && immediate) {
      setData(cachedData);
      setLoading(false);
    }

    // If offline, use cached data
    if (!online) {
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return { data: cachedData, fromCache: true };
      } else {
        setError('Tidak ada koneksi internet dan data tersedia');
        setLoading(false);
        return { error: 'No data available offline', fromCache: false };
      }
    }

    // Online: fetch fresh data
    try {
      const response = await fetchFn();
      const freshData = response.data;
      
      // Update state
      setData(freshData);
      
      // Cache the data
      storage.set(storageKey, freshData);
      
      setLoading(false);
      
      if (onSuccessRef.current) onSuccessRef.current(freshData);
      
      return { data: freshData, fromCache: false };
    } catch (err) {
      console.error('Fetch error:', err);
      
      // If fetch fails but we have cached data, use it
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        if (onSuccessRef.current) onSuccessRef.current(cachedData);
        return { data: cachedData, fromCache: true, error: err };
      }
      
      setError(err.message || 'Gagal memuat data');
      setLoading(false);
      
      if (onErrorRef.current) onErrorRef.current(err);
      
      return { error: err, fromCache: false };
    }
  }, [fetchFn, storageKey, immediate]);

  // Store fetchData in ref to avoid dependency issues
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // Initial fetch - only once on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDataRef.current();
    }
  }, []);

  // Listen for network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Refresh data when coming back online
      if (fetchDataRef.current) {
        fetchDataRef.current(true);
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refresh = useCallback(() => {
    if (fetchDataRef.current) {
      fetchDataRef.current(true);
    }
  }, []);


  return {
    data,
    loading,
    error,
    isOffline,
    refresh,
    fromCache: data && !loading && isOffline,
  };
}

// Hook for products with offline support
export function useOfflineProducts(productApi) {
  return useOfflineData(
    () => productApi.getAll(),
    'rekal_products',
    { immediate: true }
  );
}

// Hook for materials with offline support
export function useOfflineMaterials(materialApi) {
  return useOfflineData(
    () => materialApi.getAll(),
    'rekal_materials',
    { immediate: true }
  );
}

// Hook for categories with offline support
export function useOfflineCategories(categoryApi) {
  return useOfflineData(
    () => categoryApi.getAll(),
    'rekal_categories',
    { immediate: true }
  );
}

// Hook for single product with offline support
export function useOfflineProduct(productApi, productId) {
  const storageKey = `rekal_product_${productId}`;
  
  return useOfflineData(
    () => productApi.getById(productId),
    storageKey,
    { immediate: true }
  );
}

export default useOfflineData;
