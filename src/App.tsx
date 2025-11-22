import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/AppContext';
import { TokenSetup } from '@/components/TokenSetup';
import { ChatInterface } from '@/components/ChatInterface';
import { useApp } from '@/context/AppContext';

function AppContent() {
  const { apiToken } = useApp();

  return (
    <div className="h-screen">
      {apiToken ? <ChatInterface /> : <TokenSetup />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        className="z-[10000]"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </AppProvider>
  );
}
