import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Award, BookOpen } from 'lucide-react';

const Dashboard = ({ data }) => {
  const chartData = [
    { name: 'Качество Знаний', value: data.quality || 0, fill: '#00AFCA' },
    { name: 'Успеваемость', value: data.performance || 0, fill: '#00A650' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Аналитика 1С & Kundelik</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Качество Знаний (КЗ)" value={`${data.quality || 0}%`} icon={<Award className="text-kz-turquoise" size={32} />} variants={itemVariants} />
        <StatCard title="Успеваемость (У)" value={`${data.performance || 0}%`} icon={<TrendingUp className="text-success-green" size={32} />} variants={itemVariants} />
        <StatCard title="Классов обработано" value="1" icon={<BookOpen className="text-purple-500" size={32} />} variants={itemVariants} />
      </div>

      <motion.div variants={itemVariants} className="glass p-8 rounded-3xl h-[400px] mt-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Показатели класса</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, variants }) => (
  <motion.div variants={variants} whileHover={{ y: -5 }} className="glass p-8 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-xl transition-shadow">
    <div>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-4xl font-extrabold text-gray-800 mt-2">{value}</h3>
    </div>
    <div className="p-4 bg-white/60 rounded-2xl shadow-inner">{icon}</div>
  </motion.div>
);

export default Dashboard;
