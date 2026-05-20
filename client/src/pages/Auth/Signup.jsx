import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import signupBackground from '../../assets/brooke-lark-HlNcigvUi4Q-unsplash.jpg';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);

      await apiClient.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8f0] text-[#111111]">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={signupBackground}
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
              Create your account.
              <span className="block text-[#d45d10]">Start organizing your kitchen.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#594f46] sm:text-xl">
              Set up your PantryPal profile to track ingredients, plan meals, and build a smarter grocery routine.
            </p>
          </div>

          <div className="relative lg:justify-self-end">
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-[#111111]/10 blur-3xl" />
            <div className="rounded-[36px] border border-white/35 bg-[#f5f0ea]/82 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.18)] backdrop-blur-xl sm:p-8 lg:w-[480px]">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d45d10]">Sign up</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
                  Join PantryPal
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#5d5148]">
                  Create your account with a few details to get started.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#e6dacf] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                  />
                </label>

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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#e6dacf] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Confirm Password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#e6dacf] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                  />
                </label>

                {error ? <p className="text-sm text-[#b94d09]">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#ff7a18] px-6 py-3.5 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-[#5d5148]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#d45d10] hover:text-[#b94d09]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}