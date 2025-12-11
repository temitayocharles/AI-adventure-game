/**
 * services/multiplayerService.ts
 * Client-side WebSocket connection and multiplayer events
 */

import io, { Socket } from 'socket.io-client';

export interface PlayerState {
  playerId: number;
  username: string;
  position: { x: number; y: number };
  levelId?: number;
  xp: number;
}

export interface LeaderboardEntry {
  playerId: number;
  username: string;
  xp: number;
  rank?: number;
}

export interface Achievement {
  playerId: number;
  username: string;
  event: string;
  levelId: number;
  xp: number;
  timestamp: Date;
}

export interface Challenge {
  challenger: {
    playerId: number;
    username: string;
  };
  levelId: number;
  challengeId: string;
}

class MultiplayerService {
  private socket: Socket | null = null;
  private connected = false;
  private playerId: number | null = null;
  private username: string | null = null;
  private currentWorldId: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(serverUrl = 'http://localhost:4000') {
    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ Connected to multiplayer server');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('❌ Disconnected from multiplayer server');
      this.emit('disconnected');
    });

    this.socket.on('player-joined', (data: PlayerState) => {
      this.emit('player-joined', data);
    });

    this.socket.on('player-moved', (data: PlayerState) => {
      this.emit('player-moved', data);
    });

    this.socket.on('player-left', (data: { playerId: number; username: string }) => {
      this.emit('player-left', data);
    });

    this.socket.on('world-state', (data: { players: PlayerState[] }) => {
      this.emit('world-state', data);
    });

    this.socket.on('leaderboard', (data: { worldId: string; players: LeaderboardEntry[] }) => {
      this.emit('leaderboard', data);
    });

    this.socket.on('leaderboard-update', (data: LeaderboardEntry) => {
      this.emit('leaderboard-update', data);
    });

    this.socket.on('achievement', (data: Achievement) => {
      this.emit('achievement', data);
    });

    this.socket.on('challenge-received', (data: Challenge) => {
      this.emit('challenge-received', data);
    });

    this.socket.on('match-completed', (data: { winner: number; loser: number; levelId: number }) => {
      this.emit('match-completed', data);
    });

    this.socket.on('chat-received', (data: { playerId: number; username: string; message: string; timestamp: Date }) => {
      this.emit('chat-received', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Join a world (starts multiplayer session)
   */
  public joinWorld(playerId: number, username: string, worldId: string) {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ Not connected to multiplayer server');
      return;
    }

    this.playerId = playerId;
    this.username = username;
    this.currentWorldId = worldId;

    this.socket.emit('join-world', { playerId, username, worldId });
    console.log(`✅ Joined world ${worldId} as ${username}`);
  }

  /**
   * Send position update (broadcast to all players in world)
   */
  public updatePosition(position: { x: number; y: number }, levelId: number) {
    if (!this.socket) return;

    this.socket.emit('position-update', { position, levelId });
  }

  /**
   * Report level completion
   */
  public completeLevel(levelId: number, xp: number) {
    if (!this.socket || !this.currentWorldId) return;

    this.socket.emit('level-completed', {
      levelId,
      worldId: this.currentWorldId,
      xp
    });

    console.log(`✅ Reported level ${levelId} completion (+${xp} XP)`);
  }

  /**
   * Challenge another player to a PvP match
   */
  public challengePlayer(targetPlayerId: number, levelId: number) {
    if (!this.socket) return;

    this.socket.emit('challenge-player', { targetPlayerId, levelId });
    console.log(`⚔️ Challenged player ${targetPlayerId} in level ${levelId}`);
  }

  /**
   * Report PvP match result
   */
  public reportMatchResult(winnerId: number, loserId: number, levelId: number) {
    if (!this.socket || !this.currentWorldId) return;

    this.socket.emit('match-result', {
      winnerId,
      loserId,
      levelId,
      worldId: this.currentWorldId
    });
  }

  /**
   * Send chat message
   */
  public sendMessage(message: string) {
    if (!this.socket || !this.currentWorldId) return;

    this.socket.emit('chat-message', { message, worldId: this.currentWorldId });
  }

  /**
   * Register event listener
   */
  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: Function) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any) {
    if (!this.listeners.has(event)) return;

    for (const callback of this.listeners.get(event)!) {
      callback(data);
    }
  }

  /**
   * Disconnect from server
   */
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current player ID
   */
  public getPlayerId(): number | null {
    return this.playerId;
  }

  /**
   * Get current world ID
   */
  public getWorldId(): string | null {
    return this.currentWorldId;
  }
}

// Singleton instance
let multiplayerService: MultiplayerService | null = null;

export function getMultiplayerService(): MultiplayerService {
  if (!multiplayerService) {
    multiplayerService = new MultiplayerService();
  }
  return multiplayerService;
}

export default MultiplayerService;
