
import React, { useState } from 'react';
import { X, Users, UserPlus, Gift, Circle, Check, UserMinus } from 'lucide-react';
import { Button } from './Button';
import { PixelPlayer } from './PixelAssets';
import { Friend, FriendRequest } from '../types';
import { playSfx } from '../services/soundService';
import { INITIAL_USER } from '../services/mockData';

interface Props {
  friends: Friend[];
  requests: FriendRequest[];
  onAddFriend: (code: string) => void;
  onAcceptRequest: (id: string) => void;
  onClose: () => void;
}

export const FriendsModal: React.FC<Props> = ({ friends, requests, onAddFriend, onAcceptRequest, onClose }) => {
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'requests'>('list');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      playSfx('click');
      onAddFriend(code);
      setCode('');
      alert('Invite sent!');
      setActiveTab('list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border-4 border-hero-green overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-hero-green p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-2">
            <Users size={24} className="text-green-900" />
            <h2 className="text-2xl font-black tracking-wide text-green-900">Best Friends</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-green-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 font-bold text-sm ${activeTab === 'list' ? 'text-hero-green border-b-4 border-hero-green bg-green-50 dark:bg-green-900/20' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Friends ({friends.length})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 font-bold text-sm ${activeTab === 'requests' ? 'text-hero-green border-b-4 border-hero-green bg-green-50 dark:bg-green-900/20' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Reqs ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 font-bold text-sm ${activeTab === 'add' ? 'text-hero-green border-b-4 border-hero-green bg-green-50 dark:bg-green-900/20' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Add
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-800">
          {activeTab === 'list' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Users size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No friends yet!</p>
                </div>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-white dark:bg-slate-600 rounded-full border-2 border-slate-200 dark:border-slate-500 overflow-hidden relative">
                      <PixelPlayer className="w-10 h-10 absolute top-1 left-1" config={friend.avatarConfig} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{friend.displayName}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Circle size={8} className={`fill-current ${friend.isOnline ? 'text-green-500' : 'text-slate-300'}`} />
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    <button className="p-2 text-hero-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full">
                      <Gift size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
             <div className="space-y-4">
               {requests.length === 0 ? (
                 <div className="text-center text-slate-400 py-8">
                   <p>No pending requests.</p>
                 </div>
               ) : (
                 requests.map(req => (
                   <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
                     <div className="flex flex-col">
                       <span className="font-bold text-slate-800 dark:text-white">{req.displayName}</span>
                       <span className="text-xs text-slate-400">Wants to be friends!</span>
                     </div>
                     <div className="flex gap-2">
                       <Button size="sm" variant="success" onClick={() => { playSfx('win'); onAcceptRequest(req.id); }}>
                         <Check size={16} />
                       </Button>
                       <Button size="sm" variant="danger" onClick={() => playSfx('error')}>
                         <X size={16} />
                       </Button>
                     </div>
                   </div>
                 ))
               )}
             </div>
          )}

          {activeTab === 'add' && (
            <div className="text-center">
               <div className="mb-6 p-6 bg-green-50 dark:bg-slate-700 rounded-2xl border-2 border-dashed border-hero-green">
                 <UserPlus size={48} className="mx-auto mb-2 text-hero-green" />
                 <p className="text-slate-600 dark:text-slate-300 font-bold">Enter your friend's code</p>
                 <p className="text-xs text-slate-400">Ask your parent for help!</p>
               </div>
               
               <form onSubmit={handleAdd}>
                 <input 
                   type="text" 
                   value={code}
                   onChange={e => setCode(e.target.value.toUpperCase())}
                   placeholder="CODE-1234"
                   className="w-full p-4 text-center text-2xl font-black tracking-widest rounded-xl border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white mb-4 focus:border-hero-green focus:ring-4 focus:ring-green-200 outline-none"
                 />
                 <Button type="submit" className="w-full" icon={<UserPlus size={20}/>} disabled={!code.trim()}>
                   Send Invite
                 </Button>
               </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
