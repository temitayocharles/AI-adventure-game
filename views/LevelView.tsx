import React, { useState, useEffect, useRef } from 'react';
import { LevelData, AvatarConfig, WorldData, GameSettings } from '../types';
import { Button } from '../components/Button';
import { SprinkleTutorial } from '../components/SprinkleTutorial';
import { NPCDialog } from '../components/NPCDialog';
import { MobileControls } from '../components/MobileControls';
import { ArrowLeft, Sun, Moon, Loader2, MessageSquare, Smartphone } from 'lucide-react';
import { playSfx } from '../services/soundService';
import { gameAPI } from '../services/gameAPI';
import { aiService } from '../services/aiService';
import { LevelEngine } from '../services/levelEngine';
import { ResponsiveCanvasManager } from '../services/responsiveCanvas';
import { WORLDS } from '../services/mockData';

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
  const [tutorialStep, setTutorialStep] = useState(isFirstTime ? 0 : -1);
  const [gameTime, setGameTime] = useState(8); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LevelEngine | null>(null);
  const responsiveManagerRef = useRef<ResponsiveCanvasManager | null>(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showNPC, setShowNPC] = useState(false);
  const [npcType, setNpcType] = useState<'sprinkle' | 'elder' | 'merchant' | 'guardian'>('sprinkle');
  const [levelStartTime, setLevelStartTime] = useState<number>(Date.now());
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Mobile/Responsive State
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [showMobileControls, setShowMobileControls] = useState(false);
  
  // Detect mobile and setup responsive canvas
  useEffect(() => {
    const detectMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      setShowMobileControls(isMobileDevice);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);
    window.addEventListener('orientationchange', detectMobile);

    return () => {
      window.removeEventListener('resize', detectMobile);
      window.removeEventListener('orientationchange', detectMobile);
    };
  }, []);

  // Initialize responsive canvas manager
  useEffect(() => {
    if (!canvasRef.current) return;

    responsiveManagerRef.current = new ResponsiveCanvasManager({
      minWidth: 320,
      minHeight: 240,
      maxWidth: 1920,
      maxHeight: 1440,
      aspectRatio: orientation === 'portrait' ? 0.75 : 16 / 9
    });

    const state = responsiveManagerRef.current.initialize(canvasRef.current);
    console.log('✅ Responsive canvas initialized:', state);

    responsiveManagerRef.current.onOrientationChange(newState => {
      setOrientation(newState.orientation);
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    });

    return () => {
      if (responsiveManagerRef.current) {
        responsiveManagerRef.current.destroy();
      }
    };
  }, [orientation]);
  
  // Fetch level data from API or use provided data
  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        console.log('📡 Initializing level data for:', level.id, 'meta:', level.meta);
        setLoading(true);
        
        // If level already has proper metadata, use it directly
        if (level.meta && level.meta.platforms && level.meta.goal) {
          console.log('✅ Using provided level metadata:', level.meta);
          setCurrentLevelData(level);
          setLoading(false);
          return;
        }
        
        // Try to fetch full level data from API
        try {
          const res = await fetch(`http://localhost:4000/api/v1/levels/${level.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('world_hero_jwt_token')}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            console.log('✅ Level data fetched from API:', data);
            setCurrentLevelData({
              ...level,
              ...(data.level || {}),
              meta: data.level?.meta || level.meta || {}
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('⚠️ API fetch failed:', e);
        }
        
        // Fallback: use AI service to generate level
        try {
          const generated = await aiService.generateLevel(level.worldId || '1', level.difficulty || 'easy');
          console.log('✅ Generated level from AI:', generated);
          setCurrentLevelData({
            ...level,
            meta: generated
          });
        } catch (e) {
          console.warn('⚠️ AI generation failed, using mock fallback');
          // Last resort fallback
          setCurrentLevelData({
            ...level,
            meta: {
              platforms: [
                { x: 0, y: 300, w: 800, h: 20 },
                { x: 150, y: 250, w: 100, h: 20 },
                { x: 350, y: 200, w: 100, h: 20 }
              ],
              goal: { x: 700, y: 50, w: 50, h: 50 }
            }
          });
        }
      } catch (err) {
        console.error('❌ Critical error in level initialization:', err);
        setCurrentLevelData(level);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLevelData();
  }, [level]);
  
  // Initialize LevelEngine
  useEffect(() => {
    if (!canvasRef.current || !isGameActive || !canvasContainerRef.current) return;

    const levelMetadata = currentLevelData.meta || {
      platforms: [
        { x: 0, y: 300, w: 800, h: 20 },
        { x: 150, y: 250, w: 100, h: 20 },
        { x: 350, y: 200, w: 100, h: 20 }
      ],
      goal: { x: 700, y: 50, w: 50, h: 50 }
    };

    // Wait for canvas container to have dimensions
    const initEngine = () => {
      const container = canvasContainerRef.current;
      if (!container || !canvasRef.current) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      // Don't initialize if dimensions are still zero
      if (width === 0 || height === 0) {
        console.warn('⚠️ Container has zero dimensions, retrying...');
        setTimeout(initEngine, 100);
        return;
      }

      console.log('🎮 Canvas dimensions for LevelEngine:', { width, height, meta: levelMetadata });

      try {
        engineRef.current = new LevelEngine({
          canvas: canvasRef.current,
          width,
          height,
          metadata: levelMetadata,
          onGoalReached: handleGoalReached
        });

        console.log('✅ LevelEngine initialized for level:', currentLevelData.title);
      } catch (err) {
        console.error('❌ Failed to initialize LevelEngine:', err);
      }
    };

    // Start initialization after a short delay to ensure layout is complete
    const timeoutId = setTimeout(initEngine, 50);

    return () => {
      clearTimeout(timeoutId);
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [currentLevelData, isGameActive]);

  // Handle goal reached
  const handleGoalReached = async () => {
    setIsGameActive(false);
    playSfx('win');
    
    const completionTime = (Date.now() - levelStartTime) / 1000;
    console.log('🎉 Goal reached! Level:', currentLevelData.title, `Time: ${completionTime}s`);
    
    try {
      const result = await gameAPI.completeLevel(String(currentLevelData.id));
      console.log('✅ Level completion recorded:', result);
      
      try {
        const difficulty = await aiService.getAdaptiveDifficulty(
          currentLevelData.id,
          Math.round(completionTime),
          attemptCount,
          5
        );
        console.log('📊 Adaptive difficulty:', difficulty.recommendation);
      } catch (diffErr) {
        console.warn('ℹ️ Adaptive difficulty calculation skipped');
      }
      
      setTimeout(() => {
        onComplete({ wood: 0, stone: 0, metal: 0 });
      }, 1500);
    } catch (err) {
      console.error('❌ Failed to complete level:', err);
      onComplete({ wood: 0, stone: 0, metal: 0 });
    }
  };

  // Mobile control handlers
  const handleMobileLeft = () => {
    if (engineRef.current) {
      engineRef.current.moveLeft();
    }
  };

  const handleMobileRight = () => {
    if (engineRef.current) {
      engineRef.current.moveRight();
    }
  };

  const handleMobileJump = () => {
    if (engineRef.current) {
      engineRef.current.jumpAction();
    }
  };

  const handleMobileStop = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  };
  
  // Load level
  useEffect(() => {
    setCurrentLevelData(level);
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

  const handleTutorialNext = () => setTutorialStep(prev => prev + 1);

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
    <div className="w-screen h-screen flex flex-col relative overflow-hidden fixed inset-0">
      {/* Tutorial */}
      {tutorialStep >= 0 && tutorialStep < 3 && (
        <div className="absolute inset-0 z-50">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto" />
           <div className="pointer-events-auto">
             <SprinkleTutorial 
               step={tutorialStep} 
               totalSteps={3} 
               text={["Welcome Hero! Reach the goal!", "Use arrow keys to move", "Press space to jump!"][tutorialStep]} 
               onNext={handleTutorialNext} 
             />
           </div>
        </div>
      )}

      {/* HUD */}
      <div className={`h-16 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 border-b border-slate-700 z-40 ${isMobile ? 'absolute top-0 w-full shadow-lg' : 'relative shadow-lg'}`}>
        <Button size="sm" variant="glass" onClick={onExit} icon={<ArrowLeft size={16} />}>
          {isMobile ? '' : 'Exit'}
        </Button>
        <div className="flex items-center gap-4">
          {isMobile && <Smartphone size={16} className="text-hero-blue" />}
          <div className="flex gap-2 items-center">
            <Sun size={16} className="text-yellow-400" />
            <span className="text-white text-sm font-mono">{Math.floor(gameTime)}:00</span>
          </div>
          <Button 
            size="sm" 
            variant="glass" 
            onClick={() => setShowNPC(true)}
            icon={<MessageSquare size={16} />}
            title="Talk to Sprinkle"
          >
            Help
          </Button>
        </div>
      </div>

      {/* Canvas Container - Responsive */}
      <div
        ref={canvasContainerRef}
        className={`flex-1 relative overflow-hidden w-full`}
        style={{
          backgroundColor: '#87ceeb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          flex: 1
        }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            display: 'block'
          }}
        />
      </div>

      {/* Mobile Controls */}
      {showMobileControls && isGameActive && (
        <MobileControls
          enabled={isMobile}
          orientation={orientation}
          onLeft={handleMobileLeft}
          onRight={handleMobileRight}
          onJump={handleMobileJump}
          onStop={handleMobileStop}
        />
      )}

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

export default LevelView;
