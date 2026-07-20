import React, { useState, useEffect } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { getAllTeamsAdmin, deleteTeamAdmin } from '../services/adminService';
import TactileButton from '../components/common/TactileButton';

const AdminTeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeams = async () => {
    try {
      const res = await getAllTeamsAdmin();
      if (res.success) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi lấy danh sách đội tuyển');
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDelete = async (team) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đội tuyển "${team.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      await deleteTeamAdmin(team.id);
      setSuccess(`Đã xóa đội tuyển ${team.name}`);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-off-white uppercase mb-2">Quản lý Đội Tuyển</h2>
      <p className="font-mono text-sm text-tactical-gray mb-6">// Danh sách các đội tuyển Esports</p>

      {error && (
        <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 mb-4 text-sm font-mono uppercase">
          // Lỗi: {error}
        </div>
      )}
      {success && (
        <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-3 mb-4 text-sm font-mono uppercase">
          // Thành công: {success}
        </div>
      )}

      <div className="bg-surface-charcoal border border-outline-variant clip-corner overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background font-mono text-xs text-tactical-gray uppercase">
              <th className="p-4 border-b border-outline-variant">ID</th>
              <th className="p-4 border-b border-outline-variant">Đội Tuyển</th>
              <th className="p-4 border-b border-outline-variant">Đội Trưởng</th>
              <th className="p-4 border-b border-outline-variant">Thành viên</th>
              <th className="p-4 border-b border-outline-variant text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="font-body text-sm text-off-white">
            {teams.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-tactical-gray font-mono text-xs">Không có đội tuyển nào</td>
              </tr>
            ) : (
              teams.map(t => (
                <tr key={t.id} className="border-b border-outline-variant/50 hover:bg-surface-bright/20">
                  <td className="p-4 text-tactical-gray font-mono">{t.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-warning-amber" />
                      <div>
                        <div className="font-bold flex gap-2 items-center">
                          <span className="text-success-cyan font-mono text-xs">[{t.tag}]</span> {t.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    @{t.captainUsername}
                  </td>
                  <td className="p-4 font-mono text-xs">
                    {t.members ? t.members.length : 0} / 7
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(t)}
                      className="text-primary-red hover:text-off-white transition-colors p-1"
                      title="Xóa đội tuyển"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTeamManagement;
