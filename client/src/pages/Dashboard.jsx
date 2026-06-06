import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarRange,
  ChevronRight,
  Clock3,
  PackagePlus,
  ScanSearch,
  ShoppingCart,
  Sparkles,
  TimerReset,
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import dashboardBackground from '../assets/screen.png';
import cardIcon from '../assets/icon.png';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const quickActions = [
  {
    title: 'Add Pantry Item',
    description: 'Keep stock updated and spot what is running low.',
    icon: PackagePlus,
    to: '/pantry',
    cta: 'Open Inventory',
  },
  {
    title: 'Generate Recipe',
    description: 'Turn what you have into a meal idea in seconds.',
    icon: Sparkles,
    to: '/find-recipe/ai',
    cta: 'Launch AI Assistant',
  },
  {
    title: 'View Meal Plan',
    description: 'Check today and the next few meals at a glance.',
    icon: CalendarRange,
    to: '/meal-plan',
    cta: 'Go to Schedule',
  },
  {
    title: 'Shopping List',
    description: 'Collect the missing items before your next store run.',
    icon: ShoppingCart,
    to: '/shopping',
    cta: 'Open Checklist',
  },
];

const emptyPantryStats = {
  total_items: 0,
  low_stock_items: 0,
  expired_items: 0,
  expiring_soon_items: 0,
};

const emptyRecipeStats = {
  total_recipes: 0,
  avg_prep_time: 0,
  avg_cook_time: 0,
};

