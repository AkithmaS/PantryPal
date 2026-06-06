import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, LoaderCircle, Lock } from 'lucide-react';
import apiClient from '../../api/client.js';
import loginBackground from '../../assets/brooke-lark-HlNcigvUi4Q-unsplash.jpg';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ newPassword: false, confirmPassword: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.newPassword || !form.confirmPassword) {
      setError('Both fields are required.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
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
            alt="Kitchen background"
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
              Choose a new
              <span className="block text-[#d45d10]">password.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#594f46] sm:text-xl">
              Pick something strong and unique. You'll use it the next time you sign in.
            </p>
          </div>

          <div className="relative lg:justify-self-end">
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-[#111111]/10 blur-3xl" />
            <div className="rounded-[36px] border border-white/35 bg-[#f5f0ea]/82 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.18)] backdrop-blur-xl sm:p-8 lg:w-[480px]">

              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff4ea] shadow-[0_12px_28px_rgba(255,122,24,0.18)]">
                    <CheckCircle2 className="h-10 w-10 text-[#ff7a18]" />
                  </div>
                  <h2 className="mt-6 font-display text-3xl font-semibold text-[#111111]">
                    Password updated!
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#5d5148]">
                    Your password has been reset successfully. Redirecting you to Sign In…
                  </p>
                  <Link
                    to="/login"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition hover:-translate-y-0.5"
                  >
                    Sign In now
                  </Link>
                </motion.div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d45d10]">
                      Account Recovery
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
                      New password
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[#5d5148]">
                      Enter and confirm your new password below.
                    </p>
                  </div>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* New password */}
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4c4038]">
                        New password
                      </span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f6a4b]" />
                        <input
                          type={show.newPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={form.newPassword}
                          onChange={handleChange}
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-[#e6dacf] bg-white py-3 pl-11 pr-12 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShow('newPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#8f6a4b] transition hover:bg-[#fff4ea]"
                        >
                          {show.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    {/* Confirm password */}
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4c4038]">
                        Confirm password
                      </span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f6a4b]" />
                        <input
                          type={show.confirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat your password"
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-[#e6dacf] bg-white py-3 pl-11 pr-12 text-sm text-[#111111] outline-none transition focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShow('confirmPassword')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#8f6a4b] transition hover:bg-[#fff4ea]"
                        >
                          {show.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    {error && (
                      <p className="rounded-xl bg-[#fff1f1] px-4 py-3 text-sm font-medium text-[#c64545]">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Updating…
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-medium text-[#5d5148] transition hover:text-[#d45d10]">
                      Back to Sign In
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
