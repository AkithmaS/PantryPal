import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import loginBackground from '../../assets/brooke-lark-HlNcigvUi4Q-unsplash.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const token = response?.data?.data?.token;
      if (token) {
        localStorage.setItem('pantrypal_token', token);
      }

      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8f0] text-[#111111]">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={loginBackground}
            alt="Fresh ingredients on a kitchen counter"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,240,0.92)_0%,rgba(255,248,240,0.8)_40%,rgba(255,248,240,0.28)_68%,rgba(255,248,240,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.12),_transparent_30%)]" />
        </div>

        <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8 lg:py-16">
          <div className="max-w-2xl pt-6 lg:pt-0">
            <p className="inline-flex items-center rounded-full border border-[#ff7a18]/20 bg-white/80 px-4 py-2 text-sm font-medium text-[#d45d10] shadow-[0_10px_24px_rgba(17,17,17,0.06)] backdrop-blur">
              PantryPal
            </p>

            <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight text-[#111111] sm:text-6xl lg:text-7xl">
              Welcome back.
              <span className="block text-[#d45d10]">Pick up where you left off.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#594f46] sm:text-xl">
              Track what you have, find what to cook next, and keep your kitchen organized with a calm, simple workflow.
            </p>
          </div>

          <div className="relative lg:justify-self-end">
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-[#111111]/10 blur-3xl" />
            <div className="rounded-[36px] border border-white/35 bg-[#f5f0ea]/82 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.18)] backdrop-blur-xl sm:p-8 lg:w-[480px]">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d45d10]">Sign in</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
                  Access your pantry
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#5d5148]">
                  Use your account to continue managing meals, recipes, and groceries.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#e6dacf] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#e6dacf] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                  />
                </label>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#d45d10] transition hover:text-[#b94d09]"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error ? <p className="text-sm text-[#b94d09]">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#ff7a18] px-6 py-3.5 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4 text-[#7a6d62]">
                <span className="h-px flex-1 bg-[#d8cdc0]" />
                <span className="text-sm">or</span>
                <span className="h-px flex-1 bg-[#d8cdc0]" />
              </div>

              <p className="text-center text-sm text-[#5d5148]">
                New here?{' '}
                <Link to="/signup" className="font-semibold text-[#d45d10] hover:text-[#b94d09]">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}