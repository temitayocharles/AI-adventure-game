
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { playSfx } from '../services/soundService';

interface Props {
  step: number;
  totalSteps: number;
  text: string;
  onNext: () => void;
}

export const SprinkleTutorial: React.FC<Props> = ({ step, totalSteps, text, onNext }) => {
  const handleNext = () => {
    playSfx('click');
    onNext();
  };

  return (
    <div className="absolute inset-x-0 bottom-24 mx-auto max-w-md z-50 px-4 animate-bounce-small">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-hero-purple p-4 flex items-start gap-4 relative">
        
        {/* Sprinkle Avatar */}
        <div className="absolute -top-8 -left-2 w-16 h-16 bg-gradient-to-br from-hero-purple to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
           <Sparkles size={32} className="animate-spin-slow" />
        </div>

        <div className="ml-12 flex-1">
          <h3 className="text-hero-purple font-black text-sm uppercase tracking-wider mb-1">
            Tip {step + 1}/{totalSteps}
          </h3>
          <p className="text-slate-800 font-bold text-lg leading-snug mb-3">
            {text}
          </p>
          <div className="flex justify-end">
             <Button onClick={handleNext} size="sm" variant="primary" icon={<ArrowRight size={16}/>}>
               {step + 1 === totalSteps ? "Let's Go!" : "Next"}
             </Button>
          </div>
        </div>

        {/* Triangle arrow pointing down (optional visual flair if we positioned it differently, currently standard bubble) */}
      </div>
    </div>
  );
};
