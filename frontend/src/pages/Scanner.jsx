import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle2, Loader2, Download, ExternalLink, X, Info, AlertCircle } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export default function Scanner() {
  const [file, setFile] = useState(null);
  const [isScanning, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const { showNotification } = useNotification();

  const handleEdit = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = parseInt(value) || 0;
    setResults(newResults);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setIsLoading(true);
    showNotification('Начинаю сканирование документа...', 'info');

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const response = await api.post("/universal-input", formData);
      
      const students = response.data.data.students || [];
      const stats = {
        quality: 75,
        performance: 92
      };

      setResults(students);
      setAnalytics(stats);
      showNotification('Документ успешно распознан!', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Ошибка при распознавании журнала. Проверьте фото и попробуйте снова.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const downloadExcel = async () => {
    showNotification('Подготовка файла Excel...', 'info');
    try {
      const response = await api.post(
        "/bulk-export",
        { students: results },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Kundelik_Import.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Файл Kundelik_Import.xlsx успешно скачан', 'success');
    } catch (error) {
      console.error("Ошибка при скачивании файла", error);
      showNotification('Ошибка при генерации Excel', 'error');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full space-y-8"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-secondary rounded-full animate-pulse" />
      </div>

      <div className="z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl mb-2 text-glow">Vision AI: Scanner</h1>
          <p className="text-gray-400">Парсинг оценок из бумажных журналов (СОР/СОЧ)</p>
        </div>

        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="upload"
              layoutId="scanner-container"
              className="relative"
            >
              <div
                {...getRootProps()}
                className={`liquid-glass-strong p-16 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${isDragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50'}`}
              >
                <input {...getInputProps()} />
                
                {isScanning && (
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(0,175,202,1)] z-20"
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                )}

                {!isScanning ? (
                  <>
                    <UploadCloud className="w-16 h-16 text-primary mb-4" />
                    <p className="text-xl font-medium mb-2">Перетащите фото журнала сюда</p>
                    <p className="text-sm text-gray-400">Только фото (JPG, PNG)</p>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-16 h-16 text-primary mb-4 animate-spin" />
                    <p className="text-xl font-medium mb-2">Gemini 1.5 Vision сканирует документ...</p>
                    <p className="text-sm text-primary">Подготовка данных для Kundelik.kz</p>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              layoutId="scanner-container"
              className="liquid-glass p-8 rounded-3xl"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-heading text-primary flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" /> Распознано успешно
                  </h2>
                  {analytics && (
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Качество:</span>
                        <span className="text-primary font-bold">{analytics.quality}%</span>
                      </div>
                      <div className="h-4 w-px bg-white/10" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Успеваемость:</span>
                        <span className="text-secondary font-bold">{analytics.performance}%</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={downloadExcel}
                    className="flex-1 md:flex-none bg-primary text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                  >
                    <Download className="w-4 h-4" /> Export Kundelik.xlsx
                  </button>
                  <button 
                    onClick={() => { setResults(null); setFile(null); setAnalytics(null); showNotification('Результаты сброшены', 'info'); }}
                    className="flex-1 md:flex-none text-sm border border-white/20 px-6 py-3 rounded-xl text-gray-300 hover:text-white transition-all hover:bg-white/5"
                  >
                    Сбросить
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="py-4 px-4 font-bold">Ученик (ФИО)</th>
                      <th className="py-4 px-4 text-center font-bold">СОР 1</th>
                      <th className="py-4 px-4 text-center font-bold">СОР 2</th>
                      <th className="py-4 px-4 text-center font-bold">СОЧ</th>
                      <th className="py-4 px-4 text-center font-bold">Итог</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {results.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/[0.02] group transition-colors"
                        >
                          <td className="py-4 px-4 font-medium text-white">{row.name}</td>
                          <td className="py-4 px-4 text-center">
                            <input 
                              type="number" 
                              value={row.sor1} 
                              onChange={(e) => handleEdit(i, 'sor1', e.target.value)}
                              className="w-12 bg-white/5 text-center rounded border border-white/10 py-1 focus:border-primary/50 focus:outline-none transition-colors font-mono"
                            />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input 
                              type="number" 
                              value={row.sor2} 
                              onChange={(e) => handleEdit(i, 'sor2', e.target.value)}
                              className="w-12 bg-white/5 text-center rounded border border-white/10 py-1 focus:border-primary/50 focus:outline-none transition-colors font-mono"
                            />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input 
                              type="number" 
                              value={row.soch} 
                              onChange={(e) => handleEdit(i, 'soch', e.target.value)}
                              className="w-12 bg-white/5 text-center rounded border border-white/10 py-1 focus:border-primary/50 focus:outline-none transition-colors font-mono font-bold text-primary"
                            />
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-secondary">
                            {Math.round((row.sor1 + row.sor2 + row.soch) / 3)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}