import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, TrendingUp, GraduationCap, Briefcase, ChevronRight, Star, Clock, X, CheckCircle, FileText, Download, Play, ExternalLink, Calendar } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const courses = [
  { id: 1, title: "Искусственный интеллект в образовании", progress: 75, instructor: "Данияр Касымов", status: "В процессе" },
  { id: 2, title: "Методология обновленного содержания", progress: 100, instructor: "Айгуль Мурат", status: "Завершен" },
  { id: 3, title: "Критическое мышление на уроках", progress: 30, instructor: "Сергей Ли", status: "В процессе" }
];

const achievements = [
  { id: 1, title: "Инноватор года", date: "2025", icon: "🚀", details: "Награда за внедрение ИИ-технологий в учебный процесс." },
  { id: 2, title: "Лучший наставник", date: "2024", icon: "🤝", details: "Признание за вклад в развитие молодых специалистов." },
  { id: 3, title: "Digital Teacher", date: "2026", icon: "💻", details: "Сертификация по программе цифровой трансформации образования." }
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
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function Growth() {
  const [modal, setModal] = useState({ open: false, type: '', title: '' });
  const { showNotification } = useNotification();

  const openModal = (type, title) => setModal({ open: true, type, title });
  const closeModal = () => setModal({ open: false, type: '', title: '' });

  const handleAction = (message, type = 'success') => {
    showNotification(message, type);
    if (type === 'success') closeModal();
  };

  const handleDownload = (fileName) => {
    showNotification(`Файл "${fileName}" подготовлен к скачиванию`, 'success');
  };

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 text-glow">Профессиональный рост</h1>
        <p className="text-gray-400">Ваш путь к высшей категории и новым навыкам</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Courses */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-blue-400" /> Активные курсы
            </h2>
            <div className="space-y-6">
              {courses.map(course => (
                <div key={course.id} className="space-y-3 cursor-pointer group" onClick={() => openModal('course', course.title)}>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{course.title}</h3>
                      <p className="text-xs text-gray-500">{course.instructor} • {course.status}</p>
                    </div>
                    <span className="text-xs font-mono text-blue-400">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" /> Достижения и награды
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map(ach => (
                <div 
                  key={ach.id} 
                  onClick={() => openModal('achievement', ach.title)}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{ach.icon}</div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">{ach.title}</p>
                  <p className="text-[10px] text-gray-500">{ach.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => openModal('attestation', 'Подготовка к аттестации')}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-white font-bold mb-2">Подготовка к аттестации</h3>
              <p className="text-xs text-gray-500">Чек-лист документов и пробные тесты ОЗП</p>
            </div>
            <div 
              onClick={() => openModal('portfolio', 'Портфолио педагога')}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl">
                  <Award className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-white font-bold mb-2">Портфолио</h3>
              <p className="text-xs text-gray-500">Ваши достижения и сертификаты в одном месте</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 p-8 rounded-3xl sticky top-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400" /> Статус педагога
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <Briefcase className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Категория</p>
                  <p className="text-white font-bold">Педагог-эксперт</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Стаж</p>
                  <p className="text-white font-bold">12 лет 4 месяца</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4">Следующая цель</p>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-300">Педагог-исследователь</span>
                  <span className="text-blue-400">85%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-blue-500" />
                </div>
              </div>
              <button 
                onClick={() => openModal('category', 'Как повысить категорию?')}
                className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all"
              >
                Как повысить категорию?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals Implementation */}
      <Modal isOpen={modal.open} onClose={closeModal} title={modal.title}>
        {modal.type === 'attestation' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Необходимые документы
              </h4>
              <div className="space-y-3">
                {[
                  "Заявление установленного образца",
                  "Копия диплома об образовании",
                  "Удостоверение о прохождении курсов (не менее 72ч)",
                  "Лист оценки достижений (портфолио)",
                  "Результаты ОЗП (Национальное квалификационное тестирование)"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleDownload('Checklist_Attestation_2026.pdf')}
                className="w-full mt-4 py-3 border border-white/10 hover:bg-white/5 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Скачать чек-лист (PDF)
              </button>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" /> Пробные тесты ОЗП
              </h4>
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() => handleAction('Запуск теста по методике обучения...', 'info')}
                >
                  <div>
                    <p className="text-sm text-white font-bold">Методика и технология обучения</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">20 вопросов • 40 минут</p>
                  </div>
                  <Play className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() => handleAction('Запуск теста по предметным знаниям...', 'info')}
                >
                  <div>
                    <p className="text-sm text-white font-bold">Предметные знания (Профильный уровень)</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">30 вопросов • 60 минут</p>
                  </div>
                  <Play className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        )}
        {modal.type === 'portfolio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Грамоты</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Публикации</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white">Статья: Использование ИИ</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white">Грамота: Учитель года</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
              </div>
            </div>
            <button 
              onClick={() => handleAction('Портфолио успешно сформировано и готово к отправке', 'success')}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Сформировать портфолио
            </button>
          </div>
        )}
        {modal.type === 'achievement' && (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-300 leading-relaxed">
              {achievements.find(a => a.title === modal.title)?.details || 'Детали достижения будут доступны в ближайшее время.'}
            </p>
            <button 
              onClick={() => handleAction('Ссылка для публикации скопирована в буфер обмена', 'success')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all"
            >
              Поделиться в соцсетях
            </button>
          </div>
        )}
        {modal.type === 'category' && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">До категории «Педагог-исследователь» вам осталось:</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white">Публикации (2/3)</span>
                  <span className="text-blue-400">66%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[66%] bg-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white">Курсы (144ч/144ч)</span>
                  <span className="text-green-500">100%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-green-500" />
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleAction('Ваша заявка на консультацию принята. Методист свяжется с вами в течение 24 часов.', 'success')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" /> Записаться на консультацию
            </button>
          </div>
        )}
        {modal.type === 'course' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <p className="text-blue-400 text-sm font-bold">Вы прошли 6 из 8 модулей этого курса.</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest border-b border-white/5 pb-2">Программа модуля:</p>
              <div className="text-sm text-gray-300 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>1. Введение в современные технологии</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>2. Интеграция в учебный процесс</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-500" />
                  <span className="text-white font-bold">3. Практические кейсы (Текущий)</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleAction('Переход к следующему уроку...', 'info')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> Продолжить обучение
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
