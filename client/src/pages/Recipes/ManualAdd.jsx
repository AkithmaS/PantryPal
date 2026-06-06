import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  Clock3,
  Flame,
  Info,
  Lock,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import apiClient from '../../api/client.js';
import cardIcon from '../../assets/icon.png';

const MAX_INLINE_IMAGE_LENGTH = 800000;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cuisineOptions = ['Italian', 'Mediterranean', 'Asian', 'Mexican', 'American', 'Indian', 'French', 'Japanese', 'Other'];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file) {
  const maxOutputLength = 450000;
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const previewImage = new Image();
      previewImage.onload = () => resolve(previewImage);
      previewImage.onerror = () => reject(new Error('Unable to load image'));
      previewImage.src = objectUrl;
    });

    let maxDimension = 1280;
    let quality = 0.82;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      if (!context) {
        return await readFileAsDataUrl(file);
      }

      context.drawImage(image, 0, 0, width, height);
      const compressedImage = canvas.toDataURL('image/jpeg', quality);

      if (compressedImage.length <= maxOutputLength) {
        return compressedImage;
      }

      maxDimension = Math.max(640, Math.round(maxDimension * 0.75));
      quality = Math.max(0.5, quality - 0.12);
    }

    return await readFileAsDataUrl(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function SectionHeader({ icon: Icon, title, helper }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10] shadow-[0_10px_22px_rgba(17,17,17,0.04)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-[#111111] sm:text-2xl">{title}</h2>
          {helper ? <p className="mt-1 text-sm text-[#6e6258]">{helper}</p> : null}
        </div>
      </div>
    </div>
  );
}

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-[#4c4038]">
      {children}
    </label>
  );
}

