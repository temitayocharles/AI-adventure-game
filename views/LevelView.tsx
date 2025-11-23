
import React, { useState, useEffect } from 'react';
import { LevelData, AvatarConfig, WorldData, WeatherType, Season, GameSettings } from '../types';
import { Button } from '../components/Button';
import { SprinkleTutorial } from '../components/SprinkleTutorial';
import { ArrowLeft, CheckCircle, Cloud, Sun, Moon, Loader2 } from 'lucide-react';
import { playSfx } from '../services/soundService';
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
      <div 
        className={`flex-1 relative cursor-crosshair overflow-hidden touch-none select-none bg-gradient-to-b transition-colors duration-[2000ms] ${getSkyColor()}`}
        onClick={handleAreaClick}
      >
        {/* Clouds */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
           <Cloud className="absolute top-10 left-10 text-white w-24 h-24 animate-float" style={{ animationDuration: '8s' }} />
        </div>

        {/* Effects Layer (Weather/Seasons) */}
        {settings.enableEffects && (
          <AtmosphereOverlay weather={worldData.weather} season={worldData.season} />
        )}

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-b from-emerald-900/20 to-black/40 pointer-events-none"></div>

        {/* Loot Toast */}
        {lootMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/60 text-hero-yellow font-black px-4 py-2 rounded-full animate-bounce z-50">
            {lootMessage}
          </div>
        )}

        {/* Interactive Scenery (Lootable) */}
        <div 
          onClick={(e) => handleLoot(e, 'wood')}
          className="absolute top-1/4 left-10 w-16 h-16 opacity-90 cursor-pointer hover:scale-105 transition-transform"
        >
           {worldData.id === 'w_4' ? <PixelCactus className="w-full h-full" /> : <PixelTree className="w-full h-full" />}
        </div>
        <div 
          onClick={(e) => handleLoot(e, 'metal')}
          className="absolute bottom-1/3 right-10 w-20 h-20 opacity-90 cursor-pointer hover:scale-105 transition-transform"
        >
           <PixelMetal className="w-full h-full opacity-50" />
        </div>

        {/* Player */}
        <div 
          className="absolute w-16 h-16 transition-all duration-500 ease-out transform -translate-x-1/2 -translate-y-1/2 z-20 drop-shadow-2xl"
          style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
        >
          <PixelPlayer className="w-full h-full" config={avatarConfig} />
        </div>

        {/* Items */}
        {!foundItems.includes('banana') && (
          <div onClick={(e) => handleItemClick(e, 'banana')} className="absolute top-1/3 left-1/3 w-12 h-12 animate-bounce cursor-pointer z-30 filter drop-shadow-lg">
            <PixelBanana className="w-full h-full" />
          </div>
        )}
        {!foundItems.includes('key') && (
          <div onClick={(e) => handleItemClick(e, 'key')} className="absolute top-2/3 left-3/4 w-10 h-10 animate-pulse cursor-pointer z-30 filter drop-shadow-lg">
            <PixelKey className="w-full h-full" />
          </div>
        )}
        {!foundItems.includes('gem') && (
          <div onClick={(e) => handleItemClick(e, 'gem')} className="absolute top-1/2 left-1/2 w-10 h-10 animate-spin-slow cursor-pointer z-30 filter drop-shadow-lg">
            <PixelGem className="w-full h-full" />
          </div>
        )}

        {/* Night Overlay */}
        {(gameTime >= 20 || gameTime < 5) && (
           <div className="absolute inset-0 bg-indigo-950/60 pointer-events-none z-30 mix-blend-multiply" />
        )}
        {(gameTime >= 19 || gameTime < 6) && (
          <div 
            className="absolute w-64 h-64 bg-yellow-200/20 rounded-full blur-2xl pointer-events-none z-30 mix-blend-overlay transition-all duration-500"
             style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
      </div>
    </div>
  );
};

const AtmosphereOverlay: React.FC<{weather: WeatherType, season: Season}> = ({ weather, season }) => {
  if (weather === 'clear' && season !== 'autumn') return null;
  // Simple particle system for demo
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i}
          className={`absolute top-0 ${
            weather === 'rain' ? 'w-[1px] h-4 bg-blue-400/50 animate-weather-fall' : 
            weather === 'snow' ? 'w-2 h-2 bg-white/80 rounded-full animate-weather-fall' : 
            weather === 'ash' ? 'w-2 h-2 bg-gray-400 rounded-full animate-weather-fall' :
            season === 'autumn' ? 'w-3 h-3 bg-orange-500 rounded-tl-lg rounded-br-lg animate-leaves' :
            ''
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};
