import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Skill } from '@/types/skill';

export interface SpotlightItem {
  title: string;
  description: string;
  metric: string;
  skill: Skill;
}

interface SpotlightDeckProps {
  items: SpotlightItem[];
  onOpen: (skill: Skill) => void;
}

export function SpotlightDeck({ items, onOpen }: SpotlightDeckProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/80">
            Spotlight
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Fresh angles on the catalog</h2>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 md:inline-flex">
          <Sparkles className="h-4 w-4 text-cyan-200" />
          Curated by momentum, quality, and recency
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={`${item.title}-${item.skill.slug}`}
            type="button"
            onClick={() => onOpen(item.skill)}
            className="group rounded-[1.75rem] border border-white/10 bg-white/6 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">{item.title}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{item.skill.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.skill.owner}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:text-white" />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">{item.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                {item.metric}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                #{item.skill.rank}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
