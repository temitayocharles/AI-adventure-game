/**
 * components/AchievementsModal.tsx
 * Display and manage player achievements with UI integration
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Unlock, Star, Zap, Shield, Heart, Crown } from 'lucide-react';
import { Button } from './Button';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
  progress?: number; // 0-100
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementsModalProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  onClose: () => void;
}

const ACHIEVEMENT_COLORS = {
  common: 'from-slate-400 to-slate-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600'
};

const RARITY_ICONS = {
  common: <Star size={12} />,
  rare: <Zap size={12} />,
  epic: <Shield size={12} />,
  legendary: <Crown size={12} />
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  unlockedCount,
  totalCount,
  onClose
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlockedAt;
    if (filter === 'locked') return !a.unlockedAt;
    return true;
  });

  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy size={32} className="text-yellow-400" />
              <h1 className="text-2xl font-bold text-white">Achievements</h1>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded hover:bg-slate-700"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-700 rounded-full h-4 overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm mb-6">
            <span className="text-slate-300">
              {unlockedCount} of {totalCount} unlocked
            </span>
            <span className="text-yellow-400 font-bold">{progressPercent}%</span>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                  filter === f
                    ? 'bg-hero-blue text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => {
            const isUnlocked = !!achievement.unlockedAt;
            const gradientClass = ACHIEVEMENT_COLORS[achievement.rarity];

            return (
              <div
                key={achievement.id}
                className={`rounded-lg border p-4 transition-all duration-200 ${
                  isUnlocked
                    ? `bg-gradient-to-br ${gradientClass} border-opacity-100 shadow-lg hover:shadow-xl`
                    : 'bg-slate-700 border-slate-600 opacity-50'
                }`}
              >
                {/* Icon & Rarity */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                    isUnlocked
                      ? 'bg-black/20'
                      : 'bg-slate-600'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    isUnlocked
                      ? 'bg-black/20 text-white'
                      : 'bg-slate-600 text-slate-300'
                  }`}>
                    {RARITY_ICONS[achievement.rarity]}
                    {achievement.rarity}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm mb-3 ${isUnlocked ? 'text-white/80' : 'text-slate-400'}`}>
                  {achievement.description}
                </p>

                {/* Progress Bar (if applicable) */}
                {achievement.progress !== undefined && !isUnlocked && (
                  <div className="bg-black/20 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-white/80 h-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2 text-xs font-bold">
                  {isUnlocked ? (
                    <>
                      <Unlock size={14} />
                      <span>Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Locked</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Lock size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {filter === 'unlocked'
                ? 'No achievements unlocked yet'
                : filter === 'locked'
                ? 'All achievements unlocked!'
                : 'No achievements found'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-700 p-4 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
