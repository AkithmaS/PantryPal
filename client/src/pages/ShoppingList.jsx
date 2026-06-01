import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PackagePlus, Plus, Trash2, X, Trash } from 'lucide-react';
import ConflictResolutionModal from '../components/ConflictResolutionModal.jsx';
import {
  addShoppingItem,
  deleteShoppingItem,
  clearCheckedShoppingItems,
  confirmAddToPantry,
  getShoppingItems,
  preflightAddToPantry,
  toggleShoppingItem,
} from '../api/shopping.js';

const pageFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const categories = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];

const emptyFormState = {
  name: '',
  quantity: '',
  unit: 'pcs',
  category: 'Vegetables',
};

function mapShoppingItem(item) {
  return {
    id: item.id,
    name: item.name || item.ingredient_name || '',
    quantity: item.quantity,
    unit: item.unit,
    category: categories.includes(item.category) ? item.category : 'Other',
    checked: Boolean(item.is_checked ?? item.checked ?? false),
  };
}

function formatCount(checkedCount, totalCount) {
  return `${checkedCount} of ${totalCount} items checked`;
}

function ActionButton({ children, icon: Icon, onClick, isActive = false, isDanger = false, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
        isDanger
          ? 'border border-[#ead9c7] bg-white text-[#111111] shadow-[0_12px_28px_rgba(17,17,17,0.05)] hover:border-[#ff7a18]/30 hover:bg-[#fff8f0]'
          : isActive
            ? 'bg-[#ff7a18] text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.24)]'
            : 'border border-[#ead9c7] bg-white text-[#111111] shadow-[0_12px_28px_rgba(17,17,17,0.05)] hover:border-[#ff7a18]/30 hover:bg-[#fff8f0]'
      } ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </motion.button>
  );
}

function ShoppingItemRow({ item, onToggle, onDelete }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`rounded-2xl border border-[#ead9c7] bg-[#fffdf9] px-4 py-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(17,17,17,0.07)] ${
        item.checked ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <label className="flex items-start gap-3">
        <motion.span whileTap={{ scale: 0.94 }} className="mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => onToggle(item.id)}
            className="h-5 w-5 rounded border-[#d7c7b4] text-[#ff7a18] focus:ring-[#ff7a18]"
          />
        </motion.span>

        <div className="min-w-0 flex-1">
          <p className={`font-display text-base font-semibold text-[#111111] transition-all duration-300 ${item.checked ? 'line-through' : ''}`}>
            {item.name}
          </p>
          <p className="mt-1 text-sm text-[#6e6258]">{item.quantity} {item.unit}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#fff4ea] px-3 py-1 text-xs font-semibold text-[#8d5c24]">
            {item.category}
          </span>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ead9c7] bg-white text-[#8f6a4b] transition hover:border-[#c64545]/30 hover:bg-[#fff4ea] hover:text-[#c64545]"
            aria-label={`Delete ${item.name}`}
            title="Delete item"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </label>
    </motion.li>
  );
}

