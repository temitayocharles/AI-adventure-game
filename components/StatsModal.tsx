
import React from 'react';
import { X, BarChart2, Hammer, Trophy } from 'lucide-react';
import { UserStats } from '../types';
import { PixelWood, PixelMetal } from './PixelAssets';

interface Props {
  stats: UserStats;
  onClose: () => void;
}

export const StatsModal: React.FC<Props> = ({ stats, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border-4 border-hero-orange overflow-hidden">
        
        {/* Header */}
        <div className="bg-hero-orange p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-2">
            <Trophy size={24} />
            <h2 className="text-2xl font-black tracking-wide">Your Legend</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 text-center">
                <div className="text-3xl font-black text-hero-blue">{stats.levelsCompleted}</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Levels Won</div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 text-center">
                <div className="text-3xl font-black text-hero-green">{stats.itemsCollected}</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Treasures Found</div>
             </div>
          </div>

          {/* Crafting Materials */}
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600">
             <h3 className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 mb-4">
               <Hammer size={18} /> Crafting Materials
             </h3>
             <div className="flex justify-around">
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 mb-2">
                    <PixelWood className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-white">{stats.craftingMaterials.wood}</span>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Wood</span>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 mb-2">
                    <div className="w-8 h-8 bg-slate-400 rounded-full" /> {/* Stone placeholder */}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-white">{stats.craftingMaterials.stone}</span>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Stone</span>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 mb-2">
                    <PixelMetal className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-white">{stats.craftingMaterials.metal}</span>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Metal</span>
               </div>
             </div>
          </div>

          {/* Activity Chart (Mock) */}
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600">
             <h3 className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 mb-4">
               <BarChart2 size={18} /> Activity
             </h3>
             <div className="flex items-end justify-between h-24 gap-2 px-2">
               {[20, 45, 30, 60, 80, 50, 90].map((h, i) => (
                 <div key={i} className="w-full bg-hero-blue/30 rounded-t-sm hover:bg-hero-blue transition-colors relative group">
                   <div style={{ height: `${h}%` }} className="bg-hero-blue rounded-t-sm w-full absolute bottom-0"></div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
