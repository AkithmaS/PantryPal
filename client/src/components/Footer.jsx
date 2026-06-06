import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa6';
import { Mail, Phone } from 'lucide-react';
import logoIcon from '../assets/icon.png';

const footerLinks = {
	Account: [
		{ label: 'Sign In', to: '/login' },
		{ label: 'Create Account', to: '/signup' },
	],
	Support: [
		{ label: 'Help Center', to: '/dashboard' },
		{ label: 'Forgot Password', to: '/forgot-password' },
		{ label: 'Shopping List', to: '/shopping' },
	],
};

const socialLinks = [
	{ label: 'Instagram', icon: FaInstagram },
	{ label: 'Facebook', icon: FaFacebookF },
	{ label: 'YouTube', icon: FaYoutube },
];

function FooterColumn({ title, links }) {
	return (
		<div>
			<h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#111111] sm:text-base">
				{title}
			</h3>
			<ul className="mt-5 space-y-3 text-sm text-[#5d5148]">
				{links.map((link) => (
					<li key={link.label}>
						<Link className="transition hover:text-[#d45d10]" to={link.to}>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

export default function Footer() {
	return (
		<footer className="border-t border-[#ead9c7] bg-[linear-gradient(180deg,#fff8f0_0%,#fff3e6_100%)]">
			<div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
				<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:gap-12">
					<div>
						<Link to="/" className="inline-flex items-center gap-3">
							<span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/80 shadow-[0_12px_28px_rgba(17,17,17,0.08)]">
								<img src={logoIcon} alt="PantryPal logo" className="h-8 w-8 object-contain" />
							</span>
							<span className="font-display text-2xl font-semibold tracking-tight text-[#111111]">
								PantryPal
							</span>
						</Link>

						<p className="mt-5 max-w-md text-sm leading-7 text-[#5d5148] sm:text-base">
							Track ingredients, plan meals, and keep your kitchen organized with a calm, simple
							workflow that fits everyday cooking.
						</p>

						<div className="mt-6 flex items-center gap-3">
							{socialLinks.map(({ label, icon: Icon }) => (
								<Link
									key={label}
									to="/"
									aria-label={label}
									className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ead9c7] bg-white/80 text-[#4c4038] transition hover:border-[#ff7a18]/35 hover:text-[#d45d10]"
								>
									<Icon className="h-4 w-4" />
								</Link>
							))}
						</div>
					</div>

					<FooterColumn title="Account" links={footerLinks.Account} />

					<div>
						<h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#111111] sm:text-base">
							Contact
						</h3>

						<div className="mt-5 space-y-4 text-sm text-[#5d5148] sm:text-base">
							
							<div className="flex items-center gap-3">
								<Phone className="h-4 w-4 shrink-0 text-[#d45d10]" />
								<span>(91) 98765 4321 54</span>
							</div>
							<div className="flex items-center gap-3">
								<Mail className="h-4 w-4 shrink-0 text-[#d45d10]" />
								<span>support@pantrypal.com</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-12 flex flex-col gap-4 border-t border-[#ead9c7] pt-6 text-sm text-[#6e6258] sm:flex-row sm:items-center sm:justify-between">
					<p>© Copyright by PantryPal. All rights reserved.</p>
					<div className="flex flex-wrap gap-x-6 gap-y-2">
						<Link to="/" className="transition hover:text-[#d45d10]">
							Privacy Policy
						</Link>
						<Link to="/" className="transition hover:text-[#d45d10]">
							Terms of Use
						</Link>
						<Link to="/" className="transition hover:text-[#d45d10]">
							Legal
						</Link>
						<Link to="/" className="transition hover:text-[#d45d10]">
							Site Map
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
