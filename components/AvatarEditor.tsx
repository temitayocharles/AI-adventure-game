
import React, { useState } from 'react';
import { X, Check, User, Bot, PawPrint } from 'lucide-react';
import { Button } from './Button';
import { PixelPlayer } from './PixelAssets';
import { AvatarConfig, HairStyle, Accessory, AvatarModel } from '../types';
import { playSfx } from '../services/soundService';

interface Props {
  config: AvatarConfig;
  onSave: (newConfig: AvatarConfig) => void;
  onCancel: () => void;
}

const HAIR_STYLES: HairStyle[] = ['normal', 'spiky', 'bob', 'punk'];
const ACCESSORIES: Accessory[] = ['none', 'glasses', 'hat', 'crown', 'headphones'];
const SKIN_COLORS = ['#f6dba6', '#e0ac69', '#8d5524', '#5d4037', '#94a3b8', '#cbd5e1'];
const CLOTH_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899'];

export const AvatarEditor: React.FC<Props> = ({ config, onSave, onCancel }) => {
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(config);

  const handleChange = (key: string, value: any) => {
    playSfx('click');
    setCurrentConfig(prev => {
      if (key === 'skin' || key === 'top' || key === 'bottom') {
        return { ...prev, colors: { ...prev.colors, [key]: value } };
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border-4 border-hero-blue overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-hero-blue p-4 flex justify-between items-center text-white shadow-md">
          <h2 className="text-2xl font-black tracking-wide">Style Your Hero</h2>
          <button onClick={onCancel} className="p-1 hover:bg-white/20 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Preview */}
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 rounded-full border-4 border-white dark:border-slate-500 shadow-xl flex items-center justify-center relative">
              <PixelPlayer className="w-32 h-32 drop-shadow-2xl" config={currentConfig} />
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Model Selection */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Character</h3>
              <div className="flex gap-2">
                 <button onClick={() => handleChange('model', 'human')} className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 ${currentConfig.model === 'human' ? 'border-hero-blue bg-blue-50 text-hero-blue' : 'border-slate-200 text-slate-400'}`}>
                   <User size={20} /> <span className="text-xs font-bold">Human</span>
                 </button>
                 <button onClick={() => handleChange('model', 'robot')} className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 ${currentConfig.model === 'robot' ? 'border-hero-blue bg-blue-50 text-hero-blue' : 'border-slate-200 text-slate-400'}`}>
                   <Bot size={20} /> <span className="text-xs font-bold">Robot</span>
                 </button>
                 <button onClick={() => handleChange('model', 'animal')} className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 ${currentConfig.model === 'animal' ? 'border-hero-blue bg-blue-50 text-hero-blue' : 'border-slate-200 text-slate-400'}`}>
                   <PawPrint size={20} /> <span className="text-xs font-bold">Beast</span>
                 </button>
              </div>
            </section>

            {currentConfig.model === 'human' && (
              <>
                {/* Hair Selection */}
                <section>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Hair Style</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {HAIR_STYLES.map(style => (
                      <button
                        key={style}
                        onClick={() => handleChange('hairStyle', style)}
                        className={`px-4 py-2 rounded-xl border-2 font-bold text-sm capitalize transition-all ${currentConfig.hairStyle === style ? 'border-hero-blue bg-blue-50 text-hero-blue' : 'border-slate-200 text-slate-500'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Accessory Selection */}
                <section>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Accessory</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {ACCESSORIES.map(acc => (
                      <button
                        key={acc}
                        onClick={() => handleChange('accessory', acc)}
                        className={`px-4 py-2 rounded-xl border-2 font-bold text-sm capitalize transition-all ${currentConfig.accessory === acc ? 'border-hero-blue bg-blue-50 text-hero-blue' : 'border-slate-200 text-slate-500'}`}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Color Selection */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Colors</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 block mb-1">Base/Skin</label>
                   <div className="flex flex-wrap gap-2">
                     {SKIN_COLORS.map(c => (
                       <button key={c} onClick={() => handleChange('skin', c)} className={`w-8 h-8 rounded-full border-2 ${currentConfig.colors.skin === c ? 'border-black scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                     ))}
                   </div>
                </div>
                <div className="col-span-2">
                   <label className="text-xs font-bold text-slate-400 block mb-1">Outfit/Paint</label>
                   <div className="flex flex-wrap gap-2">
                     {CLOTH_COLORS.map(c => (
                       <button key={c} onClick={() => handleChange('top', c)} className={`w-8 h-8 rounded-full border-2 ${currentConfig.colors.top === c ? 'border-black scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                     ))}
                   </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <Button variant="success" className="w-full" onClick={() => onSave(currentConfig)} icon={<Check size={20} />}>
            Save Look
          </Button>
        </div>

      </div>
    </div>
  );
};
