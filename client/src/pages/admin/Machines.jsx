import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import machineService from '../../services/machineService';
import { Plus, Circle, WashingMachine, Power, Wrench, CheckCircle, Clock, Save, X, Trash2 } from 'lucide-react';

// ✅ TIMER COMPONENT (Refactored for safety)
function Timer({ startTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      if (!startTime) {
        setTimeLeft('--:--');
        return;
      }
      
      const duration = 40 * 60 * 1000; // 40 minutes in milliseconds
      const end = new Date(startTime).getTime() + duration;
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Cycle Complete');
      } else {
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center justify-center gap-2 text-blue-600 font-bold font-mono text-lg">
      <Clock className="w-5 h-5" />
      {timeLeft}
    </div>
  );
}

export default function Machines({ user, onLogout }) {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ MODAL STATE
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMachine, setNewMachine] = useState({ machineNumber: '', type: 'Washer' });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const data = await machineService.getMachines();
      setMachines(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load machines");
      setLoading(false);
    }
  };

  // 1. Handle Start/Stop (Daily Operations)
  const handleToggleRun = async (machine) => {
    try {
      await machineService.toggleStatus(machine._id, machine.status);
      fetchMachines();
    } catch (err) {
      alert("Failed to update machine status");
    }
  };

  // 2. Handle Maintenance (Admin Only)
  const handleMaintenance = async (machine) => {
    try {
      const newStatus = machine.status === 'Maintenance' ? 'Available' : 'Maintenance';
      
      // Use explicit update if available, otherwise toggle
      if (machineService.updateMachine) {
         await machineService.updateMachine(machine._id, { status: newStatus });
      } else {
         await machineService.toggleStatus(machine._id, machine.status, newStatus); 
      }
      
      fetchMachines();
    } catch (err) {
      alert("Failed to change maintenance status.");
    }
  };

  // ✅ ADD MACHINE FUNCTION (Refactored Error Handling)
  const handleAddMachine = async (e) => {
    e.preventDefault();
    try {
      await machineService.addMachine({
        machineNumber: newMachine.machineNumber,
        type: newMachine.type,
        status: 'Available'
      });
      
      alert("Machine Added Successfully!");
      setShowAddModal(false);
      setNewMachine({ machineNumber: '', type: 'Washer' });
      fetchMachines();
    } catch (err) {
      // Use the actual error from the backend (e.g., "Machine Number already exists")
      alert(err.response?.data?.message || "Error adding machine");
    }
  };

  // ✅ DELETE MACHINE FUNCTION
  const handleDeleteMachine = async (id, number, status) => {
    if (status === 'In Use') {
      return alert("Cannot delete a machine while it is running!");
    }
    
    if (!window.confirm(`Are you sure you want to permanently delete ${number}?`)) return;

    try {
      await machineService.deleteMachine(id);
      setMachines(prev => prev.filter(m => m._id !== id)); // Optimistic update
    } catch (err) {
      alert("Failed to delete machine.");
    }
  };

  // Calculate Stats
  const totalMachines = machines.length;
  const availableCount = machines.filter(m => m.status === 'Available').length;
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;
  const inUseCount = machines.filter(m => m.status === 'In Use').length;

  if (loading) return <div className="p-10 text-center">Loading Machines...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      {/* Header Stats */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto">
          {/* Stats Cards */}
          <div className="bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Machines</p>
            <p className="text-2xl font-bold">{totalMachines}</p>
          </div>
          <div className="bg-green-50 px-6 py-3 rounded-lg border border-green-200 shadow-sm">
            <p className="text-sm text-green-700 font-medium">Available</p>
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
          </div>
          <div className="bg-blue-50 px-6 py-3 rounded-lg border border-blue-200 shadow-sm">
            <p className="text-sm text-blue-700 font-medium">In Use</p>
            <p className="text-2xl font-bold text-blue-600">{inUseCount}</p>
          </div>
          <div className="bg-orange-50 px-6 py-3 rounded-lg border border-orange-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
               <Wrench className="w-4 h-4 text-orange-600" />
               <p className="text-sm text-orange-700 font-medium">Maintenance</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{maintenanceCount}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Machine</span>
        </button>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => {
          const isAvailable = machine.status === 'Available';
          const isInUse = machine.status === 'In Use';
          const isMaintenance = machine.status === 'Maintenance';

          return (
            <div key={machine._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col justify-between relative group">
              
              {/* DELETE BUTTON (Absolute Positioned) */}
              <button 
                onClick={() => handleDeleteMachine(machine._id, machine.machineNumber, machine.status)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                title="Delete Machine"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Card Top: Info */}
              <div>
                <div className="flex items-center justify-between mb-4 pr-8">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isInUse ? 'bg-blue-100 text-blue-600' : 
                      isMaintenance ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <WashingMachine className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{machine.machineNumber}</h3>
                      <p className="text-sm text-gray-500">{machine.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className={`w-3 h-3 fill-current ${
                      isAvailable ? 'text-green-500' :
                      isInUse ? 'text-blue-500' :
                      'text-orange-500'
                    }`} />
                  </div>
                </div>

                {/* Status Text Area */}
                <div className="space-y-3 py-4 border-t border-b border-gray-50 my-2 min-h-[80px] flex items-center justify-center">
                  {isInUse ? (
                     <div className="text-center w-full">
                       <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-2">Cycle In Progress</span>
                       <Timer startTime={machine.startTime} />
                     </div>
                  ) : isMaintenance ? (
                      <div className="text-center">
                       <span className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-2 justify-center">
                         <Wrench className="w-4 h-4" /> Under Repair
                       </span>
                       <p className="text-gray-400 text-xs mt-1">Technician notified</p>
                     </div>
                  ) : (
                    <div className="text-center text-gray-400 text-sm italic">
                      Ready for next customer
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS AREA */}
              <div className="mt-2 flex gap-2">
                {isMaintenance ? (
                  <button 
                    onClick={() => handleMaintenance(machine)}
                    className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Repaired
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleToggleRun(machine)}
                      disabled={isInUse && false} 
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                        isInUse 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {isInUse ? 'Stop' : 'Start'}
                    </button>

                    {!isInUse && (
                      <button 
                        onClick={() => handleMaintenance(machine)}
                        title="Set to Maintenance"
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-200"
                      >
                        <Wrench className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Machine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMachine} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name/Number</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newMachine.machineNumber}
                  onChange={e => setNewMachine({...newMachine, machineNumber: e.target.value})}
                  placeholder="e.g. Washer 05"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Type</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newMachine.type}
                  onChange={e => setNewMachine({...newMachine, type: e.target.value})}
                >
                  <option value="Washer">Washer</option>
                  <option value="Dryer">Dryer</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" /> Add Machine
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}