import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020204] text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[30%] left-[40%] w-[20%] h-[20%] bg-blue-500/5 blur-[100px] rounded-full animate-float" />
      </div>

      <div className="flex relative z-10 h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#050508]/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 z-[60]">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
               <span className="font-black text-white text-xs">U</span>
             </div>
             <span className="font-black text-white tracking-tighter text-lg">Ustaz AI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className={`flex-1 lg:ml-64 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar relative pt-16 lg:pt-0`}>
          <div className="min-h-full p-4 lg:p-10 w-full flex flex-col max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
