
import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile, LevelData, AvatarConfig, GameSettings, WorldData, CraftingRecipe } from './types';
import { INITIAL_USER, RECIPES } from './services/mockData';
import { loadUser, saveUser } from './services/storageService';
import { playSfx } from './services/soundService';
import { querySprinkle } from './services/geminiProxy';
import { gameAPI } from './services/gameAPI';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/Button';
import { ParentalGate } from './components/ParentalGate';
import { SprinkleChat } from './components/SprinkleChat';
import { InventoryModal } from './components/InventoryModal';
import { AvatarEditor } from './components/AvatarEditor';
import { StatsModal } from './components/StatsModal';
import { FriendsModal } from './components/FriendsModal';
import { CraftingModal } from './components/CraftingModal';
import { LevelView } from './views/LevelView';
import { WorldCardSkeleton } from './components/Skeleton';
import { Map, User, Settings, Star, Lock, Shield, Sun, Moon, Edit3, BarChart2, Loader2, Activity, MessageCircle, Search, Users, Hammer } from 'lucide-react';
import { PixelPlayer } from './components/PixelAssets';
import { runDiagnostics } from './tests/diagnostics';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LOADING);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [showGate, setShowGate] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [questModal, setQuestModal] = useState<{show: boolean, title: string, steps: string[], loading: boolean} | null>(null);
  const [gateTarget, setGateTarget] = useState<() => void>(() => {});
  const [activeLevel, setActiveLevel] = useState<LevelData | null>(null);
  
  // New Feature States
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(true);
  const [worlds, setWorlds] = useState<WorldData[]>([]);
  const [lastCraftState, setLastCraftState] = useState<{ inventory: string[], materials: any } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const loadedUser = loadUser();
    setUser(loadedUser);
    
    // Fetch worlds from API
    const fetchWorlds = async () => {
      try {
        const worldsData = await gameAPI.getWorlds();
        console.log('🌍 Worlds API response:', worldsData);
        if (worldsData && worldsData.worlds && worldsData.worlds.length > 0) {
          console.log('✅ Loaded', worldsData.worlds.length, 'worlds:', worldsData.worlds);
          
          // Fetch levels for each world
          const worldsWithLevels = await Promise.all(
            worldsData.worlds.map(async (world) => {
              try {
                const levelsData = await gameAPI.getPlayerLevels(world.id);
                return {
                  ...world,
                  levels: levelsData.levels || []
                };
              } catch (err) {
                console.error(`Failed to load levels for world ${world.id}:`, err);
                return { ...world, levels: [] };
              }
            })
          );
          
          setWorlds(worldsWithLevels);
        } else {
          console.warn('⚠️ No worlds data received, using empty list');
          setWorlds([]);
        }
      } catch (err) {
        console.error('❌ Error loading worlds:', err);
        setWorlds([]);
      } finally {
        setIsLoadingWorlds(false);
        setView(ViewState.WORLD_MAP);
      }
    };
    
    fetchWorlds();
  }, []);

  useEffect(() => {
    saveUser(user);
    const root = document.documentElement;
    if (user.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [user]);

  const toggleTheme = () => {
    playSfx('click');
    setUser(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const toggleEffects = () => {
    playSfx('click');
    setUser(prev => ({ 
      ...prev, 
      settings: { ...prev.settings, enableEffects: !prev.settings.enableEffects } 
    }));
  };

  const runTests = async () => {
    playSfx('click');
    const results = await runDiagnostics();
    alert("Diagnostics Results:\n\n" + results.join('\n'));
  };

  const handleLevelSelect = (level: LevelData) => {
    playSfx('click');
    setActiveLevel(level);
    setView(ViewState.LEVEL_PLAY);
  };

  const handleQuestGenerate = async (world: WorldData) => {
    playSfx('click');
    setQuestModal({ show: true, title: 'Generating Quest...', steps: [], loading: true });
    
    try {
      // Call server-side quest generation via AI proxy
      const questJson = await querySprinkle('user-1', 'quest', { worldName: world.name });
      let questData = { title: 'Mystery Quest', steps: ['Explore the unknown'], funFact: '?' };
      
      try {
        questData = JSON.parse(questJson);
      } catch (e) { 
        // If not valid JSON, treat response as quest title
        questData = { 
          title: questJson, 
          steps: ['Embark on your adventure!'], 
          funFact: world.description 
        };
      }

      setQuestModal({ show: true, title: questData.title, steps: questData.steps || [], loading: false });
      setUser(prev => ({
        ...prev,
        activeQuest: {
          title: questData.title,
          steps: questData.steps || [],
          funFact: questData.funFact || '?',
          worldId: world.id
        }
      }));
    } catch (e) {
      console.error('Quest generation failed', e);
      setQuestModal({ 
        show: true, 
        title: `${world.name} Adventure`, 
        steps: ['Explore and help those in need!'], 
        loading: false 
      });
    }
  };

  const handleLevelComplete = (loot: {wood: number, stone: number, metal: number}) => {
    if (!activeLevel) return;
    
    setUser(prev => {
      const newCompleted = Array.from(new Set([...prev.completedLevels, activeLevel.id]));
      const nextUnlockedWorlds = [...prev.unlockedWorlds];
      
      const currentWorld = worlds.find(w => w.id === activeLevel.worldId);
      if (currentWorld) {
        const idx = currentWorld.levels.findIndex(l => l.id === activeLevel.id);
        if (idx === currentWorld.levels.length - 1) {
           const nextWorldIdx = worlds.findIndex(w => w.id === currentWorld.id) + 1;
           if (worlds[nextWorldIdx] && !nextUnlockedWorlds.includes(worlds[nextWorldIdx].id)) {
              nextUnlockedWorlds.push(worlds[nextWorldIdx].id);
           }
        }
      }

      return {
        ...prev,
        xp: prev.xp + activeLevel.rewardXp,
        completedLevels: newCompleted,
        unlockedWorlds: nextUnlockedWorlds,
        stats: {
          ...prev.stats,
          levelsCompleted: prev.stats.levelsCompleted + 1,
          craftingMaterials: {
             wood: prev.stats.craftingMaterials.wood + loot.wood,
             stone: prev.stats.craftingMaterials.stone + loot.stone,
             metal: prev.stats.craftingMaterials.metal + loot.metal,
          }
        }
      };
    });
    setView(ViewState.WORLD_MAP);
    setActiveLevel(null);
  };

  const handleResourceCollect = (type: 'wood' | 'stone' | 'metal') => {
    setUser(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        itemsCollected: prev.stats.itemsCollected + 1,
        craftingMaterials: {
          ...prev.stats.craftingMaterials,
          [type]: prev.stats.craftingMaterials[type] + 1
        }
      }
    }));
  };

  // --- Crafting Undo Logic ---
  const handleCraft = (recipe: CraftingRecipe) => {
    setLastCraftState({
      inventory: [...user.inventory],
      materials: { ...user.stats.craftingMaterials }
    });

    setUser(prev => ({
      ...prev,
      inventory: [...prev.inventory, recipe.resultItem],
      stats: {
        ...prev.stats,
        craftingMaterials: {
          wood: prev.stats.craftingMaterials.wood - recipe.cost.wood,
          stone: prev.stats.craftingMaterials.stone - recipe.cost.stone,
          metal: prev.stats.craftingMaterials.metal - recipe.cost.metal
        }
      }
    }));
  };

  const handleUndoCraft = () => {
    if (!lastCraftState) return;
    playSfx('click');
    setUser(prev => ({
      ...prev,
      inventory: lastCraftState.inventory,
      stats: {
        ...prev.stats,
        craftingMaterials: lastCraftState.materials
      }
    }));
    setLastCraftState(null);
  };

  // --- Friend Logic ---
  const handleAddFriend = (code: string) => {
    setUser(prev => ({
      ...prev,
      friends: [
        ...prev.friends || [],
        {
          id: `f_${Date.now()}`,
          displayName: `Friend ${code}`,
          isOnline: false,
          avatarConfig: INITIAL_USER.avatarConfig
        }
      ]
    }));
  };

  const handleAcceptFriend = (id: string) => {
    // Logic to move from request to friend list
    const req = user.friendRequests?.find(r => r.id === id);
    if (req) {
       setUser(prev => ({
         ...prev,
         friendRequests: prev.friendRequests.filter(r => r.id !== id),
         friends: [...prev.friends, { id: req.fromUser, displayName: req.displayName, isOnline: true, avatarConfig: INITIAL_USER.avatarConfig }]
       }));
    }
  };

  // --- Search Logic ---
  const filteredWorlds = worlds.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLoading = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <Loader2 className="w-12 h-12 animate-spin text-hero-blue mb-4" />
      <h2 className="text-2xl font-bold">Loading World...</h2>
    </div>
  );

  const renderWorldMap = () => {
    const bgClass = user.theme === 'dark' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900";
    
    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className={`min-h-screen p-4 pb-24 overflow-y-auto ${bgClass}`}>
          
          {/* Header */}
          <header className={`flex flex-col gap-4 mb-8 sticky top-0 p-4 -mx-4 z-20 border-b backdrop-blur-md shadow-lg ${user.theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { playSfx('click'); setShowAvatarEditor(true); }} className="relative group">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-white/20 shadow-inner overflow-hidden transition-transform hover:scale-110">
                    <PixelPlayer className="w-10 h-10" config={user.avatarConfig} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-hero-blue p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={10} />
                  </div>
                </button>
                <div>
                  <h2 className={`font-bold ${user.theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{user.displayName}</h2>
                  <div className="text-xs text-hero-orange font-bold flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Lvl {Math.floor(user.xp / 100) + 1}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="glass" onClick={() => { playSfx('click'); setShowFriends(true); }} className={user.theme === 'light' ? '!text-slate-600 !border-slate-300' : ''}>
                  <Users size={18} />
                </Button>
                <Button size="sm" variant="glass" onClick={() => { playSfx('click'); setShowSettings(!showSettings); }} className={user.theme === 'light' ? '!text-slate-600 !border-slate-300' : ''}>
                  <Settings size={18} />
                </Button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                 type="text" 
                 placeholder="Search worlds..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className={`w-full pl-10 pr-4 py-2 rounded-xl border-2 outline-none focus:border-hero-blue transition-colors ${user.theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'}`}
               />
            </div>
          </header>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-200 dark:bg-slate-800 shadow-inner animate-fade-in text-slate-800 dark:text-white">
               <div className="flex justify-between items-center mb-4">
                 <span className="font-bold">Theme</span>
                 <Button size="sm" onClick={toggleTheme} variant="secondary">
                   {user.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                 </Button>
               </div>
               <div className="flex justify-between items-center mb-4">
                 <span className="font-bold">Realistic Effects</span>
                 <Button size="sm" onClick={toggleEffects} variant={user.settings.enableEffects ? 'success' : 'glass'} className={!user.settings.enableEffects ? 'bg-slate-400 text-white' : ''}>
                   {user.settings.enableEffects ? 'ON' : 'OFF'}
                 </Button>
               </div>
               <div className="border-t border-slate-300 dark:border-slate-700 pt-4">
                  <Button size="sm" onClick={runTests} variant="glass" className="w-full !text-slate-500 dark:!text-slate-400" icon={<Activity size={16} />}>
                    Run Diagnostics (Tests)
                  </Button>
               </div>
            </div>
          )}

          {/* Worlds */}
          <div className="max-w-4xl mx-auto space-y-8">
            {isLoadingWorlds ? (
               <>
                 <WorldCardSkeleton />
                 <WorldCardSkeleton />
               </>
            ) : filteredWorlds.length === 0 ? (
               <div className="text-center py-12 opacity-50">
                 <p className="text-2xl font-bold mb-2">No worlds found</p>
                 <p>Try a different search term</p>
               </div>
            ) : (
              filteredWorlds.map((world) => {
                const isWorldUnlocked = user.unlockedWorlds.includes(world.id);
                return (
                  <div key={world.id} className={`relative group rounded-3xl overflow-hidden transition-all duration-500 ${!isWorldUnlocked ? 'grayscale opacity-80 pointer-events-none' : 'hover:scale-[1.02] hover:shadow-2xl shadow-xl'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${world.color} opacity-90`}></div>
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>

                    <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="text-8xl drop-shadow-lg animate-float">{world.icon}</div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                          <h3 className="text-3xl font-black text-white drop-shadow-md">{world.name}</h3>
                          {!isWorldUnlocked && <Lock size={24} className="text-white/50" />}
                        </div>
                        <p className="text-white/90 font-semibold mb-4">{world.description}</p>
                        
                        {isWorldUnlocked && (
                          <>
                             <div className="mb-4">
                               <Button size="sm" variant="glass" onClick={() => handleQuestGenerate(world)} icon={<MessageCircle size={16} />}>
                                 New Quest
                               </Button>
                             </div>

                             <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                              {world.levels.map((level, idx) => {
                                const isCompleted = user.completedLevels.includes(level.id);
                                const isLocked = idx > 0 && !user.completedLevels.includes(world.levels[idx-1].id);

                                return (
                                  <button 
                                    key={level.id}
                                    onClick={() => !isLocked && handleLevelSelect(level)}
                                    disabled={isLocked}
                                    className={`flex flex-col items-center gap-2 group/btn outline-none ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all border-b-4 duration-200 active:scale-95 ${isCompleted ? 'bg-hero-green border-green-700 text-green-900' : isLocked ? 'bg-slate-300 border-slate-400 text-slate-500' : 'bg-white border-slate-300 text-slate-700 hover:bg-hero-blue hover:text-white hover:border-blue-700'}`}>
                                      {isCompleted ? <Star size={24} fill="currentColor" /> : isLocked ? <Lock size={20} /> : idx + 1}
                                    </div>
                                    <span className="text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">{level.difficulty}</span>
                                  </button>
                                );
                              })}
                             </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <nav className={`fixed bottom-0 left-0 right-0 border-t p-2 px-6 flex justify-around items-center z-30 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.1)] ${user.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <NavButton active={!showInventory} icon={<Map />} label="Worlds" onClick={() => { playSfx('click'); setShowInventory(false); setShowCrafting(false); }} theme={user.theme} />
            <NavButton active={showInventory} icon={<User />} label="Backpack" onClick={() => { playSfx('click'); setShowInventory(true); setShowCrafting(false); }} theme={user.theme} />
             <NavButton active={showCrafting} icon={<Hammer />} label="Craft" onClick={() => { playSfx('click'); setShowCrafting(true); setShowInventory(false); }} theme={user.theme} />
            <NavButton icon={<Shield />} label="Parents" onClick={() => { playSfx('click'); setGateTarget(() => () => alert("Parental Tools")); setShowGate(true); }} theme={user.theme} />
            <NavButton icon={<Settings />} label="Admin" onClick={() => { playSfx('click'); setShowAdmin(true); }} theme={user.theme} />
          </nav>
        </div>
      </div>
    );
  };

  if (view === ViewState.LEVEL_PLAY && activeLevel) {
    return (
      <LevelView 
        level={activeLevel} 
        avatarConfig={user.avatarConfig}
        settings={user.settings}
        onExit={() => setView(ViewState.WORLD_MAP)} 
        onComplete={handleLevelComplete}
        onCollectResource={handleResourceCollect}
        isFirstTime={user.completedLevels.length === 0}
      />
    );
  }

  return (
    <ErrorBoundary>
      <>
        {view === ViewState.LOADING ? renderLoading() : renderWorldMap()}
        <SprinkleChat />
      
      {/* Modals */}
      {showInventory && <InventoryModal items={user.inventory} onUse={(i) => {}} onClose={() => setShowInventory(false)} />}
      
      {showCrafting && (
        <CraftingModal 
          materials={user.stats.craftingMaterials} 
          onCraft={handleCraft}
          onUndo={handleUndoCraft}
          canUndo={!!lastCraftState}
          onClose={() => setShowCrafting(false)} 
        />
      )}

      {showAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-slate-900 p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-auto`}>
            <h2 className="text-xl font-bold mb-4">Moderation Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Admin tools for content moderation and game management.</p>
            <iframe 
              src="/admin" 
              className="w-full h-96 border rounded"
              title="Admin Dashboard"
            />
            <Button onClick={() => setShowAdmin(false)} className="w-full mt-4">Close</Button>
          </div>
        </div>
      )}
      
      {showAvatarEditor && (
        <AvatarEditor 
          config={user.avatarConfig} 
          onSave={(cfg) => { setUser(p => ({...p, avatarConfig: cfg})); setShowAvatarEditor(false); }} 
          onCancel={() => setShowAvatarEditor(false)} 
        />
      )}
      
      {showStats && <StatsModal stats={user.stats} onClose={() => setShowStats(false)} />}
      
      {showFriends && (
        <FriendsModal 
          friends={user.friends || []} 
          requests={user.friendRequests || []}
          onAddFriend={handleAddFriend} 
          onAcceptRequest={handleAcceptFriend}
          onClose={() => setShowFriends(false)} 
        />
      )}
      
      {showGate && <ParentalGate onSuccess={() => { setShowGate(false); gateTarget(); }} onCancel={() => setShowGate(false)} />}

      {/* Quest Modal */}
      {questModal && questModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border-4 border-hero-purple shadow-2xl text-center">
              {questModal.loading ? (
                 <div className="flex flex-col items-center text-hero-purple">
                   <Loader2 className="animate-spin mb-2" size={48} />
                   <p className="font-bold text-xl">Sprinkle is writing a story...</p>
                 </div>
              ) : (
                 <>
                   <div className="w-16 h-16 bg-hero-purple rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                     <MessageCircle size={32} />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{questModal.title}</h2>
                   <div className="text-left bg-purple-50 dark:bg-slate-700 p-4 rounded-xl mb-6">
                     <ul className="space-y-2">
                       {questModal.steps.map((step, i) => (
                         <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-200 font-medium">
                           <span className="bg-hero-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                           {step}
                         </li>
                       ))}
                     </ul>
                   </div>
                   <Button onClick={() => { playSfx('click'); setQuestModal(null); }} className="w-full">Accept Quest!</Button>
                 </>
              )}
           </div>
        </div>
      )}
    </>
    </ErrorBoundary>
  );
};

const NavButton: React.FC<{icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, theme: string}> = ({ icon, label, active, onClick, theme }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${active ? 'text-hero-blue scale-110 bg-hero-blue/10' : theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
