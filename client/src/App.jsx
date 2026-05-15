import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import MyRecipes from './pages/MyRecipes';
import MealPlan from './pages/MealPlan';
import Shopping from './pages/Shopping';
import Settings from './pages/Settings';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import AIGenerator from './pages/FindRecipe/AIGenerator';
import ManualAdd from './pages/FindRecipe/ManualAdd';
import SearchRecipes from './pages/FindRecipe/SearchRecipes';
import NavBar from './components/NavBar';

function PublicShell({ children }) {
  return <div className="min-h-screen bg-[#fff8f0] text-stone-900">{children}</div>;
}

function PrivateShell({ children }) {
  return (
    <div className="min-h-screen bg-[#fff8f0] text-stone-900">
      <NavBar />
      <main>{children}</main>
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
        path="/recipes"
        element={
          <PrivateShell>
            <MyRecipes />
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
            <Shopping />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}