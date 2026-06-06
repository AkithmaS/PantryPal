import apiClient from './client.js';

export const getShoppingItems = () => apiClient.get('/shopping-list');

export const addShoppingItem = (payload) => apiClient.post('/shopping-list', payload);

export const toggleShoppingItem = (id) => apiClient.put(`/shopping-list/${id}/toggle`);

export const deleteShoppingItem = (id) => apiClient.delete(`/shopping-list/${id}`);

export const clearCheckedShoppingItems = () => apiClient.delete('/shopping-list/clear-checked');

export const clearAllShoppingItems = () => apiClient.delete('/shopping-list/clear-all');

export const preflightAddToPantry = (checkedItemIds) =>
  apiClient.post('/shopping/preflight', { checkedItemIds });

export const confirmAddToPantry = (payload) =>
  apiClient.post('/shopping/add-to-pantry/confirm', payload);
