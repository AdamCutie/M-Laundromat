import React, { useState, useEffect, useContext } from 'react';
import attendanceService from '../services/attendanceService';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StaffAttendance = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [status, setStatus] = useState('Loading...');
  const [record, setRecord] = useState(null);

  // Check status when the component loads
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await attendanceService.getStatus();
      setStatus(data.status); // "Clocked In", "Clocked Out", or "Not Started"
      setRecord(data.data);
    } catch (err) {
      console.error("Error checking attendance status");
    }
  };

  const handleClockIn = async () => {
    try {
      await attendanceService.clockIn();
      toast("✅ You are now Clocked In!", 'success');
      checkStatus(); // Refresh to update the button
    } catch (err) {
      toast("Error: " + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleClockOut = async () => {
    if (!window.confirm("Are you sure you want to clock out?")) return;
    try {
      await attendanceService.clockOut();
      toast("👋 Shift Ended. See you tomorrow!", 'success');
      checkStatus();
    } catch (err) {
      toast("Error: " + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'white', 
      borderRadius: '10px', 
      border: '1px solid #ddd',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>🕒 Staff Attendance</h3>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Welcome, <strong>{user?.username}</strong>
        </p>
        <div style={{ marginTop: '5px', fontSize: '13px' }}>
          Status: 
          <span style={{ 
            fontWeight: 'bold', 
            marginLeft: '5px',
            color: status === 'Clocked In' ? 'green' : '#d63031' 
          }}>
            {status}
          </span>
          {record && status === 'Clocked In' && (
            <span style={{ marginLeft: '10px', color: '#888' }}>
              (Since {new Date(record.timeIn).toLocaleTimeString()})
            </span>
          )}
        </div>
      </div>

      <div>
        {/* LOGIC: Show Clock In if not started, Clock Out if working */}
        {(status === 'Not Started' || status === 'Clocked Out') && (
          <button 
            onClick={handleClockIn}
            style={{ padding: '10px 20px', background: '#00b894', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Click to Time In
          </button>
        )}

        {status === 'Clocked In' && (
          <button 
            onClick={handleClockOut}
            style={{ padding: '10px 20px', background: '#d63031', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            End Shift (Time Out)
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffAttendance;