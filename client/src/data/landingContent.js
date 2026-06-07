import {
  CalendarRange,
  Clock,
  Refrigerator,
  Share2,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react';
import addYourPantryImage from '../assets/add_your_pantry.jpg';
import discoverRecipesImage from '../assets/discover_recepies.jpg';
import cookWithConfidenceImage from '../assets/cook_with_confidence.jpg';

export const featureCards = [
  {
    icon: Refrigerator,
    title: 'Pantry Tracking',
    description: 'Keep ingredients organized with expiry-aware tracking that feels effortless.',
  },
  {
    icon: Sparkles,
    title: 'AI Recipe Ideas',
    description: 'Turn what you already own into fresh meal ideas in seconds using AI.',
  },
  {
    icon: CalendarRange,
    title: 'Meal Planning',
    description: 'Plan the week around your schedule, preferences, and leftovers.',
  },
  {
    icon: ShoppingCart,
    title: 'Smart Shopping',
    description: 'Generate focused grocery lists that prevent duplicate buying.',
  },
  {
    icon: Share2,
    title: 'Community Recipes',
    description: 'Share your favorite recipes with other users and discover theirs.',
  },
  {
    icon: Users,
    title: 'Family Friendly',
    description: 'Share a pantry rhythm that works for the whole household.',
  },
];

export const heroMetrics = [
  { value: '100+', label: 'AI-generated recipes available', icon: Sparkles },
  { value: '4 hrs', label: 'Saved per week on meal planning', icon: Clock },
  { value: '10k+', label: 'Community recipes shared', icon: Users },
];

export const stepCards = [
  {
    number: '01',
    title: 'Add your pantry',
    text: 'Scan, type, or paste in what you already have and let PantryPal organize it.',
    image: addYourPantryImage,
  },
  {
    number: '02',
    title: 'Discover recipes',
    text: 'Get recipes matched to what is available, what is expiring soon, and what you like.',
    image: discoverRecipesImage,
  },
  {
    number: '03',
    title: 'Cook with confidence',
    text: 'Follow a clean plan for meals, grocery gaps, and leftover-friendly prep.',
    image: cookWithConfidenceImage,
  },
];

export const testimonialCards = [
  {
    quote:
      'PantryPal made our weekly cooking less chaotic. I spend less time wondering what to cook and more time actually cooking.',
    name: 'Amina R.',
    role: 'Home cook',
  },
  {
    quote:
      'The orange-and-black interface is sharp, and the pantry logic is exactly what we needed to cut waste.',
    name: 'Jordan T.',
    role: 'Meal planner',
  },
  {
    quote:
      'It feels lightweight but powerful. The recipe suggestions are practical, not random.',
    name: 'Mei L.',
    role: 'Busy parent',
  },
];