const emptyMealPlanStats = {
  total_meals: 0,
  upcoming_meals: 0,
  unique_meal_days: 0,
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMinutes(value) {
  const minutes = toNumber(value);

  if (minutes <= 0) {
    return '—';
  }

  return `${Math.round(minutes)} mins`;
}

function formatMealType(mealType) {
  if (!mealType) {
    return 'Meal';
  }

  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

function formatMealDate(mealDate) {
  if (!mealDate) {
    return 'Scheduled';
  }

  const date = new Date(mealDate);

  if (Number.isNaN(date.getTime())) {
    return 'Scheduled';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  const dayDiff = Math.round((compareDate - today) / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) {
    return 'Today';
  }

  if (dayDiff === 1) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildPantryStatCards(stats) {
  const pantry = stats || emptyPantryStats;
  const totalItems = toNumber(pantry.total_items);
  const lowStock = toNumber(pantry.low_stock_items);
  const expiringSoon = toNumber(pantry.expiring_soon_items);
  const expired = toNumber(pantry.expired_items);

  const sharedBase = totalItems > 0 ? totalItems : 1;

  return [
    {
      label: 'Total Stock',
      value: `${totalItems} items`,
      tone: 'bg-[#fff4ea] text-[#d45d10]',
      progress: totalItems > 0 ? 100 : 10,
    },
    {
      label: 'Expiring Soon (7d)',
      value: `${expiringSoon} items`,
      tone: 'bg-[#fff0e9] text-[#b55416]',
      progress: Math.max(10, Math.min(100, Math.round((expiringSoon / sharedBase) * 100))),
    },
    {
      label: 'Below Threshold',
      value: `${lowStock} items`,
      tone: 'bg-[#f8efe0] text-[#8d5c24]',
      progress: Math.max(10, Math.min(100, Math.round((lowStock / sharedBase) * 100))),
    },
  ];
}

function buildHeroMetrics(recipeStats, pantryStats, mealPlanStats) {
  const recipes = recipeStats || emptyRecipeStats;
  const pantry = pantryStats || emptyPantryStats;
  const meals = mealPlanStats || emptyMealPlanStats;

  return [
    { value: `${toNumber(recipes.total_recipes)}`, label: 'Recipes saved', icon: ScanSearch },
    { value: formatMinutes(recipes.avg_prep_time), label: 'Average prep time', icon: TimerReset },
    { value: `${toNumber(meals.upcoming_meals)}`, label: 'Meals coming up', icon: Clock3 },
    { value: `${toNumber(pantry.expiring_soon_items)}`, label: 'Items expiring soon', icon: CalendarRange },
  ];
}

function buildMeals(mealPlanItems) {
  return (mealPlanItems || []).map((meal) => ({
    time: `${formatMealType(meal.meal_type)} · ${formatMealDate(meal.meal_date)}`,
    title: meal.title || 'Untitled meal',
    status: formatMealDate(meal.meal_date),
  }));
}

function buildRecentRecipes(recipes) {
  return (recipes || []).map((recipe) => ({
    id: recipe.id,
    image: recipe.image_url || cardIcon,
    title: recipe.name || recipe.title || 'Untitled recipe',
    meta: [recipe.cuisine_type, recipe.cooking_time ? `${recipe.cooking_time}m` : null].filter(Boolean).join(' · ') || 'Saved recipe',
  }));
}


function StatBar({ label, value, tone, progress = 75 }) {
  return (
    <div className="rounded-2xl border border-[#ead9c7] bg-white/80 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[#5d5148]">{label}</span>
        <span className="text-sm font-semibold text-[#111111]">{value}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#f2e5d7]">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function HeroMetricCard({ value, label, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-[#ead9c7] bg-white/80 px-4 py-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-[#111111]">{value}</p>
          <p className="text-sm text-[#5d5148]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, to, cta }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="group rounded-[28px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10] transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-[#f8efe0] px-3 py-1 text-xs font-semibold text-[#8d5c24]">
          Quick action
        </span>
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-[#111111]">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-[#5d5148]">{description}</p>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#ead9c7] bg-[#fff8f0] px-4 py-2 text-sm font-medium text-[#111111] transition hover:border-[#ff7a18]/35 hover:text-[#d45d10]"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}

function RecentRecipeCard({ id, image, title, meta }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="overflow-hidden rounded-[28px] border border-[#ead9c7] bg-white/85 shadow-[0_18px_45px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff7a18]/30"
    >
      <Link to={`/recipes/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f7efe6]">
          <img
            src={image || cardIcon}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.02)_0%,rgba(17,17,17,0.2)_100%)]" />
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-[#111111] transition-colors group-hover:text-[#ff7a18]">{title}</h3>
          <p className="mt-1 text-sm text-[#6e6258]">{meta}</p>
        </div>
      </Link>
    </motion.article>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email;
  const [pantryStats, setPantryStats] = useState(emptyPantryStats);
  const [recipeStats, setRecipeStats] = useState(emptyRecipeStats);
  const [mealPlanStats, setMealPlanStats] = useState(emptyMealPlanStats);
  const [mealPlanItems, setMealPlanItems] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const token = sessionStorage.getItem('pantrypal_token');

      if (!token) {
        if (isMounted) {
          setLoading(false);
          setError('Sign in to load your live dashboard data.');
        }

        return;
      }

      if (isMounted) {
        setLoading(true);
        setError('');
      }

      const today = new Date();
      const startDate = today.toISOString().slice(0, 10);

      try {
        const timestamp = Date.now();
        const [pantryResult, recipeResult, mealStatsResult, weeklyMealsResult, recentRecipesResult] = await Promise.allSettled([
          apiClient.get('/pantry/stats', { params: { _t: timestamp } }),
          apiClient.get('/recipes/stats', { params: { _t: timestamp } }),
          apiClient.get('/meal-plan/stats', { params: { _t: timestamp } }),
          apiClient.get('/meal-plan/weekly', { params: { start_date: startDate, _t: timestamp } }),
          apiClient.get('/recipes/recent', { params: { limit: 3, _t: timestamp } }),
        ]);

        if (!isMounted) {
          return;
        }

        if (pantryResult.status === 'fulfilled') {
          setPantryStats(pantryResult.value.data?.data || emptyPantryStats);
        }

        if (recipeResult.status === 'fulfilled') {
          setRecipeStats(recipeResult.value.data?.data || emptyRecipeStats);
        }

        if (mealStatsResult.status === 'fulfilled') {
          setMealPlanStats(mealStatsResult.value.data?.data || emptyMealPlanStats);
        }

        if (weeklyMealsResult.status === 'fulfilled') {
          const weeklyMeals = weeklyMealsResult.value.data?.data || [];
          const todayMeals = weeklyMeals.filter((meal) => {
            const mealDate = new Date(meal.meal_date);
            return !Number.isNaN(mealDate.getTime()) && mealDate.toISOString().slice(0, 10) === startDate;
          });

          setMealPlanItems(todayMeals.length > 0 ? todayMeals : weeklyMeals.slice(0, 3));
        }

        if (recentRecipesResult.status === 'fulfilled') {
          const recipeData = recentRecipesResult.value.data?.data;
          console.log('Dashboard: Recent recipes fulfilled. Data:', recipeData);
          setRecentRecipes(Array.isArray(recipeData) ? recipeData : []);
        } else if (recentRecipesResult.status === 'rejected') {
          console.error('Dashboard: Recent recipes fetch failed! Context:', {
            reason: recentRecipesResult.reason,
            url: '/recipes/recent'
          });
        }

        const failedRequest = [pantryResult, recipeResult, mealStatsResult, weeklyMealsResult, recentRecipesResult].find((result) => result.status === 'rejected');
        if (failedRequest) {
          console.warn('Dashboard: Some requests failed. Detailed results:', {
            pantry: pantryResult.status,
            recipes: recipeResult.status,
            mealStats: mealStatsResult.status,
            weeklyMeals: weeklyMealsResult.status,
            recentRecipes: recentRecipesResult.status
          });
          setError('Some dashboard data could not be loaded.');
        }
      } catch (error) {
        console.error('Dashboard load error:', error);
        if (isMounted) {
          setError('An error occurred while loading dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const pantryCards = buildPantryStatCards(pantryStats);
  const heroMetrics = buildHeroMetrics(recipeStats, pantryStats, mealPlanStats);
  const meals = buildMeals(mealPlanItems);
  const recentRecipeCards = buildRecentRecipes(recentRecipes);

  return (
    <div className="bg-[#fffaf4]">
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative isolate overflow-hidden rounded-[34px] border border-[#ead9c7] bg-[#fff8f0] shadow-[0_28px_70px_rgba(17,17,17,0.08)]"
        >
          <div className="absolute inset-0">
            <img
              src={dashboardBackground}
              alt="Fresh ingredients arranged on a kitchen counter"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,240,0.95)_0%,rgba(255,248,240,0.82)_35%,rgba(255,248,240,0.22)_68%,rgba(255,248,240,0.08)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.12),_transparent_28%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[520px] w-full items-center px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="max-w-3xl text-[#111111]">
              

              <motion.h1
                variants={fadeUp}
                className="mt-6 font-display text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl lg:text-6xl"
              >
                {displayName ? (
                  <>
                    Welcome, <span className="text-[#d45d10]">{displayName}</span>.
                  </>
                ) : (
                  'Welcome back.'
                )}
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-8 text-[#594f46] sm:text-xl">
                Welcome back! Here’s a quick overview of your pantry and meal schedule.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/meal-plan"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
                >
                  Resume Cooking
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/pantry"
                  className="inline-flex items-center gap-2 rounded-full border border-[#ead9c7] bg-white/85 px-6 py-3 text-sm font-semibold text-[#111111] transition-transform hover:-translate-y-0.5"
                >
                  View Pantry
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {heroMetrics.map((metric) => (
                  <HeroMetricCard key={metric.label} {...metric} />
                ))}
              </motion.div>

              
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {quickActions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <motion.div variants={fadeUp} className="rounded-[30px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
                  <PackagePlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#111111]">Pantry Summary</h2>
                  <p className="text-sm text-[#6e6258]">A quick look at what needs attention first.</p>
                </div>
              </div>
              <div className="hidden h-2 w-40 rounded-full bg-[#f2e5d7] sm:block">
                <div className="h-2 w-[78%] rounded-full bg-[#ff7a18]" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-[#ead9c7] bg-white/70 px-4 py-5 text-sm text-[#6e6258]">
                  Loading pantry stats...
                </div>
              ) : (
                pantryCards.map((stat) => (
                  <StatBar key={stat.label} {...stat} />
                ))
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-[30px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#111111]">Today&apos;s Meals</h2>
                  <p className="text-sm text-[#6e6258]">Your scheduled meals for today.</p>
                </div>
              </div>
              <Link to="/meal-plan" className="text-sm font-semibold text-[#d45d10] transition hover:text-[#9a4a12]">
                See all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] px-4 py-5 text-sm text-[#6e6258]">
                  Loading meal plan...
                </div>
              ) : meals.length > 0 ? (
                meals.map((meal, index) => (
                  <div key={`${meal.title}-${meal.time}`} className="flex items-center gap-4 rounded-2xl border border-[#ead9c7] bg-[#fffaf5] px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1e3] text-[#d45d10]">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b16a2c]">{meal.time}</p>
                      <p className="mt-1 font-semibold text-[#111111]">{meal.title}</p>
                    </div>
                    <span className="rounded-full bg-[#f2e5d7] px-3 py-1 text-xs font-semibold text-[#8d5c24]">
                      {meal.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] px-4 py-5 text-sm text-[#6e6258]">
                  No meals scheduled yet.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-5 flex items-center justify-between gap-4"
        >
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#111111]">Recent Recipes</h2>
            <p className="mt-2 text-sm text-[#6e6258]">A few fresh ideas based on what you have on hand.</p>
          </div>
          <Link to="/recipes/all" className="inline-flex items-center gap-2 text-sm font-semibold text-[#d45d10] transition hover:text-[#9a4a12]">
            See all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {loading ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-[28px] border border-dashed border-[#ead9c7] bg-white/80 p-8 text-sm text-[#6e6258]">
              Loading recent recipes...
            </div>
          ) : recentRecipeCards.length > 0 ? (
            recentRecipeCards.map((recipe) => <RecentRecipeCard key={recipe.id || recipe.title} {...recipe} />)
          ) : (
            <div className="md:col-span-2 xl:col-span-3 rounded-[28px] border border-dashed border-[#ead9c7] bg-white/80 p-8 text-sm text-[#6e6258]">
              No recent recipes yet.
            </div>
          )}
        </motion.div>
      </section>

      {error ? (
        <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-[#ead9c7] bg-white/90 px-5 py-4 text-sm text-[#6e6258] shadow-[0_12px_30px_rgba(17,17,17,0.05)]">
            {error}
          </div>
        </section>
      ) : null}
    </div>
  );
}
