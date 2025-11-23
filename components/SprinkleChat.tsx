import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { querySprinkle } from '../services/geminiProxy';
import { EMOJI_PACK } from '../services/mockData';

export const SprinkleChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', sender: 'sprinkle', text: 'Hi! I\'m Sprinkle! I can help you with hints or just chat. 🌟', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Call server proxy
    try {
      const replyText = await querySprinkle('user-1', 'chat', { 
        history: messages, 
        message: userMsg.text 
      });
      
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'sprinkle',
        text: replyText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (error) {
      console.error('Sprinkle error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'sprinkle',
        text: "Oops! I'm having trouble connecting. Try again later!",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setIsThinking(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-hero-purple to-pink-500 rounded-full shadow-xl flex items-center justify-center text-white animate-float z-40 hover:scale-110 transition-transform"
      >
        <Sparkles size={32} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col z-40 border-4 border-hero-purple overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-hero-purple p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-300" />
          <span className="font-bold text-lg">Sprinkle</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-hero-blue text-white rounded-br-none' 
                  : 'bg-white border-2 border-purple-100 text-slate-700 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-purple-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-hero-purple rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-hero-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-hero-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 no-scrollbar">
          {EMOJI_PACK.slice(0, 5).map(emoji => (
            <button key={emoji} onClick={() => setInput(prev => prev + emoji)} className="text-xl hover:bg-slate-100 p-1 rounded">
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for a hint..."
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-hero-purple outline-none text-slate-800"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="bg-hero-purple text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