function FieldShell({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-2xl border border-[#d7d7de] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(17,17,17,0.03)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function IngredientRow({ item, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-3 rounded-2xl border border-[#ead9c7] bg-[#fffaf5] px-3 py-3 transition hover:border-[#ff7a18]/30">
      <div className="col-span-12 md:col-span-5">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d5c24] md:hidden">
          Ingredient
        </div>
        <input
          value={item.name}
          onChange={(event) => onChange(item.id, 'name', event.target.value)}
          className="w-full border-0 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#9b8f82]"
          placeholder="Ingredient name"
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d5c24] md:hidden">Qty</div>
        <input
          value={item.qty}
          onChange={(event) => onChange(item.id, 'qty', event.target.value)}
          className="w-full border-0 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#9b8f82]"
          placeholder="1"
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d5c24] md:hidden">Unit</div>
        <input
          value={item.unit}
          onChange={(event) => onChange(item.id, 'unit', event.target.value)}
          className="w-full border-0 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#9b8f82]"
          placeholder="tbsp"
        />
      </div>
      <div className="col-span-4 flex items-center justify-end gap-3 md:col-span-3">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#b16a2c] transition hover:bg-[#fff1e3] hover:text-[#9a4a12]"
          aria-label="Remove ingredient"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StepCard({ step, index, onChange, onRemove }) {
  return (
    <div className="rounded-[22px] border border-[#ead9c7] bg-[#fffaf5] p-4 shadow-[0_8px_18px_rgba(17,17,17,0.03)]">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ff7a18] bg-white text-sm font-semibold text-[#d45d10] shadow-[0_10px_20px_rgba(17,17,17,0.06)]">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <input
              value={step.title}
              onChange={(event) => onChange(step.id, 'title', event.target.value)}
              className="w-full border-0 bg-transparent font-semibold text-[#111111] outline-none placeholder:text-[#9b8f82]"
              placeholder="Step title (optional)"
            />
            <button
              type="button"
              onClick={() => onRemove(step.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9b8f82] transition hover:bg-[#fff1e3] hover:text-[#9a4a12]"
              aria-label="Remove step"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea
            rows={4}
            value={step.details}
            onChange={(event) => onChange(step.id, 'details', event.target.value)}
            className="w-full resize-none rounded-2xl border border-[#e2d5c8] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition placeholder:text-[#9b8f82] focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
            placeholder="Describe the step in detail..."
          />
        </div>
      </div>
    </div>
  );
}

export default function ManualAdd() {
  const navigate = useNavigate();
  const [recipeTitle, setRecipeTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState([
    { id: 'ing-1', name: '', qty: '', unit: '', required: false },
  ]);
  const [steps, setSteps] = useState([{ id: 'step-1', title: '', details: '' }]);
  const [cookingTips, setCookingTips] = useState(['']);
  const [imagePayload, setImagePayload] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const updateIngredient = (id, key, value) => {
    setIngredients((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const addIngredient = () => {
    setIngredients((current) => [
      ...current,
      { id: `ing-${Math.random().toString(36).substr(2, 9)}`, name: '', qty: '', unit: '', required: false },
    ]);
  };

  const removeIngredient = (id) => {
    if (ingredients.length > 1) {
      setIngredients((current) => current.filter((item) => item.id !== id));
    }
  };

  const updateStep = (id, key, value) => {
    setSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, [key]: value } : step)),
    );
  };

  const addStep = () => {
    setSteps((current) => [...current, { id: `step-${Math.random().toString(36).substr(2, 9)}`, title: '', details: '' }]);
  };

  const updateTip = (index, value) => {
    setCookingTips((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const addTip = () => {
    setCookingTips((current) => [...current, '']);
  };

  const removeTip = (index) => {
    if (cookingTips.length > 1) {
      setCookingTips((current) => current.filter((_, i) => i !== index));
    }
  };

  const removeStep = (id) => {
    if (steps.length > 1) {
      setSteps((current) => current.filter((step) => step.id !== id));
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      setImagePayload(compressed);
      setImagePreview(compressed);
    } catch (err) {
      setError('Unable to process image. Please try another one.');
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipeTitle.trim()) {
      setError('Please enter a recipe title.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const payload = {
        name: recipeTitle.trim(),
        description: description.trim(),
        cuisine_type: cuisine,
        preparation_time: prepTime === '' ? null : Number(prepTime),
        cooking_time: cookTime === '' ? null : Number(cookTime),
        servings: Number(servings),
        image_url: imagePayload,
        ingredients: ingredients
          .filter((ing) => ing.name.trim())
          .map((ing) => ({
            name: ing.name.trim(),
            quantity: ing.qty || '1',
            unit: ing.unit.trim(),
          })),
        instructions: steps
          .filter((s) => s.details.trim())
          .map((s) => (s.title ? `${s.title}: ${s.details}` : s.details)),
        cooking_tips: cookingTips.filter((tip) => tip.trim()),
      };

      await apiClient.post('/recipes', payload);
      navigate('/recipes/all');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save recipe. Please check all fields.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f0] px-4 py-6 text-[#111111] sm:px-6 lg:px-8 lg:py-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(63,114,93,0.09),_transparent_24%)]" />

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative mx-auto w-full max-w-7xl"
      >
        <motion.div
          variants={fadeUp}
          className="overflow-hidden rounded-[34px] border border-[#ead9c7] bg-white/88 shadow-[0_28px_70px_rgba(17,17,17,0.08)] backdrop-blur"
        >
          <div className="border-b border-[#f0e3d6] px-5 py-5 sm:px-6 sm:py-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
              Create New Recipe
            </h1>
            <p className="mt-2 text-sm text-[#5d5148]">
              Fill in the details below to add a new recipe to your collection.
            </p>
          </div>

          <div className="p-5 sm:p-6 space-y-8">
            {error && (
              <div className="rounded-2xl bg-[#fff1f1] border border-[#fecaca] p-4 text-sm text-[#c64545] font-medium">
                {error}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-8">
                <section className="space-y-6">
                  <SectionHeader icon={Info} title="Basic Details" />
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Recipe Title</Label>
                      <input
                        id="title"
                        value={recipeTitle}
                        onChange={(e) => setRecipeTitle(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-[#d7d7de] bg-[#fffdf8] px-4 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
                        placeholder="e.g. Grandma's Secret Sunday Sauce"
                      />
                    </div>
                    <div>
                      <Label htmlFor="desc">Description</Label>
                      <textarea
                        id="desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-[#d7d7de] bg-[#fffdf8] px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
                        placeholder="A short blurb about this dish..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="cuisine">Cuisine</Label>
                      <div className="relative">
                        <select
                          id="cuisine"
                          value={cuisine}
                          onChange={(e) => setCuisine(e.target.value)}
                          className="h-12 w-full appearance-none rounded-2xl border border-[#d7d7de] bg-[#fffdf8] px-4 pr-11 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
                        >
                          {cuisineOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7c85]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="prep">Prep (min)</Label>
                      <FieldShell className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-[#d45d10]" />
                        <input id="prep" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} type="number" className="w-full border-0 bg-transparent text-sm outline-none" />
                      </FieldShell>
                    </div>
                    <div>
                      <Label htmlFor="cook">Cook (min)</Label>
                      <FieldShell className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-[#d45d10]" />
                        <input id="cook" value={cookTime} onChange={(e) => setCookTime(e.target.value)} type="number" className="w-full border-0 bg-transparent text-sm outline-none" />
                      </FieldShell>
                    </div>
                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <div className="flex items-center overflow-hidden rounded-2xl border border-[#d7d7de] bg-[#fffdf8]">
                        <button type="button" onClick={() => setServings(s => Math.max(1, s - 1))} className="h-12 w-10 text-[#8d5c24] hover:bg-[#fff1e3] transition"><Minus className="h-4 w-4 mx-auto" /></button>
                        <div className="flex-1 text-center text-sm font-semibold">{servings}</div>
                        <button type="button" onClick={() => setServings(s => s + 1)} className="h-12 w-10 text-[#8d5c24] hover:bg-[#fff1e3] transition"><Plus className="h-4 w-4 mx-auto" /></button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionHeader icon={UtensilsCrossed} title="Ingredients" helper="Add as many items as needed." />
                  <div className="space-y-3">
                    {ingredients.map((item) => (
                      <IngredientRow key={item.id} item={item} onChange={updateIngredient} onRemove={removeIngredient} />
                    ))}
                    <button type="button" onClick={addIngredient} className="inline-flex items-center gap-2 text-sm font-semibold text-[#d45d10] hover:text-[#9a4a12] transition">
                      <CirclePlus className="h-4 w-4" /> Add Item
                    </button>
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionHeader icon={CheckCircle2} title="Instructions" helper="Break it down into simple steps." />
                  <div className="space-y-4">
                    {steps.map((step, idx) => (
                      <StepCard key={step.id} index={idx} step={step} onChange={updateStep} onRemove={removeStep} />
                    ))}
                    <button type="button" onClick={addStep} className="inline-flex items-center gap-2 text-sm font-semibold text-[#d45d10] hover:text-[#9a4a12] transition">
                      <CirclePlus className="h-4 w-4" /> Add Step
                    </button>
                  </div>
                </section>

                <section className="space-y-6 pt-4 border-t border-[#ead9c7]/20">
                  <SectionHeader icon={Plus} title="Cooking Tips" helper="Optional professional advice for this dish." />
                  <div className="space-y-3">
                    {cookingTips.map((tip, index) => (
                      <div key={index} className="flex gap-3">
                        <textarea
                          rows={2}
                          value={tip}
                          onChange={(e) => updateTip(index, e.target.value)}
                          className="w-full resize-none rounded-2xl border border-[#d7d7de] bg-[#fffdf8] px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
                          placeholder="Tip or suggestion..."
                        />
                        <button
                          type="button"
                          onClick={() => removeTip(index)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9b8f82] transition hover:bg-[#fff1e3] hover:text-[#9a4a12]"
                          aria-label="Remove tip"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addTip} className="inline-flex items-center gap-2 text-sm font-semibold text-[#d45d10] hover:text-[#9a4a12] transition">
                      <CirclePlus className="h-4 w-4" /> Add Tip
                    </button>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="space-y-6">
                  <SectionHeader icon={Camera} title="Recipe Media" />
                  <div className="overflow-hidden rounded-[28px] border-2 border-dashed border-[#ead9c7] bg-[#fffaf5] p-2">
                    <div className="relative aspect-square overflow-hidden rounded-[22px] bg-white">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                          <button onClick={() => { setImagePayload(null); setImagePreview(null); }} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[#c64545] shadow-lg hover:bg-white">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-6 text-center transition hover:bg-[#fff4ea]">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10] shadow-sm">
                            <Camera className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-semibold text-[#111111]">Click to upload</p>
                          <p className="mt-2 text-xs text-[#6e6258]">High quality JPG or PNG works best.</p>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </section>

                <div className="rounded-[30px] border border-[#ead9c7] bg-[#fffaf5] p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-[#111111]">
                    <Sparkles className="h-5 w-5 text-[#d45d10]" /> Finalize
                  </h3>
                  <p className="mt-2 text-sm text-[#6e6258]">
                    Once saved, your recipe will be added to your personal collection.
                  </p>
                  <button
                    onClick={handleSaveRecipe}
                    disabled={isSaving}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(255,122,24,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving Recipe...' : 'Save Recipe'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}