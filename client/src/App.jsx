import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import MyRecipes from './pages/Recipes/Recipe-home';
import AllRecipes from './pages/Recipes/AllRecipes';
import MealPlan from './pages/MealPlan';
import ShoppingList from './pages/ShoppingList';
import Settings from './pages/Settings';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AIGenerator from './pages/Recipes/AIGenerator';
import ManualAdd from './pages/Recipes/ManualAdd';
import SearchRecipes from './pages/Recipes/CommunityRecipes';
import RecipeDetails from './pages/Recipes/RecipeDetails';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

function PublicShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff8f0] text-stone-900">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function PrivateShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff8f0] text-stone-900">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicShell>
            <Landing />
          </PublicShell>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <PrivateShell>
            <Dashboard />
          </PrivateShell>
        }
      />
      <Route
        path="/pantry"
        element={
          <PrivateShell>
            <Pantry />
          </PrivateShell>
        }
      />
      <Route
        path="/pantry/expiring"
        element={
          <PrivateShell>
            <Pantry filter="expiring" />
          </PrivateShell>
        }
      />
      <Route
        path="/pantry/running-low"
        element={
          <PrivateShell>
            <Pantry filter="running-low" />
          </PrivateShell>
        }
      />
      <Route
        path="/recipes"
        element={
          <PrivateShell>
            <MyRecipes />
          </PrivateShell>
        }
      />
      <Route
        path="/recipes/all"
        element={
          <PrivateShell>
            <AllRecipes />
          </PrivateShell>
        }
      />
      <Route
        path="/meal-plan"
        element={
          <PrivateShell>
            <MealPlan />
          </PrivateShell>
        }
      />
      <Route
        path="/shopping"
        element={
          <PrivateShell>
            <ShoppingList />
          </PrivateShell>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateShell>
            <Settings />
          </PrivateShell>
        }
      />
      <Route
        path="/find-recipe/ai"
        element={
          <PrivateShell>
            <AIGenerator />
          </PrivateShell>
        }
      />
      <Route
        path="/find-recipe/manual"
        element={
          <PrivateShell>
            <ManualAdd />
          </PrivateShell>
        }
      />
      <Route
        path="/find-recipe/search"
        element={
          <PrivateShell>
            <SearchRecipes />
          </PrivateShell>
        }
      />
      <Route
        path="/recipes/:id"
        element={
          <PrivateShell>
            <RecipeDetails />
          </PrivateShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}