'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/skill';
import { 
  formatNumber, 
  getAuditStatusColor, 
  truncateText, 
  getPlatformIcon 
} from '@/lib/utils';
import { 
  X, 
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
  Terminal,
  Globe,
  Github,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface SkillModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillModal({ skill, isOpen, onClose }: SkillModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'security'>('overview');

  if (!skill || !isOpen) return null;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(skill.installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const getAuditIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Warn':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{skill.name}</h2>
                  <p className="text-blue-100 text-sm">by {skill.owner}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mt-4 bg-white/10 p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'details', label: 'Details' },
                { id: 'security', label: 'Security' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-white text-blue-600' 
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <Download className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{skill.stats.installsWeeklyText}</div>
                    <div className="text-sm text-gray-600">Weekly Downloads</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{formatNumber(skill.stats.stars)}</div>
                    <div className="text-sm text-gray-600">GitHub Stars</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">#{skill.rank}</div>
                    <div className="text-sm text-gray-600">Ranking</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{skill.summary}</p>
                </div>

                {/* Install Command */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Installation</h3>
                  <div className="bg-gray-900 rounded-lg p-4 relative group">
                    <code className="text-green-400 font-mono text-sm break-all">
                      {skill.installCommand}
                    </code>
                    <button
                      onClick={handleCopyCommand}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                      title="Copy command"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-green-600 text-sm mt-2 animate-fade-in">
                      ✅ Command copied to clipboard!
                    </p>
                  )}
                </div>

                {/* Platform Distribution */}
                {skill.installedOn && skill.installedOn.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Platform Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {skill.installedOn.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getPlatformIcon(platform.platform)}</span>
                            <span className="font-medium capitalize">{platform.platform}</span>
                          </div>
                          <span className="text-gray-600 font-mono text-sm">{platform.installsText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium">{skill.owner}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Github className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Repository:</span>
                        <span className="font-medium">{skill.repository}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">First seen:</span>
                        <span className="font-medium">{skill.firstSeen}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Source:</span>
                        <span className="font-medium capitalize">{skill.source}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weekly Downloads:</span>
                        <span className="font-medium">{skill.stats.installsWeekly.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">GitHub Stars:</span>
                        <span className="font-medium">{skill.stats.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ranking:</span>
                        <span className="font-medium">#{skill.rank}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Platforms:</span>
                        <span className="font-medium">{skill.installedOn.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {skill.tags && skill.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {skill.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Content Preview */}
                {skill.skillFile && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Content Preview</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {truncateText(skill.skillFile.rawText, 500)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Security Audits</h3>
                  {skill.audits && skill.audits.length > 0 ? (
                    <div className="space-y-3">
                      {skill.audits.map((audit, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getAuditIcon(audit.status)}
                            <div>
                              <div className="font-medium text-gray-900">{audit.name}</div>
                              <div className={`text-sm ${audit.status === 'Pass' ? 'text-green-600' : audit.status === 'Warn' ? 'text-yellow-600' : 'text-red-600'}`}>
                                Status: {audit.status}
                              </div>
                            </div>
                          </div>
                          <a
                            href={audit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No security audit information available.</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Security Information</h4>
                      <p className="text-blue-800 text-sm">
                        All skills undergo security audits by trusted third-party services. 
                        Check individual audit reports for detailed security assessments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-gray-50 px-6 py-4 flex gap-3">
            <a
              href={skill.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
            >
              View on Skills.sh
            </a>
            {skill.raw?.repositoryUrl && (
              <a
                href={skill.raw.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}