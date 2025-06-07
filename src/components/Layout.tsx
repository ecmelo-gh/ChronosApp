import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '../context/AppContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { darkMode } = useAppContext();
  
  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
      />
      
      <div className={`
        flex-1 
        flex 
        flex-col 
        overflow-hidden 
        transition-all 
        duration-300 
        ease-in-out
        ${sidebarExpanded ? 'md:ml-64' : 'md:ml-20'}
      `}>
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;