
import React, { useState, useEffect } from 'react';
import { X, Hammer, Undo2 } from 'lucide-react';
import { Button } from './Button';
import { RECIPES } from '../services/mockData';
import { PixelWood, PixelMetal, PixelKey, PixelFlashlight, PixelMap, PixelUnknown } from './PixelAssets';
import { playSfx } from '../services/soundService';
import { CraftingRecipe } from '../types';

interface Props {
  materials: { wood: number; stone: number; metal: number };
  onCraft: (recipe: CraftingRecipe) => void;
  onUndo: () => void;
  canUndo: boolean;
  onClose: () => void;
}

const ITEM_ASSETS: Record<string, React.FC<{className?: string}>> = {
  'key': PixelKey,
  'flashlight': PixelFlashlight,
  'map': PixelMap,
};

export const CraftingModal: React.FC<Props> = ({ materials, onCraft, onUndo, canUndo, onClose }) => {
  const handleCraft = (recipe: CraftingRecipe) => {
    if (materials.wood >= recipe.cost.wood && materials.stone >= recipe.cost.stone && materials.metal >= recipe.cost.metal) {
      playSfx('collect');
      onCraft(recipe);
    } else {
      playSfx('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl border-4 border-hero-orange overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="bg-hero-orange p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-2">
            <Hammer size={24} />
            <h2 className="text-2xl font-black tracking-wide">Crafting Lab</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
          {/* Resource Bar */}
          <div className="flex justify-around mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center">
              <PixelWood className="w-8 h-8 mb-1" />
              <span className="font-bold text-slate-700 dark:text-white">{materials.wood}</span>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-8 h-8 bg-slate-400 rounded-full mb-1 border-2 border-slate-500" />
               <span className="font-bold text-slate-700 dark:text-white">{materials.stone}</span>
            </div>
            <div className="flex flex-col items-center">
              <PixelMetal className="w-8 h-8 mb-1" />
              <span className="font-bold text-slate-700 dark:text-white">{materials.metal}</span>
            </div>
          </div>

          {/* Recipes */}
          <div className="grid gap-4">
            {RECIPES.map(recipe => {
               const canCraft = materials.wood >= recipe.cost.wood && materials.stone >= recipe.cost.stone && materials.metal >= recipe.cost.metal;
               const Asset = ITEM_ASSETS[recipe.resultItem] || PixelUnknown;
               
               return (
                 <div key={recipe.id} className={`flex items-center p-4 rounded-2xl border-2 transition-all ${canCraft ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-60'}`}>
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-600 rounded-xl flex items-center justify-center mr-4">
                       <Asset className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">{recipe.name}</h3>
                      <div className="text-xs font-bold text-slate-400 flex gap-2">
                        {recipe.cost.wood > 0 && <span>{recipe.cost.wood} Wood</span>}
                        {recipe.cost.stone > 0 && <span>{recipe.cost.stone} Stone</span>}
                        {recipe.cost.metal > 0 && <span>{recipe.cost.metal} Metal</span>}
                      </div>
                    </div>
                    <Button 
                      disabled={!canCraft} 
                      onClick={() => handleCraft(recipe)}
                      variant={canCraft ? 'success' : 'glass'}
                      className={!canCraft ? '!text-slate-400 !bg-slate-200 dark:!bg-slate-900 border-none' : ''}
                    >
                      Craft
                    </Button>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Footer with Undo */}
        {canUndo && (
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">Made a mistake?</span>
            <Button onClick={onUndo} variant="secondary" size="sm" icon={<Undo2 size={16} />}>
              Undo Last Craft
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};
