import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, Save } from 'lucide-react';
import axios from 'axios';

const DocumentGenerator = () => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [generatedKsp, setGeneratedKsp] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/documents');
      setHistory(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/generator/ksp', { topic, grade_level: parseInt(grade) });
      setGeneratedKsp(res.data);
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert('Ошибка при генерации КСП. Проверьте консоль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Генератор КСП (Приказ №125/130)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleGenerate} className="glass p-8 rounded-3xl space-y-5 shadow-xl">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Тема урока</label>
              <input required type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:bg-white focus:outline-none focus:border-kz-turquoise transition-all" placeholder="Например: Законы Ньютона" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Класс (1-11)</label>
              <input required type="number" min="1" max="11" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:bg-white focus:outline-none focus:border-kz-turquoise transition-all" placeholder="9" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full bg-kz-turquoise text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-kz-turquoise/30 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <FileText size={24} />}
              Сгенерировать по ГОСО 2026
            </motion.button>
          </form>

          <div className="glass p-8 rounded-3xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Save className="text-purple-500" size={24} /> История версий (SQLite)</h3>
            <div className="space-y-4">
              {history.map(doc => (
                <motion.div whileHover={{ scale: 1.02 }} key={doc.id} className="p-4 bg-white/60 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm border border-gray-50" onClick={() => setGeneratedKsp(doc)}>
                  <p className="font-bold text-kz-turquoise truncate">{doc.title}</p>
                  <p className="text-xs font-medium text-gray-400 mt-1">{new Date(doc.created_at).toLocaleString('ru-RU')}</p>
                </motion.div>
              ))}
              {history.length === 0 && <p className="text-gray-500 text-sm">История пуста.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass p-10 rounded-3xl min-h-[600px] shadow-xl">
          {generatedKsp ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                <h2 className="text-3xl font-bold text-gray-800">{generatedKsp.title}</h2>
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold text-sm">КСП ГОСО РК</span>
              </div>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
                {generatedKsp.content}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileText size={80} className="mb-6 opacity-30 text-kz-turquoise" />
              <p className="text-xl font-medium text-gray-500">Заполните форму для генерации КСП</p>
              <p className="text-sm mt-2">ИИ учтет все требования Приказов №125 и №130</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentGenerator;
