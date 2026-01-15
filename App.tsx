
import React, { useState, useEffect } from 'react';
import { User, FoodListing } from './types';
import { apiService } from './services/apiService';
import Navbar from './components/Navbar';
import ExploreView from './views/ExploreView';
import PostFoodView from './views/PostFoodView';
import DashboardView from './views/DashboardView';
import AuthView from './views/AuthView';
import ProfileView from './views/ProfileView';
import NetworkingInfoView from './views/NetworkingInfoView';
import AdminView from './views/AdminView';
import AwarenessView from './views/AwarenessView';

type View = 'explore' | 'post' | 'dashboard' | 'profile' | 'auth' | 'networking' | 'admin' | 'awareness';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(apiService.getCurrentUser());
  const [currentView, setCurrentView] = useState<View>(currentUser ? 'explore' : 'auth');
  const [listings, setListings] = useState<FoodListing[]>([]);

  const refreshData = async () => {
    const data = await apiService.getListings();
    setListings(data);
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
      // Poll every 5 seconds for demo real-time feel
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLogin = (email: string) => {
    const user = apiService.login(email);
    setCurrentUser(user);
    setCurrentView('explore');
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setCurrentView('auth');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      {currentUser && (
        <Navbar 
          activeView={currentView} 
          setView={setCurrentView} 
          onLogout={handleLogout}
          userRole={currentUser.role}
          userName={currentUser.name}
        />
      )}

      <main className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
        {currentView === 'auth' && <AuthView onLogin={handleLogin} />}
        {currentView === 'explore' && (
          <ExploreView 
            listings={listings} 
            user={currentUser!} 
            onRefresh={refreshData} 
          />
        )}
        {currentView === 'post' && (
          <PostFoodView 
            user={currentUser!} 
            onSuccess={() => {
              refreshData();
              setCurrentView('explore');
            }} 
          />
        )}
        {currentView === 'dashboard' && (
          <DashboardView 
            user={currentUser!} 
            listings={listings}
            onRefresh={refreshData}
          />
        )}
        {currentView === 'profile' && (
          <ProfileView 
            user={currentUser!} 
            onLogout={handleLogout} 
          />
        )}
        {currentView === 'awareness' && (
          <AwarenessView />
        )}
        {currentView === 'networking' && (
          <NetworkingInfoView />
        )}
        {currentView === 'admin' && (
          <AdminView listings={listings} onRefresh={refreshData} />
        )}
      </main>

      <button 
        onClick={() => setCurrentView('networking')}
        className="fixed bottom-24 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-emerald-700 transition-colors md:bottom-8"
        title="Local Network Setup Info"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z"/><circle cx="12" cy="12" r="3"/><path d="M20 4L2 22"/></svg>
      </button>
    </div>
  );
};

export default App;
