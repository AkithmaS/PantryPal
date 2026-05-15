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
import dashboardBackground from '../assets/dashboard-background.jpg';
import recentRecipeOne from '../assets/recentrecipe1.png';
import recentRecipeTwo from '../assets/meal2.jpg';
import discoverRecipesImage from '../assets/meal1.jpg';

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

const pantryStats = [
  { label: 'Total Stock', value: '142 Items', tone: 'bg-[#fff4ea] text-[#d45d10]' },
  { label: 'Expiring Soon (3d)', value: '8 Items', tone: 'bg-[#fff0e9] text-[#b55416]' },
  { label: 'Below Threshold', value: '5 Items', tone: 'bg-[#f8efe0] text-[#8d5c24]' },
];

const meals = [
  { time: '08:00 AM', title: 'Avocado Smash Toast', status: 'Done' },
  { time: '12:30 PM', title: 'Grilled Salmon Salad', status: 'Active' },
  { time: '07:00 PM', title: 'Beef Bourguignon', status: 'Todo' },
];

const recentRecipes = [
  { image: recentRecipeOne, title: 'Truffle Mushroom Risotto', meta: 'Signature Series · 45m' },
  { image: recentRecipeTwo, title: 'Macro Harvest Bowl', meta: 'Daily Prep · 20m' },
  { image: discoverRecipesImage, title: 'Ribeye Steak au Poivre', meta: 'Classic French · 1h 20m' },
];

const heroMetrics = [
  { value: '94%', label: 'Kitchen operational efficiency', icon: TimerReset },
  { value: '3', label: 'Meal preps scheduled for today', icon: Clock3 },
  { value: '12', label: 'Recipes ready to review', icon: ScanSearch },
];

const displayName = 'Akithma';

function StatBar({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-[#ead9c7] bg-white/80 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[#5d5148]">{label}</span>
        <span className="text-sm font-semibold text-[#111111]">{value}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#f2e5d7]">
        <div className={`h-2 rounded-full ${tone} w-3/4`} />
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

function RecentRecipeCard({ image, title, meta }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="overflow-hidden rounded-[28px] border border-[#ead9c7] bg-white/85 shadow-[0_18px_45px_rgba(17,17,17,0.06)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f7efe6]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.02)_0%,rgba(17,17,17,0.2)_100%)]" />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-[#111111]">{title}</h3>
        <p className="mt-1 text-sm text-[#6e6258]">{meta}</p>
      </div>
    </motion.article>
  );
}

export default function Dashboard() {
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
                Welcome, <span className="text-[#d45d10]">{displayName}</span>.
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

              
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
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
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
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
              {pantryStats.map((stat) => (
                <StatBar key={stat.label} {...stat} />
              ))}
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
              {meals.map((meal, index) => (
                <div key={meal.title} className="flex items-center gap-4 rounded-2xl border border-[#ead9c7] bg-[#fffaf5] px-4 py-3">
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
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mb-5 flex items-center justify-between gap-4"
        >
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#111111]">Recent Recipes</h2>
            <p className="mt-2 text-sm text-[#6e6258]">A few fresh ideas based on what you have on hand.</p>
          </div>
          <Link to="/find-recipe/search" className="inline-flex items-center gap-2 text-sm font-semibold text-[#d45d10] transition hover:text-[#9a4a12]">
            See all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {recentRecipes.map((recipe) => (
            <RecentRecipeCard key={recipe.title} {...recipe} />
          ))}
        </motion.div>
      </section>
    </div>
  );
}
