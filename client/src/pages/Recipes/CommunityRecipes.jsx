import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Search, SlidersHorizontal, Star } from 'lucide-react';
import communityImage from '../../assets/recentrecipe2.jpg';
import mealOneImage from '../../assets/meal1.jpg';
import mealTwoImage from '../../assets/meal2.jpg';
import recentRecipeOne from '../../assets/recentrecipe1.png';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const filters = ['All', 'Vegetarian', 'Vegan', 'Quick (<30 min)'];

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

const communityRecipes = [
  {
    image: mealOneImage,
    label: 'Vegetarian',
    time: '25 mins',
    title: 'Autumn Harvest Bowl',
    description: 'A nourishing blend of seasonal roasted vegetables, hearty grains, and a zesty tahini drizzle.',
    author: 'Elena Vance',
    rating: '4.9',
  },
  {
    image: communityImage,
    label: 'Vegan',
    time: '15 mins',
    title: 'Zesty Thai Green Papaya Salad',
    description: 'A crisp, spicy, and refreshing salad bursting with authentic Thai flavors and textures.',
    author: 'Marcus Thorne',
    rating: '4.7',
  },
  {
    image: mealTwoImage,
    label: 'Quick',
    time: '20 mins',
    title: 'Lemon Garlic Butter Salmon',
    description: 'Perfectly seared salmon with a bright citrus glaze and tender roasted asparagus.',
    author: 'Sarah Chen',
    rating: '5.0',
  },
  {
    image: recentRecipeOne,
    label: 'Vegetarian',
    time: '30 mins',
    title: 'Fresh Harvest Mezze Bowl',
    description: 'A colorful assortment of roasted sweet potatoes, grains, greens, and creamy avocado.',
    author: 'Daniel Rivera',
    rating: '4.8',
  },
];

function CommunityCard({ image, label, time, title, description, author, rating }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="overflow-hidden rounded-[24px] border border-[#ead9c7] bg-white shadow-[0_18px_45px_rgba(17,17,17,0.08)]"
    >
      <div className="relative aspect-[1.05] overflow-hidden bg-[#f7efe6] sm:aspect-[1.05]">
        <img src={image} alt={title} className="h-full w-full object-cover object-center transition duration-500 hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.05)_0%,rgba(17,17,17,0.18)_100%)]" />

        <div className="absolute right-3 top-3 rounded-full bg-white/92 p-2 text-[#b16a2c] shadow-[0_10px_24px_rgba(17,17,17,0.12)] backdrop-blur">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ead9c7] bg-white text-[#b16a2c]">
            <span className="h-2.5 w-2.5 rounded-sm border border-current" />
          </span>
        </div>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-[#3f725d]/90 px-3 py-1.5 text-white shadow-[0_10px_22px_rgba(17,17,17,0.12)]">
            {label}
          </span>
          <span className="rounded-full bg-[#fff4ea]/92 px-3 py-1.5 text-[#8d5c24] shadow-[0_10px_22px_rgba(17,17,17,0.08)]">
            {time}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-[1.35rem] font-semibold leading-tight text-[#111111]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#6e6258]">{description}</p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[#ead9c7] bg-[#fff8f0] text-xs font-semibold text-[#3f725d]">
              {author.charAt(0)}
            </div>
            <span className="text-sm text-[#4c4038]">{author}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#b16a2c]">
            <Star className="h-4 w-4 fill-current text-[#b16a2c]" />
            {rating}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function SearchRecipes() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const normalizedSearch = normalizeText(searchText);

  const visibleRecipes = useMemo(() => {
    return communityRecipes.filter((recipe) => {
      const searchableText = normalizeText(
        `${recipe.title} ${recipe.description} ${recipe.author} ${recipe.label} ${recipe.time}`,
      );
      const matchesSearch = normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);

      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Quick (<30 min)' ? Number.parseInt(recipe.time, 10) < 30 : recipe.label === activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, normalizedSearch]);

  return (
    <div className="min-h-screen bg-[#fff8f0] px-4 py-4 text-[#111111] sm:px-6 lg:px-8 lg:py-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] border border-[#ead9c7] bg-white/85 p-4 shadow-[0_28px_70px_rgba(17,17,17,0.08)] backdrop-blur sm:p-6 lg:p-8"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.10),_transparent_30%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(63,114,93,0.10),_transparent_28%)]" />
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[520px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8f6a4b]" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search community recipes..."
              className="h-14 w-full rounded-2xl border border-[#d7d7de] bg-white pl-11 pr-14 text-sm text-[#111111] outline-none transition placeholder:text-[#7f7267] focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#3f725d] transition hover:bg-[#fff4ea] hover:text-[#2f5d4c]"
              aria-label="Search filters"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="relative z-10 mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleRecipes.map((recipe) => (
            <CommunityCard key={recipe.title} {...recipe} />
          ))}
        </motion.div>

        {visibleRecipes.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="relative z-10 mt-8 rounded-[28px] border border-[#ead9c7] bg-white/85 p-6 text-center shadow-[0_18px_45px_rgba(17,17,17,0.06)]"
          >
            <p className="font-display text-2xl font-semibold text-[#111111]">No recipes found</p>
            <p className="mt-2 text-sm text-[#6e6258]">Try a different search term or switch to another filter.</p>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}