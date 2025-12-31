import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import inventoryService from '../../services/inventoryService';
import settingService from '../../services/settingService';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/LoadingScreen';
import { Plus, Minus, Trash2, User, CreditCard, ShoppingBag, Droplets, Wind, Package } from 'lucide-react';

export default function POS({ user, onLogout }) {
  // --- STATE ---
  const [cart, setCart] = useState([]);
  const [customerSearch, setCustomerSearch] = useState(''); // Used for Name
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Data from Backend
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, inventoryData] = await Promise.all([
        settingService.getSettings(),
        inventoryService.getInventory()
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
          name: 'Full Service (1kg)', 
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
      if (existing) {
        // Prevent adding more than available stock
        if (service.type === 'product' && existing.qty >= service.stock) {
          alert(`Only ${service.stock} available in stock!`);
          return prev;
        }
        return prev.map(item => item.id === service.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...service, qty: 1 }];
    });
  };

  const updateQty = (id, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + change;
        
        // Stock check
        if (item.type === 'product' && change > 0 && newQty > item.stock) {
           return item; // Max stock reached
        }
        
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

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
      totalPrice: total
    };

    try {
      await orderService.createOrder(orderPayload);
      alert("✅ Order Created Successfully!");
      setCart([]);
      setCustomerSearch('');
      setCustomerPhone('');
      loadData(); // Refresh inventory counts
    } catch (err) {
      alert("Checkout Failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <StaffLayout user={user} onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        
        {/* Left: Services Selection */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Customer Input Section */}
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

          {/* Services Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto">
            {/* 1. Main Services */}
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {services.filter(s => s.category !== 'Add-ons').map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => addToCart(service)}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col gap-2 group"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{service.name}</p>
                      <p className="text-emerald-600 font-bold">₱{service.price}</p>
                      <span className="text-xs text-gray-400">{service.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2. Add-ons (Inventory) */}
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Add-ons (Inventory)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-4">
              {services.filter(s => s.category === 'Add-ons').map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={item.stock <= 0}
                  className={`bg-white p-4 rounded-lg border transition-all text-left group ${
                    item.stock <= 0 
                    ? 'border-gray-100 opacity-60 cursor-not-allowed' 
                    : 'border-gray-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-800 truncate pr-2">{item.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.stock > 0 ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                      {item.stock} left
                    </span>
                  </div>
                  <p className={`font-bold ${item.stock > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    ₱{item.price}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout */}
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
                    <p className="text-xs text-gray-500">₱{item.price} x {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-gray-200 font-bold">
              <span>Total</span>
              <span className="text-emerald-600">₱{total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 rounded-lg font-bold text-white transition-all ${
                cart.length > 0 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
                : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Process Payment
            </button>
            <button
              onClick={() => setCart([])}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}