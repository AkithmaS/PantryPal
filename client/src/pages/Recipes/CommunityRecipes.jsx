import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import cardIcon from '../../assets/icon.png';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function getCommunityRecipes() {
  try {
    const stored = localStorage.getItem('communityRecipes');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function formatRecipeTime(recipe) {
  const time = recipe.cooking_time ?? recipe.cook_time;
  return time ? `${time} mins` : '—';
}

function CommunityCard({ recipe, onClick }) {
  const imageUrl = recipe.image_url || recipe.image;
  const image =
    typeof imageUrl === 'string' &&
    imageUrl.startsWith('data:image/') &&
    imageUrl.length > 800000
      ? null
      : imageUrl || cardIcon;

  const label = recipe.cuisine_type || 'Community';
  const time = formatRecipeTime(recipe);

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="cursor-pointer overflow-hidden rounded-[24px] border border-[#ead9c7] bg-white shadow-[0_18px_45px_rgba(17,17,17,0.08)] transition-all hover:shadow-[0_24px_60px_rgba(17,17,17,0.12)]"
      onClick={() => onClick(recipe)}
    >
      <div className="relative aspect-[1.05] overflow-hidden bg-[#f7efe6]">
        {image ? (
          <img
            src={image}
            alt={recipe.name || recipe.title || 'Recipe'}
            className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f0e7dd]">
            <div className="text-[#d45d10] opacity-50">
              <Users className="h-16 w-16" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.05)_0%,rgba(17,17,17,0.18)_100%)]" />

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
        <h3 className="font-display text-[1.35rem] font-semibold leading-tight text-[#111111]">
          {recipe.name || recipe.title || 'Untitled'}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[#6e6258] line-clamp-2">
          {recipe.description || 'No description yet'}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#4c4038]">
            <Users className="h-4 w-4 text-[#6a3ec5]" />
            <span>Community</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#b16a2c]">
            <Star className="h-4 w-4 fill-current text-[#b16a2c]" />
            {time}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function CommunityRecipes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchText, setSearchText] = useState('');
  const normalizedSearch = normalizeText(searchText);

  // All community recipes from localStorage
  const [allCommunityRecipes, setAllCommunityRecipes] = useState([]);

  useEffect(() => {
    setAllCommunityRecipes(getCommunityRecipes());
  }, []);

  // Filter out recipes that belong to the current logged-in user
  const otherUsersRecipes = useMemo(() => {
    return allCommunityRecipes.filter(
      (recipe) => !user?.id || String(recipe.ownerId) !== String(user.id)
    );
  }, [allCommunityRecipes, user?.id]);

  const visibleRecipes = useMemo(() => {
    return otherUsersRecipes.filter((recipe) => {
      const searchableText = normalizeText(
        `${recipe.name || recipe.title || ''} ${recipe.description || ''} ${recipe.cuisine_type || ''} ${formatRecipeTime(recipe)}`
      );
      return (
        normalizedSearch.length === 0 || searchableText.includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, otherUsersRecipes]);

  return (
    <div className="min-h-screen bg-[#fff8f0] px-4 py-4 text-[#111111] sm:px-6 lg:px-8 lg:py-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] border border-[#ead9c7] bg-white/85 p-4 shadow-[0_28px_70px_rgba(17,17,17,0.08)] backdrop-blur sm:p-6 lg:p-8"
      >
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.10),_transparent_30%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(63,114,93,0.10),_transparent_28%)]" />
        </div>

        {/* Page heading */}
        <motion.div variants={fadeUp} className="relative z-10">
          <h1 className="font-display text-3xl font-semibold text-[#111111]">
            Community Recipes
          </h1>
          <p className="mt-1 text-sm text-[#6e6258]">
            Recipes shared by other PantryPal users
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="relative z-10 mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[520px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f6a4b]" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search community recipes..."
              className="h-14 w-full rounded-2xl border border-[#d7d7de] bg-white pl-11 pr-14 text-sm text-[#111111] outline-none transition placeholder:text-[#7f7267] focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#3f725d] transition hover:bg-[#fff4ea]"
              aria-label="Search filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Recipe grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="relative z-10 mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleRecipes.map((recipe) => (
            <CommunityCard
              key={recipe.id || recipe.title}
              recipe={recipe}
              onClick={(r) => navigate(`/recipes/${r.id}`)}
            />
          ))}
        </motion.div>

        {/* Empty states */}
        {visibleRecipes.length === 0 && (
          <motion.div
            variants={fadeUp}
            className="relative z-10 mt-8 rounded-[28px] border border-[#ead9c7] bg-white/85 p-6 text-center shadow-[0_18px_45px_rgba(17,17,17,0.06)]"
          >
            {otherUsersRecipes.length === 0 ? (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#efe7ff]/50 text-[#6a3ec5]">
                  <Users className="h-10 w-10" />
                </div>
                <p className="mt-6 font-display text-2xl font-semibold text-[#111111]">
                  No community recipes yet
                </p>
                <p className="mt-2 text-sm text-[#6e6258]">
                  Recipes shared by other users will appear here. Ask your
                  friends to share their favourites!
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-2xl font-semibold text-[#111111]">
                  No recipes found
                </p>
                <p className="mt-2 text-sm text-[#6e6258]">
                  Try a different search term.
                </p>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
