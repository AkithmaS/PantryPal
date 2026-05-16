import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CirclePlus,
  Clock3,
  Flame,
  Plus,
  Sparkles,
  TimerReset,
  Users,
  X,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const dietOptions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const cuisineOptions = ['Italian', 'Mexican', 'Mediterranean', 'Asian', 'American'];

const defaultIngredients = ['tomato'];

const recipeTemplates = {
  Italian: {
    title: 'Herbed Tomato & Garlic Poach',
    chips: ['Italian-Fusion', 'Vegetarian'],
    meta: ['15 mins', '2 Servings', '340 kcal'],
    ingredients: ['4 Large Organic Eggs', '2 Cloves Garlic, minced', '3 Ripe Vine Tomatoes', '1 tbsp Olive Oil'],
    instructions: [
      'Sauté the minced garlic in olive oil over medium heat until fragrant and slightly golden.',
      'Add chopped tomatoes and a pinch of salt. Cook until they break down into a thick sauce.',
      'Make four small wells in the sauce and crack an egg into each. Cover and simmer until set.',
    ],
    nutrition: [
      { label: 'Protein', value: '24g' },
      { label: 'Carbs', value: '18g' },
      { label: 'Fat', value: '21g' },
      { label: 'Fiber', value: '6g' },
    ],
  },
  Mexican: {
    title: 'Smoky Tomato Skillet Eggs',
    chips: ['Mexican', 'High-Protein'],
    meta: ['20 mins', '4 Servings', '310 kcal'],
    ingredients: ['4 Eggs', '2 Tomatoes, chopped', '1 clove Garlic', '1 tsp Olive Oil'],
    instructions: [
      'Warm the oil with garlic until fragrant, then add chopped tomatoes.',
      'Season with salt and smoked spice, then simmer into a chunky sauce.',
      'Crack eggs into wells, cover, and cook until the whites are set.',
    ],
    nutrition: [
      { label: 'Protein', value: '23g' },
      { label: 'Carbs', value: '14g' },
      { label: 'Fat', value: '19g' },
      { label: 'Fiber', value: '5g' },
    ],
  },
  Mediterranean: {
    title: 'Garden Herb Egg Stew',
    chips: ['Mediterranean', 'Vegetarian'],
    meta: ['18 mins', '3 Servings', '290 kcal'],
    ingredients: ['3 Eggs', '2 Tomatoes', '1 Garlic Clove', '1 tbsp Olive Oil'],
    instructions: [
      'Build a garlic base in olive oil, then soften the tomatoes with a little salt.',
      'Add herbs and simmer until the sauce turns glossy and rich.',
      'Poach the eggs directly in the sauce and serve once set.',
    ],
    nutrition: [
      { label: 'Protein', value: '21g' },
      { label: 'Carbs', value: '12g' },
      { label: 'Fat', value: '18g' },
      { label: 'Fiber', value: '7g' },
    ],
  },
  Asian: {
    title: 'Ginger Garlic Tomato Bowl',
    chips: ['Asian', 'Balanced'],
    meta: ['17 mins', '2 Servings', '320 kcal'],
    ingredients: ['4 Eggs', '2 Tomatoes', '1 tsp Ginger', '1 clove Garlic'],
    instructions: [
      'Cook garlic and ginger until aromatic, then fold in the tomatoes.',
      'Reduce to a jammy sauce, add seasoning, and keep the pan on medium-low.',
      'Add eggs, cover, and finish until softly set.',
    ],
    nutrition: [
      { label: 'Protein', value: '22g' },
      { label: 'Carbs', value: '16g' },
      { label: 'Fat', value: '17g' },
      { label: 'Fiber', value: '4g' },
    ],
  },
  American: {
    title: 'Rustic Tomato Breakfast Skillet',
    chips: ['American', 'Comfort Food'],
    meta: ['22 mins', '4 Servings', '360 kcal'],
    ingredients: ['4 Eggs', '3 Tomatoes', '2 Garlic Cloves', '1 tbsp Olive Oil'],
    instructions: [
      'Sauté garlic, then add tomatoes and simmer until thickened.',
      'Create wells for the eggs and cook until the yolks are still soft.',
      'Finish with herbs and a little black pepper before serving.',
    ],
    nutrition: [
      { label: 'Protein', value: '25g' },
      { label: 'Carbs', value: '19g' },
      { label: 'Fat', value: '23g' },
      { label: 'Fiber', value: '6g' },
    ],
  },
};

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3f725d]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-[#111111] sm:text-[2rem]">{title}</h2>
      {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d5148] sm:text-base">{description}</p> : null}
    </div>
  );
}

