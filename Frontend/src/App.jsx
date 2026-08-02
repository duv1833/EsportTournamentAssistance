import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageTransition from './components/common/PageTransition';

// Pages
import Home from './pages/Home';
import TournamentList from './pages/TournamentList';
import TournamentDetailsVLR from './pages/TournamentDetailsVLR';
import MatchSchedule from './pages/MatchSchedule';
import Teams from './pages/Teams';
import ManageTeam from './pages/ManageTeam';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Lobby from './pages/Lobby';
import NewsPage from './pages/NewsPage';
import JoinTeamPage from './pages/JoinTeamPage';

function AppLayout() {
  const location = useLocation();
  const isLobby = location.pathname.startsWith('/lobby');

  return (
    <div className="bg-background text-on-surface font-body antialiased overflow-x-hidden selection:bg-primary-red selection:text-off-white bg-pattern-scanline min-h-[100dvh] flex flex-col">
      {/* Hiện Navbar nếu không phải Lobby */}
      {!isLobby && <Navbar />}

      {/* Main Container */}
      <main className={`flex-grow flex flex-col ${isLobby ? '' : 'pt-20'}`}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/tournaments/:id/*" element={<TournamentDetailsVLR />} />
            <Route path="/matches" element={<MatchSchedule />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/manage-team" element={<ManageTeam />} />
            <Route path="/manage_team" element={<ManageTeam />} /> {/* Legacy fallback */}
            <Route path="/join-team" element={<JoinTeamPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin_dashboard" element={<AdminDashboard />} /> {/* Legacy fallback */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/lobby/:matchId" element={<Lobby />} />
            <Route path="/news" element={<NewsPage />} />
          </Routes>
        </PageTransition>
      </main>

      {/* Hiện Footer nếu không phải Lobby */}
      {!isLobby && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}