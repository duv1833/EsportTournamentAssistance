import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Trophy, LayoutDashboard, Flag, Activity } from 'lucide-react';
import { getDashboardStats } from '../services/adminService';
import AdminTournamentManagement from './AdminTournamentManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminTeamManagement from './AdminTeamManagement';

const AdminDashboard = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'overview' && currentUser?.id) {
      fetchStats();
    }
  }, [activeTab, currentUser]);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats(currentUser.id);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tải dữ liệu thống kê');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'tournaments', label: 'Quản lý Giải đấu', icon: Trophy },
    { id: 'users', label: 'Quản lý Người Dùng', icon: Users },
    { id: 'teams', label: 'Quản lý Đội Tuyển', icon: Flag },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner-top sticky top-24">
          <div className="mb-6 pb-4 border-b border-outline-variant/50">
            <h2 className="font-display text-xl text-off-white uppercase flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary-red" />
              Admin Panel
            </h2>
            <p className="font-mono text-xs text-tactical-gray mt-1">Hệ thống quản trị</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-display uppercase text-sm transition-all ${
                    isActive 
                      ? 'bg-primary-red/10 text-primary-red border-l-2 border-primary-red' 
                      : 'text-off-white/70 hover:bg-surface-bright/20 hover:text-off-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-display text-3xl text-off-white uppercase mb-2">Tổng quan hệ thống</h2>
              <p className="font-mono text-sm text-tactical-gray">// Số liệu thống kê thời gian thực</p>
            </div>
            
            {error && (
              <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 text-sm font-mono uppercase">
                // Lỗi: {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat Card 1 */}
              <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner relative overflow-hidden group hover:border-success-cyan transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-success-cyan">
                  <Users size={64} />
                </div>
                <p className="font-mono text-xs text-tactical-gray uppercase mb-2">Tổng người dùng</p>
                <div className="font-display text-4xl text-off-white">
                  {stats ? stats.totalUsers : '--'}
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner relative overflow-hidden group hover:border-warning-amber transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-warning-amber">
                  <Trophy size={64} />
                </div>
                <p className="font-mono text-xs text-tactical-gray uppercase mb-2">Tổng giải đấu</p>
                <div className="font-display text-4xl text-off-white">
                  {stats ? stats.totalTournaments : '--'}
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-surface-charcoal border border-primary-red/30 p-6 clip-corner relative overflow-hidden group hover:border-primary-red transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary-red">
                  <Activity size={64} />
                </div>
                <p className="font-mono text-xs text-tactical-gray uppercase mb-2">Giải đang chờ duyệt</p>
                <div className="font-display text-4xl text-primary-red">
                  {stats ? stats.pendingTournaments : '--'}
                </div>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner relative overflow-hidden group hover:border-success-cyan transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-success-cyan">
                  <Flag size={64} />
                </div>
                <p className="font-mono text-xs text-tactical-gray uppercase mb-2">Tổng đội tuyển</p>
                <div className="font-display text-4xl text-off-white">
                  {stats ? stats.totalTeams : '--'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="animate-fade-in">
            <AdminTournamentManagement currentUser={currentUser} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <AdminUserManagement currentUser={currentUser} />
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="animate-fade-in">
            <AdminTeamManagement />
          </div>
        )}
      </main>

    </div>
  );
};

export default AdminDashboard;
