import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import userService from '../../services/userService';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '../../context/ToastContext';
import { Search, Plus, Mail, Phone, Shield, UserCog, Trash2, X, Save, User as UserIcon } from 'lucide-react';

export default function Users({ user, onLogout }) {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'staff',
    phoneNumber: '' 
  });
  const sanitizePhone = (value) => value.replace(/\D/g, '').slice(0, 11);

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
      toast(`User ${username} deleted`, 'success');
    } catch (err) {
      toast("Failed to delete user", 'error');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await userService.register({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber
      });
      
      toast("User created successfully!", 'success');
      setShowAddModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'staff', phoneNumber: '' });
      fetchUsers();
    } catch (err) {
      toast("Error: " + (err.response?.data?.message || err.message), 'error');
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

  if (loading) return <LoadingScreen />;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 md:hidden">Users</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Customer">Customers</option>
            <option value="Staff">Staff Only</option>
          </select>
        </div>

        {/* Add Button */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto justify-center shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* STATS CARDS (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{totalUsers}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Users</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-100 text-green-600">
             <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{customerCount}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Customers</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
             <UserCog className="w-6 h-6" />
           </div>
           <div>
            <h3 className="text-xl font-bold">{staffCount}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Staff</p>
           </div>
        </div>
      </div>

      {/* USER LIST (Responsive: Card List on Mobile, Table on Desktop) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* DESKTOP TABLE (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
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
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                        {usr.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{usr.username}</p>
                        <p className="text-xs text-gray-400 font-mono">#{usr._id.slice(-4)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      usr.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      usr.role === 'staff' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {usr.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {usr.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" /> {usr.email}
                        </div>
                      )}
                      {usr.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" /> {usr.phoneNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(usr.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(usr._id, usr.username)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-gray-100">
           {filteredUsers.map((usr) => (
             <div key={usr._id} className="p-4 flex flex-col gap-3">
               
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                        {usr.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h4 className="font-semibold text-gray-900">{usr.username}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${
                           usr.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                           usr.role === 'staff' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                           'bg-green-50 text-green-700 border-green-200'
                        }`}>
                           {usr.role}
                        </span>
                     </div>
                  </div>
                  <button 
                     onClick={() => handleDelete(usr._id, usr.username)}
                     className="p-2 text-gray-400 hover:text-red-600 active:bg-red-50 rounded-lg"
                  >
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
                  {usr.email && (
                     <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" /> {usr.email}
                     </div>
                  )}
                  {usr.phoneNumber && (
                     <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" /> {usr.phoneNumber}
                     </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-500 text-xs pt-1 border-t border-gray-200 mt-2">
                     <UserIcon className="w-3 h-3" /> Joined: {new Date(usr.createdAt).toLocaleDateString()}
                  </div>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Username</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.phoneNumber}
                  onChange={e => setNewUser({...newUser, phoneNumber: sanitizePhone(e.target.value)})}
                  placeholder="0912 345 6789"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                <input 
                  required
                  type="password" 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md mt-2"
              >
                <Save className="w-5 h-5" /> Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
