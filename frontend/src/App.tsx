import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LogViewer from './pages/LogViewer';
import Issues from './pages/Issues';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
        case 'dashboard': return <Dashboard />;
        case 'logs': return <LogViewer />;
        case 'issues': return <Issues />;
        default: return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 selection:bg-blue-500/30">
      <Sidebar 
        onNavigate={setCurrentPage} 
        currentPage={currentPage} 
        onLogout={logout}
        user={user}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
