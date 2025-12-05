import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { MessageBubble } from './components/MessageBubble';
import { Message, Role, ResponseMode } from './types';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMode, setResponseMode] = useState<ResponseMode>(ResponseMode.CONCISE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    // Create User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userText, messages, responseMode);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: response.text,
        groundingChunks: response.groundingChunks
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: error instanceof Error ? error.message : "خطای ناشناخته",
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-950 text-slate-200">
      <Header />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center mt-20 opacity-50">
               <div className="w-20 h-20 mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-cyan-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
               </div>
               <p className="text-xl font-medium text-slate-300 mb-2">به RAM AI خوش آمدید</p>
               <p className="text-sm text-slate-500">هر سوالی دارید بپرسید تا در وب جستجو کنم</p>
               
               <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                 <button onClick={() => setInput("آخرین قیمت دلار چقدر است؟")} className="text-right p-4 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 transition-colors text-sm text-slate-400 hover:text-cyan-400">
                   آخرین قیمت دلار چقدر است؟
                 </button>
                 <button onClick={() => setInput("نتیجه بازی دیشب رئال مادرید")} className="text-right p-4 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 transition-colors text-sm text-slate-400 hover:text-cyan-400">
                   نتیجه بازی دیشب رئال مادرید
                 </button>
               </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-end mb-6">
              <div className="bg-dark-800 border border-white/5 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <div className="flex space-x-1 space-x-reverse">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-slate-400">در حال جستجو و تفکر...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-950/90 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-3">
            <div className="bg-dark-800 p-1 rounded-lg flex items-center border border-white/5">
              <button
                onClick={() => setResponseMode(ResponseMode.CONCISE)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  responseMode === ResponseMode.CONCISE
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                خلاصه (پیش‌فرض)
              </button>
              <button
                onClick={() => setResponseMode(ResponseMode.DETAILED)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  responseMode === ResponseMode.DETAILED
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                کامل و دقیق
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="سوال خود را بپرسید..."
              className="w-full bg-dark-800 text-white placeholder-slate-500 border border-white/10 rounded-2xl py-4 pr-5 pl-14 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-xl"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute left-2 p-2.5 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'bg-dark-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600">RAM AI ممکن است اشتباه کند. لطفا اطلاعات مهم را بررسی کنید.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;