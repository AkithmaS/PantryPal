import { Fragment, useEffect, useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const pageFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

const mockPlannedMeals = [
  { dayIndex: 0, mealType: 'Breakfast', recipe: 'Greek Yogurt Berry Parfait' },
  { dayIndex: 1, mealType: 'Breakfast', recipe: 'Italian Stuffed Bell Peppers' },
  { dayIndex: 2, mealType: 'Breakfast', recipe: 'Quick Tofu & Vegetable Scramble' },
  { dayIndex: 3, mealType: 'Lunch', recipe: 'Hearty Chickpea Salad Bowl' },
  { dayIndex: 4, mealType: 'Dinner', recipe: 'Quick Chicken Fajita Skillet' },
  { dayIndex: 5, mealType: 'Breakfast', recipe: 'Speedy Mexican Breakfast Wrap' },
  { dayIndex: 5, mealType: 'Lunch', recipe: 'Citrus Herb Grain Bowl' },
  { dayIndex: 6, mealType: 'Lunch', recipe: 'Hearty Chickpea Salad Bowl' },
  { dayIndex: 6, mealType: 'Dinner', recipe: 'Italian Stuffed Bell Peppers' },
];

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

function MealCard({ recipe }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl border border-[#ead9c7] bg-[#fff8f0] px-3 py-3 text-left shadow-[0_10px_24px_rgba(17,17,17,0.05)] transition-all duration-300"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.12),_transparent_34%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <p className="relative line-clamp-2 text-sm font-medium leading-5 text-[#111111]">{recipe}</p>
    </motion.div>
  );
}

function EmptyCellAction() {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [isReady, setIsReady] = useState(false);

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

    mockPlannedMeals.forEach((meal) => {
      map.set(`${meal.dayIndex}-${meal.mealType}`, meal.recipe);
    });

    return map;
  }, []);

  const mealsPlanned = mockPlannedMeals.length;
  const uniqueRecipes = new Set(mockPlannedMeals.map((meal) => meal.recipe)).size;
  const weekRange = formatDateRange(currentWeekStart);

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
              This Week
            </PlannerActionButton>
            <PlannerActionButton icon={ChevronRight} iconPosition="right" onClick={() => setWeekOffset((current) => current + 1)}>
              Next Week
            </PlannerActionButton>
          </div>
        </motion.div>

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
                      const recipe = mealMap.get(`${day.dayIndex}-${mealType}`);

                      return (
                        <div
                          key={`${mealType}-${day.dayIndex}`}
                          className="group border-b border-r border-[#ead9c7] bg-white/75 p-4 transition-colors duration-300 last:border-r-0 hover:bg-[#fffdf8]"
                        >
                          <div className="flex min-h-[118px] items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                            {recipe ? <MealCard recipe={recipe} /> : <EmptyCellAction />}
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
          <PlannerStatCard label="Total Recipes" value={uniqueRecipes} helper="Unique recipes used in this week" />
          <PlannerStatCard label="Current Week" value={new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(currentWeekStart)} helper={weekRange} />
        </motion.div>
      </motion.section>
    </div>
  );
}