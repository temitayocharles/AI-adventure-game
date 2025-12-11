
import React, { useState, useEffect, useRef } from 'react';
import { LevelData, AvatarConfig, WorldData, WeatherType, Season, GameSettings } from '../types';
import { Button } from '../components/Button';
import { SprinkleTutorial } from '../components/SprinkleTutorial';
import { NPCDialog } from '../components/NPCDialog';
import { ArrowLeft, CheckCircle, Cloud, Sun, Moon, Loader2, MessageSquare } from 'lucide-react';
import { playSfx } from '../services/soundService';
import { gameAPI } from '../services/gameAPI';
import { aiService } from '../services/aiService';
import { LevelEngine } from '../services/levelEngine';
import { WORLDS } from '../services/mockData';
import { PixelPlayer, PixelMonkey, PixelBanana, PixelKey, PixelGem, PixelCactus, PixelTree, PixelWood, PixelMetal } from '../components/PixelAssets';

interface Props {
  level: LevelData;
  avatarConfig: AvatarConfig;
  settings: GameSettings;
  onExit: () => void;
  onComplete: (resources: {wood: number, stone: number, metal: number}) => void;
  onCollectResource: (type: 'wood' | 'stone' | 'metal') => void;
  isFirstTime: boolean;
}

export const LevelView: React.FC<Props> = ({ level, avatarConfig, settings, onExit, onComplete, onCollectResource, isFirstTime }) => {
  const [loading, setLoading] = useState(false);
  const [currentLevelData, setCurrentLevelData] = useState<LevelData>(level);
  const [progress, setProgress] = useState(0);
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [tutorialStep, setTutorialStep] = useState(isFirstTime ? 0 : -1);
  const [gameTime, setGameTime] = useState(8); 
  const [lootMessage, setLootMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LevelEngine | null>(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showNPC, setShowNPC] = useState(false);
  const [npcType, setNpcType] = useState<'sprinkle' | 'elder' | 'merchant' | 'guardian'>('sprinkle');
  const [levelStartTime, setLevelStartTime] = useState<number>(Date.now());
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Initialize LevelEngine
  useEffect(() => {
    if (!canvasRef.current || !isGameActive) return;

    const levelMetadata = currentLevelData.meta || {
      platforms: [
        { x: 0, y: 300, w: 800, h: 20 },
        { x: 150, y: 250, w: 100, h: 20 },
        { x: 350, y: 200, w: 100, h: 20 }
      ],
      goal: { x: 700, y: 50, w: 50, h: 50 }
    };

    try {
      engineRef.current = new LevelEngine({
        canvas: canvasRef.current,
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight,
        metadata: levelMetadata,
        onGoalReached: handleGoalReached
      });

      console.log('✅ LevelEngine initialized for level:', currentLevelData.title);
    } catch (err) {
      console.error('❌ Failed to initialize LevelEngine:', err);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [currentLevelData, isGameActive]);

  // Handle goal reached (level completion)
  const handleGoalReached = async () => {
    setIsGameActive(false);
    playSfx('win');
    
    const completionTime = (Date.now() - levelStartTime) / 1000;
    console.log('🎉 Goal reached! Level:', currentLevelData.title, `Time: ${completionTime}s, Attempts: ${attemptCount}`);
    
    try {
      // Call API to mark level as completed
      const result = await gameAPI.completeLevel(String(currentLevelData.id));
      console.log('✅ Level completion recorded:', result);
      
      // Calculate adaptive difficulty based on performance
      try {
        const difficulty = await aiService.getAdaptiveDifficulty(
          currentLevelData.id,
          Math.round(completionTime),
          attemptCount,
          5 // Default player skill level
        );
        console.log('📊 Adaptive difficulty:', difficulty.recommendation);
      } catch (diffErr) {
        console.warn('ℹ️ Adaptive difficulty calculation skipped:', diffErr);
      }
      
      // Trigger level complete callback
      setTimeout(() => {
        onComplete({ wood: 0, stone: 0, metal: 0 });
      }, 1500);
    } catch (err) {
      console.error('❌ Failed to complete level:', err);
      onComplete({ wood: 0, stone: 0, metal: 0 }); // Complete anyway
    }
  };
  
  // Load AI level if dynamic - DISABLED (server-side generation recommended instead)
  useEffect(() => {
    const loadLevel = async () => {
       if (level.worldId !== 'dynamic' && !level.isGenerated) return;
       
       // Note: Dynamic level generation via AI is now server-side.
       // For demo, we'll just use the client-provided level.
       // To enable: uncomment server call to /api/v1/ai/generateLevel
       setCurrentLevelData(level);
    };
    loadLevel();
  }, [level]);

  // World Context
  const worldData = WORLDS.find(w => w.id === currentLevelData.worldId) || WORLDS[0];

  // Day/Night Cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(prev => {
        const next = prev + 0.05; 
        return next >= 24 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Sky Color
  const getSkyColor = () => {
    if (gameTime >= 6 && gameTime < 17) return 'from-sky-300 to-blue-500'; 
    if (gameTime >= 17 && gameTime < 20) return 'from-orange-400 to-purple-600'; 
    if (gameTime >= 20 || gameTime < 5) return 'from-slate-900 to-slate-800'; 
    return 'from-indigo-400 to-sky-300';
  };

  const handleTutorialNext = () => setTutorialStep(prev => prev + 1);

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tutorialStep === 0) return;
    if (tutorialStep === 1) handleTutorialNext();

    playSfx('step');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlayerPos({ x, y });
  };

  const handleLoot = (e: React.MouseEvent, type: 'wood' | 'stone' | 'metal') => {
    e.stopPropagation();
    playSfx('collect');
    onCollectResource(type);
    setLootMessage(`+1 ${type.toUpperCase()}`);
    setTimeout(() => setLootMessage(null), 1000);
  };

  const handleItemClick = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    if (tutorialStep >= 0 && tutorialStep < 2) return;
    if (tutorialStep === 2) setTutorialStep(-1);
    if (foundItems.includes(item)) return;

    playSfx('collect');
    const newFound = [...foundItems, item];
    setFoundItems(newFound);
    const newProgress = (newFound.length / 3) * 100; 
    setProgress(newProgress);
    
    if (newProgress >= 100) {
      setTimeout(() => playSfx('win'), 500);
      setTimeout(() => onComplete({wood: 0, stone: 0, metal: 0}), 2000); // Pass session loot here ideally
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 size={48} className="animate-spin text-hero-blue mb-4" />
        <h2 className="text-xl font-bold">Generating unique challenge...</h2>
        <p className="text-slate-400">Sprinkle is thinking!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      
      {/* Tutorial */}
      {tutorialStep >= 0 && tutorialStep < 3 && (
        <div className="absolute inset-0 z-50 pointer-events-none">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto" />
           <SprinkleTutorial 
             step={tutorialStep} 
             totalSteps={3} 
             text={["Welcome Hero! Tap ground to move.", "Find items to win!", "Click trees for wood!"][tutorialStep]} 
             onNext={handleTutorialNext} 
           />
        </div>
      )}

      {/* HUD */}
      <div className="h-16 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 border-b border-slate-700 z-40 absolute top-0 w-full shadow-lg">
        <Button size="sm" variant="glass" onClick={onExit} icon={<ArrowLeft size={16} />}>Exit</Button>
        <div className="flex items-center gap-4">
          <Button 
            size="sm" 
            variant="glass" 
            onClick={() => setShowNPC(true)}
            icon={<MessageSquare size={16} />}
            title="Talk to Sprinkle for hints"
          >
            Help
          </Button>
          <div className="bg-black/30 px-3 py-1 rounded-full flex items-center gap-2 text-white text-xs font-bold border border-white/10">
            {gameTime > 6 && gameTime < 18 ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-blue-200" />}
            {Math.floor(gameTime)}:00
          </div>
          <div className="text-white font-bold hidden sm:block drop-shadow-md">{currentLevelData.title}</div>
          <div className="w-24 h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <div className="h-full bg-hero-green transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Game World */}
      <div className="flex-1 relative overflow-hidden touch-none select-none bg-gradient-to-b from-sky-400 to-blue-500 z-10">
        {/* Tutorial */}
        {tutorialStep >= 0 && tutorialStep < 3 && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto" />
            <SprinkleTutorial 
              step={tutorialStep} 
              totalSteps={3} 
              text={["Use Arrow Keys or WASD to move", "Press Space to jump", "Reach the gold square to win!"][tutorialStep]} 
              onNext={handleTutorialNext} 
            />
          </div>
        )}

        {/* PixiJS Canvas */}
        <canvas 
          ref={canvasRef}
          className="w-full h-full absolute inset-0"
          style={{ display: 'block', background: 'transparent' }}
        />

        {/* Completion Overlay */}
        {!isGameActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-slate-900 border-2 border-hero-green rounded-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-hero-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Level Complete!</h2>
              <p className="text-slate-300">Returning to world map...</p>
            </div>
          </div>
        )}
      </div>

      {/* HUD */}
      <div className="h-16 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 border-t border-slate-700 z-40 shadow-lg">
        <Button size="sm" variant="glass" onClick={onExit} icon={<ArrowLeft size={16} />}>Exit</Button>
        <div className="flex items-center gap-4">
          <Button 
            size="sm" 
            variant="glass" 
            onClick={() => setShowNPC(true)}
            icon={<MessageSquare size={16} />}
            title="Talk to Sprinkle for hints"
          >
            Help
          </Button>
          <div className="bg-black/30 px-3 py-1 rounded-full flex items-center gap-2 text-white text-xs font-bold border border-white/10">
            {gameTime > 6 && gameTime < 18 ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-blue-200" />}
            {Math.floor(gameTime)}:00
          </div>
          <div className="text-white font-bold hidden sm:block drop-shadow-md">{currentLevelData.title}</div>
        </div>
      </div>

      {/* NPC Dialog */}
      <NPCDialog 
        npcId={npcType}
        isOpen={showNPC}
        onClose={() => setShowNPC(false)}
        context={{
          currentLevel: currentLevelData.id,
          worldId: currentLevelData.worldId,
          playerStats: { skill: 5, attempts: attemptCount }
        }}
      />
    </div>
  );
};
