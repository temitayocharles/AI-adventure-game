/**
 * components/MultiplayerLeaderboard.tsx
 * Real-time leaderboard showing top players in a world
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';
import { getMultiplayerService } from '../services/multiplayerService';

export interface LeaderboardEntry {
  playerId: number;
  username: string;
  xp: number;
  rank?: number;
}

export interface Props {
  worldId: string;
  currentPlayerId?: number;
  visible: boolean;
}

export const MultiplayerLeaderboard: React.FC<Props> = ({ worldId, currentPlayerId, visible }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activePlayers, setActivePlayers] = useState<number>(0);
  const multiplayer = getMultiplayerService();

  useEffect(() => {
    if (!visible) return;

    const handleLeaderboard = (data: { players: LeaderboardEntry[] }) => {
      const withRank = data.players.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      setLeaderboard(withRank);
    };

    const handleLeaderboardUpdate = (entry: LeaderboardEntry) => {
      setLeaderboard(prev => {
        const updated = prev.map(p => p.playerId === entry.playerId ? { ...p, xp: entry.xp } : p);
        return updated.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
      });
    };

    const handleWorldState = (data: { players: any[] }) => {
      setActivePlayers(data.players.length);
    };

    multiplayer.on('leaderboard', handleLeaderboard);
    multiplayer.on('leaderboard-update', handleLeaderboardUpdate);
    multiplayer.on('world-state', handleWorldState);

    return () => {
      multiplayer.off('leaderboard', handleLeaderboard);
      multiplayer.off('leaderboard-update', handleLeaderboardUpdate);
      multiplayer.off('world-state', handleWorldState);
    };
  }, [visible, multiplayer]);

  if (!visible) return null;

  return (
    <div className="absolute top-20 right-4 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-4 w-64 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-hero-yellow" />
        <h3 className="text-white font-bold">Leaderboard</h3>
        <span className="text-xs text-slate-400 ml-auto">{activePlayers} online</span>
      </div>

      {/* Entries */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboard.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Loading...</p>
        ) : (
          leaderboard.map((entry) => (
            <div
              key={entry.playerId}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                entry.playerId === currentPlayerId
                  ? 'bg-hero-blue/30 border border-hero-blue text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              {/* Rank */}
              <span className="font-bold w-6">
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </span>

              {/* Username */}
              <span className="flex-1 truncate font-medium">{entry.username}</span>

              {/* XP */}
              <span className="text-hero-yellow font-bold">{entry.xp.toLocaleString()} XP</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-xs text-slate-400">
        <Users className="w-4 h-4" />
        <span>Playing in {worldId}</span>
      </div>
    </div>
  );
};
