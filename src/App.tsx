import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/AppContext';
import { TokenSetup } from '@/components/TokenSetup';
import { ChatInterface } from '@/components/ChatInterface';
import { UserNamePopup } from '@/components/UserNamePopup';
import { useApp } from '@/context/AppContext';

function AppContent() {
  const { apiToken } = useApp();

  return (
    <div className="h-screen">
      <UserNamePopup />
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
        position="top-center"
        offset={{ top: 80, left: 16, right: 16 }}
        mobileOffset={{ top: 16, left: 8, right: 8 }}
        className="z-[10000]"
        closeButton
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </AppProvider>
  );
}
