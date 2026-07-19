import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getAllUsers, banUser, unbanUser } from '../services/adminService';
import TactileButton from '../components/common/TactileButton';

const AdminUserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi lấy danh sách người dùng');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    setError('');
    setSuccess('');
    try {
      if (user.isActive) {
        await banUser(user.id);
        setSuccess(`Đã khóa tài khoản ${user.username}`);
      } else {
        await unbanUser(user.id);
        setSuccess(`Đã mở khóa tài khoản ${user.username}`);
      }
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-off-white uppercase mb-2">Quản lý Người Dùng</h2>
      <p className="font-mono text-sm text-tactical-gray mb-6">// Danh sách người dùng hệ thống</p>

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
              <th className="p-4 border-b border-outline-variant">Tài khoản</th>
              <th className="p-4 border-b border-outline-variant">Vai trò</th>
              <th className="p-4 border-b border-outline-variant">Trạng thái</th>
              <th className="p-4 border-b border-outline-variant text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="font-body text-sm text-off-white">
            {users.map(u => (
              <tr key={u.id} className="border-b border-outline-variant/50 hover:bg-surface-bright/20">
                <td className="p-4 text-tactical-gray font-mono">{u.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-success-cyan" />
                    <div>
                      <div className="font-bold">{u.username}</div>
                      <div className="text-xs text-off-white/60">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-mono uppercase font-bold ${u.globalRole === 'ADMIN' ? 'text-primary-red border border-primary-red' : 'text-tactical-gray'}`}>
                    {u.globalRole}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-mono uppercase ${u.isActive ? 'text-success-cyan bg-success-cyan/10' : 'text-primary-red bg-primary-red/10'}`}>
                    {u.isActive ? 'Hoạt động' : 'Bị Khóa'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {u.globalRole !== 'ADMIN' && (
                    <TactileButton 
                      onClick={() => handleToggleStatus(u)}
                      className={`text-xs px-3 py-1 font-mono uppercase ${u.isActive ? 'bg-primary-red hover:bg-primary-red/80' : 'bg-success-cyan text-background hover:bg-success-cyan/80'}`}
                    >
                      {u.isActive ? 'Khóa' : 'Mở Khóa'}
                    </TactileButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
