import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { Profile } from '../contexts/AuthContext';
import { Button } from './Button';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      alert("Failed to fetch users. Ensure you are an admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (user: Profile) => {
    if (user.role === 'admin') return; // protect admin
    try {
      await adminService.toggleUserStatus(user.id, user.is_active);
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleUpdateCredits = async (user: Profile) => {
    const val = creditInputs[user.id];
    if (!val) return;
    const amount = parseInt(val);
    if (isNaN(amount)) return;

    try {
      const newTotal = user.credits + amount;
      await adminService.updateUserCredits(user.id, newTotal);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, credits: newTotal } : u));
      setCreditInputs(prev => ({ ...prev, [user.id]: '' }));
    } catch (e) {
      alert("Failed to update credits");
    }
  };

  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.mobile_number?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-neutral-900 border border-white/20 w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl rounded-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center bg-black gap-4">
          <div>
            <h2 className="text-2xl font-bold brand-font text-white uppercase tracking-wider">Super Admin</h2>
            <p className="text-xs text-purple-400 uppercase tracking-widest font-bold">User Management</p>
          </div>

          <div className="flex gap-4 items-center w-full md:w-auto">
            <input
              type="text"
              placeholder="Search Name, Email, Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-800 border border-white/10 px-4 py-2 text-sm text-white focus:border-purple-500 outline-none w-full md:w-80 rounded text-center md:text-left"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">Loading Database...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-neutral-900 z-10 border-b border-white/20">
                <tr className="text-xs text-gray-400 uppercase tracking-widest">
                  <th className="p-4 font-normal">User Details</th>
                  <th className="p-4 font-normal">Contact</th>
                  <th className="p-4 font-normal">Role / Status</th>
                  <th className="p-4 font-normal">Expiry</th>
                  <th className="p-4 font-normal">Generations</th>
                  <th className="p-4 font-normal">Credits</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(user => {
                  const isExpired = user.expiry_date ? new Date(user.expiry_date) < new Date() : false;

                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{user.full_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300">{user.email}</div>
                        <div className="text-xs text-purple-400 font-mono">{user.mobile_number || 'No Mobile'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${user.role === 'admin' ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                            {user.role}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${user.is_active ? (isExpired ? 'bg-orange-900/30 border-orange-500 text-orange-300' : 'bg-green-900/30 border-green-500 text-green-300') : 'bg-red-900/30 border-red-500 text-red-300'}`}>
                            {user.is_active ? (isExpired ? 'Expired' : 'Active') : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <input
                          type="date"
                          className="bg-black border border-white/10 text-xs text-gray-300 p-1 rounded outline-none focus:border-purple-500"
                          value={user.expiry_date ? new Date(user.expiry_date).toISOString().split('T')[0] : ''}
                          onChange={async (e) => {
                            const newDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                            try {
                              await adminService.updateUserExpiry(user.id, newDate);
                              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, expiry_date: newDate || undefined } : u));
                            } catch (err) {
                              alert("Failed to update expiry date");
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="text-lg font-bold text-cyan-400">{user.total_generations || 0}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-lg font-bold text-white">{user.credits}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          {/* Add/Remove Credits */}
                          <div className="flex items-center border border-white/10 rounded overflow-hidden">
                            <input
                              type="number"
                              placeholder="+/-"
                              className="w-16 bg-black p-1 text-xs text-center text-white outline-none"
                              value={creditInputs[user.id] || ''}
                              onChange={(e) => setCreditInputs(p => ({ ...p, [user.id]: e.target.value }))}
                            />
                            <button onClick={() => handleUpdateCredits(user)} className="bg-white/10 hover:bg-white/20 px-2 py-1 text-[10px] uppercase font-bold text-gray-300">Set</button>
                          </div>

                          {/* Toggle Status */}
                          {user.role !== 'admin' && (
                            <Button
                              variant={user.is_active ? 'secondary' : 'primary'}
                              onClick={() => handleToggleStatus(user)}
                              className={`py-1 px-3 text-[10px] w-24 ${user.is_active ? 'border-red-500/50 hover:bg-red-900/20 text-red-400' : ''}`}
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
