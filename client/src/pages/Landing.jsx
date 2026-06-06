import { motion } from 'framer-motion';
import {
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/icon.png';
import heroBackground from '../assets/brooke-lark-jUPOXXRNdcA-unsplash.jpg';
import ctaBackground from '../assets/new.jpg';
import {
  featureCards,
  stepCards,
  testimonialCards,
} from '../data/landingContent';
import {
  FeatureCard,
  StepCard,
  TestimonialCard,
} from '../components/landing/LandingCards';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const MotionLink = motion(Link);

export default function Landing() {
  return (
    <div className="overflow-hidden bg-[#fff8f0]">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBackground}
            alt="Fresh ingredients and produce"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,240,0.95)_0%,rgba(255,248,240,0.82)_35%,rgba(255,248,240,0.22)_68%,rgba(255,248,240,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,24,0.12),_transparent_28%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[680px] w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-4"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfa14d] shadow-[0_10px_24px_rgba(17,17,17,0.08)]">
                <img src={logoIcon} alt="PantryPal logo" className="h-8 w-8 object-contain" />
              </span>
              <span className="text-4xl font-semibold tracking-tight text-[#111111]">
                PantryPal
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-5xl font-semibold tracking-tight text-[#111111] sm:text-6xl lg:text-7xl"
            >
              Cook smarter.
              <span className="block text-[#d45d10]">Waste less.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg leading-8 text-[#594f46] sm:text-xl"
            >
              PantryPal helps you track what you own, find what to cook next, and build shopping
              lists around real needs instead of guesswork.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <MotionLink
                to="/login"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-7 py-3.5 text-sm font-semibold text-[#111111] shadow-[0_18px_35px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </MotionLink>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d45d10]">Why it works</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
              Smart kitchen tools without the clutter
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5d5148] sm:text-lg">
              Designed for quick decisions, clear visuals, and a pantry workflow that feels calm even on busy days.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp} whileHover={{ y: -6 }}>
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
            className="rounded-[40px] border border-black/5 bg-white/78 px-6 py-12 shadow-[0_24px_60px_rgba(17,17,17,0.07)] sm:px-8 lg:px-10"
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d45d10]">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
              Three steps to a calmer kitchen
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {stepCards.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d45d10]">Loved by home cooks</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
              Built for real kitchens and real routines
            </h2>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3">
            {testimonialCards.map((testimonial) => (
              <motion.div key={testimonial.name} variants={fadeUp}>
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[38px] px-6 py-12 text-white shadow-[0_28px_70px_rgba(17,17,17,0.22)] sm:px-10"
        >
          <div className="absolute inset-0">
            <img
              src={ctaBackground}
              alt="Fresh produce background"
              className="h-full w-full scale-105 object-cover object-center brightness-[0.72] saturate-[1.15]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.92)_0%,rgba(17,17,17,0.8)_38%,rgba(17,17,17,0.55)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,122,24,0.28),_transparent_34%)]" />
          </div>
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#ff7a18]/22 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ffb17a]">
                Ready to transform your kitchen?
              </p>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
                Start tracking, planning, and cooking with less waste.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_16px_30px_rgba(255,122,24,0.28)] transition-transform hover:-translate-y-0.5"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white/90 transition-transform hover:-translate-y-0.5"
              >
                Log In
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}