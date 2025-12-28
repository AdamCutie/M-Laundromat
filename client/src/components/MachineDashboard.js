import React, { useState, useEffect } from 'react';
import machineService from '../services/machineService';

const MachineDashboard = () => {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const data = await machineService.getMachines();
      setMachines(data);
    } catch (err) {
      alert("Failed to load machines");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await machineService.toggleStatus(id, currentStatus);
      fetchMachines(); // Refresh to see the new color
    } catch (err) {
      alert("Error updating machine");
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '20px' }}>
      <h2>⚙️ Machine Status</h2>
      
      {/* GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px' }}>
        
        {machines.map((machine) => (
          <div 
            key={machine._id}
            style={{ 
              padding: '15px', 
              borderRadius: '10px', 
              textAlign: 'center',
              backgroundColor: machine.status === 'Available' ? '#d4edda' : '#f8d7da', // Green or Red
              border: machine.status === 'Available' ? '2px solid #c3e6cb' : '2px solid #f5c6cb',
              cursor: 'pointer'
            }}
            onClick={() => handleToggle(machine._id, machine.status)}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>{machine.machineNumber}</h3>
            <p style={{ margin: 0, fontSize: '12px' }}>{machine.type}</p>
            <hr style={{ opacity: 0.3 }}/>
            <strong>{machine.status}</strong>
          </div>
        ))}

      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        * Click a machine card to toggle Start/Stop
      </p>
    </div>
  );
};

export default MachineDashboard;