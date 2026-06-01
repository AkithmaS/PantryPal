import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock3, Users } from 'lucide-react';
import apiClient from '../../api/client.js';
import cardIcon from '../../assets/icon.png';

function Badge({ children, tone = 'cuisine' }) {
  const className =
    tone === 'cuisine'
      ? 'bg-[#fff4ea] text-[#d45d10]'
      : tone === 'difficulty'
      ? 'bg-[#e7efff] text-[#2f5bb8]'
      : 'bg-[#efe7ff] text-[#6a3ec5]';

  return <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${className}`}>{children}</span>;
}

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/recipes/${id}`);
        setRecipe(res.data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load recipe');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipe();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-sm text-[#c64545]">{error}</div>;
  if (!recipe) return null;

  const recipeImage = recipe.image_url || cardIcon;

  return (
    <div className="min-h-screen bg-[#fff8f0] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 rounded-[20px] border border-[#ead9c7] bg-white p-6 shadow-[0_12px_28px_rgba(17,17,17,0.06)]">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 shrink-0 rounded-lg bg-[#fff4ea] p-4">
              <img src={recipeImage} alt={recipe.name || recipe.title || 'Recipe image'} className="h-full w-full object-contain" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-display font-semibold text-[#111111]">{recipe.name || recipe.title}</h1>
              <p className="mt-2 text-sm text-[#6e6258]">{recipe.description}</p>

              <div className="mt-4 flex items-center gap-3">
                {recipe.cuisine_type ? <Badge tone="cuisine">{recipe.cuisine_type}</Badge> : null}
                {recipe.difficulty ? <Badge tone="difficulty">{recipe.difficulty}</Badge> : null}
                {Array.isArray(recipe.dietary_tags) && recipe.dietary_tags.map((d) => (<Badge key={d} tone="dietary">{d}</Badge>))}
              </div>

              <div className="mt-4 flex items-center gap-6 text-sm text-[#6e6258]">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#b16a2c]" />
                  {recipe.cooking_time ? `${recipe.cooking_time} mins` : '—'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#b16a2c]" />
                  {recipe.servings ? `${recipe.servings} servings` : '—'}
                </span>
              </div>
            </div>
            <div>
              <button
                onClick={() => navigate(-1)}
                className="rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-[12px] border border-[#ead9c7] bg-[#fff4ea] p-5">
              <h3 className="text-lg font-semibold text-[#111111]">Ingredients</h3>
              <ul className="mt-4 space-y-3">
                {(recipe.ingredients || []).map((ing, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#ff7a18] text-[#ff7a18]" />
                    <span className="text-sm text-[#4c4038]">{ing.quantity ? `${ing.quantity} ` : ''}{ing.unit ? `${ing.unit} ` : ''}{ing.name || ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[12px] border border-[#ead9c7] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#111111]">Instructions</h3>
              <div className="mt-4 space-y-4">
                {(recipe.instructions || []).map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-none mt-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#ff7a18] text-sm font-semibold text-white">{idx + 1}</div>
                    <p className="text-sm leading-7 text-[#4c4038]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {((recipe.cookingTips && recipe.cookingTips.length) || (recipe.cooking_tips && recipe.cooking_tips.length)) ? (
              <div className="rounded-[12px] border border-[#f3e1cf] bg-[#fff4ea] p-5">
                <h3 className="text-lg font-semibold text-[#111111]">Cooking Tips</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#4c4038]">
                  {(recipe.cookingTips || recipe.cooking_tips || []).map((tip, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#d45d10]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {recipe.nutrition ? (
              <div className="rounded-[12px] border border-[#ead9c7] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#111111]">Nutrition (per serving)</h3>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {recipe.nutrition.calories ? (
                    <div className="rounded-lg bg-[#fffaf5] p-3 text-center">
                      <div className="text-2xl font-semibold text-[#111111]">{Math.round(recipe.nutrition.calories)} kcal</div>
                      <div className="text-xs text-[#6e6258]">Calories</div>
                    </div>
                  ) : null}
                  {recipe.nutrition.protein ? (
                    <div className="rounded-lg bg-[#fffaf5] p-3 text-center">
                      <div className="text-2xl font-semibold text-[#111111]">{Number(recipe.nutrition.protein).toFixed(2)}g</div>
                      <div className="text-xs text-[#6e6258]">Protein</div>
                    </div>
                  ) : null}
                  {recipe.nutrition.carbohydrates ? (
                    <div className="rounded-lg bg-[#fffaf5] p-3 text-center">
                      <div className="text-2xl font-semibold text-[#111111]">{Number(recipe.nutrition.carbohydrates).toFixed(2)}g</div>
                      <div className="text-xs text-[#6e6258]">Carbs</div>
                    </div>
                  ) : null}
                  {recipe.nutrition.fat ? (
                    <div className="rounded-lg bg-[#fffaf5] p-3 text-center">
                      <div className="text-2xl font-semibold text-[#111111]">{Number(recipe.nutrition.fat).toFixed(2)}g</div>
                      <div className="text-xs text-[#6e6258]">Fats</div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
