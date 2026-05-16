import { motion } from 'framer-motion';
import { ArrowRight, BookOpenText, NotebookPen, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import aiGeneratorImage from '../../assets/aigenerator.png';
import scratchImage from '../../assets/scrach.png';
import communityImage from '../../assets/community.jpg';

const drift = {
  animate: (custom) => ({
    y: [0, -10, 0],
    x: [0, custom, 0],
    transition: {
      duration: 7 + Math.abs(custom) * 0.25,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};

const shine = {
  animate: {
    x: ['-160%', '160%'],
    opacity: [0, 0.55, 0],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      repeatDelay: 3.5,
      ease: 'easeInOut',
    },
  },
};

function BlobRecipesButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative isolate inline-flex"
    >
      <motion.span
        aria-hidden="true"
        variants={drift}
        animate="animate"
        custom={8}
        className="absolute -left-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#ff7a18]/25 blur-2xl"
      />
      <motion.span
        aria-hidden="true"
        variants={drift}
        animate="animate"
        custom={-6}
        className="absolute -right-5 top-0 h-20 w-20 rounded-full bg-[#d45d10]/25 blur-2xl"
      />

      <motion.span
        aria-hidden="true"
        variants={drift}
        animate="animate"
        custom={4}
        className="absolute inset-x-6 -top-4 h-10 rounded-full bg-[#fff4ea]/70 blur-2xl"
      />

      <Link
        to="/recipes"
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/40 bg-[linear-gradient(135deg,rgba(255,122,24,0.95)_0%,rgba(255,161,84,0.9)_48%,rgba(255,122,24,0.92)_100%)] px-5 py-3.5 text-sm font-semibold text-[#111111] shadow-[0_20px_40px_rgba(255,122,24,0.28),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl transition duration-300 hover:scale-[1.03] hover:shadow-[0_24px_50px_rgba(255,122,24,0.34),0_0_0_1px_rgba(255,122,24,0.18)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ff7a18]/30 dark:border-white/10 dark:text-[#111111]"
        aria-label="All My Recipes"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.46),_transparent_36%)] opacity-90" />
        <motion.span
          aria-hidden="true"
          variants={shine}
          animate="animate"
          className="absolute left-0 top-0 h-full w-24 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] blur-sm"
        />

        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/55 text-[#d45d10] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover:scale-105">
          <BookOpenText className="h-4.5 w-4.5" />
        </span>

        <span className="relative tracking-[0.02em]">All My Recipes</span>

        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/45 text-[#111111] transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </motion.div>
  );
}

function RecipeCard({ image, icon: Icon, title, description, buttonLabel, to, tone = 'orange' }) {
  const accentClass = 'from-[#ff8f3d]/70 via-[#ffc99b]/42 to-[#b55b1f]/62';
  const buttonClass = 'bg-[#ffb36b] text-[#111111] shadow-[0_16px_34px_rgba(255,140,61,0.22)]';

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 26 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
      }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative overflow-hidden rounded-[30px] border border-[#ead9c7] bg-white shadow-[0_18px_45px_rgba(17,17,17,0.08)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,122,24,0.08),_transparent_36%)] opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.04)_0%,rgba(17,17,17,0.24)_100%)]" />

      <div className="relative aspect-[16/7] overflow-hidden sm:aspect-[16/6.2]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
        />

        <div className={`absolute inset-0 bg-gradient-to-r ${accentClass} opacity-26`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_30%)]" />

        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/16 text-white shadow-[0_12px_24px_rgba(17,17,17,0.16)] backdrop-blur-md">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            className="max-w-2xl"
          >

            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-[2.15rem]">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
              {description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${buttonClass}`}
                >
                  {buttonLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

export default function MyRecipes() {
  return (
    <div className="min-h-screen bg-[#fff8f0] px-4 py-4 text-[#111111] sm:px-6 lg:px-8 lg:py-6">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] border border-[#ead9c7] bg-white/85 p-4 shadow-[0_28px_70px_rgba(17,17,17,0.08)] backdrop-blur sm:p-6 lg:p-8">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.12),_transparent_30%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,93,16,0.08),_transparent_28%)]" />
          <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#ff7a18]/10 blur-3xl" />
          <div className="absolute right-[-3rem] top-[-2rem] h-72 w-72 rounded-full bg-[#d45d10]/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-start justify-end">
          <BlobRecipesButton />
        </div>

        <div className="relative z-10 mt-6 grid gap-5">
          <RecipeCard
            image={aiGeneratorImage}
            icon={Sparkles}
            title="AI Recipe Generator"
            description="Transform your pantry ingredients into a masterpiece. Our AI creates unique recipes based on what you have on hand."
            buttonLabel="Get Started"
            to="/find-recipe/ai"
          />

          <RecipeCard
            image={scratchImage}
            icon={NotebookPen}
            title="Create from Scratch"
            description="Preserve your family secrets or document your latest kitchen experiments with our intuitive recipe builder."
            buttonLabel="Start Writing"
            to="/find-recipe/manual"
          />

          <RecipeCard
            image={communityImage}
            icon={Users}
            title="Community Kitchen"
            description="Connect with fellow home cooks, browse global inspirations, and share your culinary successes with the world."
            buttonLabel="Explore"
            to="/find-recipe/search"
          />
        </div>
      </div>
    </div>
  );
}