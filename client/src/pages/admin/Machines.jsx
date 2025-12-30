import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import machineService from '../../services/machineService';
import { Plus, Circle, WashingMachine, Power, Wrench, CheckCircle } from 'lucide-react';

export default function Machines({ user, onLogout }) {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // If it's In Use, we stop it -> 'Available'
      // If it's Available, we start it -> 'In Use'
      // We pass the CURRENT status, and the backend toggles it
      await machineService.toggleStatus(machine._id, machine.status);
      fetchMachines();
    } catch (err) {
      alert("Failed to update machine status");
    }
  };

  // 2. Handle Maintenance (Admin Only)
  const handleMaintenance = async (machine) => {
    try {
      // If currently Maintenance, we make it 'Available'
      // If currently Available, we make it 'Maintenance'
      
      // Note: We are re-using toggleStatus. 
      // Ideally, your backend should accept an explicit status like { status: 'Maintenance' }
      // But if your backend logic is smart, we might need a specific service call here.
      // For now, let's assume we can force the status update via the same endpoint or a generic update.
      
      const newStatus = machine.status === 'Maintenance' ? 'Available' : 'Maintenance';
      
      // We will try to use the generic update if it exists, otherwise use toggle
      // If your machineService has an 'update' method, use that. 
      // Assuming toggleStatus might be limited, let's try to update explicitly if possible.
      // Since I don't see your service file, I'll use a standard update pattern:
      
      if (machineService.updateMachine) {
         await machineService.updateMachine(machine._id, { status: newStatus });
      } else {
         // Fallback: If your backend toggles based on current state, this might be tricky.
         // Let's assume toggleStatus handles the switch logic or accepts a target status.
         await machineService.toggleStatus(machine._id, machine.status, newStatus); 
      }
      
      fetchMachines();
    } catch (err) {
      // If the above fails, it means we need to add 'updateMachine' to your service file.
      alert("Failed to change maintenance status. (Backend update might be needed)");
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
          {/* Stats Cards (Same as before) */}
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
          onClick={() => alert("Machine adding is handled automatically by the system seed.")}
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
            <div key={machine._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col justify-between">
              
              {/* Card Top: Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
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
                     <div className="text-center">
                       <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Cycle In Progress</span>
                       <p className="text-gray-500 text-xs mt-1">Started: {new Date(machine.startTime).toLocaleTimeString()}</p>
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
                  // Case 1: Machine is Broken -> Show one big "Fix" button
                  <button 
                    onClick={() => handleMaintenance(machine)}
                    className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Repaired
                  </button>
                ) : (
                  // Case 2: Machine is Working -> Show Start/Stop AND Maintenance options
                  <>
                    <button 
                      onClick={() => handleToggleRun(machine)}
                      disabled={isInUse && false} // Keep enabled to allow stop
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                        isInUse 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {isInUse ? 'Stop' : 'Start'}
                    </button>

                    {/* Only show Maintenance button if NOT in use (Safety) */}
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
    </AdminLayout>
  );
}