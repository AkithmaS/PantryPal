import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CircleAlert,
  Plus,
  Search,
  X,
} from 'lucide-react';
import PantryAddItem from './pantry_additem';
import { usePantry } from '../context/PantryContext';

const categories = ['Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function getDaysUntil(expiryDate) {
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  const target = new Date(expiryDate);
  target.setHours(0, 0, 0, 0);

  return Math.round((target - current) / (1000 * 60 * 60 * 24));
}

function formatExpiry(expiryDate) {
  if (!expiryDate) {
    return 'No expiry date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(expiryDate));
}

function PantryItemCard({ item, onDelete }) {
  const hasExpiryDate = Boolean(item.expiryDate);
  const daysUntilExpiry = hasExpiryDate ? getDaysUntil(item.expiryDate) : null;
  const isExpired = hasExpiryDate && daysUntilExpiry < 0;
  const isExpiringSoon = hasExpiryDate && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  const shouldShowRunningLow = item.runningLow || isExpired;

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="group relative rounded-[22px] border border-[#ead9c7] bg-white p-5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] transition-transform duration-300 hover:shadow-[0_20px_44px_rgba(17,17,17,0.1)]"
    >
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8f6a4b] transition hover:bg-[#fff4ea] hover:text-[#111111]"
        aria-label={`Delete ${item.name}`}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start justify-between gap-4 pr-8">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-tight text-[#111111] sm:text-xl">
            {item.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-[#8d7f72]">{item.category}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8d7f72]">Quantity</p>
          <p className="mt-1 text-base font-semibold text-[#111111]">{item.quantity}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${isExpired ? 'bg-[#fff1f1] text-[#c64545]' : 'bg-[#fff8f0] text-[#6e6258]'}`}
        >
          <Calendar className="h-4 w-4" />
          <span className={isExpired ? 'font-semibold' : ''}>
            {hasExpiryDate
              ? isExpired
                ? `Expired: ${formatExpiry(item.expiryDate)}`
                : `Expires: ${formatExpiry(item.expiryDate)}`
              : 'No expiry date'}
          </span>
        </div>

        {shouldShowRunningLow ? (
          <span className="inline-flex items-center rounded-full bg-[#ffe8e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#c64545]">
            RUNNING LOW
          </span>
        ) : isExpiringSoon ? (
          <span className="inline-flex items-center rounded-full bg-[#fff2df] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#b55416]">
            Expiring Soon
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}

export default function Pantry() {
  const { items, addItem, removeItem } = usePantry();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'Pieces',
    category: 'Other',
    expiryDate: '',
    runningLow: false,
  });

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.quantity.toLowerCase().includes(query);

      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, items, searchTerm]);

  const expiringSoonCount = useMemo(
    () => items.filter((item) => {
      const daysUntilExpiry = getDaysUntil(item.expiryDate);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }).length,
    [items],
  );

  const handleDeleteItem = (id) => {
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) {
      return;
    }

    setDeleteTarget(itemToDelete);
  };

  const confirmDeleteItem = () => {
    if (!deleteTarget) {
      return;
    }

    removeItem(deleteTarget.id);
    setDeleteTarget(null);
  };

  const cancelDeleteItem = () => {
    setDeleteTarget(null);
  };

  const openAddItemModal = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: 'Pieces',
      category: 'Other',
      expiryDate: '',
      runningLow: false,
    });
    setIsAddItemOpen(true);
  };

  const closeAddItemModal = () => {
    setIsAddItemOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, type, checked, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddItem = (event) => {
    event.preventDefault();

    const nextItem = {
      id: Date.now(),
      name: formData.name.trim(),
      category: formData.category,
      quantity: `${Number(formData.quantity).toFixed(2)} ${formData.unit.toLowerCase()}`,
      expiryDate: formData.expiryDate,
      runningLow: formData.runningLow,
    };

    addItem(nextItem);
    setIsAddItemOpen(false);
  };

  return (
    <div className="bg-[#fffaf4]">
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="rounded-[34px] border border-[#ead9c7] bg-[#fff8f0] p-5 shadow-[0_24px_60px_rgba(17,17,17,0.08)] sm:p-7 lg:p-8"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
                Pantry
              </h1>
              <p className="mt-2 text-sm leading-7 text-[#6e6258] sm:text-base">
                Manage your ingredients and track expiry dates
              </p>
            </div>

            <button
              type="button"
              onClick={openAddItemModal}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-5 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-6 rounded-[22px] border border-[#f2dfb7] bg-[#fff8df] px-4 py-4 sm:px-5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 text-[#b08a1f]">
                <AlertCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-[#8d5c24] sm:text-lg">
                  Items Expiring Soon
                </p>
                <p className="mt-1 text-sm font-medium text-[#9c8250]">
                  {expiringSoonCount} items expiring within 7 days
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 rounded-[22px] border border-[#ead9c7] bg-white/80 p-3 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-[#8d7f72] shadow-[0_8px_22px_rgba(17,17,17,0.03)]">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search ingredients..."
                  className="w-full bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#a69a8f]"
                />
              </label>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0">
                {['All', ...categories].map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-[#ff7a18] text-[#111111] shadow-[0_12px_28px_rgba(255,122,24,0.2)]' : 'bg-[#f5ede4] text-[#6e6258] hover:bg-[#f0e4d6] hover:text-[#111111]'}`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <PantryItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
              ))
            ) : (
              <div className="col-span-full rounded-[24px] border border-dashed border-[#ead9c7] bg-white px-6 py-12 text-center shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4ea] text-[#d45d10]">
                  <CircleAlert className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-[#111111]">
                  No items found
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#6e6258]">
                  Try a different search term or switch categories to see more ingredients.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      <PantryAddItem
        isOpen={isAddItemOpen}
        onClose={closeAddItemModal}
        onSubmit={handleAddItem}
        formData={formData}
        onChange={handleFormChange}
        categories={categories}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-[#111111]/45 backdrop-blur-[2px]"
            onClick={cancelDeleteItem}
            aria-label="Close delete confirmation"
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
                Delete Pantry Item?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6e6258]">
                Are you sure you want to delete {deleteTarget.name} from your pantry?
              </p>
            </div>

            <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={cancelDeleteItem}
                className="inline-flex items-center justify-center rounded-2xl border border-[#d8cab9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5"
              >
                <X className="h-4 w-4" />
                Delete Item
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
