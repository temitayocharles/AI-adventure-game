
import React, { useState } from 'react';
import { X, Package, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { playSfx } from '../services/soundService';
import { 
  PixelBanana, PixelKey, PixelGem, PixelFlashlight, PixelApple, PixelMap, PixelUnknown 
} from './PixelAssets';

interface Props {
  items: string[];
  onUse: (item: string) => void;
  onClose: () => void;
}

const ITEM_ASSETS: Record<string, React.FC<{className?: string}>> = {
  'banana': PixelBanana,
  'key': PixelKey,
  'gem': PixelGem,
  'flashlight': PixelFlashlight,
  'apple': PixelApple,
  'map': PixelMap,
};

const ITEM_DETAILS: Record<string, { name: string, desc: string }> = {
  'banana': { name: 'Banana', desc: 'A delicious blocky snack. Monkeys love it!' },
  'key': { name: 'Gold Key', desc: 'Opens ancient voxel doors.' },
  'gem': { name: 'Magic Gem', desc: 'It glows with a mysterious blue light.' },
  'flashlight': { name: 'Flashlight', desc: 'Helps you see in dark caves.' },
  'apple': { name: 'Apple', desc: 'Crunchy and sweet. Restores health.' },
  'map': { name: 'Map', desc: 'Shows the path to hidden treasures.' },
};

export const InventoryModal: React.FC<Props> = ({ items, onUse, onClose }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleItemClick = (item: string) => {
    playSfx('click');
    setSelectedItem(item);
    setIsConfirming(false);
  };

  const handleRequestUse = () => {
    if (!selectedItem) return;
    playSfx('click');
    setIsConfirming(true);
  };

  const handleConfirmUse = () => {
     if (!selectedItem) return;
     playSfx('collect');
     onUse(selectedItem);
     setSelectedItem(null);
     setIsConfirming(false);
  };

  const activeDetail = selectedItem ? ITEM_DETAILS[selectedItem] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl border-4 border-hero-blue overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-hero-blue p-4 flex justify-between items-center text-white shadow-md z-10">
          <div className="flex items-center gap-2">
            <Package size={24} />
            <h2 className="text-2xl font-black tracking-wide">Backpack</h2>
          </div>
          <button 
            onClick={() => { playSfx('click'); onClose(); }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Item Grid */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-[200px]">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-6xl mb-4 opacity-50">🎒</div>
                <p className="font-bold text-lg">Empty Backpack</p>
                <p className="text-sm">Go find some treasure!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {items.map((item, idx) => {
                  const AssetComponent = ITEM_ASSETS[item] || PixelUnknown;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleItemClick(item)}
                      className={`aspect-square rounded-2xl border-2 flex items-center justify-center p-2 shadow-sm transition-all duration-200 ${selectedItem === item ? 'bg-blue-50 dark:bg-blue-900/20 border-hero-blue scale-110 shadow-hero-blue/30 ring-2 ring-hero-blue/20' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:scale-105 hover:border-hero-blue/50'}`}
                    >
                      <AssetComponent className="w-full h-full" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar / Bottom Panel for Details */}
          <div className="w-full md:w-64 bg-white dark:bg-slate-800 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 relative">
             {selectedItem ? (
               isConfirming ? (
                <div className="animate-fade-in flex flex-col h-full items-center justify-center w-full">
                   <AlertCircle size={48} className="text-orange-500 mb-4" />
                   <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Are you sure?</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Using this item might consume it forever!</p>
                   <div className="w-full space-y-2">
                      <Button variant="primary" className="w-full" onClick={handleConfirmUse}>
                        Yes, Use It
                      </Button>
                      <Button variant="glass" className="w-full !text-slate-400 !bg-transparent border-slate-200 dark:border-slate-600 hover:!bg-slate-50 dark:hover:!bg-slate-700" onClick={() => setIsConfirming(false)}>
                        Cancel
                      </Button>
                   </div>
                </div>
               ) : (
                 <div className="animate-fade-in flex flex-col h-full items-center justify-center w-full">
                    <div className="w-24 h-24 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center p-4 mb-4 border-4 border-white dark:border-slate-600 shadow-lg animate-float">
                      {(() => {
                        const Asset = ITEM_ASSETS[selectedItem] || PixelUnknown;
                        return <Asset className="w-full h-full drop-shadow-md" />;
                      })()}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{activeDetail?.name || 'Unknown Item'}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">{activeDetail?.desc || 'A mysterious blocky object.'}</p>
                    
                    <div className="mt-auto w-full space-y-2">
                      <Button variant="primary" className="w-full" onClick={handleRequestUse} icon={<Sparkles size={16}/>}>
                        Use Item
                      </Button>
                      <Button variant="glass" className="w-full !text-slate-400 !bg-transparent hover:!text-slate-600 border-none" onClick={() => setSelectedItem(null)}>
                        Cancel
                      </Button>
                    </div>
                 </div>
               )
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                  <Package size={48} className="mb-2 opacity-20"/>
                  <p className="font-bold">Select an item</p>
                  <p className="text-xs">Tap an item to see details</p>
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          {items.length} / 20 Slots
        </div>
      </div>
    </div>
  );
};
