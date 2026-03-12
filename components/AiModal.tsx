import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ChatMessage } from '../types';
import { askGemini } from '../services/geminiService';

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to parse bold syntax (**text**)
const parseBold = (text: string) => {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

// Markdown Formatter Component
const FormattedMessage = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Headers
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-bold mt-3 mb-1 text-inherit">{parseBold(trimmed.slice(4))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-inherit">{parseBold(trimmed.slice(3))}</h2>;
        }
        if (trimmed.startsWith('# ')) {
           return <h1 key={i} className="text-xl font-bold mt-4 mb-2 text-inherit">{parseBold(trimmed.slice(2))}</h1>;
        }

        // Bullet points (Updated for better alignment)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
             return (
                 <div key={i} className="flex items-start gap-2.5 pl-1 mb-0.5">
                     {/* Use CSS shape instead of text char for better alignment */}
                     <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-60 mt-[0.55rem]" />
                     <div className="flex-1 leading-relaxed break-words text-inherit">
                        {parseBold(trimmed.slice(2))}
                     </div>
                 </div>
             )
        }
        
        // Ordered lists (1. )
        if (/^\d+\.\s/.test(trimmed)) {
             const dotIndex = trimmed.indexOf('.');
             const num = trimmed.slice(0, dotIndex + 1);
             const content = trimmed.slice(dotIndex + 1).trim();
             return (
                 <div key={i} className="flex items-start gap-2 pl-1 mb-0.5">
                     <span className="font-semibold text-inherit min-w-[1.2rem] text-right tabular-nums flex-shrink-0 leading-relaxed">{num}</span>
                     <div className="flex-1 leading-relaxed break-words text-inherit">{parseBold(content)}</div>
                 </div>
             )
        }

        // Normal paragraph
        return (
          <p key={i} className="min-h-[1.2em] leading-relaxed break-words">
            {parseBold(line)}
          </p>
        );
      })}
    </div>
  );
};

const AiModal: React.FC<AiModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '안녕하세요. 지방 작성이나 본관 한자에 대해 궁금한 점이 있으신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const answer = await askGemini(userMsg);

    setMessages(prev => [...prev, { role: 'model', text: answer }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            AI 제례 도우미
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-stone-800 text-white rounded-tr-none'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                }`}
              >
                <FormattedMessage text={msg.text} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 김해 김씨 한자가 뭐야?"
              className="flex-1 px-4 py-2 bg-stone-100 border-none rounded-full focus:ring-2 focus:ring-stone-400 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-stone-800 text-white rounded-full hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiModal;