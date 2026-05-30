import { useEffect, useMemo, useState } from 'react';
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
import apiClient from '../../api/client.js';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const dietOptions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const cuisineOptions = ['Italian', 'Mexican', 'Sri Lankan', 'Indian', 'Chineese', 'Thai', 'French', 'Japanese','Korean', 'Middle Eastern'];
const cookingTimeOptions = [
  { value: 'any', label: 'Any' },
  { value: 'short', label: 'Under 30 mins' },
  { value: 'medium', label: '30-60 mins' },
  { value: 'long', label: 'Over 60 mins' },
];

const defaultIngredients = [];


function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d45d10]">{eyebrow}</p>
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
  const [dietaryRestriction, setDietaryRestriction] = useState('None');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('any');
  const [servings, setServings] = useState(4);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [generatedSource, setGeneratedSource] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (!saveSuccess) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setSaveSuccess('');
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [saveSuccess]);

  const canAddIngredient = useMemo(() => ingredientText.trim().length > 0, [ingredientText]);

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

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGenerateError('');

      const dietaryPreferences = dietaryRestriction === 'None' ? [] : [dietaryRestriction];
      const response = await apiClient.post('/recipes/generate', {
        ingredients,
        usePantryIngredients,
        dietaryPreferences,
        cuisineType: cuisine,
        servingSize: servings,
        cookingTime,
      });

      const recipe = response?.data?.data?.recipe;
      if (!recipe) {
        throw new Error('No recipe returned');
      }

      const formattedIngredients = (recipe.ingredients || []).map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        const quantity = item.quantity ? String(item.quantity) : '';
        const unit = item.unit ? String(item.unit) : '';
        return [quantity, unit, item.name].filter(Boolean).join(' ').trim();
      });

      const nutritionInfo = recipe.nutritionalInfo || {};
      const nutrition = [
        nutritionInfo.protein ? { label: 'Protein', value: `${nutritionInfo.protein}g` } : null,
        nutritionInfo.carbohydrates ? { label: 'Carbs', value: `${nutritionInfo.carbohydrates}g` } : null,
        nutritionInfo.fat ? { label: 'Fat', value: `${nutritionInfo.fat}g` } : null,
        nutritionInfo.fiber ? { label: 'Fiber', value: `${nutritionInfo.fiber}g` } : null,
      ].filter(Boolean);

      const meta = [
        recipe.cookTime ? `${recipe.cookTime} mins` : 'Cook time varies',
        `${recipe.servingSize || servings} Servings`,
        nutritionInfo.calories ? `${nutritionInfo.calories} kcal` : 'Calories N/A',
      ];

      const badges = [
        recipe.cuisineType ? { label: recipe.cuisineType, tone: 'cuisine' } : null,
        recipe.difficulty ? { label: recipe.difficulty, tone: 'difficulty' } : null,
        ...(recipe.dietaryInfo || []).map((item) => ({ label: item, tone: 'dietary' })),
      ].filter(Boolean);

      setGeneratedRecipe({
        title: recipe.name || 'Generated Recipe',
        meta,
        badges,
        ingredients: formattedIngredients,
        instructions: recipe.instructions || [],
        nutrition,
        summary: recipe.description || 'A recipe generated from your pantry preferences.',
        cookingTips: recipe.cookingTips || [],
      });
      setGeneratedSource(recipe);
      setSaveError('');
      setSaveSuccess('');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to generate recipe. Please try again.';
      setGenerateError(message);
      setGeneratedRecipe(null);
      setGeneratedSource(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedSource) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError('');
      setSaveSuccess('');

      const nutrition = generatedSource.nutritionalInfo || {};

      // Normalize ingredients: backend expects objects with a `name` (and optional quantity/unit)
      const normalizedIngredients = (generatedSource.ingredients || []).map((ing) => {
        if (!ing) return null;
        if (typeof ing === 'string') return { name: ing };
        // If it's an object, ensure it has a name property
        return { name: ing.name || String(ing), quantity: ing.quantity, unit: ing.unit };
      }).filter(Boolean);

      // Ensure instructions is an array (backend requires instructions)
      const instructionsPayload = Array.isArray(generatedSource.instructions)
        ? generatedSource.instructions
        : generatedSource.instructions
        ? [generatedSource.instructions]
        : [];

      const payload = {
        name: generatedSource.name,
        description: generatedSource.description,
        cuisine_type: generatedSource.cuisineType,
        difficulty: generatedSource.difficulty,
        preparation_time: Number(generatedSource.prepTime) || null,
        cooking_time: Number(generatedSource.cookTime) || null,
        servings: generatedSource.servingSize || servings,
        dietary_tags: generatedSource.dietaryInfo || [],
        instructions: instructionsPayload,
        ingredients: normalizedIngredients,
        nutrition: {
          calories: nutrition.calories,
          carbohydrates: nutrition.carbohydrates,
          protein: nutrition.protein,
          fiber: nutrition.fiber,
          fat: nutrition.fat,
        },
      };

      await apiClient.post('/recipes', payload);
      setSaveSuccess('Recipe saved successfully.');
    } catch (error) {
      console.error('Save recipe error:', error);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      const serverData = error?.response?.data;
      const message = serverMsg || (serverData ? JSON.stringify(serverData) : null) || 'Unable to save recipe. Please try again.';
      if (status === 401) {
        setSaveError('You must be logged in to save recipes. Please sign in.');
      } else {
        setSaveError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f0]">
      <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.08),_transparent_32%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(63,114,93,0.08),_transparent_30%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl">
          {saveSuccess ? (
            <div className="mb-4 rounded-2xl border border-[#f3e1cf] bg-[#fff4ea] px-4 py-3 text-sm font-medium text-[#6a4321] shadow-[0_8px_18px_rgba(17,17,17,0.03)]" aria-live="polite">
              Recipe saved to your collection!
            </div>
          ) : null}
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
                        className="h-5 w-5 rounded border-[#ff7a18] text-[#a6a6ad] focus:ring-[#ff7a18]"
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
                            <option value="" disabled>
                              Select cuisine
                            </option>
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
                                  ? 'border border-[#ff7a18] bg-[#fff4ea] text-[#6a4321] shadow-[0_10px_20px_rgba(255,122,24,0.16)]'
                                  : 'border border-transparent bg-[#fff4ea] text-[#6a4321] hover:border-[#ff7a18]/40 hover:bg-[#ffe9d4]',
                              ].join(' ')}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="cooking-time-select" className="mb-2 block text-sm text-[#4c4038]">
                          Cooking Time
                        </label>
                        <div className="relative">
                          <select
                            id="cooking-time-select"
                            value={cookingTime}
                            onChange={(event) => setCookingTime(event.target.value)}
                            className="h-14 w-full appearance-none rounded-2xl border border-[#d7d7de] bg-white px-4 pr-11 text-base text-[#111111] outline-none transition focus:border-[#d45d10] focus:ring-4 focus:ring-[#ff7a18]/10"
                          >
                            {cookingTimeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7c85]" />
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-6 py-4 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Recipe'}
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>

                  {generateError ? (
                    <p className="text-xs font-medium text-[#c64545]">{generateError}</p>
                  ) : null}

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
                    <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-[#111111]">
                      {generatedRecipe.title}
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5d5148]">
                      {generatedRecipe.summary}
                    </p>

                    {generatedRecipe.badges.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
                        {generatedRecipe.badges.map((badge) => (
                          <span
                            key={`${badge.tone}-${badge.label}`}
                            className={[
                              'rounded-full px-3 py-1.5',
                              badge.tone === 'cuisine'
                                ? 'bg-[#e6f7f1] text-[#1d6b52]'
                                : badge.tone === 'difficulty'
                                  ? 'bg-[#e7efff] text-[#2f5bb8]'
                                  : 'bg-[#efe7ff] text-[#6a3ec5]',
                            ].join(' ')}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#6e6258]">
                      <DetailChip icon={Clock3} label={generatedRecipe.meta[0]} />
                      <DetailChip icon={Users} label={generatedRecipe.meta[1]} />
                      <DetailChip icon={Flame} label={generatedRecipe.meta[2]} />
                    </div>

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
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[#ff7a18] bg-[#fff4ea] text-[#d45d10]">
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
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff7a18] text-sm font-semibold text-[#111111] shadow-[0_10px_22px_rgba(255,122,24,0.18)]">
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

                    {generatedRecipe.cookingTips.length > 0 ? (
                      <div className="mt-6 border-t border-[#ead9c7] pt-6">
                        <SectionTitle
                          eyebrow="Cooking Tips"
                          title="Make it even better"
                          description="Small adjustments that level up the result."
                        />
                        <div className="mt-4 rounded-2xl border border-[#f3e1cf] bg-[#fff4ea] px-5 py-4 text-[#6a4321]">
                          <ul className="space-y-2 text-sm leading-7">
                            {generatedRecipe.cookingTips.map((tip) => (
                              <li key={tip} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d45d10]" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-6 border-t border-[#ead9c7] pt-6">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleSaveRecipe}
                          disabled={isSaving || !generatedSource}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isSaving ? 'Saving...' : 'Save Recipe'}
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ead9c7] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Generate New Recipe
                        </button>
                      </div>
                      {saveError ? <p className="mt-3 text-xs font-medium text-[#c64545]">{saveError}</p> : null}
                      {saveSuccess ? <p className="mt-3 text-xs font-medium text-[#8d5c24]">{saveSuccess}</p> : null}
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