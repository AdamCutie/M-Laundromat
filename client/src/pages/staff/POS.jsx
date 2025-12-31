import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import inventoryService from '../../services/inventoryService';
import settingService from '../../services/settingService';
import orderService from '../../services/orderService';
import machineService from '../../services/machineService';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Minus, Trash2, User, CreditCard, ShoppingBag, Droplets, Wind, Package, WashingMachine, X } from 'lucide-react';

export default function POS({ user, onLogout }) {
  // --- STATE ---
  const [cart, setCart] = useState([]);
  const [customerSearch, setCustomerSearch] = useState(''); // Used for Name
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Data from Backend
  const [services, setServices] = useState([]);
  const [machines, setMachines] = useState([]); 
  const [selectedMachines, setSelectedMachines] = useState([]); 
  const [loading, setLoading] = useState(true);

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

      // 1. Construct Service Menu from Settings
      const serviceOptions = [
        { 
          id: 'wash', 
          name: 'Wash Cycle', 
          price: settingsData.selfServiceWash, 
          category: 'Self-Service', 
          icon: Droplets 
        },
        { 
          id: 'dry', 
          name: 'Dry Cycle', 
          price: settingsData.selfServiceDry, 
          category: 'Self-Service', 
          icon: Wind 
        },
        { 
          id: 'full', 
          name: 'Full Service (Min 5kg)', 
          price: settingsData.fullServicePerKg, 
          category: 'Full-Service', 
          icon: ShoppingBag 
        },
      ];

      // 2. Construct Add-ons from Inventory
      const addOnOptions = inventoryData.map(item => ({
        id: item._id,
        name: item.itemName,
        price: item.unitPrice,
        category: 'Add-ons',
        type: 'product', // Mark as inventory item
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

  // --- CART ACTIONS ---
  const addToCart = (service) => {
    // Check stock for products
    if (service.type === 'product' && service.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === service.id);
      const initialQty = service.id === 'full' ? 5 : 1;

      if (existing) {
        // Prevent adding more than available stock
        if (service.type === 'product' && existing.qty >= service.stock) {
          alert(`Only ${service.stock} available in stock!`);
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
        if (item.id === 'full' && newQty < 5) return item; 
        if (item.type === 'product' && change > 0 && newQty > item.stock) return item; 
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // --- DROPDOWN MACHINE SELECTION ---
  const handleSelectMachine = (e) => {
    const machineId = e.target.value;
    if (!machineId) return;
    
    // Add to selection if not already there
    if (!selectedMachines.includes(machineId)) {
      setSelectedMachines(prev => [...prev, machineId]);
    }
    
    // Reset dropdown back to default
    e.target.value = ""; 
  };

  const removeMachine = (machineId) => {
    setSelectedMachines(prev => prev.filter(id => id !== machineId));
  };

  // Filter available machines for the dropdowns
  const availableWashers = machines.filter(m => 
    m.type === 'Washer' && m.status === 'Available' && !selectedMachines.includes(m._id)
  );

  const availableDryers = machines.filter(m => 
    m.type === 'Dryer' && m.status === 'Available' && !selectedMachines.includes(m._id)
  );

  // --- CALCULATIONS ---
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = 0; // You can set this to subtotal * 0.12 if needed
  const total = subtotal + tax;

  // --- CHECKOUT ---
  const handleCheckout = async () => {
    if (!customerSearch) return alert("Please enter a Customer Name.");
    if (cart.length === 0) return alert("Cart is empty.");

    // Transform cart into backend format
    let washCount = 0;
    let dryCount = 0;
    let weight = 0;
    const addOns = [];

    cart.forEach(item => {
      if (item.id === 'wash') washCount += item.qty;
      else if (item.id === 'dry') dryCount += item.qty;
      else if (item.id === 'full') weight += item.qty;
      else if (item.type === 'product') {
        addOns.push({
          itemId: item.id,
          itemName: item.name,
          price: item.price,
          quantity: item.qty
        });
      }
    });

    // Auto-detect service type
    const finalServiceType = weight > 0 ? 'Full-Service' : 'Self-Service';

    const orderPayload = {
      customerName: customerSearch,
      customerPhone: customerPhone, // Optional
      serviceType: finalServiceType,
      washCount,
      dryCount,
      weight,
      addOns,
      totalPrice: total,
      machineIds: selectedMachines 
    };

    try {
      await orderService.createOrder(orderPayload);
      
      if (selectedMachines.length === 0) {
        alert("✅ Order added to PENDING (No machines selected).");
      } else {
        alert("✅ Order Started! Machines Activated.");
      }

      setCart([]);
      setCustomerSearch('');
      setCustomerPhone('');
      setSelectedMachines([]);
      loadData(); 
    } catch (err) {
      alert("Checkout Failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <StaffLayout user={user} onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        
        {/* LEFT COLUMN: Services & Machines */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Customer Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Customer Name *"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone Number (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            
            {/* 1. Services */}
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {services.filter(s => s.category !== 'Add-ons').map((service) => (
                <button
                  key={service.id}
                  onClick={() => addToCart(service)}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col gap-2 group"
                >
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <service.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-emerald-600 font-bold">₱{service.price}</p>
                    {service.id === 'full' && <p className="text-xs text-orange-500 font-semibold">Min 5kg</p>}
                  </div>
                </button>
              ))}
            </div>

            {/* 2. COMPACT MACHINE SELECTION (Dropdowns) */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <h3 className="text-sm font-bold text-blue-800 mb-3 flex justify-between">
                <span>Assign Machines</span>
                <span className="font-normal text-blue-600 text-xs">Optional - Leave empty to Pending</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select 
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                  onChange={handleSelectMachine}
                  defaultValue=""
                >
                  <option value="" disabled>Select Washer...</option>
                  {availableWashers.length > 0 ? (
                    availableWashers.map(m => (
                      <option key={m._id} value={m._id}>{m.machineNumber} (Available)</option>
                    ))
                  ) : (
                    <option disabled>No Washers Available</option>
                  )}
                </select>

                <select 
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                  onChange={handleSelectMachine}
                  defaultValue=""
                >
                  <option value="" disabled>Select Dryer...</option>
                  {availableDryers.length > 0 ? (
                    availableDryers.map(m => (
                      <option key={m._id} value={m._id}>{m.machineNumber} (Available)</option>
                    ))
                  ) : (
                    <option disabled>No Dryers Available</option>
                  )}
                </select>
              </div>

              {/* Selected Chips/Tags */}
              {selectedMachines.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedMachines.map(id => {
                    const machine = machines.find(m => m._id === id);
                    if (!machine) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-1 rounded-full shadow-sm">
                        <WashingMachine className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-bold text-gray-700">{machine.machineNumber}</span>
                        <button onClick={() => removeMachine(id)} className="text-gray-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-blue-400 italic">No machines selected yet.</p>
              )}
            </div>

            {/* 3. Add-ons */}
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Add-ons</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-4">
              {services.filter(s => s.category === 'Add-ons').map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={item.stock <= 0}
                  className={`bg-white p-4 rounded-lg border transition-all text-left ${
                    item.stock <= 0 ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  <p className="font-medium text-gray-800 truncate">{item.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-emerald-600 font-bold">₱{item.price}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.stock > 0 ? 'bg-gray-100' : 'bg-red-100 text-red-600'}`}>
                      {item.stock} left
                    </span>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Cart & Checkout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Current Order</h3>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
                <p>No items in cart</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.id === 'full' ? `${item.qty} kg` : `Qty: ${item.qty}`} x ₱{item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {/* ✅ RESTORED: Machine Summary Chips in Footer */}
            {selectedMachines.length > 0 && (
              <div className="mb-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                <strong>Machines assigned:</strong> {machines.filter(m => selectedMachines.includes(m._id)).map(m => m.machineNumber).join(', ')}
              </div>
            )}
            {selectedMachines.length === 0 && cart.length > 0 && (
              <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                No machines selected. Order will be <strong>PENDING</strong>.
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">₱{total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-white transition-all ${
                cart.length > 0 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
                : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              {selectedMachines.length > 0 ? 'Start Order' : 'Add to Pending'}
            </button>

            {/* ✅ RESTORED: Clear Cart Button */}
            <button
              onClick={() => {
                setCart([]);
                setSelectedMachines([]);
              }}
              className="w-full mt-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

      </div>
    </StaffLayout>
  );
}