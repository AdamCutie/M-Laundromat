import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import inventoryService from '../../services/inventoryService';
import settingService from '../../services/settingService';
import orderService from '../../services/orderService';
import machineService from '../../services/machineService';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, Minus, Trash2, User, CreditCard, ShoppingBag, 
  Droplets, Wind, Package, WashingMachine, X, ChevronUp, Loader 
} from 'lucide-react';

export default function POS({ user, onLogout }) {
  const toast = useToast();
  // --- STATE ---
  const [cart, setCart] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const sanitizePhone = (value) => value.replace(/\D/g, '').slice(0, 11);
  
  // Data from Backend
  const [services, setServices] = useState([]);
  const [machines, setMachines] = useState([]); 
  const [selectedMachines, setSelectedMachines] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // ✅ FIX 1: Add State for Min Weight so it is accessible everywhere
  const [minWeight, setMinWeight] = useState(5); 

  // Mobile State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // ✅ LOCKS (Prevent Double Hits)
  const [paymentStatus, setPaymentStatus] = useState('Unpaid'); // Default to Unpaid
  const [processingId, setProcessingId] = useState(null); // Locks specific "Add" button
  const [isSubmitting, setIsSubmitting] = useState(false); // Locks "Checkout" button

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, inventoryData, machinesData] = await Promise.all([
        settingService.getSettings(),
        inventoryService.getInventory(),
        machineService.getMachines()
      ]);

      // ✅ FIX 2: Save the minimum weight to state
      const currentMinWeight = settingsData.minWeight || 5;
      setMinWeight(currentMinWeight);

      // 1. Service Menu
      const serviceOptions = [
        { id: 'wash', name: 'Wash Cycle', price: settingsData.selfServiceWash, category: 'Self-Service', icon: Droplets },
        { id: 'dry', name: 'Dry Cycle', price: settingsData.selfServiceDry, category: 'Self-Service', icon: Wind },
        { 
          id: 'full', 
          // ✅ FIX 3: Make the label dynamic
          name: `Full Service (Min ${currentMinWeight}kg)`, 
          price: settingsData.fullServicePerKg, 
          category: 'Full-Service', 
          icon: ShoppingBag 
        },
      ];

      // 2. Add-ons
      const addOnOptions = inventoryData.map(item => ({
        id: item._id,
        name: item.itemName,
        price: item.unitPrice,
        category: 'Add-ons',
        type: 'product',
        stock: item.stockLevel,
        icon: Package
      }));

      setServices([...serviceOptions, ...addOnOptions]);
      setMachines(machinesData); 
      setLoading(false);
    } catch (err) {
      console.error("Failed to load POS data", err);
      setLoading(false);
    }
  };

  // --- CART HANDLERS ---
  const handleAddToCart = async (item) => {
    if (processingId === item.id) return; // Prevent double click
    setProcessingId(item.id); 
    
    addToCart(item);

    // Small delay to visually show "processing" state
    setTimeout(() => setProcessingId(null), 300);
  };

  const addToCart = (service) => {
    if (service.type === 'product' && service.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === service.id);
      
      // ✅ FIX 4: Use state variable instead of hardcoded '5'
      const initialQty = service.id === 'full' ? minWeight : 1;

      if (existing) {
        if (service.type === 'product' && existing.qty >= service.stock) {
          alert(`Only ${service.stock} available!`);
          return prev;
        }
        return prev.map(item => item.id === service.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...service, qty: initialQty }];
    });
  };

  const updateQty = (id, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + change;
        
        // ✅ FIX 5: Use state variable for validation
        if (item.id === 'full' && newQty < minWeight) return item; 
        
        if (item.type === 'product' && change > 0 && newQty > item.stock) return item; 
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // --- MACHINE HANDLERS ---
  const handleSelectMachine = (e) => {
    const machineId = e.target.value;
    if (!machineId) return;
    if (!selectedMachines.includes(machineId)) {
      setSelectedMachines(prev => [...prev, machineId]);
    }
    e.target.value = ""; 
  };

  const removeMachine = (machineId) => {
    setSelectedMachines(prev => prev.filter(id => id !== machineId));
  };

  const availableWashers = machines.filter(m => m.type === 'Washer' && m.status === 'Available' && !selectedMachines.includes(m._id));
  const availableDryers = machines.filter(m => m.type === 'Dryer' && m.status === 'Available' && !selectedMachines.includes(m._id));

  // --- CALCULATIONS ---
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal;

  // --- CHECKOUT ---
  const handleCheckout = async () => {
    if (isSubmitting) return; // ✅ Block double hits
    if (!customerSearch) return alert("Please enter a Customer Name.");
    if (cart.length === 0) return alert("Cart is empty.");

    setIsSubmitting(true); //  Lock the button

    let washCount = 0, dryCount = 0, weight = 0;
    const addOns = [];

    cart.forEach(item => {
      if (item.id === 'wash') washCount += item.qty;
      else if (item.id === 'dry') dryCount += item.qty;
      else if (item.id === 'full') weight += item.qty;
      else if (item.type === 'product') {
        addOns.push({ itemId: item.id, itemName: item.name, price: item.price, quantity: item.qty });
      }
    });

    const finalServiceType = weight > 0 ? 'Full-Service' : 'Self-Service';

    const orderPayload = {
      customerName: customerSearch,
      customerPhone: customerPhone,
      serviceType: finalServiceType,
      washCount, dryCount, weight, addOns,
      totalPrice: total,
      machineIds: selectedMachines,
      paymentStatus 
    };

    try {
      await orderService.createOrder(orderPayload);
      toast(selectedMachines.length === 0 ? "Order added to pending" : "Order started! Machines activated", 'success');
      
      // Reset Form
      setCart([]);
      setCustomerSearch('');
      setCustomerPhone('');
      setSelectedMachines([]);
      setIsMobileCartOpen(false); 
      
      // Refresh Data (Inventory/Machines might have changed)
      await loadData(); 

    } catch (err) {
      toast("Checkout Failed: " + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsSubmitting(false); // 🔓 Unlock button
    }
  };

  if (loading) return <LoadingScreen />;

  // --- SHARED CART COMPONENT ---
  const CartContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" /> Current Order
        </h3>
        {/* Mobile Close */}
        <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
           <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <ShoppingBag className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-lg shadow-sm">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {item.id === 'full' ? `${item.qty} kg` : `Qty: ${item.qty}`} x ₱{item.price}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><Minus className="w-3 h-3" /></button>
                <span className="w-6 text-center text-sm font-semibold text-gray-700">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><Plus className="w-3 h-3" /></button>
                <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-50 rounded ml-1"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Checkout */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm pb-safe">
        {selectedMachines.length > 0 && (
          <div className="mb-2 text-[10px] text-blue-600 bg-blue-50 p-1.5 rounded border border-blue-100 flex items-center gap-1">
            <WashingMachine className="w-3 h-3" />
            <span className="truncate"><strong>Machines:</strong> {machines.filter(m => selectedMachines.includes(m._id)).map(m => m.machineNumber).join(', ')}</span>
          </div>
        )}
        {/* ✅ PAYMENT STATUS TOGGLE */}
        <div className="flex bg-gray-200 rounded-lg p-1 mb-4">
          <button
            onClick={() => setPaymentStatus('Unpaid')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              paymentStatus === 'Unpaid' 
                ? 'bg-white text-red-500 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pay Later (Unpaid)
          </button>
          <button
            onClick={() => setPaymentStatus('Paid')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              paymentStatus === 'Paid' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pay Now (Paid)
          </button>
        </div>
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs text-gray-500 font-medium">Total Amount</span>
          <span className="text-xl font-bold text-gray-900 tracking-tight">₱{total.toFixed(2)}</span>
        </div>
        
        {/* ✅ ORDER BUTTON WITH LOADING STATE */}
        <button 
          onClick={handleCheckout}
          disabled={cart.length === 0 || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] ${
            cart.length > 0 && !isSubmitting
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              {selectedMachines.length > 0 ? 'Start Order' : 'Add to Pending'}
            </>
          )}
        </button>

        <button
          onClick={() => { setCart([]); setSelectedMachines([]); }}
          disabled={isSubmitting}
          className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-700 font-medium"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );

  return (
    <StaffLayout user={user} onLogout={onLogout}>
      {/* Main Grid Layout */}
      <div className="relative h-full md:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 lg:gap-6">
        
        {/* LEFT COLUMN: Menu & Inputs */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-32 lg:pb-0 custom-scrollbar px-0.5">
          
          {/* Customer Inputs */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Customer Name *"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(sanitizePhone(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 mb-2">
              {services.filter(s => s.category !== 'Add-ons').map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleAddToCart(service)}
                  disabled={processingId === service.id}
                  className={`relative bg-white p-3 rounded-xl border transition-all text-left flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 group
                    ${processingId === service.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-500 hover:shadow-sm'}
                  `}
                >
                  <div className="p-2 bg-emerald-100/50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    {processingId === service.id ? <Loader className="w-5 h-5 animate-spin" /> : <service.icon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{service.name}</p>
                    <p className="text-emerald-600 font-bold text-xs mt-0.5">₱{service.price}</p>
                    {service.id === 'full' && <p className="text-[10px] text-orange-500 font-medium mt-0.5">Min {minWeight}kg</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Machine Section */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60 mb-2">
            <h3 className="text-xs font-bold text-blue-800 mb-2 flex justify-between items-center">
              <span>Assign Machines</span>
              <span className="font-normal text-[10px] bg-white/50 px-2 py-0.5 rounded-full text-blue-600">Optional</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select 
                className="w-full px-2 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-xs font-medium text-gray-700"
                onChange={handleSelectMachine}
                value=""
              >
                <option value="" disabled>Select Washer</option>
                {availableWashers.map(m => <option key={m._id} value={m._id}>{m.machineNumber}</option>)}
              </select>

              <select 
                className="w-full px-2 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-xs font-medium text-gray-700"
                onChange={handleSelectMachine}
                value=""
              >
                <option value="" disabled>Select Dryer</option>
                {availableDryers.map(m => <option key={m._id} value={m._id}>{m.machineNumber}</option>)}
              </select>
            </div>

            {selectedMachines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedMachines.map(id => {
                  const machine = machines.find(m => m._id === id);
                  if (!machine) return null;
                  return (
                    <div key={id} className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-1 rounded-md shadow-sm animate-fade-in">
                      <WashingMachine className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-bold text-gray-700">{machine.machineNumber}</span>
                      <button onClick={() => removeMachine(id)} className="text-gray-400 hover:text-red-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add-ons Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Add-ons</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {services.filter(s => s.category === 'Add-ons').map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  disabled={item.stock <= 0 || processingId === item.id}
                  className={`p-2.5 rounded-xl border transition-all text-left bg-white ${
                    (item.stock <= 0 || processingId === item.id) 
                      ? 'border-gray-100 opacity-60 cursor-not-allowed' 
                      : 'border-gray-200 hover:border-emerald-500 active:scale-[0.98]'
                  }`}
                >
                  <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                    {processingId === item.id ? 'Adding...' : item.name}
                  </p>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-emerald-600 font-bold text-xs">₱{item.price}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${item.stock > 0 ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'}`}>
                      {item.stock} left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cart (Desktop) */}
        <div className="hidden lg:block w-96 bg-white rounded-xl shadow-sm border border-gray-100 h-full overflow-hidden sticky top-0">
          <CartContent />
        </div>

        {/* MOBILE FLOATING BUTTON */}
        <button 
          onClick={() => setIsMobileCartOpen(true)}
          className="
            lg:hidden fixed bottom-6 right-6 z-30 
            bg-emerald-600 text-white 
            pl-4 pr-5 py-3 rounded-full 
            shadow-xl shadow-emerald-900/20 
            flex items-center gap-3
            border border-white/10 backdrop-blur-sm
            transition-transform active:scale-95 animate-bounce-subtle
          "
        >
          <div className="relative">
             <ShoppingBag className="w-5 h-5" />
             {cart.length > 0 && (
               <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-emerald-600">
                 {cart.reduce((acc, item) => acc + item.qty, 0)}
               </span>
             )}
          </div>
          <span className="font-bold text-sm tracking-wide">₱{total.toFixed(2)}</span>
          <ChevronUp className="w-4 h-4 opacity-80" />
        </button>

        {/* MOBILE DRAWER */}
        {isMobileCartOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
            <div 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileCartOpen(false)}
            ></div>

            <div className="relative w-full sm:w-[400px] h-[85vh] bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-200 rounded-full"></div>
              <CartContent />
            </div>
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
