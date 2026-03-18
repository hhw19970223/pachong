'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/skill';
import { 
  formatNumber, 
  getAuditStatusColor, 
  getOverallAuditStatus, 
  truncateText, 
  getPlatformIcon,
  getRelativeTime
} from '@/lib/utils';
import { 
  Star, 
  Download, 
  Shield, 
  ExternalLink, 
  Copy, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Globe
} from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onViewDetails?: (skill: Skill) => void;
}

export function SkillCard({ skill, onViewDetails }: SkillCardProps) {
  const [copied, setCopied] = useState(false);
  const overallStatus = getOverallAuditStatus(skill.audits);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(skill.installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const getStatusIcon = (status: typeof overallStatus) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Warn':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 overflow-hidden">
      {/* Header with rank badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          #{skill.rank}
        </div>
      </div>

      {/* Audit status indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getAuditStatusColor(overallStatus)}`}>
          {getStatusIcon(overallStatus)}
          <span className="capitalize">{overallStatus}</span>
        </div>
      </div>

      <div className="p-6 pt-14">
        {/* Skill header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {skill.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <User className="w-3 h-3" />
                <span className="truncate">{skill.owner}</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncateText(skill.summary, 120)}
          </p>
        </div>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {skill.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
            {skill.tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{skill.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Download className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Downloads:</span>
            <span className="font-semibold text-green-600">{skill.stats.installsWeeklyText}/week</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600">Stars:</span>
            <span className="font-semibold text-yellow-600">{formatNumber(skill.stats.stars)}</span>
          </div>
        </div>

        {/* Platform installations */}
        {skill.installedOn && skill.installedOn.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Popular on:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skill.installedOn.slice(0, 3).map((platform, index) => (
                <div key={index} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-md">
                  <span className="text-sm">{getPlatformIcon(platform.platform)}</span>
                  <span className="text-gray-600 capitalize">{platform.platform}</span>
                  <span className="text-gray-500">({platform.installsText})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* First seen */}
        <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Added {getRelativeTime(skill.firstSeen)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(skill)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
          >
            View Details
          </button>
          
          <button
            onClick={handleCopyCommand}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors duration-200 group/copy"
            title="Copy install command"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 group-hover/copy:text-gray-900" />
            )}
          </button>
          
          <a
            href={skill.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors duration-200"
            title="Open in Skills.sh"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Copy feedback */}
        {copied && (
          <div className="mt-2 text-xs text-green-600 text-center animate-fade-in">
            ✅ Install command copied!
          </div>
        )}
      </div>

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/30 transition-all duration-200 pointer-events-none" />
    </div>
  );
}