import React, { useState, useEffect } from 'react';
import machineService from '../services/machineService';

const MachineDashboard = () => {
  const [machines, setMachines] = useState([]);
  // This state is just to force the page to re-draw every second
  const [, setTick] = useState(0);

  // 1. Fetch Data Once on Load
  useEffect(() => {
    fetchMachines();
  }, []);

  // 2. Create a "Heartbeat" that updates the timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1); // This forces the component to refresh
    }, 1000);

    return () => clearInterval(timer); // Cleanup on exit
  }, []);

  const fetchMachines = async () => {
    try {
      const data = await machineService.getMachines();
      setMachines(data);
    } catch (err) {
      console.error("Failed to load machines");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await machineService.toggleStatus(id, currentStatus);
      fetchMachines(); // Refresh data immediately after clicking
    } catch (err) {
      alert("Error updating machine");
    }
  };

  // Helper: Calculate Time Left
  const getTimeLeft = (endTime) => {
    if (!endTime) return "Ready";
    
    const diff = new Date(endTime).getTime() - Date.now();
    
    if (diff <= 0) return "Cycle Done"; // Time is up!

    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}:${s < 10 ? '0' : ''}${s}`; // Format as 14:05
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '20px' }}>
      <h2>⚙️ Live Machine Status</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
        
        {machines.map((machine) => {
          const timeLeft = getTimeLeft(machine.endTime);
          const isDone = machine.status === 'In Use' && timeLeft === 'Cycle Done';
          
          // Dynamic Styles based on state
          let bgColor = '#d4edda'; // Green (Available)
          let borderColor = '#c3e6cb';

          if (machine.status === 'In Use') {
            bgColor = isDone ? '#fff3cd' : '#f8d7da'; // Yellow if Done, Red if Running
            borderColor = isDone ? '#ffeeba' : '#f5c6cb';
          }

          return (
            <div 
              key={machine._id}
              style={{ 
                padding: '15px', 
                borderRadius: '10px', 
                textAlign: 'center',
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                cursor: 'pointer',
                transition: '0.2s'
              }}
              onClick={() => handleToggle(machine._id, machine.status)}
            >
              <h3 style={{ margin: '0 0 5px 0' }}>{machine.machineNumber}</h3>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
                {machine.type}
              </p>
              
              <hr style={{ opacity: 0.3 }}/>
              
              {/* DISPLAY THE TIMER HERE */}
              <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>
                {machine.status === 'Available' ? 'IDLE' : timeLeft}
              </div>

              <small style={{ fontSize: '10px' }}>
                {isDone ? "CLICK TO RESET" : machine.status}
              </small>
            </div>
          );
        })}

      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        * Click a machine to Start (45m) or Stop it.
      </p>
    </div>
  );
};

export default MachineDashboard;