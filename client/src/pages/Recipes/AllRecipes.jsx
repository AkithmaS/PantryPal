import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, X, Users } from 'lucide-react';
import apiClient from '../../api/client.js';
import cardIcon from '../../assets/icon.png';
import { useAuth } from '../../context/AuthContext.jsx';

const MAX_INLINE_IMAGE_LENGTH = 800000;

const fadeUp = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.45, ease: 'easeOut' },
	},
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.08 } },
};

function Badge({ children, tone = 'cuisine' }) {
	const className =
		tone === 'cuisine'
			? 'bg-[#fff4ea] text-[#d45d10]'
			: tone === 'difficulty'
			? 'bg-[#e7efff] text-[#2f5bb8]'
			: 'bg-[#efe7ff] text-[#6a3ec5]';

	return (
		<span
			className={`rounded-full px-3 py-1.5 text-sm font-medium ${className}`}
		>
			{children}
		</span>
	);
}

function getRecipeImage(recipe) {
	const imageUrl = recipe?.image_url;

	if (
		typeof imageUrl === 'string' &&
		imageUrl.startsWith('data:image/') &&
		imageUrl.length > MAX_INLINE_IMAGE_LENGTH
	) {
		return cardIcon;
	}

	return imageUrl || cardIcon;
}

function getCommunityRecipes() {
	try {
		const stored = localStorage.getItem('communityRecipes');
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function addToCommunityRecipe(recipe, ownerId) {
	try {
		const existing = getCommunityRecipes();
		const exists = existing.some((r) => String(r.id) === String(recipe.id));

		if (!exists) {
			const updated = [...existing, { ...recipe, ownerId }];
			localStorage.setItem('communityRecipes', JSON.stringify(updated));
			return true;
		}

		return false;
	} catch {
		return false;
	}
}

function removeFromCommunityRecipe(recipeId) {
	try {
		const existing = getCommunityRecipes();
		const updated = existing.filter((r) => String(r.id) !== String(recipeId));
		localStorage.setItem('communityRecipes', JSON.stringify(updated));
		return updated;
	} catch {
		return [];
	}
}

function isRecipeInCommunity(recipeId) {
	try {
		const existing = getCommunityRecipes();
		return existing.some((r) => String(r.id) === String(recipeId));
	} catch {
		return false;
	}
}

function formatRecipeTime(recipe) {
	const time = recipe.cooking_time || recipe.cook_time;
	return time ? `${time} mins` : '—';
}

export default function AllRecipes() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [recipes, setRecipes] = useState([]);
	const [communityRecipeIds, setCommunityRecipeIds] = useState(new Set());

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [deleting, setDeleting] = useState(null);

	const [communityModalOpen, setCommunityModalOpen] = useState(false);
	const [selectedRecipeForCommunity, setSelectedRecipeForCommunity] = useState(null);
	const [toast, setToast] = useState(null);

	const showToast = (message, type = 'success') => {
		setToast({ message, type, id: Date.now() });
		window.setTimeout(() => setToast(null), 3000);
	};

	const refreshCommunityIds = () => {
		const stored = getCommunityRecipes();
		setCommunityRecipeIds(new Set(stored.map((r) => String(r.id))));
	};

	const fetchRecipes = async () => {
		try {
			setLoading(true);
			setError('');

			const params = {};
			if (search) params.search = search;

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
		refreshCommunityIds();
	}, []);

	const handleDelete = async (id) => {
		const ok = window.confirm('Delete this recipe?');
		if (!ok) return;

		try {
			setDeleting(id);
			await apiClient.delete(`/recipes/${id}`);
			setRecipes((current) => current.filter((r) => r.id !== id));
			// also remove from community if it was there
			removeFromCommunityRecipe(id);
			refreshCommunityIds();
			showToast('Recipe deleted successfully', 'success');
		} catch (err) {
			setError(err?.response?.data?.message || 'Unable to delete recipe');
		} finally {
			setDeleting(null);
		}
	};

	const openCommunityModal = (recipe) => {
		setSelectedRecipeForCommunity(recipe);
		setCommunityModalOpen(true);
	};

	const handleAddToCommunity = () => {
		if (!selectedRecipeForCommunity) return;

		try {
			const added = addToCommunityRecipe(
				selectedRecipeForCommunity,
				user?.id
			);

			if (added) {
				refreshCommunityIds();
				showToast('Recipe added to community successfully', 'success');
			} else {
				showToast('Recipe already added to community', 'warning');
			}

			setCommunityModalOpen(false);
			setSelectedRecipeForCommunity(null);
		} catch {
			showToast('Failed to add recipe', 'error');
		}
	};

	const handleRemoveFromCommunity = (recipeId) => {
		try {
			removeFromCommunityRecipe(recipeId);
			refreshCommunityIds();
			showToast('Recipe removed from community', 'success');
		} catch {
			showToast('Failed to remove recipe', 'error');
		}
	};

	return (
		<div className="min-h-screen bg-[#fff8f0] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
			<div className="mx-auto w-full max-w-7xl">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between gap-4">
					<div>
						<h1 className="font-display text-3xl font-semibold text-[#111111]">
							All Recipes
						</h1>
						<p className="mt-1 text-sm text-[#6e6258]">
							Your personal recipe collection
						</p>
					</div>

					<div className="flex items-center gap-3">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && fetchRecipes()}
							placeholder="Search recipes"
							className="h-10 rounded-full border border-[#e7e7ea] bg-white px-4 text-sm outline-none"
						/>
						<button
							onClick={fetchRecipes}
							className="rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[#ea6d11]"
						>
							Search
						</button>
					</div>
				</div>

				{error && (
					<p className="mb-4 text-sm font-medium text-[#c64545]">{error}</p>
				)}

				{/* Recipe grid */}
				<motion.div
					initial="hidden"
					animate="visible"
					variants={stagger}
					className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					{loading ? (
						<div className="col-span-full rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] p-8 text-center">
							Loading...
						</div>
					) : recipes.length === 0 ? (
						<div className="col-span-full rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] p-8 text-center">
							<p className="font-display text-xl font-semibold text-[#111111]">
								No recipes yet
							</p>
							<p className="mt-2 text-sm text-[#6e6258]">
								Add your first recipe to get started
							</p>
						</div>
					) : (
						recipes.map((recipe) => {
							const inCommunity = communityRecipeIds.has(String(recipe.id));

							return (
								<motion.article
									key={recipe.id}
									variants={fadeUp}
									whileHover={{ y: -6, scale: 1.01 }}
									className="overflow-hidden rounded-[24px] border border-[#ead9c7] bg-[#fffaf5] shadow-[0_12px_28px_rgba(17,17,17,0.06)] transition-all cursor-pointer"
									onClick={() => navigate(`/recipes/${recipe.id}`)}
								>
									{/* Image area */}
									<div className="relative h-44 overflow-hidden">
										<div className="absolute inset-0 bg-gradient-to-r from-[#fff4ea] to-[#fffaf5]" />
										<div className="absolute inset-0 flex items-center justify-center p-4">
											<img
												src={getRecipeImage(recipe)}
												alt={recipe.name || 'Recipe'}
												className="h-full w-full object-contain"
											/>
										</div>

										{/* Delete button — stop propagation so card click doesn't fire */}
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDelete(recipe.id);
											}}
											disabled={deleting === recipe.id}
											className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c64545] shadow-md transition hover:scale-105 hover:bg-[#fff1f1]"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>

									{/* Card body */}
									<div className="px-5 py-5">
										<h3 className="truncate text-lg font-semibold text-[#111111]">
											{recipe.name || recipe.title || 'Untitled'}
										</h3>

										<div className="mt-4 flex flex-wrap gap-2">
											{recipe.cuisine_type && (
												<Badge tone="cuisine">{recipe.cuisine_type}</Badge>
											)}
											{recipe.difficulty && (
												<Badge tone="difficulty">{recipe.difficulty}</Badge>
											)}
											<Badge tone="dietary">{formatRecipeTime(recipe)}</Badge>
										</div>

										{/* Bottom actions: View (left) + Community toggle (right) */}
										<div className="mt-5 flex items-center justify-between gap-3">
											<button
												onClick={(e) => {
													e.stopPropagation();
													navigate(`/recipes/${recipe.id}`);
												}}
												className="rounded-full border border-[#ead9c7] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition hover:scale-105 hover:bg-[#fff4ea]"
											>
												View
											</button>

											{inCommunity ? (
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveFromCommunity(recipe.id);
													}}
													className="inline-flex items-center gap-2 rounded-full bg-[#dff5e4] px-4 py-2 text-sm font-semibold text-[#1e7b34] transition hover:scale-105 hover:bg-[#c8edcf]"
												>
													<X className="h-4 w-4" />
													Remove from Community
												</button>
											) : (
												<button
													onClick={(e) => {
														e.stopPropagation();
														openCommunityModal(recipe);
													}}
													className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[#ea6d11]"
												>
													<Users className="h-4 w-4" />
													Add to Community
												</button>
											)}
										</div>
									</div>
								</motion.article>
							);
						})
					)}
				</motion.div>

				{/* Confirmation modal */}
				{communityModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							className="w-full max-w-md rounded-[28px] border border-[#ead9c7] bg-[#fffaf5] p-6 shadow-[0_30px_80px_rgba(17,17,17,0.22)]"
						>
							<h2 className="font-display text-2xl font-semibold text-[#111111]">
								Add to Community
							</h2>
							<p className="mt-3 text-sm leading-6 text-[#6e6258]">
								Do you want to add this recipe to the community so others can
								view it?
							</p>
							<div className="mt-6 flex justify-end gap-3">
								<button
									onClick={() => {
										setCommunityModalOpen(false);
										setSelectedRecipeForCommunity(null);
									}}
									className="rounded-full border border-[#ead9c7] bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-[#fff4ea]"
								>
									Cancel
								</button>
								<button
									onClick={handleAddToCommunity}
									className="rounded-full bg-[#ff7a18] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[#ea6d11]"
								>
									Yes, Add
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}

				{/* Toast */}
				{toast && (
					<motion.div
						key={toast.id}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						className={`fixed right-4 top-4 z-[60] rounded-2xl px-5 py-3 text-sm font-medium shadow-[0_18px_45px_rgba(17,17,17,0.12)] ${
							toast.type === 'success'
								? 'bg-[#fff4ea] text-[#6a4321]'
								: toast.type === 'error'
								? 'bg-[#fff1f1] text-[#c64545]'
								: 'bg-white text-[#111111]'
						}`}
					>
						{toast.message}
					</motion.div>
				)}
			</div>
		</div>
	);
}
