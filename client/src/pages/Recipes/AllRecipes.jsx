import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock3, Pencil, Plus, Trash2, X } from 'lucide-react';
import apiClient from '../../api/client.js';
import cardIcon from '../../assets/icon.png';

const MAX_INLINE_IMAGE_LENGTH = 800000;

const fadeUp = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
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

	return <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${className}`}>{children}</span>;
}

function createId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toIngredientRows(ingredients = []) {
	if (!Array.isArray(ingredients) || ingredients.length === 0) {
		return [{ id: createId(), name: '', quantity: '', unit: '' }];
	}

	return ingredients.map((ingredient) => ({
		id: createId(),
		name: ingredient?.name || ingredient?.ingredient_name || '',
		quantity: ingredient?.quantity ?? '',
		unit: ingredient?.unit || '',
	}));
}

function toInstructionRows(instructions = []) {
	if (Array.isArray(instructions) && instructions.length > 0) {
		return instructions.map((step) => ({
			id: createId(),
			text: typeof step === 'string' ? step : step?.text || '',
		}));
	}

	if (typeof instructions === 'string' && instructions.trim()) {
		return instructions
			.split(/\n+/)
			.map((step) => step.trim())
			.filter(Boolean)
			.map((step) => ({ id: createId(), text: step }));
	}

	return [{ id: createId(), text: '' }];
}

function getRecipeImage(recipe) {
	const imageUrl = recipe?.image_url;

	if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/') && imageUrl.length > MAX_INLINE_IMAGE_LENGTH) {
		return cardIcon;
	}

	return imageUrl || cardIcon;
}

function readFileAsDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ''));
		reader.onerror = () => reject(new Error('Unable to read image file'));
		reader.readAsDataURL(file);
	});
}

async function compressImageFile(file) {
	const maxOutputLength = 450000;
	const objectUrl = URL.createObjectURL(file);

	try {
		const image = await new Promise((resolve, reject) => {
			const previewImage = new Image();
			previewImage.onload = () => resolve(previewImage);
			previewImage.onerror = () => reject(new Error('Unable to load image'));
			previewImage.src = objectUrl;
		});

		let maxDimension = 1280;
		let quality = 0.82;

		for (let attempt = 0; attempt < 4; attempt += 1) {
			const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
			const width = Math.max(1, Math.round(image.width * scale));
			const height = Math.max(1, Math.round(image.height * scale));
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			const context = canvas.getContext('2d');

			if (!context) {
				return await readFileAsDataUrl(file);
			}

			context.drawImage(image, 0, 0, width, height);
			const compressedImage = canvas.toDataURL('image/jpeg', quality);

			if (compressedImage.length <= maxOutputLength) {
				return compressedImage;
			}

			maxDimension = Math.max(640, Math.round(maxDimension * 0.75));
			quality = Math.max(0.5, quality - 0.12);
		}

		return await readFileAsDataUrl(file);
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

function formatRecipeTime(recipe) {
	return recipe.cooking_time ?? recipe.cook_time ? `${recipe.cooking_time || recipe.cook_time} mins` : '—';
}

function getIngredientPreview(recipe) {
	const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
	const firstIngredient = ingredients[0];

	if (!firstIngredient) {
		return 'No ingredients listed';
	}

	const name = firstIngredient.name || firstIngredient.ingredient_name || 'Ingredient';
	const quantity = firstIngredient.quantity ? `${firstIngredient.quantity} ` : '';
	const unit = firstIngredient.unit ? `${firstIngredient.unit} ` : '';

	return `${quantity}${unit}${name}`.trim();
}

function getInstructionPreview(recipe) {
	const instructions = recipe?.instructions;

	if (Array.isArray(instructions) && instructions.length > 0) {
		const firstStep = instructions[0];
		return typeof firstStep === 'string' ? firstStep : firstStep?.text || 'No instructions listed';
	}

	if (typeof instructions === 'string' && instructions.trim()) {
		try {
			const parsed = JSON.parse(instructions);
			if (Array.isArray(parsed) && parsed.length > 0) {
				const firstStep = parsed[0];
				return typeof firstStep === 'string' ? firstStep : firstStep?.text || 'No instructions listed';
			}
		} catch (error) {
			return instructions.split(/\n+/).find(Boolean) || 'No instructions listed';
		}
	}

	return 'No instructions listed';
}

function RecipeEditModal({
	isOpen,
	isLoading,
	isSaving,
	error,
	form,
	onClose,
	onChange,
	onIngredientChange,
	onAddIngredient,
	onRemoveIngredient,
	onInstructionChange,
	onAddInstruction,
	onRemoveInstruction,
	onImageChange,
	onSubmit,
}) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
			<button
				type="button"
				className="absolute inset-0 bg-[#111111]/45 backdrop-blur-[2px]"
				onClick={onClose}
				aria-label="Close recipe editor"
			/>

			<div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-[#ead9c7] bg-[#fffaf4] shadow-[0_30px_80px_rgba(17,17,17,0.22)]">
				<div className="flex items-start justify-between border-b border-[#ead9c7] px-6 py-5 sm:px-8">
					<div>
						<h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">Edit Recipe</h2>
						<p className="mt-2 text-sm leading-6 text-[#6e6258]">
							Update ingredients, instructions, and the recipe image.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8f6a4b] transition hover:bg-[#fff1e5] hover:text-[#111111]"
						aria-label="Close modal"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-8">
					{isLoading ? (
						<div className="rounded-[24px] border border-dashed border-[#ead9c7] bg-white px-6 py-12 text-center text-sm text-[#6e6258]">
							Loading recipe...
						</div>
					) : (
						<form onSubmit={onSubmit} className="space-y-6">
							{error ? <p className="text-sm font-medium text-[#c64545]">{error}</p> : null}

							<div className="grid gap-5 lg:grid-cols-[320px_1fr]">
								<div className="space-y-4">
									<div className="rounded-[24px] border border-[#ead9c7] bg-white p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
										<div className="flex items-center gap-3">
											<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4ea] text-[#d45d10]">
												<Camera className="h-5 w-5" />
											</div>
											<div>
												<p className="text-sm font-semibold text-[#111111]">Recipe Image</p>
												<p className="text-xs text-[#6e6258]">Upload a replacement for the default icon.</p>
											</div>
										</div>

										<div className="mt-4 overflow-hidden rounded-[20px] border border-[#ead9c7] bg-[#fffaf4]">
											<div className="aspect-[16/10] bg-[linear-gradient(135deg,_#fff4ea,_#fffaf5)]">
												<img
													src={form.imagePreview || cardIcon}
													alt="Recipe preview"
													className="h-full w-full object-contain p-6"
												/>
											</div>
										</div>

										<label className="mt-4 block">
											<span className="mb-2 block text-sm font-medium text-[#4c4038]">Upload Image</span>
											<input
												type="file"
												accept="image/*"
												onChange={onImageChange}
												className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#fff4ea] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#d45d10] focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
											/>
										</label>
									</div>

									<div className="rounded-[24px] border border-[#ead9c7] bg-white p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
										<div className="grid gap-4 sm:grid-cols-2">
											<label className="block sm:col-span-2">
												<span className="mb-2 block text-sm font-medium text-[#4c4038]">Name</span>
												<input
													type="text"
													name="name"
													value={form.name}
													onChange={onChange}
													className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
												/>
											</label>

											<label className="block sm:col-span-2">
												<span className="mb-2 block text-sm font-medium text-[#4c4038]">Description</span>
												<textarea
													name="description"
													value={form.description}
													onChange={onChange}
													rows={4}
													className="w-full resize-none rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
												/>
											</label>

											<label className="block">
												<span className="mb-2 block text-sm font-medium text-[#4c4038]">Cuisine Type</span>
												<input
													name="cuisine_type"
													value={form.cuisine_type}
													onChange={onChange}
													className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
												/>
											</label>

											<label className="block">
												<span className="mb-2 block text-sm font-medium text-[#4c4038]">Difficulty</span>
												<select
													name="difficulty"
													value={form.difficulty}
													onChange={onChange}
													className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
												>
													<option value="easy">Easy</option>
													<option value="medium">Medium</option>
													<option value="hard">Hard</option>
												</select>
											</label>

											<label className="block">
												<span className="mb-2 block text-sm font-medium text-[#4c4038]">Prep Time</span>
												<input
													type="number"
													name="preparation_time"
													value={form.preparation_time}
													onChange={onChange}
													min="0"
													className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
												/>
											</label>

											<label className="block">
												<span className="mb-2 block text-sm font-medium text-[#4c4038]">Cook Time</span>
												<input
													type="number"
													name="cooking_time"
													value={form.cooking_time}
													onChange={onChange}
													min="0"
													className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
												/>
											</label>

											<label className="block">
												<span className="mb-2 block text-sm font-medium text-[#4c4038]">Servings</span>
												<input
													type="number"
													name="servings"
													value={form.servings}
													onChange={onChange}
													min="1"
													className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
												/>
											</label>
										</div>
									</div>
								</div>

								<div className="space-y-6">
									<div className="rounded-[24px] border border-[#ead9c7] bg-white p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
										<div className="flex items-center justify-between gap-3">
											<h3 className="font-display text-lg font-semibold text-[#111111]">Ingredients</h3>
											<button
												type="button"
												onClick={onAddIngredient}
												className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white"
											>
												<Plus className="h-4 w-4" />
												Add Ingredient
											</button>
										</div>
										<div className="mt-4 space-y-3">
											{form.ingredients.map((ingredient, index) => (
												<div key={ingredient.id} className="grid gap-3 rounded-2xl border border-[#ead9c7] bg-[#fffaf5] p-3 sm:grid-cols-[1.4fr_0.6fr_0.7fr_auto]">
													<label className="block">
														<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8d5c24]">Ingredient {index + 1}</span>
														<input
															type="text"
															value={ingredient.name}
															onChange={(event) => onIngredientChange(ingredient.id, 'name', event.target.value)}
															placeholder="Ingredient name"
															className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
														/>
													</label>
													<label className="block">
														<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8d5c24]">Qty</span>
														<input
															type="text"
															value={ingredient.quantity}
															onChange={(event) => onIngredientChange(ingredient.id, 'quantity', event.target.value)}
															placeholder="1"
															className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
														/>
													</label>
													<label className="block">
														<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8d5c24]">Unit</span>
														<input
															type="text"
															value={ingredient.unit}
															onChange={(event) => onIngredientChange(ingredient.id, 'unit', event.target.value)}
															placeholder="cup"
															className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
														/>
													</label>
													<button
														type="button"
														onClick={() => onRemoveIngredient(ingredient.id)}
														className="inline-flex h-11 w-11 items-center justify-center self-end rounded-full border border-[#ead9c7] bg-white text-[#c64545] transition hover:bg-[#fff4f4]"
														aria-label="Remove ingredient"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
											))}
										</div>
									</div>

									<div className="rounded-[24px] border border-[#ead9c7] bg-white p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
										<div className="flex items-center justify-between gap-3">
											<h3 className="font-display text-lg font-semibold text-[#111111]">Instructions</h3>
											<button
												type="button"
												onClick={onAddInstruction}
												className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-white"
											>
												<Plus className="h-4 w-4" />
												Add Step
											</button>
										</div>
										<div className="mt-4 space-y-3">
											{form.instructions.map((instruction, index) => (
												<div key={instruction.id} className="rounded-2xl border border-[#ead9c7] bg-[#fffaf5] p-3">
													<div className="mb-2 flex items-center justify-between gap-3">
														<span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d5c24]">Step {index + 1}</span>
														<button
															type="button"
															onClick={() => onRemoveInstruction(instruction.id)}
															className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#c64545] transition hover:bg-[#fff4f4]"
															aria-label="Remove step"
														>
															<X className="h-4 w-4" />
														</button>
													</div>
													<textarea
														rows={4}
														value={instruction.text}
														onChange={(event) => onInstructionChange(instruction.id, event.target.value)}
														placeholder="Describe this step..."
														className="w-full resize-none rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
													/>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-3 border-t border-[#ead9c7] pt-6 sm:flex-row sm:justify-end">
								<button
									type="button"
									onClick={onClose}
									className="inline-flex items-center justify-center rounded-2xl border border-[#d8cab9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
									disabled={isSaving}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
									disabled={isSaving}
								>
									{isSaving ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}

export default function AllRecipes() {
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [authRequired, setAuthRequired] = useState(false);
	const [search, setSearch] = useState('');
	const [cuisine, setCuisine] = useState('');
	const [deleting, setDeleting] = useState(null);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [editSaving, setEditSaving] = useState(false);
	const [editError, setEditError] = useState('');
	const [editingRecipeId, setEditingRecipeId] = useState(null);
	const [editForm, setEditForm] = useState(null);
	const navigate = useNavigate();

	const fetchRecipes = async () => {
		try {
			const token = localStorage.getItem('pantrypal_token');

			if (!token) {
				setAuthRequired(true);
				setRecipes([]);
				setError('Please sign in to view and edit your saved recipes.');
				return;
			}

			setAuthRequired(false);
			setLoading(true);
			setError('');
			const params = {};
			if (search) params.search = search;
			if (cuisine) params.cuisine = cuisine;
			params.sort_by = 'created_at';
			params.sort_order = 'desc';

			const res = await apiClient.get('/recipes', { params });
			setRecipes(res.data?.data || []);
		} catch (err) {
			if (err?.response?.status === 401) {
				setAuthRequired(true);
			}
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

	const openEditRecipe = async (recipeId) => {
		try {
			setEditError('');
			setEditLoading(true);
			const response = await apiClient.get(`/recipes/${recipeId}`);
			const recipe = response.data?.data;

			if (!recipe) {
				throw new Error('Recipe not found');
			}

			setEditingRecipeId(recipeId);
			setEditForm({
				name: recipe.name || recipe.title || '',
				description: recipe.description || '',
				cuisine_type: recipe.cuisine_type || '',
				difficulty: recipe.difficulty || 'medium',
				preparation_time: recipe.preparation_time ?? '',
				cooking_time: recipe.cooking_time ?? '',
				servings: recipe.servings ?? '',
				image_url:
					typeof recipe.image_url === 'string' && recipe.image_url.startsWith('data:image/') && recipe.image_url.length > MAX_INLINE_IMAGE_LENGTH
						? ''
						: recipe.image_url || '',
				imagePreview: getRecipeImage(recipe),
				imageChanged: false,
				ingredients: toIngredientRows(recipe.ingredients),
				instructions: toInstructionRows(recipe.instructions),
			});
			setIsEditOpen(true);
		} catch (err) {
			setEditError(err?.response?.data?.message || 'Unable to load recipe for editing');
		} finally {
			setEditLoading(false);
		}
	};

	const updateEditField = (name, value) => {
		setEditForm((current) => ({ ...current, [name]: value }));
	};

	const updateIngredientField = (id, key, value) => {
		setEditForm((current) => ({
			...current,
			ingredients: current.ingredients.map((ingredient) => (ingredient.id === id ? { ...ingredient, [key]: value } : ingredient)),
		}));
	};

	const addIngredientRow = () => {
		setEditForm((current) => ({
			...current,
			ingredients: [...current.ingredients, { id: createId(), name: '', quantity: '', unit: '' }],
		}));
	};

	const removeIngredientRow = (id) => {
		setEditForm((current) => ({
			...current,
			ingredients: current.ingredients.length > 1 ? current.ingredients.filter((ingredient) => ingredient.id !== id) : current.ingredients,
		}));
	};

	const updateInstructionField = (id, value) => {
		setEditForm((current) => ({
			...current,
			instructions: current.instructions.map((instruction) => (instruction.id === id ? { ...instruction, text: value } : instruction)),
		}));
	};

	const addInstructionRow = () => {
		setEditForm((current) => ({
			...current,
			instructions: [...current.instructions, { id: createId(), text: '' }],
		}));
	};

	const removeInstructionRow = (id) => {
		setEditForm((current) => ({
			...current,
			instructions: current.instructions.length > 1 ? current.instructions.filter((instruction) => instruction.id !== id) : current.instructions,
		}));
	};

	const handleImageChange = async (event) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		try {
			const compressedImage = await compressImageFile(file);
			setEditForm((current) => ({
				...current,
				image_url: compressedImage,
				imagePreview: compressedImage,
				imageChanged: true,
			}));
		} catch (error) {
			setEditError(error?.message || 'Unable to process image');
		}
	};

	const closeEditModal = (force = false) => {
		if (editSaving && !force) {
			return;
		}

		setIsEditOpen(false);
		setEditingRecipeId(null);
		setEditForm(null);
		setEditError('');
	};

	const handleSaveEdit = async (event) => {
		event.preventDefault();

		if (!editingRecipeId || !editForm) {
			return;
		}

		try {
			setEditSaving(true);
			setEditError('');

			const payload = {
				name: editForm.name.trim(),
				description: editForm.description.trim(),
				cuisine_type: editForm.cuisine_type.trim(),
				difficulty: editForm.difficulty,
				preparation_time: editForm.preparation_time === '' ? null : Number(editForm.preparation_time),
				cooking_time: editForm.cooking_time === '' ? null : Number(editForm.cooking_time),
				servings: editForm.servings === '' ? null : Number(editForm.servings),
				ingredients: editForm.ingredients
					.map((ingredient) => ({
						name: ingredient.name.trim(),
						quantity: ingredient.quantity === '' ? 1 : ingredient.quantity,
						unit: ingredient.unit.trim(),
					}))
					.filter((ingredient) => ingredient.name),
				instructions: editForm.instructions
					.map((instruction) => instruction.text.trim())
					.filter(Boolean),
			};

			if (editForm.imageChanged) {
				payload.image_url = editForm.image_url || null;
			}

			const response = await apiClient.put(`/recipes/${editingRecipeId}`, payload);
			const updatedRecipe = response.data?.data;

			if (updatedRecipe) {
				setRecipes((current) =>
					current.map((recipe) =>
						String(recipe.id) === String(editingRecipeId) ? updatedRecipe : recipe
					)
				);
			}

			closeEditModal(true);
		} catch (err) {
			setEditError(err?.response?.data?.message || 'Unable to update recipe');
		} finally {
			setEditSaving(false);
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

				{authRequired ? (
					<div className="mb-6 rounded-[24px] border border-[#ead9c7] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
						<p className="text-sm font-semibold text-[#111111]">You are signed out</p>
						<p className="mt-1 text-sm text-[#6e6258]">Sign in again to load your recipes and upload recipe images.</p>
						<button
							type="button"
							onClick={() => navigate('/login')}
							className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ff7a18] px-5 py-2.5 text-sm font-semibold text-white"
						>
							Go to Sign In
						</button>
					</div>
				) : null}

				<motion.div initial="hidden" animate="visible" variants={stagger} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{loading ? (
						<div className="col-span-full rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] p-8 text-center">Loading...</div>
					) : recipes.length === 0 ? (
						<div className="col-span-full rounded-2xl border border-dashed border-[#ead9c7] bg-[#fffaf5] p-8 text-center">No recipes yet</div>
					) : (
						recipes.map((recipe) => (
							<motion.article key={recipe.id} variants={fadeUp} whileHover={{ y: -4 }} className="overflow-hidden rounded-[20px] border border-[#ead9c7] bg-[#fff4ea] shadow-[0_12px_28px_rgba(17,17,17,0.06)]">
								<div className="relative h-36 overflow-hidden sm:h-40">
									<div className="absolute inset-0 bg-gradient-to-r from-[#fff4ea] to-[#fffaf5]" />
									<div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
										<img
											src={getRecipeImage(recipe)}
											alt={recipe.name || recipe.title || 'Recipe image'}
											loading="lazy"
											decoding="async"
											className="h-full w-full object-contain"
										/>
									</div>
									<button
										onClick={() => openEditRecipe(recipe.id)}
										className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ead9c7] bg-white/95 text-[#111111] shadow-[0_10px_20px_rgba(17,17,17,0.08)] transition hover:bg-white"
										aria-label={`Edit ${recipe.name || recipe.title || 'recipe'}`}
									>
										<Pencil className="h-4 w-4" />
									</button>
								</div>

								<div className="px-4 py-4 sm:px-5">
									<h3 className="truncate text-lg font-semibold text-[#111111]">{recipe.name || recipe.title || 'Untitled'}</h3>
									<p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-[#6e6258]">
										{recipe.description || 'No description yet'}
									</p>

									<div className="mt-3 flex flex-wrap items-center gap-2">
										{recipe.cuisine_type ? <Badge tone="cuisine">{recipe.cuisine_type}</Badge> : null}
										{recipe.difficulty ? <Badge tone="difficulty">{recipe.difficulty}</Badge> : null}
										<Badge tone="dietary">{formatRecipeTime(recipe)}</Badge>
									</div>

									<div className="mt-4 flex items-center justify-between gap-3">
										<button
											onClick={() => navigate(`/recipes/${recipe.id}`)}
											className="rounded-full border border-[#ead9c7] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
										>
											View Recipe
										</button>
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleDelete(recipe.id)}
												disabled={deleting === recipe.id}
												className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-[#c64545] hover:bg-[#fff4f4]"
												aria-label={`Delete ${recipe.name || recipe.title || 'recipe'}`}
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							</motion.article>
						)))
					}
				</motion.div>
			</div>

				<RecipeEditModal
					isOpen={isEditOpen}
					isLoading={editLoading}
					isSaving={editSaving}
					error={editError}
					form={editForm || {
						name: '',
						description: '',
						cuisine_type: '',
						difficulty: 'medium',
						preparation_time: '',
						cooking_time: '',
						servings: '',
						image_url: '',
						imagePreview: cardIcon,
						ingredients: [{ id: createId(), name: '', quantity: '', unit: '' }],
						instructions: [{ id: createId(), text: '' }],
					}}
					onClose={closeEditModal}
					onChange={(event) => updateEditField(event.target.name, event.target.value)}
					onIngredientChange={updateIngredientField}
					onAddIngredient={addIngredientRow}
					onRemoveIngredient={removeIngredientRow}
					onInstructionChange={updateInstructionField}
					onAddInstruction={addInstructionRow}
					onRemoveInstruction={removeInstructionRow}
					onImageChange={handleImageChange}
					onSubmit={handleSaveEdit}
				/>
		</div>
	);
}

