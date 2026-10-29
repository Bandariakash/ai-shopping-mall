import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, ChevronDown, Minimize2 } from 'lucide-react';
import { sendChatMessage } from '../utils/api';
import AIProductCarousel from './AIProductCarousel';

const WELCOME_MESSAGE = {
  id: 'welcome',
  text: "👋 Welcome to AI Mall! I'm your personal shopping concierge powered by Groq AI. Ask me anything — need gift ideas, product recommendations, or help finding the best deal? I know every product in this mall!",
  isAI: true,
  products: [],
};

const QUICK_SUGGESTIONS = [
  "Gift ideas for a 10-year-old who loves space 🚀",
  "Best laptop under $1500 💻",
  "Home decor for a modern living room 🏠",
  "Sports gift for someone active 🎽",
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const sendMessage = async (text) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setInputValue('');
    const userMessage = {
      id: crypto.randomUUID(),
      text: messageText,
      isAI: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(messageText, sessionId);
      const aiMessage = {
        id: crypto.randomUUID(),
        text: response.message,
        isAI: true,
        products: response.recommendedProducts || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Sorry, I encountered an error. Please try again!';
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: `⚠️ ${errMsg}`,
          isAI: true,
          products: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white px-4 py-3 rounded-2xl shadow-2xl animate-pulse-glow transition-all hover:scale-105 active:scale-95"
        >
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">AI Concierge</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-slide-up ${
            isMinimized ? 'h-14 w-80' : 'h-[560px] w-[380px] sm:w-[420px]'
          }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-800 to-purple-800 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">AI Concierge</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-green-400">Online — Powered by Groq AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2.5 animate-fade-in ${message.isAI ? '' : 'flex-row-reverse'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                        message.isAI
                          ? 'bg-gradient-to-br from-primary-500 to-purple-500'
                          : 'bg-slate-600'
                      }`}
                    >
                      {message.isAI ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex-1 ${message.isAI ? '' : 'flex flex-col items-end'}`}>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] ${
                          message.isAI
                            ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                            : 'bg-primary-600 text-white rounded-tr-sm ml-auto'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>

                      {/* Product Carousel for AI messages */}
                      {message.isAI && message.products && message.products.length > 0 && (
                        <div className="mt-2 w-full">
                          <AIProductCarousel products={message.products} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5 items-center">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions (show only initially) */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      disabled={isLoading}
                      className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-primary-500 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-full transition-all disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-slate-700 flex-shrink-0">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Ask me anything about products..."
                    rows={1}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all disabled:opacity-50"
                    style={{ minHeight: '40px', maxHeight: '100px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 text-center">
                  Powered by Groq AI • Press Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

