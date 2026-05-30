import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';
import logoIcon from '../assets/icon.png';
import dashboardIcon from '../assets/home.png';
import pantryIcon from '../assets/pantry.png';
import recipesIcon from '../assets/cutlery.png';
import mealPlanIcon from '../assets/planning.png';
import shoppingIcon from '../assets/shopping-cart.png';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
	{ to: '/dashboard', label: 'Dashboard', icon: dashboardIcon },
	{ to: '/pantry', label: 'Pantry', icon: pantryIcon },
	{ to: '/recipes', label: 'Recipes', icon: recipesIcon },
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
	const navigate = useNavigate();
	const { user, signOut } = useAuth();
	const displayName = user?.name || user?.email || 'Account';
	const displayEmail = user?.email || '';
	const avatarLetter = displayName.trim().charAt(0).toUpperCase() || 'A';

	const handleSignOut = () => {
		signOut();
		localStorage.removeItem('pantrypal_token');
		navigate('/login');
	};

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
					

					<details className="relative">
						<summary className="flex list-none cursor-pointer items-center gap-3 rounded-full bg-transparent px-2 py-1.5 text-[#111111] transition hover:bg-[#fff4ea] [&::-webkit-details-marker]:hidden">
							<span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9dccf] text-sm font-semibold text-[#111111] shadow-[0_8px_20px_rgba(17,17,17,0.08)]">
								{avatarLetter}
							</span>
							<span className="hidden text-sm font-medium sm:block">{displayName}</span>
							<ChevronDown className="h-4 w-4 text-[#8f6a4b]" />
						</summary>

						<div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_rgba(17,17,17,0.14)]">
							<div className="border-b border-black/5 px-4 py-3">
								<p className="text-sm font-semibold text-[#111111]">{displayName}</p>
								{displayEmail ? <p className="text-xs text-[#6e6258]">{displayEmail}</p> : null}
							</div>
							<div className="p-2">
								<Link
									to="/settings"
									className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[#4c4038] transition hover:bg-[#fff4ea] hover:text-[#111111]"
								>
									<Settings className="h-4 w-4" />
									Account settings
								</Link>
								<button
									type="button"
									onClick={handleSignOut}
									className="mt-1 block w-full rounded-2xl px-3 py-2 text-left text-sm text-[#4c4038] transition hover:bg-[#fff4ea] hover:text-[#111111]"
								>
									Sign out
								</button>
							</div>
						</div>
					</details>
				</div>
			</div>
		</header>
	);
}
