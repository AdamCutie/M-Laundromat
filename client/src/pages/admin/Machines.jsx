import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout'; // Default fallback
import machineService from '../../services/machineService';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, Circle, WashingMachine, Power, Wrench, 
  CheckCircle, Clock, Save, X, Trash2, Wind 
} from 'lucide-react';

// ==========================================
// INTERNAL COMPONENT: TIMER
// ==========================================
function Timer({ startTime, onComplete }) {
  const [timeLeft, setTimeLeft] = useState('--:--');

  useEffect(() => {
    const calculateTime = () => {
      if (!startTime) return;
      
      const duration = 40 * 60 * 1000; // 40 minutes in ms
      const end = new Date(startTime).getTime() + duration;
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Finishing...');
        if (onComplete) onComplete();
      } else {
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startTime, onComplete]); 

  return (
    <div className="flex items-center justify-center gap-2 text-blue-600 font-bold font-mono text-lg animate-pulse">
      <Clock className="w-5 h-5" />
      {timeLeft}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Machines({ user, onLogout, Layout = AdminLayout }) {
  const toast = useToast();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
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

  // ACTIONS
  const handleToggleRun = async (machine) => {
    try {
      await machineService.toggleStatus(machine._id, machine.status);
      fetchMachines();
    } catch (err) {
      toast("Failed to update status", 'error');
    }
  };

  const handleMaintenance = async (machine) => {
    try {
      const newStatus = machine.status === 'Maintenance' ? 'Available' : 'Maintenance';
      // Support both backend API styles (update vs toggle)
      if (machineService.updateMachine) {
         await machineService.updateMachine(machine._id, { status: newStatus });
      } else {
         await machineService.toggleStatus(machine._id, machine.status, newStatus); 
      }
      fetchMachines();
      toast(`Machine set to ${newStatus}`, 'success');
    } catch (err) {
      toast("Failed to update maintenance status.", 'error');
    }
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    try {
      await machineService.addMachine({
        machineNumber: newMachine.machineNumber,
        type: newMachine.type,
        status: 'Available'
      });
      toast("Machine Added Successfully!", 'success');
      setShowAddModal(false);
      setNewMachine({ machineNumber: '', type: 'Washer' });
      fetchMachines();
    } catch (err) {
      toast(err.response?.data?.message || "Error adding machine", 'error');
    }
  };

  const handleDeleteMachine = async (id, number, status) => {
    if (status === 'In Use') return toast("Cannot delete a running machine!", 'error');
    if (!window.confirm(`Permanently delete ${number}?`)) return;

    try {
      await machineService.deleteMachine(id);
      setMachines(prev => prev.filter(m => m._id !== id));
      toast("Machine deleted", 'success');
    } catch (err) {
      toast("Failed to delete machine.", 'error');
    }
  };

  // CALCULATIONS
  const totalMachines = machines.length;
  const availableCount = machines.filter(m => m.status === 'Available').length;
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;
  const inUseCount = machines.filter(m => m.status === 'In Use').length;

  const washers = machines.filter(m => m.type === 'Washer');
  const dryers = machines.filter(m => m.type === 'Dryer');

  // CARD RENDERER
  const renderMachineCard = (machine) => {
    const isAvailable = machine.status === 'Available';
    const isInUse = machine.status === 'In Use';
    const isMaintenance = machine.status === 'Maintenance';

    return (
      <div key={machine._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col justify-between relative group">
        
        {/* Delete Button (Visible always on mobile, Hover on desktop) */}
        {user.role === 'admin' && (
          <button 
            onClick={() => handleDeleteMachine(machine._id, machine.machineNumber, machine.status)}
            className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            {/* Icon Box */}
            <div className={`p-3 rounded-xl flex-shrink-0 ${
               isInUse ? 'bg-blue-100 text-blue-600' : 
               isMaintenance ? 'bg-orange-100 text-orange-600' :
               'bg-gray-100 text-gray-600'
            }`}>
              {machine.type === 'Dryer' ? <Wind className="w-6 h-6" /> : <WashingMachine className="w-6 h-6" />}
            </div>
            
            {/* Text Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 leading-none mb-1">{machine.machineNumber}</h3>
              <div className="flex items-center gap-1.5">
                <Circle className={`w-2 h-2 fill-current ${
                  isAvailable ? 'text-emerald-500' : isInUse ? 'text-blue-500' : 'text-orange-500'
                }`} />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{machine.status}</span>
              </div>
            </div>
          </div>

          {/* Status / Timer Area */}
          <div className="py-4 border-t border-b border-gray-50 my-2 min-h-[80px] flex items-center justify-center bg-gray-50/50 rounded-lg">
            {isInUse ? (
               <div className="text-center w-full">
                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Time Remaining</span>
                 <Timer startTime={machine.startTime} onComplete={() => fetchMachines()} />
               </div>
            ) : isMaintenance ? (
               <div className="text-center">
                 <span className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1 justify-center">
                   <Wrench className="w-3 h-3" /> Under Repair
                 </span>
               </div>
            ) : (
              <span className="text-gray-400 text-xs italic">Ready for use</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3 flex gap-2 h-10">
          {isMaintenance ? (
            <button 
              onClick={() => handleMaintenance(machine)}
              className="w-full h-full rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Available
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleToggleRun(machine)}
                className={`flex-1 h-full rounded-lg transition-colors text-sm font-bold flex items-center justify-center gap-2 ${
                  isInUse 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                }`}
              >
                <Power className="w-4 h-4" />
                {isInUse ? 'Stop' : 'Start'}
              </button>

              {!isInUse && (
                <button 
                  onClick={() => handleMaintenance(machine)}
                  className="px-3 h-full rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-orange-600 hover:border-orange-200 transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <Layout user={user} onLogout={onLogout}>
      
      {/* ✅ HEADER & STATS 
        Mobile Optimization: Used 'grid-cols-2' so stats don't take up 
        huge vertical space on phones (2x2 grid instead of 1x4 stack).
      */}
      <div className="mb-8 flex flex-col xl:flex-row justify-between items-start gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto">
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total</p>
            <p className="text-2xl font-black text-gray-800">{totalMachines}</p>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">Free</p>
            <p className="text-2xl font-black text-emerald-700">{availableCount}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Running</p>
            <p className="text-2xl font-black text-blue-700">{inUseCount}</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-orange-600 uppercase tracking-wider font-semibold">Repair</p>
            <p className="text-2xl font-black text-orange-700">{maintenanceCount}</p>
          </div>
        </div>
        
        {/* Add Button (Admin Only) - Full width on mobile for easier tapping */}
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Machine</span>
          </button>
        )}
      </div>

      {/* ✅ SECTIONS */}
      <div className="space-y-8">
        
        {/* WASHERS */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             <span className="p-1.5 bg-blue-100 rounded text-blue-600"><WashingMachine className="w-5 h-5" /></span>
             Washers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
             {washers.length > 0 ? washers.map(renderMachineCard) : (
                 <p className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">No washers found.</p>
             )}
          </div>
        </section>

        {/* DRYERS */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             <span className="p-1.5 bg-orange-100 rounded text-orange-600"><Wind className="w-5 h-5" /></span>
             Dryers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
             {dryers.length > 0 ? dryers.map(renderMachineCard) : (
                 <p className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">No dryers found.</p>
             )}
          </div>
        </section>
      </div>

      {/* MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Add Machine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMachine} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Machine Number</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={newMachine.machineNumber}
                  onChange={e => setNewMachine({...newMachine, machineNumber: e.target.value})}
                  placeholder="e.g. Washer 01"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-3">
                   <button
                     type="button"
                     onClick={() => setNewMachine({...newMachine, type: 'Washer'})}
                     className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                       newMachine.type === 'Washer' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                     }`}
                   >
                     <WashingMachine className="w-6 h-6" />
                     <span className="text-sm font-semibold">Washer</span>
                   </button>
                   
                   <button
                     type="button"
                     onClick={() => setNewMachine({...newMachine, type: 'Dryer'})}
                     className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                       newMachine.type === 'Dryer' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
                     }`}
                   >
                     <Wind className="w-6 h-6" />
                     <span className="text-sm font-semibold">Dryer</span>
                   </button>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                <Save className="w-5 h-5" /> Save Machine
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}