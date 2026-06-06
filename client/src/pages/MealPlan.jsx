import { Fragment, useEffect, useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client.js';

const pageFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

function getStartOfWeek(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatDateRange(startDate) {
  const endDate = addDays(startDate, 6);
  const monthDayFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' });
  const sameMonth = startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    return `${monthDayFormatter.format(startDate)} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }

  return `${monthDayFormatter.format(startDate)} - ${monthDayFormatter.format(endDate)}, ${endDate.getFullYear()}`;
}

function formatShortDay(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatApiDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
} 

function normalizeMealType(mealType) {
  return String(mealType || '').toLowerCase();
}

function getWeekSelectionLabel(offset) {
  if (offset === 0) {
    return 'This Week';
  }

  if (offset === -1) {
    return 'Last Week';
  }

  if (offset === 1) {
    return 'Next Week';
  }

  const absOffset = Math.abs(offset);
  return offset > 0 ? `${absOffset} Weeks Ahead` : `${absOffset} Weeks Ago`;
}

function PlannerActionButton({ children, isActive, onClick, icon: Icon, iconPosition = 'left' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        isActive
          ? 'border-[#ff7a18] bg-[#ff7a18] text-[#111111] shadow-[0_16px_30px_rgba(255,122,24,0.24)]'
          : 'border-[#ead9c7] bg-white/90 text-[#111111] hover:border-[#ff7a18]/30 hover:bg-[#fff8f0]'
      }`}
    >
      {Icon && iconPosition === 'left' ? <Icon className="h-4 w-4" /> : null}
      {children}
      {Icon && iconPosition === 'right' ? <Icon className="h-4 w-4" /> : null}
    </motion.button>
  );
}

