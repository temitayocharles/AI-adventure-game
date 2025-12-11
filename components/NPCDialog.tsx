/**
 * components/NPCDialog.tsx
 * Interactive NPC dialogue system with chat interface
 * 
 * Features:
 * - Character rendering with emotion states
 * - Dialogue box with typing animation
 * - Suggestion buttons
 * - Auto-close on completion
 */

import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { X, MessageCircle } from 'lucide-react';

interface NPCDialogProps {
  npcId: 'sprinkle' | 'elder' | 'merchant' | 'guardian';
  isOpen: boolean;
  onClose: () => void;
  context?: {
    currentLevel?: number;
    worldId?: number;
    playerStats?: any;
  };
}

interface Message {
  sender: 'player' | 'npc';
  text: string;
  emotion?: string;
}

interface NPCCharacter {
  name: string;
  emoji: string;
  color: string;
  description: string;
}

const NPC_CHARACTERS: Record<string, NPCCharacter> = {
  'sprinkle': {
    name: 'Sprinkle',
    emoji: '✨',
    color: 'from-purple-400 to-pink-400',
    description: 'Helpful magical companion'
  },
  'elder': {
    name: 'Elder Wisdom',
    emoji: '🧙',
    color: 'from-blue-400 to-teal-400',
    description: 'Ancient village guardian'
  },
  'merchant': {
    name: 'Merchant Zara',
    emoji: '🏪',
    color: 'from-yellow-400 to-orange-400',
    description: 'Mysterious trader'
  },
  'guardian': {
    name: 'Spirit Guardian',
    emoji: '👻',
    color: 'from-indigo-400 to-purple-400',
    description: 'Mystical spirit guide'
  }
};

const EMOTION_STYLES: Record<string, string> = {
  'happy': '😊',
  'thoughtful': '🤔',
  'excited': '🤩',
  'concerned': '😟'
};

export const NPCDialog: React.FC<NPCDialogProps> = ({
  npcId,
  isOpen,
  onClose,
  context = {}
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>('happy');
  const [isTyping, setIsTyping] = useState(false);

  const character = NPC_CHARACTERS[npcId];

  // Initialize greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetings: Record<string, string> = {
        'sprinkle': '✨ Hi there! I\'m Sprinkle! Need help with this level?',
        'elder': '🧙 Welcome, young adventurer. What brings you to seek my wisdom?',
        'merchant': '🏪 Ah, a new customer! Looking for supplies or information?',
        'guardian': '👻 I sense you need guidance. How can I help your journey?'
      };

      const greeting = greetings[npcId];
      setMessages([{ sender: 'npc', text: greeting, emotion: 'happy' }]);
      setSuggestions(['Tell me a hint', 'Give me advice', 'What\'s this world about?']);
    }
  }, [isOpen, npcId, messages.length]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = { sender: 'player', text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await aiService.chatWithNPC(npcId, text, context);

      // Simulate typing animation
      await new Promise(resolve => setTimeout(resolve, 800));

      const npcMessage: Message = {
        sender: 'npc',
        text: response.reply,
        emotion: response.emotion
      };

      setMessages(prev => [...prev, npcMessage]);
      setCurrentEmotion(response.emotion);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Failed to get NPC response:', error);
      const errorMessage: Message = {
        sender: 'npc',
        text: 'Oh no! I\'m having trouble understanding. Can you say that again?'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
        {/* Header */}
        <div className={`bg-gradient-to-r ${character.color} p-4 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{character.emoji}</span>
            <div>
              <h3 className="font-bold text-lg">{character.name}</h3>
              <p className="text-sm opacity-90">{character.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-white flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'npc' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.sender === 'npc'
                    ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-400'
                    : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                } animate-in fade-in slide-in-from-bottom`}
              >
                <div className="flex items-start gap-2">
                  {msg.emotion && msg.sender === 'npc' && (
                    <span className="text-lg mt-0.5">
                      {EMOTION_STYLES[msg.emotion] || EMOTION_STYLES['happy']}
                    </span>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-blue-100 px-4 py-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !isLoading && (
          <div className="px-4 py-3 bg-blue-50 border-t border-blue-200 flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="text-xs bg-blue-200 hover:bg-blue-300 text-blue-900 px-3 py-1 rounded-full transition disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage(inputValue);
              }
            }}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            <MessageCircle size={18} />
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-100 text-center text-xs text-gray-600">
          💡 Tap suggestions or type your question
        </div>
      </div>
    </div>
  );
};

export default NPCDialog;
