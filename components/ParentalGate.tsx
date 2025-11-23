import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Lock } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParentalGate: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [problem, setProblem] = useState({ q: '', a: 0 });
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const n1 = Math.floor(Math.random() * 10) + 10;
    const n2 = Math.floor(Math.random() * 9) + 2;
    setProblem({ q: `${n1} + ${n2}`, a: n1 + n2 });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === problem.a) {
      onSuccess();
    } else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-hero-purple text-center">
        <div className="w-16 h-16 bg-hero-purple rounded-full flex items-center justify-center mx-auto mb-4 text-white">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Parental Gate</h2>
        <p className="text-slate-500 mb-6">Please solve this to continue (Grown-ups only!)</p>
        
        <div className="text-4xl font-bold text-hero-blue mb-6">
          {problem.q} = ?
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="number" 
            inputMode="numeric"
            value={answer}
            onChange={(e) => { setError(false); setAnswer(e.target.value); }}
            className="w-full text-center text-3xl p-4 border-2 border-slate-200 rounded-2xl focus:border-hero-purple focus:ring-4 focus:ring-hero-purple/20 outline-none text-slate-800"
            placeholder="?"
            autoFocus
          />
          {error && <p className="text-red-500 font-bold">Oops! Try again.</p>}
          
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="glass" className="flex-1 !text-slate-500 !border-slate-300 !bg-transparent hover:!bg-slate-100" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Unlock
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
