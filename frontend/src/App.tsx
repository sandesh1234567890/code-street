import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LogViewer from './pages/LogViewer';
import Issues from './pages/Issues';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
        case 'dashboard': return <Dashboard />;
        case 'logs': return <LogViewer />;
        case 'issues': return <Issues />;
        default: return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-background min-h-screen text-foreground selection:bg-primary/20">
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
