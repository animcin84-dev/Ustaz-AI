import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Save, Loader2, Check } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

const Settings = () => {
  const [prefs, setPrefs] = useState({ theme: 'dark', language: 'ru', notifications: true });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const controller = new AbortController();
    fetchPrefs(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchPrefs = async (signal) => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me', { signal });
      if (res.data.preferences) {
        setPrefs(res.data.preferences);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.put('/auth/preferences', prefs);
      
      // Apply theme immediately
      if (prefs.theme === 'light') {
        document.documentElement.classList.add('light');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      } else {
        document.documentElement.classList.remove('light');
        document.body.style.backgroundColor = '#050508';
        document.body.style.color = '#f8fafc';
      }
      
      showNotification('Настройки успешно применены', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Ошибка при сохранении настроек', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 text-glow">Настройки</h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">System Configuration & UX</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Theme */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${prefs.theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {prefs.theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-white font-bold">Тема оформления</p>
              <p className="text-gray-400 text-sm">Выберите светлую или темную тему</p>
            </div>
          </div>
          <select 
            value={prefs.theme}
            onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="dark">Темная</option>
            <option value="light">Светлая</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">Язык интерфейса</p>
              <p className="text-gray-400 text-sm">Основной язык приложения</p>
            </div>
          </div>
          <select 
            value={prefs.language}
            onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="ru">Русский</option>
            <option value="kk">Қазақша</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">Уведомления</p>
              <p className="text-gray-400 text-sm">Получать оповещения системы</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={prefs.notifications}
              onChange={(e) => setPrefs({ ...prefs, notifications: e.target.checked })}
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
          </label>
        </div>

        <div className="pt-4 flex items-center justify-end relative z-10">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 active:scale-95"
          >
            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