function Pill({ children, active = false }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
        active
          ? 'border-[#ff7a18] bg-[#ff7a18] text-[#111111] shadow-[0_12px_24px_rgba(255,122,24,0.24)]'
          : 'border-[#e7e7ea] bg-[#f7f7f9] text-[#232328] hover:border-[#ff7a18]/35 hover:text-[#111111]',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function formatIngredient(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function DetailChip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff4ea] px-3 py-1.5 font-medium text-[#8d5c24]">
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

export default function AIGenerator() {
  const [usePantryIngredients, setUsePantryIngredients] = useState(true);
  const [ingredientText, setIngredientText] = useState('');
  const [ingredients, setIngredients] = useState(defaultIngredients);
  const [dietaryRestriction, setDietaryRestriction] = useState('Vegetarian');
  const [cuisine, setCuisine] = useState('Mexican');
  const [servings, setServings] = useState(4);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  const canAddIngredient = useMemo(() => ingredientText.trim().length > 0, [ingredientText]);
  const cuisinePreset = recipeTemplates[cuisine] ?? recipeTemplates.Italian;

  const addIngredient = () => {
    const nextIngredient = ingredientText.trim();

    if (!nextIngredient) {
      return;
    }

    const normalized = nextIngredient.toLowerCase();

    setIngredients((currentIngredients) =>
      currentIngredients.some((item) => item.toLowerCase() === normalized)
        ? currentIngredients
        : [...currentIngredients, nextIngredient],
    );
    setIngredientText('');
  };

  const removeIngredient = (ingredient) => {
    setIngredients((currentIngredients) =>
      currentIngredients.filter((item) => item !== ingredient),
    );
  };

  const handleGenerate = () => {
    const selectedIngredients = usePantryIngredients ? ingredients : [];

    setGeneratedRecipe({
      title: cuisinePreset.title,
      chips: cuisinePreset.chips,
      meta: cuisinePreset.meta,
      ingredients: selectedIngredients.length > 0 ? selectedIngredients : cuisinePreset.ingredients,
      instructions: cuisinePreset.instructions,
      nutrition: cuisinePreset.nutrition,
      summary:
        `A ${dietaryRestriction.toLowerCase()} ${cuisine.toLowerCase()} recipe built for ${servings} servings using PantryPal colors and a clean, calm layout.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#fff8f0]">
      <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.08),_transparent_32%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(63,114,93,0.08),_transparent_30%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]"
          >
            <motion.div
              variants={fadeUp}
              className="overflow-hidden rounded-[32px] border border-[#ead9c7] bg-white/88 shadow-[0_24px_60px_rgba(17,17,17,0.08)] backdrop-blur"
            >
              <div className="border-b border-[#f0e3d6] px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10] shadow-[0_10px_22px_rgba(17,17,17,0.04)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    
                    <h1 className="font-display text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
                      AI Recipe Generator
                    </h1>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-[#f3e1cf] bg-[#fff4ea] px-4 py-3 text-[#6a4321] shadow-[0_8px_18px_rgba(17,17,17,0.03)]">
                    <label className="flex items-center gap-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={usePantryIngredients}
                        onChange={(event) => setUsePantryIngredients(event.target.checked)}
                        className="h-5 w-5 rounded border-[#ff7a18] text-[#ff7a18] focus:ring-[#ff7a18]"
                      />
                      <span>Use ingredients from my pantry</span>
                    </label>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label htmlFor="ingredient-input" className="text-sm font-semibold text-[#111111]">
                        Ingredients
                      </label>
                      <span className="text-xs font-medium text-[#6e6258]">Add what you have on hand</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        id="ingredient-input"
                        value={ingredientText}
                        onChange={(event) => setIngredientText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addIngredient();
                          }
                        }}
                        placeholder="Add ingredient"
                        className="h-14 flex-1 rounded-2xl border-2 border-[#ff7a18] bg-white px-4 text-base text-[#111111] outline-none transition placeholder:text-[#7a7a83] focus:border-[#d45d10] focus:ring-4 focus:ring-[#ff7a18]/12"
                      />

                      <button
                        type="button"
                        onClick={addIngredient}
                        disabled={!canAddIngredient}
                        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff7a18] text-[#111111] shadow-[0_16px_28px_rgba(255,122,24,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Add ingredient"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {ingredients.map((ingredient) => (
                        <span
                          key={ingredient}
                          className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f5] px-4 py-2 text-sm font-medium text-[#2b2b31] shadow-[0_6px_16px_rgba(17,17,17,0.04)]"
                        >
                          {formatIngredient(ingredient)}
                          <button
                            type="button"
                            onClick={() => removeIngredient(ingredient)}
                            className="text-[#6c6c76] transition hover:text-[#111111]"
                            aria-label={`Remove ${ingredient}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#111111]">Preferences</p>

                    <div className="mt-3 space-y-5">
                      <div>
                        <label htmlFor="cuisine-select" className="mb-2 block text-sm text-[#4c4038]">
                          Cuisine Type
                        </label>
                        <div className="relative">
                          <select
                            id="cuisine-select"
                            value={cuisine}
                            onChange={(event) => setCuisine(event.target.value)}
                            className="h-14 w-full appearance-none rounded-2xl border border-[#d7d7de] bg-white px-4 pr-11 text-base text-[#111111] outline-none transition focus:border-[#d45d10] focus:ring-4 focus:ring-[#ff7a18]/10"
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
                        <label className="mb-2 block text-sm text-[#4c4038]">Dietary Restrictions</label>
                        <div className="flex flex-wrap gap-3">
                          {dietOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setDietaryRestriction(option)}
                              className={[
                                'rounded-full px-4 py-2 text-sm font-medium transition',
                                dietaryRestriction === option
                                  ? 'bg-[#ff7a18] text-[#111111] shadow-[0_12px_24px_rgba(255,122,24,0.24)]'
                                  : 'bg-[#f3f3f5] text-[#2b2b31] hover:bg-[#edf8f2]',
                              ].join(' ')}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label htmlFor="servings-range" className="text-sm text-[#4c4038]">
                            Servings: {servings}
                          </label>
                        </div>
                        <input
                          id="servings-range"
                          type="range"
                          min="1"
                          max="8"
                          value={servings}
                          onChange={(event) => setServings(Number(event.target.value))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e7e7ea] accent-[#ff7a18]"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-6 py-4 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5"
                  >
                    Generate Recipe
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>

                  <p className="text-xs leading-6 text-[#6e6258]">
                    Pantry mode is {usePantryIngredients ? 'on' : 'off'}. Selected cuisine is {cuisine}, with {dietaryRestriction.toLowerCase()} preferences and {servings} servings.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="overflow-hidden rounded-[32px] border border-[#ead9c7] bg-white/88 shadow-[0_24px_60px_rgba(17,17,17,0.08)] backdrop-blur"
            >
              <div className="flex min-h-full flex-col px-5 py-5 sm:px-6 sm:py-6">
                {generatedRecipe ? (
                  <div className="flex h-full flex-1 flex-col">
                    <div className="flex flex-wrap gap-2">
                      {generatedRecipe.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full bg-[#3f725d] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.08)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-[#111111]">
                      {generatedRecipe.title}
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#6e6258]">
                      <DetailChip icon={Clock3} label={generatedRecipe.meta[0]} />
                      <DetailChip icon={Users} label={generatedRecipe.meta[1]} />
                      <DetailChip icon={Flame} label={generatedRecipe.meta[2]} />
                    </div>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5d5148]">
                      {generatedRecipe.summary}
                    </p>

                    <div className="mt-6 border-t border-[#ead9c7] pt-6">
                      <SectionTitle
                        eyebrow="Ingredients"
                        title="What you need"
                        description="Matched to your selected pantry ingredients and theme."
                      />

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {generatedRecipe.ingredients.map((item) => (
                          <div key={item} className="rounded-2xl border border-[#ead9c7] bg-[#fffaf5] px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[#3f725d] bg-[#e7f1ea] text-[#3f725d]">
                                <Check className="h-3 w-3" />
                              </span>
                              <span className="text-sm font-medium text-[#4c4038]">{formatIngredient(item)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#ead9c7] pt-6">
                      <SectionTitle
                        eyebrow="Instructions"
                        title="How to cook it"
                        description="A simple, readable flow that stays calm on screen and on the plate."
                      />

                      <div className="mt-4 space-y-3">
                        {generatedRecipe.instructions.map((step, index) => (
                          <div key={step} className="flex items-start gap-4 rounded-2xl border border-[#ead9c7] bg-[#fffaf5] px-4 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3f725d] text-sm font-semibold text-white shadow-[0_10px_22px_rgba(63,114,93,0.18)]">
                              {index + 1}
                            </div>
                            <p className="pt-0.5 text-sm leading-7 text-[#4c4038]">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#ead9c7] pt-6">
                      <SectionTitle
                        eyebrow="Nutrition Facts"
                        title="Balanced for a fast dinner"
                        description="Useful for a quick scan before you cook."
                      />

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {generatedRecipe.nutrition.map((item) => (
                          <div key={item.label} className="rounded-2xl border border-[#ead9c7] bg-[#fffaf5] px-4 py-4 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b16a2c]">{item.label}</p>
                            <p className="mt-2 text-2xl font-semibold text-[#111111]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[680px] flex-1 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#ead9c7] bg-[#fffaf5] px-6 py-10 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4f0ea] text-[#c1c1c8] shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
                      <Sparkles className="h-10 w-10" />
                    </div>
                    <p className="mt-5 text-lg font-medium text-[#6e6258]">Your generated recipe will appear here</p>
                    <p className="mt-2 max-w-sm text-sm leading-7 text-[#8b8075]">
                      Hit Generate Recipe after adjusting the left card to see a PantryPal-styled preview.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}