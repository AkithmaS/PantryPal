import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CircleAlert,
  Plus,
  Pencil,
  Search,
  X,
} from 'lucide-react';
import apiClient from '../api/client.js';
import PantryAddItem from './pantry_additem';
import { usePantry } from '../context/PantryContext';

const categories = ['Vegetables','Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];
const unitOptions = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
  { value: 'l', label: 'Liters' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'packs', label: 'Packs' },
  { value: 'cans', label: 'Cans' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'other', label: 'Other' },
];

function formatUnitLabel(unit) {
  const normalizedUnit = String(unit || '').toLowerCase();
  const matchedOption = unitOptions.find(({ value, label }) => value === normalizedUnit || label.toLowerCase() === normalizedUnit);

  return matchedOption ? matchedOption.label : unit || 'Pieces';
}

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

function formatShortDate(expiryDate) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(expiryDate));
}

function PantryItemCard({ item, onDelete, onEdit }) {
  const hasExpiryDate = Boolean(item.expiration_date);
  const daysUntilExpiry = hasExpiryDate ? getDaysUntil(item.expiration_date) : null;
  const isExpired = hasExpiryDate && daysUntilExpiry < 0;
  const isExpiringSoon = hasExpiryDate && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  const shouldShowRunningLow = item.is_running_low || isExpired;
  const quantityLabel = `${item.quantity} ${formatUnitLabel(item.unit)}`.trim();

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="group relative rounded-[22px] border border-[#ead9c7] bg-white p-5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] transition-transform duration-300 hover:shadow-[0_20px_44px_rgba(17,17,17,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-tight text-[#111111] sm:text-xl">
            {item.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-[#8d7f72]">{item.category}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8f6a4b] transition hover:bg-[#fff4ea] hover:text-[#111111]"
            aria-label={`Edit ${item.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8f6a4b] transition hover:bg-[#fff4ea] hover:text-[#111111]"
            aria-label={`Delete ${item.name}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-[#111111]">{quantityLabel}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${isExpired ? 'bg-[#fff1f1] text-[#c64545]' : 'bg-[#fff8f0] text-[#6e6258]'}`}
        >
          <Calendar className="h-4 w-4" />
          <span className={isExpired ? 'font-semibold' : ''}>
            {hasExpiryDate
              ? isExpired
                ? `Expired: ${formatExpiry(item.expiration_date)}`
                : `Expires: ${formatExpiry(item.expiration_date)}`
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

export default function Pantry({ filter }) {
  const navigate = useNavigate();
  const {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    isLoading,
    error,
  } = usePantry();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showExpiringSoonOnly, setShowExpiringSoonOnly] = useState(filter === 'expiring');
  const [showRunningLowOnly, setShowRunningLowOnly] = useState(filter === 'running-low');
  const [expiredItems, setExpiredItems] = useState([]);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [deletingExpired, setDeletingExpired] = useState(false);
  const [expiredDeleteError, setExpiredDeleteError] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pcs',
    category: 'Other',
    expiryDate: '',
    runningLow: false,
  });

  useEffect(() => {
    // Update filter states when filter prop changes
    setShowExpiringSoonOnly(filter === 'expiring');
    setShowRunningLowOnly(filter === 'running-low');
  }, [filter]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(''), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    const checkExpired = async () => {
      try {
        const response = await apiClient.get('/pantry/expired');
        const expired = response.data?.data || [];

        if (expired.length > 0) {
          setExpiredItems(expired);
          setShowExpiredModal(true);
          setExpiredDeleteError('');
        }
      } catch (requestError) {
        console.error('Expired check failed', requestError);
      }
    };

    checkExpired();
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        String(item.quantity).toLowerCase().includes(query);

      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesExpiringSoon =
        !showExpiringSoonOnly ||
        (item.expiration_date && (() => {
          const daysUntilExpiry = getDaysUntil(item.expiration_date);
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
        })());

      const matchesRunningLow =
        !showRunningLowOnly ||
        item.is_running_low;

      return matchesSearch && matchesCategory && matchesExpiringSoon && matchesRunningLow;
    });
  }, [activeCategory, items, searchTerm, showExpiringSoonOnly, showRunningLowOnly]);

  const expiringSoonCount = useMemo(
    () => items.filter((item) => {
      if (!item.expiration_date) {
        return false;
      }

      const daysUntilExpiry = getDaysUntil(item.expiration_date);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }).length,
    [items],
  );

  const runningLowCount = useMemo(
    () => items.filter((item) => item.is_running_low).length,
    [items],
  );

  const toggleExpiringSoonFilter = () => {
    if (showExpiringSoonOnly) {
      navigate('/pantry');
    } else {
      navigate('/pantry/expiring');
    }
  };

  const toggleRunningLowFilter = () => {
    if (showRunningLowOnly) {
      navigate('/pantry');
    } else {
      navigate('/pantry/running-low');
    }
  };

  const closeExpiredModal = () => {
    if (deletingExpired) {
      return;
    }

    setShowExpiredModal(false);
    setExpiredDeleteError('');
  };

  const handleDeleteExpiredItems = async () => {
    try {
      setDeletingExpired(true);
      setExpiredDeleteError('');

      const response = await apiClient.delete('/pantry/expired');
      const deletedIds = response.data?.data?.items || [];
      const deletedCount = response.data?.data?.deleted ?? deletedIds.length;

      setItems((currentItems) => currentItems.filter((item) => !deletedIds.includes(item.id)));
      setExpiredItems([]);
      setShowExpiredModal(false);
      setToastMessage(`${deletedCount} expired items removed and logged as waste`);
    } catch (requestError) {
      setExpiredDeleteError(requestError?.response?.data?.error || 'Failed to remove expired items');
    } finally {
      setDeletingExpired(false);
    }
  };

  const handleDeleteItem = (id) => {
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) {
      return;
    }

    setDeleteError('');
    setDeleteTarget(itemToDelete);
  };

  const confirmDeleteItem = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError('');
      await removeItem(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to delete this item. Please try again.';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteItem = () => {
    setDeleteError('');
    setDeleteTarget(null);
  };

  const openAddItemModal = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: 'pcs',
      category: 'Other',
      expiryDate: '',
      runningLow: false,
    });
    setIsAddItemOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditTarget(item);
    setFormData({
      name: item.name || '',
      quantity: item.quantity ?? '',
      unit: unitOptions.some(({ value, label }) => value === String(item.unit || '').toLowerCase() || label === item.unit)
        ? String(item.unit || '').toLowerCase()
        : 'pcs',
      category: item.category || 'Other',
      expiryDate: item.expiration_date ? String(item.expiration_date).slice(0, 10) : '',
      runningLow: Boolean(item.is_running_low),
    });
    setIsEditItemOpen(true);
  };

  const closeAddItemModal = () => {
    setIsAddItemOpen(false);
  };

  const closeEditItemModal = () => {
    setIsEditItemOpen(false);
    setEditTarget(null);
  };

  const handleFormChange = (event) => {
    const { name, type, checked, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      expiration_date: formData.expiryDate || null,
      is_running_low: formData.runningLow,
    };

    await addItem(payload);
    setIsAddItemOpen(false);
  };

  const handleUpdateItem = async (event) => {
    event.preventDefault();

    if (!editTarget) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      expiration_date: formData.expiryDate || null,
      is_running_low: formData.runningLow,
    };

    await updateItem(editTarget.id, payload);
    closeEditItemModal();
  };

  const expiredItemsToRender = expiredItems.map((item) => ({
    ...item,
    displayDate: formatShortDate(item.expiryDate || item.expiration_date),
  }));

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
            className="mt-6 flex flex-col gap-4 lg:flex-row lg:gap-4"
          >
            <button
              type="button"
              onClick={toggleExpiringSoonFilter}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition sm:px-5 ${showExpiringSoonOnly ? 'border-[#ff7a18] bg-[#fff3e7] shadow-[0_12px_28px_rgba(255,122,24,0.12)]' : 'border-[#f2dfb7] bg-[#fff8df]'}`}
              aria-pressed={showExpiringSoonOnly}
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
                    {showExpiringSoonOnly ? ' - showing only expiring items' : ''}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={toggleRunningLowFilter}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition sm:px-5 ${showRunningLowOnly ? 'border-[#ff7a18] bg-[#fff3e7] shadow-[0_12px_28px_rgba(255,122,24,0.12)]' : 'border-[#f2dfb7] bg-[#fff8df]'}`}
              aria-pressed={showRunningLowOnly}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 text-[#b08a1f]">
                  <AlertCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-[#8d5c24] sm:text-lg">
                    Running Low Items
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#9c8250]">
                    {runningLowCount} items marked as running low
                    {showRunningLowOnly ? ' - showing only running low items' : ''}
                  </p>
                </div>
              </div>
            </button>
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
            {isLoading ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-[#ead9c7] bg-white px-6 py-12 text-center shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4ea] text-[#d45d10]">
                  <CircleAlert className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-[#111111]">
                  Loading pantry items...
                </h2>
              </div>
            ) : error ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-[#ead9c7] bg-white px-6 py-12 text-center shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4ea] text-[#d45d10]">
                  <CircleAlert className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-[#111111]">
                  Unable to load pantry items
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#6e6258]">{error}</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <PantryItemCard key={item.id} item={item} onDelete={handleDeleteItem} onEdit={openEditItemModal} />
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
                  {showExpiringSoonOnly
                    ? 'No items are expiring within the next 7 days. Click the banner again to show all pantry items.'
                    : showRunningLowOnly
                      ? 'No items marked as running low. Click the banner again to show all pantry items.'
                      : 'Try a different search term or switch categories to see more ingredients.'}
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
        units={unitOptions}
        title="Add Pantry Item"
        subtitle="Keep your pantry list organized and up to date."
        submitLabel="Add Item"
      />

      <PantryAddItem
        isOpen={isEditItemOpen}
        onClose={closeEditItemModal}
        onSubmit={handleUpdateItem}
        formData={formData}
        onChange={handleFormChange}
        categories={categories}
        units={unitOptions}
        title="Update Pantry Item"
        subtitle="Edit the details and save the latest pantry info."
        submitLabel="Save Changes"
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
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeleting}
              >
                <X className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
            {deleteError ? (
              <p className="px-6 pb-6 text-sm text-[#c64545] sm:px-8">{deleteError}</p>
            ) : null}
          </motion.div>
        </div>
      ) : null}

      {showExpiredModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-[#111111]/45 backdrop-blur-[2px]"
            onClick={closeExpiredModal}
            aria-label="Close expired items modal"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[30px] border border-[#ead9c7] bg-[#fffaf4] shadow-[0_30px_80px_rgba(17,17,17,0.22)]"
          >
            <div className="border-b border-[#ead9c7] px-6 py-5 sm:px-8">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[#c64545]">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                    Expired Items Found
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#6e6258]">
                    The following items have passed their expiry date and will be removed from your pantry.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8">
              <div className="max-h-72 overflow-y-auto rounded-[24px] border border-[#ead9c7] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                <ul className="space-y-3 text-sm text-[#4c4038]">
                  {expiredItemsToRender.map((item) => (
                    <li key={item.id} className="rounded-2xl bg-[#fff8f0] px-4 py-3">
                      • {item.name} — {item.quantity} {formatUnitLabel(item.unit)} — expired {item.displayDate}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#6e6258]">
                These items will be logged as waste automatically when removed.
              </p>

              {expiredDeleteError ? (
                <p className="mt-3 text-sm font-medium text-[#c64545]">{expiredDeleteError}</p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeExpiredModal}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#d8cab9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
                  disabled={deletingExpired}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteExpiredItems}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={deletingExpired}
                >
                  <CircleAlert className="h-4 w-4" />
                  {deletingExpired ? 'Removing...' : `Remove ${expiredItems.length} Expired Items`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}

      {toastMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className="fixed right-4 top-4 z-[60] rounded-2xl border border-[#f3e1cf] bg-[#fff4ea] px-4 py-3 text-sm font-medium text-[#6a4321] shadow-[0_18px_45px_rgba(17,17,17,0.12)]"
        >
          {toastMessage}
        </motion.div>
      ) : null}
    </div>
  );
}
