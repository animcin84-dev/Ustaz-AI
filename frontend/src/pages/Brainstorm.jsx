import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Send, Sparkles, Copy, RefreshCw, Share2 } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

const Brainstorm = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleBrainstorm = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);
    showNotification('ИИ генерирует идеи для вашего урока...', 'info');
    
    try {
      const res = await api.post('/brainstorm', { topic });
      setResult(res.data);
      showNotification('Идеи успешно сгенерированы!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Ошибка генерации', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = result?.blocks?.map(b => `${b.title}: ${b.content}`).join('\n\n') || '';
    navigator.clipboard.writeText(textToCopy);
    showNotification('Идеи скопированы в буфер обмена', 'success');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent flex items-center justify-center gap-4 text-glow"
        >
          <Lightbulb className="text-yellow-400 w-12 h-12" />
          Мозговой штурм 2.0
        </motion.h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Получите готовые блоки для вашего урока: от методологии до уникальных цифровых фишек
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBrainstorm()}
            placeholder="Введите тему (например: Интерактивная математика)..."
            className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-8 py-5 focus:outline-none focus:border-yellow-500/50 transition-all text-white text-lg shadow-inner"
          />
          <button
            onClick={handleBrainstorm}
            disabled={loading || !topic.trim()}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:scale-95 shadow-xl shadow-orange-900/40 active:scale-95 group/btn"
          >
            {loading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                Штурм
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-8 rounded-[2rem] shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                <Sparkles className="w-6 h-6" /> Концепция
              </h2>
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"><Copy className="w-5 h-5" /></button>
                <button onClick={() => showNotification('План сохранен', 'success')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
            <p className="text-xl text-gray-200 italic leading-relaxed">"{result.summary}"</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.blocks?.map((block, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    {block.icon || '💡'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{block.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{block.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Brainstorm;
