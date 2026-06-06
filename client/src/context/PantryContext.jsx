import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const PantryContext = createContext(null);

const normalizeItem = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  quantity: item.quantity,
  unit: item.unit,
  expiration_date: item.expiration_date,
  is_running_low: item.is_running_low,
});

export function PantryProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.get('/pantry');
      const data = response?.data?.data || [];
      setItems(data.map(normalizeItem));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load pantry items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('PantryContext - user.id:', user?.id, '- fetching items');
    fetchItems();
  }, [user?.id]);

  const value = useMemo(
    () => ({
      items,
      setItems,
      isLoading,
      error,
      refreshItems: fetchItems,
      addItem: async (payload) => {
        const response = await apiClient.post('/pantry', payload);
        const created = normalizeItem(response?.data?.data);
        setItems((current) => [created, ...current]);
        return created;
      },
      removeItem: async (itemId) => {
        await apiClient.delete(`/pantry/${itemId}`);
        setItems((current) => current.filter((item) => item.id !== itemId));
      },
      updateItem: async (itemId, payload) => {
        const response = await apiClient.put(`/pantry/${itemId}`, payload);
        const updated = normalizeItem(response?.data?.data);
        setItems((current) => current.map((item) => (item.id === itemId ? updated : item)));
        return updated;
      },
    }),
    [items, isLoading, error]
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const context = useContext(PantryContext);

  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }

  return context;
}