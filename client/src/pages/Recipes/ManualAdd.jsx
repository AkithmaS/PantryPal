import { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cuisineOptions = ['Italian', 'Mediterranean', 'Asian', 'Mexican', 'American'];
const dietaryOptions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];
const difficultyOptions = ['Easy', 'Medium', 'Hard'];

const initialIngredients = [
  { id: 1, name: 'Extra Virgin Olive Oil', qty: '2', unit: 'tbsp', required: false },
  { id: 2, name: 'Fresh Basil Leaves', qty: '1', unit: 'bunch', required: true },
];

const initialSteps = [
  {
    id: 1,
    title: 'Sauté aromatics',
    details: 'Heat olive oil in a large pan over medium heat. Add chopped garlic and onions until fragrant.',
  },
  {
    id: 2,
    title: 'Simmer the sauce',
    details: 'Pour in the crushed tomatoes and season with salt and pepper. Let the sauce reduce until rich.',
  },
];

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

function ProgressRow({ label, value, percent }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-[#4c4038]">{label}</span>
        <span className="font-semibold text-[#111111]">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#ece0d5]">
        <div className="h-2 rounded-full bg-[#3f725d]" style={{ width: `${percent}%` }} />
      </div>
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
      <div className="col-span-4 flex items-center justify-between gap-3 md:col-span-3">
        <div className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d5c24] md:block">Req.</div>
        <button
          type="button"
          onClick={() => onChange(item.id, 'required', !item.required)}
          className={[
            'inline-flex h-9 w-9 items-center justify-center rounded-full border transition',
            item.required
              ? 'border-[#d45d10] bg-[#fff1e3] text-[#d45d10]'
              : 'border-[#e3d8cb] bg-white text-[#9b8f82] hover:border-[#ff7a18]/35 hover:text-[#d45d10]',
          ].join(' ')}
          aria-label={item.required ? 'Mark ingredient as optional' : 'Mark ingredient as required'}
        >
          <Lock className="h-4 w-4" />
        </button>
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
  const [recipeTitle, setRecipeTitle] = useState("Grandma's Secret Sunday Sauce");
  const [cuisine, setCuisine] = useState('Italian');
  const [dietaryLabel, setDietaryLabel] = useState('Vegetarian');
  const [difficulty, setDifficulty] = useState('Medium');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('45');
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [steps, setSteps] = useState(initialSteps);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [publishPromptOpen, setPublishPromptOpen] = useState(false);

  const updateIngredient = (id, key, value) => {
    setIngredients((currentIngredients) =>
      currentIngredients.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const addIngredient = () => {
    setIngredients((currentIngredients) => [
      ...currentIngredients,
      { id: Date.now(), name: '', qty: '', unit: '', required: false },
    ]);
  };

  const removeIngredient = (id) => {
    setIngredients((currentIngredients) => currentIngredients.filter((item) => item.id !== id));
  };

  const updateStep = (id, key, value) => {
    setSteps((currentSteps) =>
      currentSteps.map((step) => (step.id === id ? { ...step, [key]: value } : step)),
    );
  };

  const addStep = () => {
    setSteps((currentSteps) => [...currentSteps, { id: Date.now(), title: '', details: '' }]);
  };

  const removeStep = (id) => {
    setSteps((currentSteps) => currentSteps.filter((step) => step.id !== id));
  };

  const ingredientProgress = Math.min(
    100,
    Math.round((ingredients.filter((item) => item.name.trim()).length / 10) * 100),
  );
  const instructionProgress = Math.min(
    100,
    Math.round((steps.filter((step) => step.details.trim()).length / 4) * 100),
  );

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
            <div className="flex flex-wrap items-center gap-4">
              
              <div className="min-w-0 flex-1">
                
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl lg:text-5xl">
                  Create New Recipe
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5d5148] sm:text-base">
                  Document your culinary masterpiece with precise details, polished steps, and PantryPal’s warm green and orange palette.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <div className="space-y-6">
              <motion.div variants={fadeUp} className="rounded-[30px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)] sm:p-6">
                <SectionHeader
                  icon={Info}
                  title="Basic Info"
                  helper="Start with the recipe identity, core timing, and diet preferences."
                />

                <div className="mt-6 space-y-6">
                  <div>
                    <Label htmlFor="recipe-title">Recipe Title</Label>
                    <input
                      id="recipe-title"
                      value={recipeTitle}
                      onChange={(event) => setRecipeTitle(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-[#d7d7de] bg-[#fffdf8] px-4 text-sm text-[#111111] outline-none transition placeholder:text-[#9b8f82] focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
                      placeholder="e.g. Grandma's Secret Sunday Sauce"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cuisine">Cuisine</Label>
                      <div className="relative">
                        <select
                          id="cuisine"
                          value={cuisine}
                          onChange={(event) => setCuisine(event.target.value)}
                          className="h-12 w-full appearance-none rounded-2xl border border-[#d7d7de] bg-[#fffdf8] px-4 pr-11 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
                        >
                          {cuisineOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7c85]" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="dietary-label">Dietary Labels</Label>
                      <div className="relative">
                        <select
                          id="dietary-label"
                          value={dietaryLabel}
                          onChange={(event) => setDietaryLabel(event.target.value)}
                          className="h-12 w-full appearance-none rounded-2xl border border-[#d7d7de] bg-[#fffdf8] px-4 pr-11 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
                        >
                          {dietaryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7c85]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 block text-sm font-medium text-[#4c4038]">Difficulty Level</p>
                    <div className="flex flex-wrap gap-2">
                      {difficultyOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setDifficulty(option)}
                          className={[
                            'rounded-full border px-4 py-2 text-sm font-medium transition',
                            difficulty === option
                              ? 'border-[#8d5c24] bg-[#fff4ea] text-[#8d5c24] shadow-[0_12px_24px_rgba(141,92,36,0.14)]'
                              : 'border-[#e7e7ea] bg-[#f7f7f9] text-[#232328] hover:border-[#8d5c24]/30 hover:text-[#111111]',
                          ].join(' ')}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="prep-time">Prep Time (min)</Label>
                      <FieldShell>
                        <div className="flex items-center gap-3">
                          <Clock3 className="h-4 w-4 text-[#d45d10]" />
                          <input
                            id="prep-time"
                            value={prepTime}
                            onChange={(event) => setPrepTime(event.target.value)}
                            className="w-full border-0 bg-transparent text-sm text-[#111111] outline-none"
                          />
                        </div>
                      </FieldShell>
                    </div>

                    <div>
                      <Label htmlFor="cook-time">Cook Time (min)</Label>
                      <FieldShell>
                        <div className="flex items-center gap-3">
                          <Flame className="h-4 w-4 text-[#d45d10]" />
                          <input
                            id="cook-time"
                            value={cookTime}
                            onChange={(event) => setCookTime(event.target.value)}
                            className="w-full border-0 bg-transparent text-sm text-[#111111] outline-none"
                          />
                        </div>
                      </FieldShell>
                    </div>

                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <div className="flex items-center overflow-hidden rounded-2xl border border-[#d7d7de] bg-[#fffdf8] shadow-[0_8px_18px_rgba(17,17,17,0.03)]">
                        <button
                          type="button"
                          onClick={() => setServings((currentValue) => Math.max(1, currentValue - 1))}
                          className="inline-flex h-12 w-12 items-center justify-center text-[#8d5c24] transition hover:bg-[#fff1e3] hover:text-[#9a4a12]"
                          aria-label="Decrease servings"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div id="servings" className="flex-1 text-center text-sm font-semibold text-[#111111]">
                          {servings}
                        </div>
                        <button
                          type="button"
                          onClick={() => setServings((currentValue) => currentValue + 1)}
                          className="inline-flex h-12 w-12 items-center justify-center text-[#8d5c24] transition hover:bg-[#fff1e3] hover:text-[#9a4a12]"
                          aria-label="Increase servings"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-[30px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <SectionHeader
                    icon={UtensilsCrossed}
                    title="Ingredients"
                    helper="Define mandatory items with the lock icon."
                  />
                  <div className="hidden rounded-full bg-[#fff4ea] px-3 py-1.5 text-xs font-semibold text-[#8d5c24] sm:inline-flex">
                    {ingredients.length} items
                  </div>
                </div>

                <div className="mt-5 hidden rounded-2xl bg-[#fff4ea] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d5c24] md:grid md:grid-cols-12 md:gap-3">
                  <div className="md:col-span-5">Ingredient Name</div>
                  <div className="md:col-span-2">Qty</div>
                  <div className="md:col-span-2">Unit</div>
                  <div className="md:col-span-3 text-right">Req.</div>
                </div>

                <div className="mt-4 space-y-3">
                  {ingredients.map((item) => (
                    <IngredientRow
                      key={item.id}
                      item={item}
                      onChange={updateIngredient}
                      onRemove={removeIngredient}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#fff4ea] bg-[#fff4ea] px-4 py-3 text-sm font-semibold text-[#8d5c24] transition hover:border-[#3f725d]/40 hover:bg-[#fff4ea]"
                >
                  <CirclePlus className="h-4 w-4" />
                  Add Ingredient
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-[30px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)] sm:p-6">
                <SectionHeader
                  icon={CheckCircle2}
                  title="Instructions"
                  helper="Write each step as something a cook can act on immediately."
                />

                <div className="mt-5 space-y-4">
                  {steps.map((step, index) => (
                    <StepCard key={step.id} step={step} index={index} onChange={updateStep} onRemove={removeStep} />
                  ))}
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={addStep}
                    className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-5 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add Step
                  </button>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-3">
                <details className="group overflow-hidden rounded-[26px] border border-[#ead9c7] bg-white/80 shadow-[0_14px_34px_rgba(17,17,17,0.05)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3 font-display text-lg font-semibold text-[#111111]">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
                        <Camera className="h-4 w-4" />
                      </span>
                      Recipe Cover (Optional)
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#8f6a4b] transition group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[#f0e3d6] px-5 pb-5 pt-4">
                    <p className="text-sm text-[#6e6258]">
                      Add a cover image to make the recipe feel polished and easier to recognize in your collection.
                    </p>

                    <div className="mt-4 rounded-[28px] border-2 border-dashed border-[#cfd2c8] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,244,234,0.8)_100%)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                      <div className="flex min-h-[190px] items-center justify-center rounded-[22px] bg-[radial-gradient(circle_at_top,_rgba(255,122,24,0.06),_transparent_35%),linear-gradient(180deg,rgba(255,248,240,0.2),rgba(63,114,93,0.06))] px-4 py-8">
                        <div className="max-w-[220px] text-[#6e6258]">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-[#d45d10] shadow-[0_14px_28px_rgba(17,17,17,0.08)]">
                            <Camera className="h-6 w-6" />
                          </div>
                          <p className="mt-4 text-sm font-medium text-[#4c4038]">Click to upload image</p>
                          <p className="mt-2 text-xs leading-6 text-[#7f7267]">
                            Choose a landscape photo with natural light and clean composition.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-3">
                <details
                  open={nutritionOpen}
                  onToggle={(event) => setNutritionOpen(event.currentTarget.open)}
                  className="group overflow-hidden rounded-[26px] border border-[#ead9c7] bg-white/80 shadow-[0_14px_34px_rgba(17,17,17,0.05)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3 font-display text-lg font-semibold text-[#111111]">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
                        <Flame className="h-4 w-4" />
                      </span>
                      Nutrition (Optional)
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#8f6a4b] transition group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[#f0e3d6] px-5 pb-5 pt-1 text-sm text-[#5d5148]">
                    Add calories, macros, or dietary notes for a more complete recipe entry.
                  </div>
                </details>

                <details
                  open={tipsOpen}
                  onToggle={(event) => setTipsOpen(event.currentTarget.open)}
                  className="group overflow-hidden rounded-[26px] border border-[#ead9c7] bg-white/80 shadow-[0_14px_34px_rgba(17,17,17,0.05)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3 font-display text-lg font-semibold text-[#111111]">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
                        <Info className="h-4 w-4" />
                      </span>
                      Cooking Tips (Optional)
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#8f6a4b] transition group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[#f0e3d6] px-5 pb-5 pt-1 text-sm text-[#5d5148]">
                    Note garnish ideas, timing warnings, or plating guidance so the recipe feels finished.
                  </div>
                </details>
              </motion.div>

              <motion.div variants={fadeUp} className="pt-2">
                <button
                  type="button"
                  onClick={() => setPublishPromptOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#ff7a18] px-6 py-4 text-sm font-semibold text-[#111111] shadow-[0_20px_40px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
                >
                  Save Recipe
                </button>
                
              </motion.div>
            
            </div>

            <div className="space-y-5 xl:sticky xl:top-6">
            </div>
          </div>
        </motion.div>
      </motion.section>

      {publishPromptOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/35 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-md rounded-[28px] border border-[#ead9c7] bg-white p-5 shadow-[0_24px_60px_rgba(17,17,17,0.18)]"
          >
            <div className="flex items-start gap-3">
              
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold text-[#111111]">Do you want to publish this recipe?</h2>
                <p className="mt-2 text-sm leading-6 text-[#6e6258]">
                  Publishing will allow others to view and try your recipe. 
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPublishPromptOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-[#ead9c7] bg-white px-4 py-2.5 text-sm font-semibold text-[#4c4038] transition hover:bg-[#fff8f0] hover:text-[#111111]"
              >
                Ignore
              </button>
              <button
                type="button"
                onClick={() => setPublishPromptOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-[#ff7a18] px-4 py-2.5 text-sm font-semibold text-[#111111] shadow-[0_16px_30px_rgba(255,122,24,0.28)] transition hover:-translate-y-0.5"
              >
                Publish
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}