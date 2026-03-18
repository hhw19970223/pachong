'use client';

import { type ReactNode, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Layers3,
  Star,
  XCircle,
} from 'lucide-react';
import { Skill } from '@/types/skill';
import {
  formatNumber,
  getAuditStatusColor,
  getOverallAuditStatus,
  getPlatformIcon,
  getRelativeTime,
  truncateText,
} from '@/lib/utils';

interface SkillCardProps {
  skill: Skill;
  onViewDetails?: (skill: Skill) => void;
}

export function SkillCard({ skill, onViewDetails }: SkillCardProps) {
  const [copied, setCopied] = useState(false);
  const overallStatus = getOverallAuditStatus(skill.audits);
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
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.88),rgba(8,12,24,0.96))] p-6 shadow-[0_25px_80px_rgba(3,7,18,0.45)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_24%)] opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
              Rank #{skill.rank}
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white transition group-hover:text-cyan-100">
                {skill.name}
              </h3>
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-100"
              >
                <Layers3 className="h-4 w-4" />
                {skill.owner}
              </a>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getAuditStatusColor(
              overallStatus
            )}`}
          >
            {getStatusIcon(overallStatus)}
            <span>{overallStatus}</span>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-300">
          {truncateText(skill.summary, 140)}
        </p>

        {skill.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {skill.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <StatPanel
            icon={<Download className="h-4 w-4 text-emerald-300" />}
            label="Weekly installs"
            value={skill.stats.installsWeeklyText}
          />
          <StatPanel
            icon={<Star className="h-4 w-4 text-amber-300" />}
            label="GitHub stars"
            value={formatNumber(skill.stats.stars)}
          />
        </div>

        {skill.installedOn.length > 0 ? (
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Globe className="h-3.5 w-3.5" />
              Popular on
            </div>
            <div className="flex flex-wrap gap-2">
              {skill.installedOn.slice(0, 3).map((platform) => (
                <span
                  key={platform.platform}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                >
                  <span>{getPlatformIcon(platform.platform)}</span>
                  {platform.platform}
                  <span className="text-slate-400">{platform.installsText}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          Added {getRelativeTime(skill.firstSeen)}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onViewDetails?.(skill)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            Open brief
            <ArrowUpRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyCommand}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            title="Copy install command"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-emerald-300" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          <a
            href={skill.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            title="Open in Skills.sh"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {copied ? (
          <div className="mt-3 text-xs text-emerald-300 animate-fade-in">
            Install command copied to clipboard.
          </div>
        ) : null}
      </div>
    </article>
  );
}

function getStatusIcon(status: Skill['audits'][number]['status']) {
  switch (status) {
    case 'Pass':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'Warn':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'Fail':
      return <XCircle className="h-4 w-4 text-red-600" />;
  }
}

function StatPanel({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}