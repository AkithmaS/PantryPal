import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export default function PantryAddItem({
	isOpen,
	onClose,
	onSubmit,
	formData,
	onChange,
	categories,
	title = 'Add Pantry Item',
	subtitle = 'Keep your pantry list organized and up to date.',
	submitLabel = 'Add Item',
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
				aria-label="Close add item modal"
			/>

			<motion.div
				initial={{ opacity: 0, scale: 0.96, y: 14 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.22, ease: 'easeOut' }}
				className="relative z-10 w-full max-w-xl overflow-hidden rounded-[30px] border border-[#ead9c7] bg-[#fffaf4] shadow-[0_30px_80px_rgba(17,17,17,0.22)]"
			>
				<div className="flex items-start justify-between border-b border-[#ead9c7] px-6 py-5 sm:px-8">
					<div>
						<h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
							{title}
						</h2>
						<p className="mt-1 text-sm text-[#6e6258]">{subtitle}</p>
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

				<form onSubmit={onSubmit} className="px-6 py-6 sm:px-8">
					<div className="space-y-5">
						<label className="block">
							<span className="mb-2 block text-sm font-medium text-[#4c4038]">Name</span>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={onChange}
								placeholder="Tomato"
								required
								className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
							/>
						</label>

						<div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-[#4c4038]">Quantity</span>
								<input
									type="number"
									name="quantity"
									value={formData.quantity}
									onChange={onChange}
									min="0"
									step="0.01"
									placeholder="250"
									required
									className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-[#4c4038]">Unit</span>
								<select
									name="unit"
									value={formData.unit}
									onChange={onChange}
									className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
								>
									<option>Pieces</option>
									<option>Grams</option>
									<option>Kilograms</option>
									<option>Milliliters</option>
									<option>Liters</option>
									<option>Cans</option>
									<option>Packs</option>
								</select>
							</label>
						</div>

						<label className="block">
							<span className="mb-2 block text-sm font-medium text-[#4c4038]">Category</span>
							<select
								name="category"
								value={formData.category}
								onChange={onChange}
								className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
							>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="mb-2 block text-sm font-medium text-[#4c4038]">
								Expiry Date <span className="font-normal text-[#8d7f72]">(Optional)</span>
							</span>
							<input
								type="date"
								name="expiryDate"
								value={formData.expiryDate}
								onChange={onChange}
								className="w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
							/>
						</label>

						<label className="flex items-center gap-3 text-sm text-[#4c4038]">
							<input
								type="checkbox"
								name="runningLow"
								checked={formData.runningLow}
								onChange={onChange}
								className="h-5 w-5 rounded border-[#d7c7b4] text-[#ff7a18] focus:ring-[#ff7a18]"
							/>
							Mark as running low
						</label>
					</div>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							className="inline-flex items-center justify-center rounded-2xl border border-[#d8cab9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5"
						>
							<Plus className="h-4 w-4" />
							{submitLabel}
						</button>
					</div>
				</form>
			</motion.div>
		</div>
	);
}
