import React, { useState, useRef, useEffect } from 'react';
import chatService from '../services/chatService';
import logo from '../assets/logo.png'; 
import { Send, X, Minimize2, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initial Welcome Message
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      text: "Hi! I'm M-Bot 🤖. I can calculate laundry prices or answer questions about our services. Ask me anything!" 
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Prevent body scrolling when chat is open on mobile
      document.body.style.overflow = window.innerWidth < 640 ? 'hidden' : 'auto';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput(''); 

    // 1. Add User Message
    const newHistory = [...messages, { role: 'user', text: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // 2. ✅ FIXED: Send ALL messages (backend will filter welcome message)
      const apiHistory = newHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // 3. Call API
      const data = await chatService.sendMessage(userMessage, apiHistory);

      // 4. Add AI Response
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error); // ✅ Added error logging
      
      // ✅ IMPROVED: Handle different error types
      let errorMessage = "I'm having trouble right now. Please try again in a moment.";
      
      if (error.response?.status === 429) {
        errorMessage = "I've reached my chat limit for now. Please try again in a few minutes! 🙏";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ IMPROVED: Reset to initial state properly
  const handleReset = () => {
    setMessages([
      { 
        role: 'model', 
        text: "Hi! I'm M-Bot 🤖. I can calculate laundry prices or answer questions about our services. Ask me anything!" 
      }
    ]);
    setInput('');
  };

  return (
    <>
      {/* CHAT WINDOW CONTAINER */}
      <div className={`
        fixed z-[60] transition-all duration-300 ease-in-out
        ${isOpen 
          ? 'opacity-100 pointer-events-auto visible' 
          : 'opacity-0 pointer-events-none invisible translate-y-10 sm:translate-y-0'
        }
        inset-0 sm:inset-auto sm:bottom-24 sm:right-6
        w-full h-[100dvh] sm:w-96 sm:h-[600px] sm:max-h-[80vh]
        bg-white sm:bg-white/95 sm:backdrop-blur-xl 
        sm:border sm:border-white/20 sm:rounded-2xl sm:shadow-2xl 
        overflow-hidden flex flex-col font-sans
      `}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Bot" className="w-10 h-10 rounded-full border-2 border-white/30 bg-white object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-sm">M-Bot Assistant</h3>
              <p className="text-[10px] text-indigo-100 opacity-90 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Powered
              </p>
            </div>
          </div>
          <div className="flex gap-2">
              <button 
                onClick={handleReset} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors" 
                title="Reset Chat"
                type="button" // ✅ Added type="button"
              >
                  <RefreshCw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                type="button" // ✅ Added type="button"
              >
                  <ChevronDown className="w-6 h-6 sm:hidden" /> 
                  <Minimize2 className="w-5 h-5 hidden sm:block" />
              </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }
              `}>
                {/* ✅ IMPROVED: Preserve line breaks and formatting */}
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1 items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0 pb-safe">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask M-Bot..." 
            disabled={isLoading} // ✅ Added: Disable during loading
            className="flex-1 px-4 py-3 sm:py-2 bg-gray-100 border-transparent focus:bg-white border focus:border-indigo-300 rounded-full outline-none text-base sm:text-sm transition-all disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 sm:p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* FLOATING BUTTON */}
      <div className={`fixed bottom-6 right-6 z-50 ${isOpen ? 'hidden sm:flex' : 'flex'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group relative flex items-center justify-center
            w-14 h-14 rounded-full shadow-2xl border-2 border-white/50
            transition-all duration-300 hover:scale-110 active:scale-95
            ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-white'}
          `}
          type="button" // ✅ Added type="button"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <img 
                src={logo} 
                alt="Chat" 
                className="w-full h-full rounded-full object-cover" 
              />
              {/* Notification Badge */}
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}