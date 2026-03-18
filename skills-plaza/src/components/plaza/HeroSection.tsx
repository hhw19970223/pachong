import { type ReactNode } from 'react';
import { ArrowRight, RefreshCw, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { formatNumber } from '@/lib/utils';
import { Skill } from '@/types/skill';

interface HeroSectionProps {
  totalSkills: number;
  totalStars: number;
  verifiedCount: number;
  ownerCount: number;
  topSkill: Skill | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function HeroSection({
  totalSkills,
  totalStars,
  verifiedCount,
  ownerCount,
  topSkill,
  isRefreshing,
  onRefresh,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Curated Skill Market
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
            Browse AI agent skills like a front-page editorial.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            {siteConfig.description} Scan the pulse of the ecosystem, filter by trust
            and momentum, then open any skill for install commands, platform demand,
            and security detail.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#skills-grid"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Explore the plaza
              <ArrowRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10"
            >
              <RefreshCw className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              Refresh live data
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Skills indexed" value={formatNumber(totalSkills)} />
            <MetricCard label="Verified" value={formatNumber(verifiedCount)} />
            <MetricCard label="Maintainers" value={formatNumber(ownerCount)} />
            <MetricCard label="GitHub stars" value={formatNumber(totalStars)} />
          </div>
        </div>

        <aside className="relative rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_120px_rgba(5,10,20,0.55)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/80">
                Live pulse
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What feels hot right now</h2>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 p-2 text-emerald-300">
              <Waypoints className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
                Featured skill
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                {topSkill?.name ?? 'Awaiting incoming data'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {topSkill?.summary ?? 'Pulling the current leader from the live marketplace feed.'}
              </p>
              {topSkill ? (
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-200">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    #{topSkill.rank} ranked
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {topSkill.stats.installsWeeklyText} weekly installs
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {topSkill.owner}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SignalCard
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Trust signal"
                value={`${formatNumber(verifiedCount)} fully passed`}
                description="Skills with clean audit coverage across providers."
              />
              <SignalCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Depth"
                value={`${formatNumber(totalSkills)} entries`}
                description="A broad catalog spanning utility, dev, SEO, and design workflows."
              />
            </div>

            <a
              href={`${siteConfig.apiUrl}/api/skills/cache`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition hover:text-cyan-100"
            >
              Open raw cache feed
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SignalCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-cyan-200">
        {icon}
        <span className="text-xs uppercase tracking-[0.22em] text-slate-300">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
