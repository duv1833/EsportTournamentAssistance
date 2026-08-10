import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageTransition from './components/layout/PageTransition';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const TournamentList = lazy(() => import('./pages/TournamentList'));
const TournamentDetailsVLR = lazy(() => import('./pages/TournamentDetailsVLR'));
const MatchSchedule = lazy(() => import('./pages/MatchSchedule'));
const Teams = lazy(() => import('./pages/Teams'));
const ManageTeam = lazy(() => import('./pages/ManageTeam'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Lobby = lazy(() => import('./pages/Lobby'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const JoinTeamPage = lazy(() => import('./pages/JoinTeamPage'));

const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <span className="animate-spin h-10 w-10 border-4 border-primary-red border-t-transparent rounded-full"></span>
  </div>
);

function AppLayout() {
  const location = useLocation();
  const isLobby = location.pathname.startsWith('/lobby');
  const { currentUser, logout, updateCurrentUser } = useAuth();

  return (
    <div className="bg-background text-on-surface font-body antialiased overflow-x-hidden selection:bg-primary-red selection:text-off-white bg-pattern-scanline min-h-[100dvh] flex flex-col">
      {!isLobby && <Navbar />}

      <main className={`flex-grow ${isLobby ? '' : 'pt-20'}`}>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/tournaments" element={<PageTransition><TournamentList /></PageTransition>} />
              <Route path="/tournaments/:id/*" element={<PageTransition><TournamentDetailsVLR currentUser={currentUser} /></PageTransition>} />
              <Route path="/matches" element={<PageTransition><MatchSchedule /></PageTransition>} />
              <Route path="/teams" element={<PageTransition><Teams /></PageTransition>} />
              <Route path="/manage-team" element={<PageTransition><ManageTeam /></PageTransition>} />
              <Route path="/manage_team" element={<PageTransition><ManageTeam /></PageTransition>} />
              <Route path="/join-team" element={<PageTransition><JoinTeamPage /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><UserProfile currentUser={currentUser} onUserUpdated={updateCurrentUser} /></PageTransition>} />
              <Route path="/admin" element={<PageTransition><AdminDashboard currentUser={currentUser} /></PageTransition>} />
              <Route path="/admin_dashboard" element={<PageTransition><AdminDashboard currentUser={currentUser} /></PageTransition>} />
              <Route path="/organizer_dashboard/:id" element={<Navigate to="/tournaments/:id/manage" replace />} />
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
              <Route path="/lobby/:matchId" element={<Lobby />} />
              <Route path="/news" element={<PageTransition><NewsPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isLobby && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppLayout />
      </NotificationProvider>
    </AuthProvider>
  );
}
