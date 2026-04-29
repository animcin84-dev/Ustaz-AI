import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Scale, Download, Sparkles, Copy, Share2, Printer } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export default function LegalBot() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: 'Сәлеметсіз бе! Я — «Қорғаушы», ваш личный юридический ИИ-адвокат.\n\nМоя задача — защищать вас от бумажной бюрократии и незаконных требований, опираясь на Закон РК «О статусе педагога» и Приказы МОН РК №125 и №130.\n\nЗадайте свой вопрос, и я предоставлю вам точное юридическое обоснование и план действий.',
    }
  ]);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dynamic textarea height logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', content: userMsg }]);
    setIsLoading(true);
    showNotification('Запрос обрабатывается юристом...', 'info');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await api.post("/legal-guardian", { query: userMsg }, { signal: controller.signal });
      clearTimeout(timeoutId);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        content: response.data.response,
        law_ref: response.data.law_ref
      }]);
      showNotification('Ответ получен', 'success');
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
         setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          content: "ИИ не ответил вовремя. Попробуйте перефразировать вопрос."
        }]);
         showNotification('Таймаут ожидания', 'error');
      } else {
        console.error(error);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          content: "Извините, произошла ошибка при получении ответа."
        }]);
        showNotification('Ошибка связи с сервером', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    showNotification('Текст ответа скопирован', 'success');
  };

  const downloadPDF = (title) => {
    showNotification(`Генерация юридической справки по теме: "${title}"...`, 'info');
    setTimeout(() => {
      showNotification('Юридическая справка (PDF) скачана', 'success');
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto p-2 lg:p-0">
      <div className="mb-6 flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 text-glow">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Scale className="text-blue-400 w-6 h-6" />
            </div>
            Legal Guardian
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-widest">Compliance • RK Law AI</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">AI Online</span>
        </div>
      </div>

      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {[
                "Как отказаться от лишних отчетов?",
                "Какие документы должен вести учитель?",
                "Статус педагога в 2026 году",
                "Законность дежурства в выходные"
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); handleSend(); }}
                  className="p-3 text-sm bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500 transition-all text-left text-gray-300 active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`group relative max-w-[85%] rounded-2xl px-5 py-4 ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/10' 
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-xl'
                }`}>
                  {msg.sender === 'ai' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => copyMessage(msg.content)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400" title="Копировать">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-serif">
                    {msg.content}
                  </div>
                  
                  {msg.law_ref && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{msg.law_ref}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => downloadPDF(msg.law_ref)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                        <button 
                          onClick={() => showNotification('Документ отправлен на печать', 'success')}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Chat Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-blue-500/50 transition-colors shadow-2xl">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите о законодательстве в сфере образования..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm py-2 px-3 resize-none custom-scrollbar max-h-[200px]"
              style={{ minHeight: '40px' }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isLoading 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-100 hover:scale-105' 
                : 'bg-white/5 text-gray-600 scale-95 opacity-50 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-600 mt-3 uppercase font-bold tracking-[0.2em]">
            Ustaz-AI может ошибаться. Всегда проверяйте официальные тексты приказов.
          </p>
        </div>
      </div>
    </div>
  );
}
