import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import axios from 'axios';

const UploadVision = ({ setAnalyticsData }) => {
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const visionRes = await axios.post('http://localhost:8000/api/vision/parse-journal', formData);
      const data = visionRes.data.data;
      setParsedData(data);

      const analyticsRes = await axios.post('http://localhost:8000/api/analytics/calculate', data);
      setAnalyticsData({
        quality: analyticsRes.data.quality,
        performance: analyticsRes.data.performance
      });
      setDownloadUrl(analyticsRes.data.download_url);
    } catch (error) {
      console.error(error);
      alert('Ошибка при обработке журнала');
    } finally {
      setLoading(false);
    }
  }, [setAnalyticsData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': ['.jpeg', '.jpg', '.png']} });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Распознавание Журналов (Vision AI)</h1>
      
      <div 
        {...getRootProps()} 
        className={`glass p-16 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-kz-turquoise bg-kz-turquoise/10 scale-105' : 'border-gray-300 hover:border-kz-turquoise hover:bg-white/80'
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center text-kz-turquoise">
            <Loader2 className="animate-spin mb-4" size={56} />
            <p className="text-xl font-bold">Gemini 1.5 Flash анализирует фотографию...</p>
            <p className="text-gray-500 mt-2">Извлечение структуры таблицы и оценок</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <UploadCloud className="mb-6 text-kz-turquoise" size={64} />
            <p className="text-2xl font-bold text-gray-800">Перетащите фото журнала сюда</p>
            <p className="text-lg mt-2">или нажмите для выбора файла</p>
          </div>
        )}
      </div>

      {parsedData && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3"><CheckCircle className="text-success-green" size={28} /> Данные распознаны</h3>
            {downloadUrl && (
              <a href={`http://localhost:8000${downloadUrl}`} download>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-success-green text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-success-green/30">
                  <FileSpreadsheet size={22} /> Экспорт в 1С / Kundelik
                </motion.button>
              </a>
            )}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse bg-white/50">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-700">ФИО Ученика</th>
                  <th className="p-4 font-bold text-gray-700">Оценка</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-white/80 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{item.student}</td>
                    <td className="p-4 text-gray-800">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        item.grade >= 4 ? 'bg-success-green/20 text-success-green' : 
                        item.grade == 3 ? 'bg-yellow-500/20 text-yellow-600' : 
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {item.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadVision;
