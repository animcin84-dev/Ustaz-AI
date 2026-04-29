import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Video, FileText, Download, ExternalLink, Search, Bookmark, X, Play, Eye, Sparkles, Copy } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../api';

const resources = [
  {
    id: 1,
    title: "Методика преподавания в 5-9 классах",
    category: "Методика",
    type: "PDF",
    size: "4.2 MB",
    icon: <FileText className="w-6 h-6 text-blue-400" />,
    description: "Полное руководство по современным методикам преподавания для среднего звена.",
    fullContent: `
      ## Методика преподавания в 5-9 классах

      ### 1. Введение
      Современное образование требует от учителя не только знания предмета, но и владения активными методами обучения.

      ### 2. Ключевые стратегии
      *   **Проблемное обучение**: постановка перед учащимися познавательных задач.
      *   **Проектная деятельность**: создание условий для самостоятельного исследования.
      *   **Дифференцированный подход**: учет индивидуальных особенностей каждого ученика.

      ### 3. Оценивание для обучения
      Использование формативного оценивания позволяет отслеживать прогресс в реальном времени.
    `
  },
  {
    id: 2,
    title: "Цифровая грамотность: Видеокурс",
    category: "Курсы",
    type: "Video",
    duration: "12:40",
    icon: <Video className="w-6 h-6 text-purple-400" />,
    description: "Освойте ключевые цифровые инструменты для автоматизации работы учителя.",
    fullContent: "Видеокурс включает в себя 5 модулей: от работы с облачными хранилищами до настройки ИИ-ассистентов в учебном процессе."
  },
  {
    id: 3,
    title: "Шаблоны КТП 2026",
    category: "Шаблоны",
    type: "DOCX",
    size: "1.1 MB",
    icon: <FileText className="w-6 h-6 text-green-400" />,
    description: "Актуальные шаблоны календарно-тематического планирования согласно новым стандартам.",
    fullContent: `
      # Календарно-тематическое планирование (Шаблон)
      **Предмет**: [Название]
      **Класс**: [Номер]
      **Учебный год**: 2026-2027

      | № | Тема урока | Кол-во часов | Дата | Примечание |
      |---|------------|--------------|------|------------|
      | 1 | Введение   | 1            |      |            |
      | 2 | Раздел 1   | 4            |      |            |
    `
  },
  {
    id: 4,
    title: "Психология общения с подростками",
    category: "Психология",
    type: "Audio",
    duration: "45:00",
    icon: <Book className="w-6 h-6 text-orange-400" />,
    description: "Аудио-лекция о психологических особенностях современных подростков."
  },
  {
    id: 5,
    title: "Инструменты геймификации на уроках",
    category: "Инновации",
    type: "PDF",
    size: "2.8 MB",
    icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
    description: "Как превратить обучение в игру: практические кейсы и инструменты."
  },
  {
    id: 6,
    title: "Сборник упражнений по критическому мышлению",
    category: "Методика",
    type: "PDF",
    size: "5.5 MB",
    icon: <FileText className="w-6 h-6 text-blue-400" />,
    description: "Более 50 упражнений для развития навыков анализа и оценки информации."
  },
  {
    id: 7,
    title: "Основы инклюзивного образования",
    category: "Курсы",
    type: "PDF",
    size: "3.2 MB",
    icon: <Bookmark className="w-6 h-6 text-indigo-400" />,
    description: "Введение в инклюзивную практику: работа с особыми образовательными потребностями."
  },
  {
    id: 8,
    title: "Мастер-класс: Дизайн презентаций",
    category: "Медиа",
    type: "Video",
    duration: "18:20",
    icon: <Video className="w-6 h-6 text-pink-400" />,
    description: "Создание эффектных и эффективных учебных презентаций за 20 минут."
  }
];

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
          className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function Library() {
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const { showNotification } = useNotification();

  const handleOpenResource = async (res) => {
    setSelectedResource(res);
    setPreviewText(res.fullContent || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    showNotification('Загрузка и анализ файла...', 'info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resources/extract-text', formData);
      const newResource = {
        id: Date.now(),
        title: file.name,
        category: "Загружено",
        type: file.name.split('.').pop().toUpperCase(),
        size: (file.size / 1024 / 1024).toFixed(1) + " MB",
        icon: <FileText className="w-6 h-6 text-yellow-400" />,
        description: "Ваш загруженный документ.",
        fullContent: res.data.text
      };
      
      setSelectedResource(newResource);
      setPreviewText(res.data.text);
      setIsModalOpen(true);
      showNotification('Файл успешно проанализирован!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Ошибка при обработке файла', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (e, title) => {
    e.stopPropagation();
    showNotification(`Файл "${title}" успешно добавлен в очередь загрузки`, 'success');
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    showNotification('Ресурс сохранен в закладки', 'info');
  };

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">Библиотека ресурсов</h1>
          <p className="text-gray-400">Полезные материалы, шаблоны и видеоуроки для вашего роста</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4 rotate-180" />
            {uploading ? 'Загрузка...' : 'Добавить свой'}
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" disabled={uploading} />
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Поиск ресурсов..." 
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white focus:outline-none focus:border-blue-500 transition-all w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {resources.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleOpenResource(item)}
            className="liquid-glass border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Bookmark className="w-4 h-4 text-blue-400" onClick={handleBookmark} />
            </div>
            <div className="mb-4 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{item.category}</div>
            <h3 className="text-white font-bold mb-4 line-clamp-2">{item.title}</h3>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-gray-500">{item.type} • {item.size || item.duration}</span>
              <button 
                onClick={(e) => handleDownload(e, item.title)}
                className="p-2 bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Рекомендовано для вас</h2>
            <p className="text-gray-300">На основе ваших последних КСП мы подобрали материалы по активным методам обучения.</p>
            <button 
              onClick={() => showNotification('Подборка сформирована', 'success')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 mx-auto md:mx-0 shadow-lg shadow-blue-500/20"
            >
              Посмотреть подборку <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="w-32 h-32 liquid-glass rounded-2xl border border-white/10 flex items-center justify-center hover:scale-105 transition-transform">
              <Video className="w-8 h-8 text-purple-400" />
            </div>
            <div className="w-32 h-32 liquid-glass rounded-2xl border border-white/10 flex items-center justify-center hover:scale-105 transition-transform">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedResource?.title || "Детали ресурса"}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 sticky top-0 backdrop-blur-md z-10">
            {selectedResource?.icon}
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{selectedResource?.category}</p>
              <p className="text-white font-bold">{selectedResource?.type} • {selectedResource?.size || selectedResource?.duration}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Описание</h4>
            <p className="text-gray-300 leading-relaxed">
              {selectedResource?.description}
            </p>
          </div>

          {previewText && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Содержание</h4>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/10 text-gray-200 whitespace-pre-wrap font-serif leading-relaxed text-sm">
                {previewText}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sticky bottom-0 bg-[#0f172a] pt-4">
            <button 
              onClick={(e) => { handleDownload(e, selectedResource?.title); setIsModalOpen(false); }}
              className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {selectedResource?.type === 'Video' ? <Play className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              {selectedResource?.type === 'Video' ? 'Смотреть' : 'Скачать'}
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(previewText);
                showNotification('Содержимое скопировано', 'success');
              }}
              className="py-4 border border-white/10 hover:bg-white/5 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" /> Копировать
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
