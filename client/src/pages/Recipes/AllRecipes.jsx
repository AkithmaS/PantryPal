import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock3, Trash2 } from 'lucide-react';
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

export default function AllRecipes() {
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [cuisine, setCuisine] = useState('');
	const [deleting, setDeleting] = useState(null);
	const navigate = useNavigate();

	const fetchRecipes = async () => {
		try {
			setLoading(true);
			setError('');
			const params = {};
			if (search) params.search = search;
			if (cuisine) params.cuisine = cuisine;

			const res = await apiClient.get('/recipes', { params });
			setRecipes(res.data?.data || []);
		} catch (err) {
			setError(err?.response?.data?.message || 'Unable to load recipes');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRecipes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDelete = async (id) => {
		const ok = window.confirm('Delete this recipe? This cannot be undone.');
		if (!ok) return;

		try {
			setDeleting(id);
			await apiClient.delete(`/recipes/${id}`);
			setRecipes((cur) => cur.filter((r) => r.id !== id));
		} catch (err) {
			// show minimal feedback
			setError(err?.response?.data?.message || 'Unable to delete recipe');
		} finally {
			setDeleting(null);
		}
	};

	return (
		<div className="min-h-screen bg-[#fff8f0] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
			<div className="mx-auto w-full max-w-7xl">
				<div className="mb-6 flex items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-display font-semibold text-[#111111]">All Recipes</h1>
						<p className="mt-1 text-sm text-[#6e6258]">Your personal recipe collection — showing {recipes.length} recipes</p>
					</div>

					<div className="flex items-center gap-3">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search recipes"
							className="h-10 rounded-full border border-[#e7e7ea] bg-white px-4 text-sm outline-none"
						/>
						<button
							onClick={() => fetchRecipes()}
							className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white"
						>
							Search
						</button>
					</div>
				</div>

				{error ? <p className="mb-4 text-sm font-medium text-[#c64545]">{error}</p> : null}

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{loading ? (
						<div className="col-span-full rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] p-8 text-center">Loading...</div>
					) : recipes.length === 0 ? (
						<div className="col-span-full rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] p-8 text-center">No recipes yet</div>
					) : (
						recipes.map((recipe) => (
							<article key={recipe.id} className="overflow-hidden rounded-[20px] border border-[#ead9c7] bg-[#fff4ea] shadow-[0_12px_28px_rgba(17,17,17,0.06)]">
								<div className="relative aspect-[16/7] overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-r from-[#fff4ea] to-[#fffaf5]" />
									<div className="absolute inset-0 flex items-center justify-center">
										<img src={cardIcon} alt="icon" className="h-20 w-20 object-contain opacity-95" />
									</div>
								</div>

								<div className="px-5 py-5">
									<h3 className="text-lg font-semibold text-[#111111]">{recipe.name || recipe.title || 'Untitled'}</h3>
									<p className="mt-2 text-sm text-[#6e6258] line-clamp-3">{recipe.description || 'No description'}</p>

									<div className="mt-4 flex flex-wrap items-center gap-2">
										{recipe.cuisine_type ? <Badge tone="cuisine">{recipe.cuisine_type}</Badge> : null}
										{recipe.difficulty ? <Badge tone="difficulty">{recipe.difficulty}</Badge> : null}
										{Array.isArray(recipe.dietary_tags) && recipe.dietary_tags.slice(0, 3).map((d) => (<Badge key={d} tone="dietary">{d}</Badge>))}
									</div>

									<div className="mt-4 flex items-center justify-between">
										<div className="flex items-center gap-3 text-sm text-[#6e6258]">
											<span className="inline-flex items-center gap-2 rounded-full bg-[#fffaf5] px-3 py-1.5">
												<Clock3 className="h-4 w-4 text-[#b16a2c]" />
												{recipe.cooking_time ?? recipe.cook_time ? `${recipe.cooking_time || recipe.cook_time} mins` : '—'}
											</span>
											<span className="text-sm">{recipe.servings ? `${recipe.servings} servings` : ''}</span>
										</div>

										<div className="flex items-center gap-2">
											<button
												onClick={() => navigate(`/recipes/${recipe.id}`)}
												className="rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white"
											>
												View Recipe
											</button>
											<button
												onClick={() => handleDelete(recipe.id)}
												disabled={deleting === recipe.id}
												className="inline-flex items-center justify-center rounded-full border border-transparent bg-white px-3 py-2 text-sm text-[#c64545] hover:bg-[#fff4f4]"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							</article>
						)))
					}
				</div>
			</div>
		</div>
	);
}

