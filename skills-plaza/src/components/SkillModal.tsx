'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  Github,
  Globe,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import { Skill } from '@/types/skill';
import {
  formatNumber,
  getPlatformIcon,
  truncateText,
} from '@/lib/utils';

interface SkillModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'overview' | 'details' | 'security';

const TABS: Array<{ id: ModalTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'security', label: 'Security' },
];

export function SkillModal({ skill, isOpen, onClose }: SkillModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!skill || !isOpen) {
    return null;
  }

  const repositoryUrl =
    skill.raw?.repositoryUrl || `https://github.com/${skill.repository}`;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(skill.installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy command:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(7,11,20,0.98))] shadow-[0_40px_120px_rgba(2,6,23,0.7)]">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-100">
                Skill briefing
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white">{skill.name}</h2>
              <p className="mt-2 text-sm text-slate-400">
                Maintained by {skill.owner} • Ranked #{skill.rank}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm transition ${
                  activeTab === tab.id
                    ? 'border-cyan-300/40 bg-cyan-300/12 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="scrollbar-thin overflow-y-auto px-6 py-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricTile
                  icon={<Download className="h-5 w-5 text-emerald-300" />}
                  label="Weekly installs"
                  value={skill.stats.installsWeeklyText}
                />
                <MetricTile
                  icon={<Star className="h-5 w-5 text-amber-300" />}
                  label="GitHub stars"
                  value={formatNumber(skill.stats.stars)}
                />
                <MetricTile
                  icon={<TrendingUp className="h-5 w-5 text-cyan-300" />}
                  label="Current rank"
                  value={`#${skill.rank}`}
                />
              </div>

              <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
                  Summary
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{skill.summary}</p>
              </section>

              <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
                      Install command
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Copy the command and drop it into your terminal or agent workflow.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <code className="mt-4 block overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm leading-6 text-emerald-300">
                  {skill.installCommand}
                </code>
              </section>

              {skill.installedOn.length > 0 ? (
                <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
                    Platform footprint
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {skill.installedOn.map((platform) => (
                      <div
                        key={platform.platform}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 text-slate-200">
                          <span className="text-lg">{getPlatformIcon(platform.platform)}</span>
                          <span>{platform.platform}</span>
                        </div>
                        <span className="text-sm text-slate-400">{platform.installsText}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'details' ? (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  title="Catalog facts"
                  rows={[
                    {
                      icon: <Github className="h-4 w-4" />,
                      label: 'Repository',
                      value: skill.repository,
                    },
                    {
                      icon: <Calendar className="h-4 w-4" />,
                      label: 'First seen',
                      value: skill.firstSeen,
                    },
                    {
                      icon: <Globe className="h-4 w-4" />,
                      label: 'Source',
                      value: skill.source,
                    },
                    {
                      icon: <Sparkles className="h-4 w-4" />,
                      label: 'Platforms',
                      value: String(skill.installedOn.length),
                    },
                  ]}
                />

                <InfoCard
                  title="Adoption"
                  rows={[
                    {
                      icon: <Download className="h-4 w-4" />,
                      label: 'Weekly installs',
                      value: skill.stats.installsWeekly.toLocaleString(),
                    },
                    {
                      icon: <Star className="h-4 w-4" />,
                      label: 'GitHub stars',
                      value: skill.stats.stars.toLocaleString(),
                    },
                    {
                      icon: <TrendingUp className="h-4 w-4" />,
                      label: 'Rank',
                      value: `#${skill.rank}`,
                    },
                    {
                      icon: <ExternalLink className="h-4 w-4" />,
                      label: 'Detail page',
                      value: 'skills.sh',
                    },
                  ]}
                />
              </section>

              {skill.tags.length > 0 ? (
                <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
                    Tags
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-sm text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {skill.skillFile?.rawText ? (
                <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
                    Content preview
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {truncateText(skill.skillFile.rawText, 700)}
                  </p>
                </section>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'security' ? (
            <div className="space-y-6">
              {skill.audits.length > 0 ? (
                <section className="space-y-3">
                  {skill.audits.map((audit) => (
                    <div
                      key={audit.name}
                      className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center gap-3">
                        {getAuditIcon(audit.status)}
                        <div>
                          <div className="font-medium text-white">{audit.name}</div>
                          <div className="text-sm text-slate-400">Status: {audit.status}</div>
                        </div>
                      </div>

                      <a
                        href={audit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </section>
              ) : (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                  No security audit information is available for this skill yet.
                </div>
              )}

              <section className="rounded-[1.75rem] border border-cyan-300/15 bg-cyan-300/10 p-5">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-cyan-200" />
                  <div>
                    <h3 className="font-medium text-white">How to read this panel</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      Treat audit results as one layer of trust. Combine them with the
                      repository history, install momentum, and the actual `SKILL.md`
                      content before adopting a skill into production agents.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row">
          <a
            href={skill.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            View on skills.sh
          </a>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            <Github className="h-4 w-4" />
            Repository
          </a>
        </div>
      </div>
    </div>
  );
}

function getAuditIcon(status: Skill['audits'][number]['status']) {
  switch (status) {
    case 'Pass':
      return <CheckCircle className="h-5 w-5 text-emerald-300" />;
    case 'Warn':
      return <AlertCircle className="h-5 w-5 text-amber-300" />;
    case 'Fail':
      return <XCircle className="h-5 w-5 text-rose-300" />;
  }
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-4 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ icon: React.ReactNode; label: string; value: string }>;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div
            key={`${title}-${row.label}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3"
          >
            <div className="flex items-center gap-3 text-slate-300">
              {row.icon}
              <span>{row.label}</span>
            </div>
            <span className="text-sm font-medium text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}