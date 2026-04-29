import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = ({ data }) => {
  // Demo data if none provided
  const displayData = data || [
    { name: 'Алибек А.', sor1: 15, sor2: 14, soch: 28, grade: 5 },
    { name: 'Сауле Б.', sor1: 12, sor2: 10, soch: 22, grade: 4 },
    { name: 'Марат К.', sor1: 8, sor2: 7, soch: 15, grade: 3 },
    { name: 'Айжан М.', sor1: 18, sor2: 19, soch: 29, grade: 5 },
    { name: 'Дамир С.', sor1: 10, sor2: 11, soch: 18, grade: 4 },
  ];

  const chartData = displayData.map(s => ({
    name: s.name,
    'СОР 1': s.sor1,
    'СОР 2': s.sor2,
    'СОЧ': s.soch,
    'Прогноз': Math.round((s.sor1 + s.sor2) / 2 * 1.1)
  }));

  const gradeDistribution = [
    { name: 'Отлично (5)', value: displayData.filter(s => s.grade === 5).length, color: '#10b981' },
    { name: 'Хорошо (4)', value: displayData.filter(s => s.grade === 4).length, color: '#3b82f6' },
    { name: 'Удовл. (3)', value: displayData.filter(s => s.grade === 3).length, color: '#f59e0b' },
    { name: 'Неудовл. (2)', value: displayData.filter(s => s.grade === 2).length, color: '#ef4444' },
  ];

  const riskStudents = displayData.filter(s => s.grade <= 3);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Зоны риска</h3>
          <p className="text-3xl font-bold text-red-400">{riskStudents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Требуют внимания (Оценка ≤ 3)</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Качество знаний</h3>
          <p className="text-3xl font-bold text-green-400">
            {Math.round((displayData.filter(s => s.grade >= 4).length / displayData.length) * 100)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Доля оценок 4 и 5</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Ср. балл класса</h3>
          <p className="text-3xl font-bold text-blue-400">
            {(displayData.reduce((acc, s) => acc + s.grade, 0) / displayData.length).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">По текущему предмету</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[400px] bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6">Динамика успеваемости</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="Прогноз" fill="#8884d820" stroke="#8884d8" />
              <Bar dataKey="СОР 1" barSize={20} fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="СОР 2" barSize={20} fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="СОЧ" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[400px] bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6">Распределение оценок</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
