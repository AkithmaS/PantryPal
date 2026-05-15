import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export function StarRow() {
  return (
    <div className="flex items-center gap-1 text-[#ff7a18]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}

export function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="group rounded-[28px] border border-black/5 bg-white/85 p-6 shadow-[0_18px_45px_rgba(17,17,17,0.06)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-[#ff7a18] transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-lg font-semibold text-[#111111]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5d5148]">{description}</p>
    </article>
  );
}

export function MetricCard({ value, label, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(17,17,17,0.07)]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-display text-2xl font-semibold text-[#111111]">{value}</div>
      <div className="mt-1 text-sm text-[#6d6259]">{label}</div>
    </div>
  );
}

export function TestimonialCard({ quote, name, role }) {
  return (
    <article className="rounded-[30px] border border-black/5 bg-white/85 p-6 shadow-[0_18px_45px_rgba(17,17,17,0.06)]">
      <StarRow />
      <p className="mt-5 text-sm leading-7 text-[#5d5148]">{quote}</p>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-[#ff7a18]">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-[#111111]">{name}</div>
          <div className="text-sm text-[#7a6f66]">{role}</div>
        </div>
      </div>
    </article>
  );
}

export function StepCard({ number, title, text, image }) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
      }}
      whileHover={{ y: -6 }}
      className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_18px_45px_rgba(17,17,17,0.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4ece4]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.02)_0%,rgba(17,17,17,0.18)_100%)]" />
        <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 font-display text-lg font-semibold text-[#ff7a18] shadow-[0_14px_30px_rgba(17,17,17,0.12)]">
          {number}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="max-w-[85%] font-display text-xl font-semibold text-white drop-shadow-[0_2px_10px_rgba(17,17,17,0.45)]">
            {title}
          </h3>
        </div>
      </div>
      <div className="p-6">
        <p className="mt-4 text-sm leading-6 text-[#5d5148]">{text}</p>
      </div>
    </motion.article>
  );
}