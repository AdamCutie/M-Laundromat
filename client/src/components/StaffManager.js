import React, { useState, useEffect } from 'react';
import userService from '../services/userService';

const StaffManager = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', password: '', isAdmin: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.log("Not an admin, or failed to fetch users.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await userService.register(newUser);
      alert("Staff Added!");
      setNewUser({ name: '', password: '', isAdmin: false });
      fetchUsers();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if(window.confirm(`Delete ${name}?`)) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) { alert("Failed to delete"); }
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '10px', border: '1px solid #ddd', marginTop: '20px' }}>
      <h3>👨‍💼 Staff Management</h3>
      
      {/* Form */}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '15px', padding: '10px', background: '#f8f9fa' }}>
        <input placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
        <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input type="checkbox" checked={newUser.isAdmin} onChange={e => setNewUser({...newUser, isAdmin: e.target.checked})} /> Admin?
        </label>
        <button type="submit" style={{ background: '#6c5ce7', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Add</button>
      </form>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}><th style={{padding:'5px'}}>Name</th><th style={{padding:'5px'}}>Role</th><th style={{padding:'5px'}}>Action</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{padding:'8px'}}>{u.username}</td>
              <td style={{padding:'8px'}}>{u.role}</td>
              <td style={{padding:'8px'}}>
                <button onClick={() => handleDelete(u._id, u.username)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffManager;