import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Scan, 
  FileText, 
  MessageSquare, 
  Archive as ArchiveIcon,
  Cpu,
  ShieldCheck,
  Lightbulb,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Library as LibraryIcon,
  TrendingUp as GrowthIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/', label: 'Панель', icon: LayoutDashboard },
  { path: '/scanner', label: 'AI Сканер', icon: Scan },
  { path: '/report', label: 'Отчеты', icon: FileText },
  { path: '/library', label: 'Библиотека', icon: LibraryIcon },
  { path: '/growth', label: 'Развитие', icon: GrowthIcon },
  { path: '/brainstorm', label: 'Штурм', icon: Lightbulb },
  { path: '/methodist', label: 'Legal Guardian', icon: ShieldCheck },
  { path: '/archive', label: 'Архив', icon: ArchiveIcon },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={cn(
      "fixed lg:relative w-64 h-full bg-[#050508]/60 backdrop-blur-3xl border-r border-white/10 flex flex-col pt-10 pb-6 px-4 z-50 transition-transform duration-500 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="mb-14 px-4">
        <div className="flex items-center gap-3 mb-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform duration-500">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-white tracking-tighter">Ustaz AI</h1>
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-transparent rounded-full opacity-50" />
          </div>
        </div>
        <p className="text-indigo-400 text-[9px] font-black tracking-[0.3em] uppercase opacity-60 ml-1">TRL-7 Enterprise</p>
      </div>

      <nav className="flex-1 space-y-1.5 custom-scrollbar overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] border border-white/10" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-full"
                />
              )}
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-blue-400" : "text-gray-500"
              )} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <Link to="/profile" className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 text-xs font-black text-white shadow-2xl hover:border-blue-500 transition-all duration-300">
              {user?.username?.substring(0, 2).toUpperCase() || 'УЗ'}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to="/profile" className="text-sm font-black text-white truncate hover:text-blue-400 transition-colors block">
                {user?.username || 'Загрузка...'}
              </Link>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">School №15</p>
            </div>
            <Link to="/settings" className="p-2 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
