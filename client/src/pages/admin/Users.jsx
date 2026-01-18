import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import userService from '../../services/userService';
import { Search, Plus, Mail, Phone, Shield, UserCog, Trash2, X, Save } from 'lucide-react';

export default function Users({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  
  // ✅ UPDATE: Added phoneNumber to state
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'staff',
    phoneNumber: '' 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load users");
      setLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      await userService.deleteUser(userId);
      fetchUsers(); // Refresh list
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // ✅ UPDATE: Sending phoneNumber to backend
      await userService.register({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber
      });
      
      alert("User created successfully!");
      setShowAddModal(false);
      // Reset form
      setNewUser({ username: '', email: '', password: '', role: 'staff', phoneNumber: '' });
      fetchUsers();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  // Logic: Filter Data
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'All' || 
                        (selectedRole === 'Staff' && (u.role === 'staff' || u.role === 'admin')) ||
                        (selectedRole === 'Customer' && u.role === 'customer');
    return matchesSearch && matchesRole;
  });

  // Logic: Calc Stats
  const totalUsers = users.length;
  const customerCount = users.filter(u => u.role === 'customer').length;
  const staffCount = users.filter(u => u.role === 'staff' || u.role === 'admin').length;

  if (loading) return <div className="p-10 text-center">Loading Users...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      {/* Header Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Customer">Customers</option>
            <option value="Staff">Staff Only</option>
          </select>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-100 text-green-600">
             <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{customerCount}</h3>
            <p className="text-sm text-gray-500">Customers</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
             <UserCog className="w-6 h-6" />
           </div>
           <div>
            <h3 className="text-2xl font-bold">{staffCount}</h3>
            <p className="text-sm text-gray-500">Staff Members</p>
           </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((usr) => (
                <tr key={usr._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {usr.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{usr.username}</p>
                        <p className="text-xs text-gray-500">ID: ...{usr._id.slice(-4)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full border ${
                      usr.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                      usr.role === 'staff' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      {usr.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {usr.email ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {usr.email}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No email</span>
                      )}
                      {usr.phoneNumber ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {usr.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No phone</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(usr.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(usr._id, usr.username)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Staff / Admin</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username (Display Name)</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  placeholder="admin@example.com"
                />
              </div>

              {/* ✅ NEW: Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.phoneNumber}
                  onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})}
                  placeholder="e.g. 0912 345 6789"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  required
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  * Admins have full access. Staff have restricted access.
                </p>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}