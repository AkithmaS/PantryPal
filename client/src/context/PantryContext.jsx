import { createContext, useContext, useMemo, useState } from 'react';

const PantryContext = createContext(null);

const initialItems = [];

export function PantryProvider({ children }) {
  const [items, setItems] = useState(initialItems);

  const value = useMemo(
    () => ({
      items,
      setItems,
      addItem: (item) => setItems((current) => [...current, item]),
      removeItem: (itemId) => setItems((current) => current.filter((item) => item.id !== itemId)),
    }),
    [items]
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