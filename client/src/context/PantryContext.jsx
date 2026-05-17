import { createContext, useContext, useMemo, useState } from 'react';

const PantryContext = createContext(null);

const initialItems = [
  {
    id: 1,
    name: 'Strawberries',
    category: 'Fruits',
    quantity: '250.00 grams',
    expiryDate: '2026-05-12',
  },
  {
    id: 2,
    name: 'Coconut Milk',
    category: 'Other',
    quantity: '400.00 ml',
    expiryDate: '2026-05-18',
  },
  {
    id: 3,
    name: 'Chickpeas',
    category: 'Grains',
    quantity: '1.00 can',
    expiryDate: '2026-05-19',
  },
  {
    id: 4,
    name: 'Canned Tomatoes',
    category: 'Other',
    quantity: '2.00 cans',
    expiryDate: '2026-05-21',
  },
  {
    id: 5,
    name: 'Mayonnaise',
    category: 'Dairy',
    quantity: '300.00 ml',
    expiryDate: '2026-05-17',
  },
  {
    id: 6,
    name: 'Ketchup',
    category: 'Spices',
    quantity: '400.00 ml',
    expiryDate: '2026-06-10',
  },
];

export function PantryProvider({ children }) {
  const [items, setItems] = useState(initialItems);

  const value = useMemo(
    () => ({
      items,
      setItems,
      addItem: (item) => setItems((current) => [...current, item]),
      addItems: (newItems) => setItems((current) => [...current, ...newItems]),
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