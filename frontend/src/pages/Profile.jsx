import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

const Profile = () => {
  const [user, setUser] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser({ username: res.data.username, email: res.data.email });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', { username: user.username, email: user.email });
      showNotification('Профиль успешно обновлен', 'success');
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Ошибка при обновлении профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 text-glow">Личный профиль</h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Personal Identification & Identity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full group-hover:bg-blue-500/10 transition-all" />
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <User className="w-5 h-5 text-blue-400" /> Основная информация
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Имя пользователя</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email адрес</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Сохранить изменения
            </button>
          </form>
        </motion.div>

        {/* Security Disabled */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden group"
        >
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full group-hover:bg-purple-500/10 transition-all" />
          <div className="p-4 bg-blue-500/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
            <ShieldCheck className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Безопасность</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-[250px]">
            Ваш аккаунт защищен локальной системой Ustaz-AI. В демо-режиме изменение пароля не требуется.
          </p>
          <div className="mt-8 pt-8 border-t border-white/5 w-full">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Status: Verified Member</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
