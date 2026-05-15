import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';
import logoIcon from '../assets/icon.png';
import dashboardIcon from '../assets/home.png';
import pantryIcon from '../assets/pantry.png';
import recipesIcon from '../assets/cutlery.png';
import mealPlanIcon from '../assets/planning.png';
import shoppingIcon from '../assets/shopping-cart.png';

const navItems = [
	{ to: '/dashboard', label: 'Dashboard', icon: dashboardIcon },
	{ to: '/pantry', label: 'Pantry', icon: pantryIcon },
	{ to: '/find-recipe/search', label: 'Recipes', icon: recipesIcon },
	{ to: '/meal-plan', label: 'Meal Planner', icon: mealPlanIcon },
	{ to: '/shopping', label: 'Shopping Card', icon: shoppingIcon },
];

function NavItem({ to, label, icon }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				[
					'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
					isActive
						? 'bg-[#f4e6d7] text-[#9a4a12] shadow-[0_10px_24px_rgba(17,17,17,0.05)]'
						: 'text-[#4c4038] hover:bg-white/70 hover:text-[#111111]',
				].join(' ')
			}
		>
			<img src={icon} alt="" aria-hidden="true" className="h-4 w-4 opacity-80" />
			<span>{label}</span>
		</NavLink>
	);
}

export default function NavBar() {
	return (
		<header className="sticky top-0 z-50 border-b border-[#ead9c7] bg-[#fff8f0]/96 backdrop-blur-xl">
			<div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
				<Link to="/" className="flex shrink-0 items-center gap-3">
					<span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-transparent">
						<img src={logoIcon} alt="PantryPal logo" className="h-8 w-8 object-contain" />
					</span>
					<span className="font-display text-lg font-semibold tracking-tight text-[#111111]">
						PantryPal
					</span>
				</Link>

				<nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
					{navItems.map((item) => (
						<NavItem key={item.to} {...item} />
					))}
				</nav>

				<div className="ml-auto flex items-center gap-3">
					<Link
						to="/settings"
						className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-[#4c4038] transition hover:bg-[#fff4ea] hover:text-[#111111]"
						aria-label="Settings"
					>
						<Settings className="h-5 w-5" />
					</Link>

					<details className="relative">
						<summary className="flex list-none cursor-pointer items-center gap-3 rounded-full bg-transparent px-2 py-1.5 text-[#111111] transition hover:bg-[#fff4ea] [&::-webkit-details-marker]:hidden">
							<span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9dccf] text-sm font-semibold text-[#111111] shadow-[0_8px_20px_rgba(17,17,17,0.08)]">
								A
							</span>
							<span className="hidden text-sm font-medium sm:block">Alex</span>
							<ChevronDown className="h-4 w-4 text-[#8f6a4b]" />
						</summary>

						<div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_rgba(17,17,17,0.14)]">
							<div className="border-b border-black/5 px-4 py-3">
								<p className="text-sm font-semibold text-[#111111]">Alex</p>
								<p className="text-xs text-[#6e6258]">alex@pantrypal.com</p>
							</div>
							<div className="p-2">
								<Link
									to="/settings"
									className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[#4c4038] transition hover:bg-[#fff4ea] hover:text-[#111111]"
								>
									<Settings className="h-4 w-4" />
									Account settings
								</Link>
								<Link
									to="/login"
									className="mt-1 block rounded-2xl px-3 py-2 text-sm text-[#4c4038] transition hover:bg-[#fff4ea] hover:text-[#111111]"
								>
									Sign out
								</Link>
							</div>
						</div>
					</details>
				</div>
			</div>
		</header>
	);
}
