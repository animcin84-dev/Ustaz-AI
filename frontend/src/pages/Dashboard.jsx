import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Activity, BookOpen, BrainCircuit, ShieldCheck, Sparkles, Calendar, Plus, MessageSquare, Zap, X, Info, Clock, CheckCircle } from 'lucide-react';
import Analytics from '../components/Analytics';
import api from '../api';
import { Link } from 'react-router-dom';
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

const mockStudents = [
  { id: 1, name: "Алибек Касымов", grade: 85, progress: "+5%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali" },
  { id: 2, name: "Динара Сатпаева", grade: 92, progress: "+2%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dina" },
  { id: 3, name: "Марат Оспанов", grade: 78, progress: "-1%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marat" },
  { id: 4, name: "Айгерим Мурат", grade: 95, progress: "+8%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aige" },
  { id: 5, name: "Тимур Ибраев", grade: 88, progress: "+3%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Timur" }
];

const upcomingEvents = [
  { id: 1, time: "09:00", title: "СОР по Алгебре (8А)", type: "assessment" },
  { id: 2, time: "11:30", title: "Педсовет (Актовый зал)", type: "meeting" },
  { id: 3, time: "14:00", title: "Вебинар: Использование ИИ", type: "event" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

function Counter({ to, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = to / (duration * 60);
    const interval = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(interval);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [to, duration]);

  return <>{count}{suffix}</>;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ kspCount: 0, archiveCount: 0 });
  const [modal, setModal] = useState({ open: false, type: '', title: '', data: null });
  const { showNotification } = useNotification();

  const openModal = (type, title, data = null) => setModal({ open: true, type, title, data });
  const closeModal = () => setModal({ open: false, type: '', title: '', data: null });

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const fetchData = async () => {
      try {
        const [userRes, archiveRes] = await Promise.all([
          api.get('/auth/me', { signal: controller.signal }),
          api.get('/archive', { signal: controller.signal })
        ]);
        clearTimeout(timeoutId);
        setUser(userRes.data);
        const kspCount = archiveRes.data.filter(e => e.type === 'КСП').length;
        setStats({ kspCount, archiveCount: archiveRes.data.length });
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          console.error('Request timed out');
        } else {
          console.error('Failed to fetch dashboard data', err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h1 className="font-heading text-5xl mb-2 text-white flex items-center gap-4">
          С возвращением, {user?.username || 'Коллега'}!
          <Sparkles className="text-yellow-400 w-10 h-10" />
        </h1>
        <p className="text-gray-400 font-mono text-sm tracking-wide">Strategic Analysis 2026: Zero Paperwork Initiative</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                <div className="h-8 w-16 bg-white/10 rounded" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </motion.div>
            ))
          ) : (
            <>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/5 p-6 rounded-2xl relative group backdrop-blur-xl cursor-pointer" onClick={() => openModal('stats', 'Экономия времени')}>
                <div className="absolute top-4 right-4 p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform"><Activity className="w-5 h-5"/></div>
                <p className="text-sm text-gray-400 mb-2 font-medium">Сэкономлено времени</p>
                <p className="text-3xl font-bold text-white"><Counter to={stats.kspCount * 2 + stats.archiveCount} suffix=" ч/мес" /></p>
              </motion.div>
              
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/5 p-6 rounded-2xl relative group backdrop-blur-xl cursor-pointer" onClick={() => openModal('stats', 'Генерация КСП')}>
                <div className="absolute top-4 right-4 p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:scale-110 transition-transform"><BookOpen className="w-5 h-5"/></div>
                <p className="text-sm text-gray-400 mb-2 font-medium">Сгенерировано КСП</p>
                <p className="text-3xl font-bold text-white"><Counter to={stats.kspCount} /></p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/5 p-6 rounded-2xl relative group backdrop-blur-xl cursor-pointer" onClick={() => openModal('stats', 'Правовой статус')}>
                <div className="absolute top-4 right-4 p-2 bg-green-500/10 rounded-lg text-green-500 group-hover:scale-110 transition-transform"><ShieldCheck className="w-5 h-5"/></div>
                <p className="text-sm text-gray-400 mb-2 font-medium">Правовой статус</p>
                <p className="text-3xl font-bold text-white">Защищен</p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/5 p-6 rounded-2xl relative group backdrop-blur-xl cursor-pointer" onClick={() => openModal('stats', 'AI Энергия')}>
                <div className="absolute top-4 right-4 p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:scale-110 transition-transform"><Zap className="w-5 h-5"/></div>
                <p className="text-sm text-gray-400 mb-2 font-medium">Заряжен ИИ</p>
                <p className="text-3xl font-bold text-white">100%</p>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/report" className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all"><Plus className="w-5 h-5"/></div>
          <span className="text-sm font-bold">Создать КСП</span>
        </Link>
        <Link to="/scanner" className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all"><Plus className="w-5 h-5"/></div>
          <span className="text-sm font-bold">Сканировать</span>
        </Link>
        <Link to="/methodist" className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="p-2 bg-green-500/20 rounded-xl text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all"><MessageSquare className="w-5 h-5"/></div>
          <span className="text-sm font-bold">Чат с ИИ</span>
        </Link>
        <Link to="/brainstorm" className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all"><BrainCircuit className="w-5 h-5"/></div>
          <span className="text-sm font-bold">Идеи</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Analytics />
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Топ успеваемости
            </h3>
            <div className="space-y-4">
              {mockStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer" onClick={() => openModal('student', student.name, student)}>
                  <div className="flex items-center gap-3">
                    <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full border border-white/10" />
                    <div>
                      <p className="text-sm font-bold text-white">{student.name}</p>
                      <p className="text-[10px] text-gray-500">Средний балл: {student.grade}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-green-400">{student.progress}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Расписание
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-all" onClick={() => openModal('event', event.title, event)}>
                  <div className="text-xs font-bold text-gray-500 mt-0.5">{event.time}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{event.title}</p>
                    <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${
                      event.type === 'assessment' ? 'text-red-400' : 
                      event.type === 'meeting' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {event.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.title}>
        {modal.type === 'stats' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-1" />
              <p className="text-sm text-blue-100">Этот показатель рассчитывается на основе вашей активности за последние 30 дней.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Прошлый месяц</p>
                <p className="text-xl font-bold text-white">85%</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Тренд</p>
                <p className="text-xl font-bold text-green-400">+12%</p>
              </div>
            </div>
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all" onClick={() => { showNotification('Отчет сформирован', 'success'); closeModal(); }}>
              Подробный отчет
            </button>
          </div>
        )}
        {modal.type === 'student' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img src={modal.data?.avatar} className="w-16 h-16 rounded-full border-2 border-blue-500/30" />
              <div>
                <p className="text-2xl font-bold text-white">{modal.data?.name}</p>
                <p className="text-sm text-gray-400">8 "А" класс • Информатика</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-white">Успеваемость</span>
                </div>
                <span className="font-bold text-white">{modal.data?.grade}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white">Посещаемость</span>
                </div>
                <span className="font-bold text-white">98%</span>
              </div>
            </div>
            <button 
              onClick={() => showNotification('Запуск журнала успеваемости...', 'info')}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all"
            >
              Посмотреть журнал
            </button>
          </div>
        )}
        {modal.type === 'event' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
              <Calendar className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-xs text-purple-300 font-bold uppercase">Событие</p>
                <p className="text-white font-bold">{modal.data?.time}</p>
              </div>
            </div>
            <p className="text-gray-300">Подготовка материалов завершена на 80%. Не забудьте проверить наличие свободных кабинетов.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-white">Подготовить тесты</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <CheckCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-400">Распечатать ведомость</span>
              </div>
            </div>
            <button 
              onClick={() => showNotification('Переход к подготовке события...', 'info')}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold transition-all"
            >
              Перейти к подготовке
            </button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
