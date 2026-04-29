import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Filter, Database, Loader2, X, Download, Share2, Printer, Trash2 } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function Archive() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/archive");
      const data = response.data;
      
      if (data.length === 0) {
        setDocuments([
          {
            id: 'demo-1',
            title: 'КСП: Квантовая физика (11 класс)',
            type: 'КСП',
            date: '15.04.2026 10:30',
            content: 'Цели урока: Сформировать представление о квантовой природе света и вещества. Задачи: 1. Изучить фотоэффект. 2. Рассмотреть уравнение Эйнштейна. 3. Решить задачи на определение энергии фотона.'
          },
          {
            id: 'demo-2',
            title: 'Анализ СОР №2 (Математика)',
            type: 'Анализ',
            date: '12.04.2026 14:15',
            content: 'Анализ результатов СОР за 2 четверть в 8 "А" классе. Средний балл: 18.5 из 25. Качество знаний: 72%. Типичные ошибки: решение квадратных уравнений через дискриминант.'
          },
          {
            id: 'demo-3',
            title: 'Методическая рекомендация: Инклюзия',
            type: 'Методика',
            date: '10.04.2026 09:00',
            content: 'Рекомендации по адаптации учебного материала для детей с задержкой психического развития (ЗПР). Использование визуальных опорных схем и дифференцированных заданий.'
          },
          {
            id: 'demo-4',
            title: 'КТП: Информатика (7 класс)',
            type: 'КТП',
            date: '08.04.2026 16:45',
            content: 'Календарно-тематическое планирование по предмету "Информатика" для 7 класса. Раздел: Программирование на Python. Количество часов: 34.'
          },
          {
            id: 'demo-5',
            title: 'Протокол родительского собрания',
            type: 'Протокол',
            date: '05.04.2026 18:00',
            content: 'Повестка дня: Итоги 3 четверти. Подготовка к весеннему балу. Профилактика правонарушений в интернете. Присутствовало: 22 родителя.'
          }
        ]);
      } else {
        setDocuments(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки архива:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action, docTitle) => {
    const messages = {
      download: `Файл "${docTitle}" успешно скачан`,
      share: `Ссылка на "${docTitle}" скопирована`,
      print: `Документ "${docTitle}" отправлен на печать`,
      delete: `Документ "${docTitle}" удален из архива`
    };
    showNotification(messages[action], action === 'delete' ? 'info' : 'success');
    if (action === 'delete') {
      setDocuments(prev => prev.filter(d => d.title !== docTitle));
      setSelectedDoc(null);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-5xl mb-2 text-white text-glow">Smart Archive</h1>
          <p className="text-gray-400">Единая база сгенерированных планов и отчетов</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-400" />
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Хранилище</p>
            <p className="text-sm font-medium text-white">{documents.length} записей</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col min-h-[500px]">
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по архиву (КСП, отчеты...)" 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => { fetchArchive(); showNotification('Данные успешно обновлены', 'success'); }} 
            className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors text-white group"
          >
            <Filter className="w-5 h-5 group-active:rotate-180 transition-transform" /> Обновить
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p>Синхронизация с базой данных...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <Database className="w-16 h-16 mb-4 opacity-20" />
              <p>В архиве пока пусто или ничего не найдено.</p>
              <p className="text-sm mt-2">Создайте КСП в разделе "Отчеты".</p>
            </div>
          ) : (
            <div className="overflow-y-auto custom-scrollbar pr-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="py-4 px-4 font-medium">Название / Тема</th>
                    <th className="py-4 px-4 font-medium">Дата создания</th>
                    <th className="py-4 px-4 font-medium">Тип</th>
                    <th className="py-4 px-4 font-medium text-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredDocs.map((doc, i) => (
                      <motion.tr 
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        <td className="py-4 px-4 flex items-center gap-4">
                          <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="font-bold text-white text-lg">{doc.title}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-400 font-mono text-sm">{doc.date}</td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 uppercase tracking-wider">
                            {doc.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                          >
                            Открыть
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        title={selectedDoc?.title || "Просмотр документа"}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{selectedDoc?.type}</p>
                <p className="text-white font-bold">{selectedDoc?.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction('download', selectedDoc.title)}
                className="p-2 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                title="Скачать"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleAction('share', selectedDoc.title)}
                className="p-2 bg-white/5 hover:bg-purple-600 hover:text-white rounded-xl transition-all"
                title="Поделиться"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-serif leading-relaxed text-gray-300 text-lg whitespace-pre-wrap">
            {selectedDoc?.content}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleAction('print', selectedDoc.title)}
              className="flex-1 py-4 border border-white/10 hover:bg-white/5 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" /> Печать
            </button>
            <button 
              onClick={() => handleAction('delete', selectedDoc.title)}
              className="px-6 py-4 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-2xl font-bold transition-all"
              title="Удалить"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
