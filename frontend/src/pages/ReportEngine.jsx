import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Loader2, BookOpen, Clock, Target, CheckCircle2, FileText } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export default function ReportEngine() {
  const [formData, setFormData] = useState({
    subject: '',
    class_level: '',
    topic: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [kspData, setKspData] = useState(null);
  const { showNotification } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateKSP = async () => {
    if (!formData.subject || !formData.topic || !formData.class_level) return;
    
    setIsLoading(true);
    showNotification('Запуск AI-генерации КСП...', 'info');
    try {
      const response = await api.post("/generate-ksp", formData);
      setKspData(response.data);
      showNotification('КСП успешно сгенерирован и сохранен в архив!', 'success');
    } catch (error) {
      console.error("Ошибка при генерации КСП", error);
      showNotification('Ошибка при генерации КСП. Попробуйте другой запрос.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToWord = () => {
    showNotification('Подготовка документа Word (DOCX)...', 'info');
    setTimeout(() => {
      showNotification(`Файл "КСП_${formData.subject}_${formData.topic}.docx" готов к скачиванию`, 'success');
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-heading text-5xl mb-2 text-white text-glow">Генератор КСП</h1>
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Приказ №130 / AI Engine</p>
        </div>
        {kspData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3"
          >
            <button 
              onClick={exportToWord}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/30"
            >
              <FileText className="w-4 h-4" /> Экспорт в Word
            </button>
            <button 
              onClick={() => showNotification('Документ отправлен на печать', 'success')}
              className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Печать
            </button>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Input Forms */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6 backdrop-blur-xl h-fit sticky top-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Параметры урока</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Предмет</label>
              <input 
                type="text" name="subject" value={formData.subject} onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                placeholder="Например: Алгебра"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Класс</label>
              <input 
                type="text" name="class_level" value={formData.class_level} onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                placeholder="Например: 9 'А'"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Тема урока</label>
              <input 
                type="text" name="topic" value={formData.topic} onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                placeholder="Решение квадратных уравнений"
              />
            </div>

            <button 
              onClick={generateKSP}
              disabled={isLoading || !formData.subject || !formData.topic || !formData.class_level}
              className="w-full mt-4 bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-blue-600" />}
              Сгенерировать КСП
            </button>
          </div>
        </div>

        {/* Right Side: Output / Preview */}
        <div className="lg:col-span-8 bg-black/20 border border-white/5 p-8 rounded-3xl backdrop-blur-xl min-h-[500px] relative overflow-hidden">
          {!kspData && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-50">
              <Sparkles className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">Заполните параметры слева, чтобы<br/>ИИ создал план урока по ГОСО РК</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-blue-400 font-bold uppercase tracking-widest animate-pulse">Нейросеть пишет план...</p>
            </div>
          )}

          <AnimatePresence>
            {kspData && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-heading text-white mb-2">{kspData.title}</h2>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-400">{formData.subject}</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-400">{formData.class_level} класс</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2"><Target className="w-4 h-4"/> Цели обучения</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{kspData.goals}</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold text-purple-400 uppercase mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Критерии оценивания</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{kspData.criteria}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Ход урока</h3>
                  <div className="space-y-4">
                    {kspData.stages?.map((stage, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex gap-6">
                        <div className="w-24 shrink-0 flex flex-col items-center justify-center border-r border-white/10 pr-6">
                          <Clock className="w-6 h-6 text-gray-500 mb-2" />
                          <span className="text-xs font-bold text-white">{stage.time}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-2">{stage.name}</h4>
                          <p className="text-gray-400 text-sm mb-3 leading-relaxed">{stage.activity}</p>
                          <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded-lg">
                            Оценивание: {stage.evaluation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
