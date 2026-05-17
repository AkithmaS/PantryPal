import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PackagePlus, Plus, Trash2, X } from 'lucide-react';
import { usePantry } from '../context/PantryContext';

const pageFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const categories = ['Dairy', 'Meat', 'Produce', 'Other'];

const initialShoppingItems = [
  { id: 1, name: 'Milk', quantity: '1', unit: 'l', category: 'Dairy', checked: true },
  { id: 2, name: 'Curd', quantity: '1', unit: 'l', category: 'Dairy', checked: true },
  { id: 3, name: 'Chicken', quantity: '2', unit: 'kg', category: 'Meat', checked: false },
  { id: 4, name: 'Ground Beef', quantity: '500', unit: 'g', category: 'Meat', checked: false },
  { id: 5, name: 'Garlic', quantity: '1', unit: 'bulb', category: 'Produce', checked: false },
  { id: 6, name: 'Spinach', quantity: '2', unit: 'bags', category: 'Produce', checked: false },
  { id: 7, name: 'Rice', quantity: '1', unit: 'kg', category: 'Other', checked: false },
  { id: 8, name: 'Pasta', quantity: '2', unit: 'packs', category: 'Other', checked: false },
];

const emptyFormState = {
  name: '',
  quantity: '',
  unit: 'pcs',
  category: 'Produce',
};

function buildPantryItem(shoppingItem) {
  return {
    id: Date.now() + shoppingItem.id,
    name: shoppingItem.name,
    category: shoppingItem.category,
    quantity: `${shoppingItem.quantity} ${shoppingItem.unit}`,
    expiryDate: '',
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

function ShoppingItemRow({ item, onToggle }) {
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

        <span className="rounded-full bg-[#fff4ea] px-3 py-1 text-xs font-semibold text-[#8d5c24]">
          {item.category}
        </span>
      </label>
    </motion.li>
  );
}

function CategoryCard({ category, items, onToggle }) {
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
                <ShoppingItemRow key={item.id} item={item} onToggle={onToggle} />
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
                  <option value="bulb">Bulb</option>
                  <option value="bags">Bags</option>
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
  const { addItems: addPantryItems } = usePantry();
  const [items, setItems] = useState(initialShoppingItems);
  const [isReady, setIsReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPantryConfirmOpen, setIsPantryConfirmOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [formData, setFormData] = useState(emptyFormState);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const checkedCount = useMemo(() => items.filter((item) => item.checked).length, [items]);

  const groupedItems = useMemo(() => {
    return categories.map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }));
  }, [items]);

  const handleToggleItem = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const handleClearChecked = () => {
    setItems((currentItems) => currentItems.filter((item) => !item.checked));
  };

  const handleAddToPantry = () => {
    const checkedItems = items.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      return;
    }

    setIsPantryConfirmOpen(true);
  };

  const confirmAddToPantry = () => {
    const checkedItems = items.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      setIsPantryConfirmOpen(false);
      return;
    }

    addPantryItems(checkedItems.map(buildPantryItem));
    setItems((currentItems) => currentItems.filter((item) => !item.checked));
    setIsPantryConfirmOpen(false);
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

  const handleAddItem = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setValidationMessage('Item name is required.');
      return;
    }

    const nextItem = {
      id: Date.now(),
      name: formData.name.trim(),
      quantity: formData.quantity || '1',
      unit: formData.unit,
      category: formData.category,
      checked: false,
    };

    setItems((currentItems) => [nextItem, ...currentItems]);
    handleCloseModal();
  };

  return (
    <div className="bg-[#fff8f0]">
      <motion.section
        initial="hidden"
        animate={isReady ? 'visible' : 'hidden'}
        variants={stagger}
        className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      >
        {/* Header section */}
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
                <ActionButton icon={PackagePlus} onClick={handleAddToPantry}>
                  Add to Pantry ({checkedCount})
                </ActionButton>
                <ActionButton icon={Trash2} onClick={handleClearChecked} isDanger>
                  Clear Checked
                </ActionButton>
              </>
            ) : null}
          </div>
        </motion.div>

        {/* Shopping cards */}
        <motion.div variants={stagger} className="mt-6 grid gap-5">
          {groupedItems.map(({ category, items: categoryItems }) => (
            <CategoryCard key={category} category={category} items={categoryItems} onToggle={handleToggleItem} />
          ))}
        </motion.div>
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

      <AnimatePresence mode="wait">
        {isPantryConfirmOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <button
              type="button"
              className="absolute inset-0 bg-[#111111]/45 backdrop-blur-[2px]"
              onClick={() => setIsPantryConfirmOpen(false)}
              aria-label="Close confirmation dialog"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-[30px] border border-[#ead9c7] bg-[#fffaf4] shadow-[0_30px_80px_rgba(17,17,17,0.22)]"
            >
              <div className="border-b border-[#ead9c7] px-6 py-5 sm:px-8">
                <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                  Add to Pantry?
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6e6258]">
                  Are you sure you want to move the checked items into Pantry? They will be removed from the shopping list.
                </p>
              </div>

              <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={() => setIsPantryConfirmOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#d8cab9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAddToPantry}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5"
                >
                  <PackagePlus className="h-4 w-4" />
                  Add to Pantry
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}