function CategoryCard({ category, items, onToggle, onDelete }) {
  return (
    <motion.article
      variants={pageFade}
      whileHover={{ y: -4 }}
      className="rounded-[30px] border border-[#ead9c7] bg-white/85 shadow-[0_18px_45px_rgba(17,17,17,0.06)] transition-transform duration-300"
    >
      <div className="border-b border-[#ead9c7] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#111111]">{category}</h2>
          <span className="rounded-full bg-[#fff4ea] px-3 py-1 text-xs font-semibold text-[#8d5c24]">
            {items.length}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {items.length > 0 ? (
          <motion.ul variants={stagger} initial="hidden" animate="visible" className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item) => (
                <ShoppingItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#ead9c7] bg-[#fffaf4] px-5 py-8 text-center transition-all duration-300 hover:border-[#ff7a18]/30 hover:bg-[#fff8f0]">
            <p className="font-display text-lg font-semibold text-[#111111]">No items in this category</p>
            <p className="mt-1 text-sm text-[#6e6258]">Add an item to keep this section organized.</p>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function ShoppingModal({ isOpen, onClose, onSubmit, formData, onChange, validationMessage }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#111111]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close add item modal"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[30px] border border-[#ead9c7] bg-[#fffaf4] shadow-[0_30px_80px_rgba(17,17,17,0.22)]"
      >
        <div className="flex items-start justify-between border-b border-[#ead9c7] px-6 py-5 sm:px-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">Add Shopping Item</h2>
            <p className="mt-1 text-sm text-[#6e6258]">Add something to your shopping list.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8f6a4b] transition hover:bg-[#fff1e5] hover:text-[#111111]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-6 sm:px-8">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#4c4038]">Item Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Tomatoes"
                className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#4c4038]">Quantity</span>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={onChange}
                  min="0"
                  step="0.01"
                  placeholder="2"
                  className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#4c4038]">Unit</span>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                >
                  <option value="pcs">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="g">Grams</option>
                  <option value="l">Liters</option>
                  <option value="ml">Milliliters</option>
                  <option value="packs">Packs</option>
                  <option value="cans">Cans</option>
                  <option value="bottle">Bottle</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#4c4038]">Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
                className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            {validationMessage ? <p className="text-sm font-medium text-[#c64545]">{validationMessage}</p> : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-[#d8cab9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [formData, setFormData] = useState(emptyFormState);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [conflictState, setConflictState] = useState({ isOpen: false, conflicts: [], cleanItems: [] });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getShoppingItems();
        setItems((response.data?.data || []).map(mapShoppingItem));
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load shopping list');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(''), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const checkedCount = useMemo(() => items.filter((item) => item.checked).length, [items]);

  const refreshItems = async () => {
    const response = await getShoppingItems();
    const nextItems = (response.data?.data || []).map(mapShoppingItem);

    setItems((currentItems) => {
      const currentMap = new Map(currentItems.map((item) => [item.id, item]));

      return nextItems.map((item) => {
        const existing = currentMap.get(item.id);

        if (!existing) {
          return item;
        }

        return {
          ...item,
          category: existing.category || item.category,
          checked: existing.checked,
        };
      });
    });
  };

  const showToast = (message) => {
    setToastMessage(message);
  };

  const handleToggleItem = async (id) => {
    try {
      const response = await toggleShoppingItem(id);
      const updatedData = response.data?.data;

      if (updatedData) {
        const updated = mapShoppingItem(updatedData);
        setItems((currentItems) => currentItems.map((item) => (item.id === id ? updated : item)));
        return;
      }

      await refreshItems();
    } catch (toggleError) {
      setError(toggleError?.response?.data?.message || 'Unable to update item');
    }
  };

  const handleDeleteItem = async (id) => {
    const targetItem = items.find((item) => item.id === id);

    if (!targetItem) {
      return;
    }

    const shouldDelete = window.confirm(`Delete ${targetItem.name} from your shopping list?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteShoppingItem(id);
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      showToast('Item deleted');
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || 'Unable to delete item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearChecked = async () => {
    try {
      setActionLoading(true);
      await clearCheckedShoppingItems();
      await refreshItems();
      showToast('Checked items cleared');
    } catch (clearError) {
      setError(clearError?.response?.data?.message || 'Unable to clear checked items');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenModal = () => {
    setValidationMessage('');
    setFormData(emptyFormState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setValidationMessage('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setValidationMessage('Item name is required.');
      return;
    }

    try {
      setActionLoading(true);
      setValidationMessage('');

      const response = await addShoppingItem({
        name: formData.name.trim(),
        quantity: formData.quantity || '1',
        unit: formData.unit,
        category: formData.category,
      });

      const createdItem = response.data?.data;

      if (createdItem) {
        setItems((currentItems) => [mapShoppingItem(createdItem), ...currentItems]);
      }
      await refreshItems();
      showToast('Item added to shopping list');
      handleCloseModal();
    } catch (addError) {
      setValidationMessage(addError?.response?.data?.message || 'Unable to add item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToPantry = async () => {
    const checkedItems = items.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const preflightResponse = await preflightAddToPantry(checkedItems.map((item) => item.id));
      const preflight = preflightResponse.data?.data || { clean: [], conflicts: [] };

      setConflictState({
        isOpen: true,
        conflicts: preflight.conflicts || [],
        cleanItems: preflight.clean || [],
      });
    } catch (addError) {
      setError(addError?.response?.data?.message || 'Unable to add items to pantry');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmConflictResolution = async ({ decisions, cleanItems }) => {
    try {
      setActionLoading(true);
      setError('');

      const cleanPayload = (cleanItems || []).map((item) => ({
        shoppingItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        newExpiry: decisions[item.id]?.newExpiry ?? null,
      }));

      const conflictDecisionArray = conflictState.conflicts.map((conflict) => {
        const decision = decisions[conflict.shoppingItem.id] || {
          action: 'merge',
          newExpiry: null,
          mergeQuantity: conflict.shoppingItem.quantity,
          mergeExpiry: conflict.existingPantryItem.expiryDate ?? null,
        };

        return {
          shoppingItemId: conflict.shoppingItem.id,
          existingPantryId: conflict.existingPantryItem.id,
          action: decision.action,
          mergeQuantity: decision.mergeQuantity ?? conflict.shoppingItem.quantity,
          mergeExpiry: decision.mergeExpiry ?? conflict.existingPantryItem.expiryDate ?? null,
          newExpiry: decision.newExpiry ?? null,
        };
      });

      const response = await confirmAddToPantry({
        clean: cleanPayload,
        decisions: conflictDecisionArray,
      });

      const added = response.data?.data?.added ?? cleanItems.length;
      setConflictState({ isOpen: false, conflicts: [], cleanItems: [] });
      await refreshItems();
      showToast(`${added} items added to pantry`);
    } catch (confirmError) {
      setError(confirmError?.response?.data?.message || 'Unable to confirm pantry update');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-[#fff8f0]">
      <motion.section
        initial="hidden"
        animate={isReady ? 'visible' : 'hidden'}
        variants={stagger}
        className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      >
        <motion.div variants={pageFade} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
              Shopping List
            </h1>
            <p className="mt-2 text-base text-[#5d5148] sm:text-lg">{formatCount(checkedCount, items.length)}</p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ActionButton icon={Plus} onClick={handleOpenModal} isActive>
              Add Item
            </ActionButton>

            {checkedCount > 0 ? (
              <>
                <ActionButton icon={PackagePlus} onClick={handleAddToPantry} isActive>
                  {actionLoading ? 'Working...' : `Add to Pantry (${checkedCount})`}
                </ActionButton>
                <ActionButton icon={Trash2} onClick={handleClearChecked} isDanger>
                  Clear Checked
                </ActionButton>
              </>
            ) : null}
          </div>
        </motion.div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#f3e1cf] bg-[#fff4ea] px-4 py-3 text-sm font-medium text-[#6a4321]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <motion.div variants={pageFade} className="mt-6 rounded-[30px] border border-[#ead9c7] bg-white/85 p-8 text-center text-sm text-[#6e6258] shadow-[0_18px_45px_rgba(17,17,17,0.06)]">
            Loading shopping list...
          </motion.div>
        ) : (
          <motion.article
            variants={pageFade}
            className="mt-6 rounded-[30px] border border-[#ead9c7] bg-white/85 shadow-[0_18px_45px_rgba(17,17,17,0.06)]"
          >
            <div className="border-b border-[#ead9c7] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-[#111111]">All Items</h2>
                <span className="rounded-full bg-[#fff4ea] px-3 py-1 text-xs font-semibold text-[#8d5c24]">
                  {items.length}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {items.length > 0 ? (
                <motion.ul variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((item) => (
                      <ShoppingItemRow key={item.id} item={item} onToggle={handleToggleItem} onDelete={handleDeleteItem} />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#ead9c7] bg-[#fffaf4] px-5 py-8 text-center transition-all duration-300 hover:border-[#ff7a18]/30 hover:bg-[#fff8f0]">
                  <p className="font-display text-lg font-semibold text-[#111111]">No shopping items yet</p>
                  <p className="mt-1 text-sm text-[#6e6258]">Use Add Item to create your first entry.</p>
                </div>
              )}
            </div>
          </motion.article>
        )}
      </motion.section>

      <AnimatePresence mode="wait">
        {isModalOpen ? (
          <ShoppingModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleAddItem}
            formData={formData}
            onChange={handleFormChange}
            validationMessage={validationMessage}
          />
        ) : null}
      </AnimatePresence>

      <ConflictResolutionModal
        isOpen={conflictState.isOpen}
        conflicts={conflictState.conflicts}
        cleanItems={conflictState.cleanItems}
        onConfirm={handleConfirmConflictResolution}
        onClose={() => setConflictState({ isOpen: false, conflicts: [], cleanItems: [] })}
      />

      <AnimatePresence>
        {toastMessage ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="fixed right-4 top-4 z-[60] rounded-2xl border border-[#f3e1cf] bg-[#fff4ea] px-4 py-3 text-sm font-medium text-[#6a4321] shadow-[0_18px_45px_rgba(17,17,17,0.12)]"
          >
            {toastMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}