function MealCard({ meal, onRemove, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#ead9c7] bg-[#fff4ea] px-3 py-3 text-left shadow-[0_10px_24px_rgba(17,17,17,0.05)] transition-all duration-300 hover:border-[#ff7a18] hover:shadow-[0_16px_30px_rgba(255,122,24,0.15)]"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.14),_transparent_34%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#111111]">{meal.title}</p>
          <p className="mt-1 text-xs text-[#8b7d70] capitalize">{meal.meal_type}</p>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-full p-1 text-[#8b7d70] transition hover:bg-[#fff8f0] hover:text-[#d45d10]"
            aria-label="Remove meal"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

function EmptyCellAction({ onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-[#d8c8b7] bg-white/70 text-[#8a7b6c] transition-all duration-300 hover:border-[#ff7a18]/30 hover:bg-[#fff8f0] hover:text-[#d45d10]"
      aria-label="Add meal"
    >
      <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
    </motion.button>
  );
}

function PlannerStatCard({ label, value, helper }) {
  return (
    <motion.article
      variants={pageFade}
      whileHover={{ y: -4 }}
      className="rounded-[26px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)] transition-transform duration-300"
    >
      <p className="text-sm text-[#6e6258]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <span className="font-display text-3xl font-semibold tracking-tight text-[#111111]">{value}</span>
        <CalendarRange className="h-5 w-5 shrink-0 text-[#d45d10]" />
      </div>
      <p className="mt-3 text-sm text-[#8b7d70]">{helper}</p>
    </motion.article>
  );
}

export default function MealPlan() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weekMeals, setWeekMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftMeal, setDraftMeal] = useState({ meal_date: '', meal_type: 'breakfast', recipe_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const currentWeekStart = useMemo(() => {
    const anchorDate = new Date();
    return addDays(getStartOfWeek(anchorDate), weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, dayIndex) => {
        const date = addDays(currentWeekStart, dayIndex);
        return {
          dayIndex,
          date,
          shortLabel: formatShortDay(date),
          dateLabel: formatShortDate(date),
        };
      }),
    [currentWeekStart],
  );

  const mealMap = useMemo(() => {
    const map = new Map();

    weekMeals.forEach((meal) => {
      const mealDate = new Date(meal.meal_date);
      const dayIndex = Math.round((mealDate.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24));
      map.set(`${dayIndex}-${normalizeMealType(meal.meal_type)}`, meal);
    });

    return map;
  }, [currentWeekStart, weekMeals]);

  const mealsPlanned = Number(stats?.total_meals || weekMeals.length || 0);
  const upcomingMeals = Number(stats?.upcoming_meals || 0);
  const uniqueMealDays = Number(stats?.unique_meal_days || 0);
  const weekRange = formatDateRange(currentWeekStart);

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        setLoading(true);
        setError('');

        const [weeklyRes, statsRes, recipesRes] = await Promise.all([
          apiClient.get('/meal-plan/weekly', { params: { start_date: formatApiDate(currentWeekStart) } }),
          apiClient.get('/meal-plan/stats'),
          apiClient.get('/recipes', { params: { limit: 100, sort_by: 'created_at', sort_order: 'desc' } }),
        ]);

        setWeekMeals(weeklyRes.data?.data || []);
        setStats(statsRes.data?.data || null);
        setRecipes(recipesRes.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load meal plan');
      } finally {
        setLoading(false);
      }
    };

    loadMealPlan();
  }, [currentWeekStart]);

  const openMealForm = (date, mealType) => {
    setDraftMeal({
      meal_date: formatApiDate(date),
      meal_type: normalizeMealType(mealType),
      recipe_id: '',
    });
    setIsFormOpen(true);
  };

  const handleSaveMeal = async () => {
    if (!draftMeal.recipe_id || !draftMeal.meal_date || !draftMeal.meal_type) {
      return;
    }

    try {
      setSaving(true);
      await apiClient.post('/meal-plan', draftMeal);

      const weeklyRes = await apiClient.get('/meal-plan/weekly', { params: { start_date: formatApiDate(currentWeekStart) } });
      const statsRes = await apiClient.get('/meal-plan/stats');

      setWeekMeals(weeklyRes.data?.data || []);
      setStats(statsRes.data?.data || null);
      setIsFormOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save meal plan entry');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMeal = async (mealId) => {
    const shouldRemove = window.confirm('Do you want to remove this meal?');
    if (!shouldRemove) {
      return;
    }

    try {
      await apiClient.delete(`/meal-plan/${mealId}`);
      setWeekMeals((current) => current.filter((meal) => meal.id !== mealId));

      const statsRes = await apiClient.get('/meal-plan/stats');
      setStats(statsRes.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete meal plan entry');
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
        {/* Top section */}
        <motion.div variants={pageFade} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
              Meal Planner
            </h1>
            <p className="mt-2 text-base text-[#5d5148] sm:text-lg">Plan your weekly meals</p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <PlannerActionButton icon={ChevronLeft} onClick={() => setWeekOffset((current) => current - 1)}>
              Previous Week
            </PlannerActionButton>
            <PlannerActionButton isActive onClick={() => setWeekOffset(0)}>
              {getWeekSelectionLabel(weekOffset)}
            </PlannerActionButton>
            <PlannerActionButton icon={ChevronRight} iconPosition="right" onClick={() => setWeekOffset((current) => current + 1)}>
              Next Week
            </PlannerActionButton>
          </div>
        </motion.div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#f3e1cf] bg-[#fff4ea] px-4 py-3 text-sm font-medium text-[#6a4321]">
            {error}
          </div>
        ) : null}

        {isFormOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-sm">
            <motion.div
              variants={pageFade}
              initial="hidden"
              animate="visible"
              className="w-full max-w-xl rounded-[28px] border border-[#ead9c7] bg-white p-5 shadow-[0_24px_70px_rgba(17,17,17,0.18)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#111111]">Add meal to plan</h2>
                  <p className="mt-1 text-sm text-[#6e6258]">Connect a saved recipe to the selected day and meal slot.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full p-2 text-[#8b7d70] transition hover:bg-[#fff8f0] hover:text-[#111111]"
                  aria-label="Close meal form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Date</span>
                  <input
                    type="date"
                    value={draftMeal.meal_date}
                    onChange={(event) => setDraftMeal((current) => ({ ...current, meal_date: event.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#d7d7de] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#d45d10] focus:ring-4 focus:ring-[#ff7a18]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Meal Type</span>
                  <select
                    value={draftMeal.meal_type}
                    onChange={(event) => setDraftMeal((current) => ({ ...current, meal_type: event.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#d7d7de] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#d45d10] focus:ring-4 focus:ring-[#ff7a18]/10"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Recipe</span>
                  <select
                    value={draftMeal.recipe_id}
                    onChange={(event) => setDraftMeal((current) => ({ ...current, recipe_id: event.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[#d7d7de] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#d45d10] focus:ring-4 focus:ring-[#ff7a18]/10"
                  >
                    <option value="">Select a recipe</option>
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name || recipe.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveMeal}
                  disabled={saving}
                  className="rounded-full bg-[#ff7a18] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,122,24,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save to Meal Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full border border-[#ead9c7] bg-white px-5 py-3 text-sm font-semibold text-[#111111]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}

        {/* Week header card */}
        <motion.div
          variants={pageFade}
          className="mt-6 rounded-[32px] border border-[#ead9c7] bg-white/85 px-6 py-8 text-center shadow-[0_18px_45px_rgba(17,17,17,0.06)] backdrop-blur-sm"
        >
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#8b7d70]">Week of</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111111] sm:text-3xl">
            {weekRange}
          </h2>
        </motion.div>

        {/* Weekly meal planner grid */}
        <motion.div
          variants={pageFade}
          className="mt-6 overflow-hidden rounded-[32px] border border-[#ead9c7] bg-white/85 shadow-[0_18px_45px_rgba(17,17,17,0.06)]"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[170px_repeat(7,minmax(140px,1fr))]">
                <div className="sticky left-0 z-30 border-b border-r border-[#ead9c7] bg-white/95 px-5 py-4 text-sm font-semibold text-[#111111] backdrop-blur-sm">
                  Meal
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day.dayIndex}
                    className="sticky top-0 z-20 border-b border-r border-[#ead9c7] bg-white/95 px-4 py-4 text-center backdrop-blur-sm last:border-r-0"
                  >
                    <p className="font-semibold text-[#111111]">{day.shortLabel}</p>
                    <p className="mt-0.5 text-sm text-[#6e6258]">{day.dateLabel}</p>
                  </div>
                ))}

                {mealTypes.map((mealType) => (
                  <Fragment key={mealType}>
                    <div
                      className="sticky left-0 z-20 flex items-center border-b border-r border-[#ead9c7] bg-[#fffdf8] px-5 py-6 text-base font-medium text-[#111111] backdrop-blur-sm"
                    >
                      {mealType}
                    </div>

                    {weekDays.map((day) => {
                      const meal = mealMap.get(`${day.dayIndex}-${normalizeMealType(mealType)}`);

                      return (
                        <div
                          key={`${mealType}-${day.dayIndex}`}
                          className="group border-b border-r border-[#ead9c7] bg-white/75 p-4 transition-colors duration-300 last:border-r-0 hover:bg-[#fffdf8]"
                        >
                          <div className="flex min-h-[118px] items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                            {meal ? (
                              <MealCard
                                meal={meal}
                                onRemove={() => handleRemoveMeal(meal.id)}
                                onClick={() => navigate(`/recipes/${meal.recipe_id}`)}
                              />
                            ) : (
                              <EmptyCellAction onClick={() => openMealForm(day.date, mealType)} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Planner stats */}
        <motion.div variants={stagger} className="mt-6 grid gap-5 md:grid-cols-3">
          <PlannerStatCard label="Meals Planned" value={mealsPlanned} helper="Meals placed across the weekly grid" />
          <PlannerStatCard label="Upcoming Meals" value={upcomingMeals} helper="Meals scheduled from today onward" />
          <PlannerStatCard label="Active Days" value={uniqueMealDays} helper={weekRange} />
        </motion.div>
      </motion.section>
    </div>
  );
}