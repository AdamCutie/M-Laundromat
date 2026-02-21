import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import settingService from '../services/settingService';
import inventoryService from '../services/inventoryService';
import { printReceipt } from '../utils/printReceipt';

const OrderForm = () => {
  // 1. STATE: Form Data
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '', // ADDED: Phone number field
    serviceType: 'Full-Service',
    weight: 0,
    washCount: 0,
    dryCount: 0,
    totalPrice: 0
  });

  // 2. DATA STATE
  const [rates, setRates] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  
  // 3. CART STATE
  const [cart, setCart] = useState([]); 
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const sanitizePhone = (value) => value.replace(/\D/g, '').slice(0, 11);

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const settings = await settingService.getSettings();
        setRates(settings);
        
        const items = await inventoryService.getInventory();
        setInventoryItems(items);
        
        if (items.length > 0) setSelectedItem(items[0]._id);
      } catch (err) {
        alert("⚠️ Error loading prices. Check server.");
      }
    };
    fetchData();
  }, []);

  // 4. EFFECT: Auto-Calculate Price
  useEffect(() => {
    if (!rates) return;

    let servicePrice = 0;

    if (formData.serviceType === 'Full-Service') {
      const weightToCharge = Math.max(formData.weight || 0, rates.minWeight);
      servicePrice = weightToCharge * rates.fullServicePerKg;
    } else {
      servicePrice = 
        (formData.washCount * rates.selfServiceWash) + 
        (formData.dryCount * rates.selfServiceDry);
    }

    const addOnsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalPrice = servicePrice + addOnsTotal;

    setFormData(prev => {
      if (prev.totalPrice !== finalPrice) {
        return { ...prev, totalPrice: finalPrice };
      }
      return prev;
    });

  }, [formData.weight, formData.washCount, formData.dryCount, formData.serviceType, rates, cart]);

  // 5. HANDLER: Handle Typing
  const handleChange = (e) => {
    const { name, type, value } = e.target;
    if (name === 'customerPhone') {
      setFormData({ ...formData, [name]: sanitizePhone(value) });
      return;
    }
    if (type === 'number') {
      const num = Number(value);
      setFormData({ ...formData, [name]: Number.isFinite(num) ? num : 0 });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const addToCart = () => {
    const product = inventoryItems.find(i => i._id === selectedItem);
    if (!product) return;

    const safeQty = Math.max(1, parseInt(itemQuantity, 10) || 1);
    const newItem = {
      itemId: product._id,
      itemName: product.itemName,
      price: product.unitPrice,
      quantity: safeQty
    };

    setCart([...cart, newItem]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await orderService.createOrder({ ...formData, addOns: cart });
      
      alert("✅ Order Created Successfully!");

      if(window.confirm("Do you want to print the receipt now?")) {
         printReceipt(response); 
      }

      window.location.reload(); 
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  
  if (!rates) return <p>Loading System Prices...</p>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f0f8ff' }}>
      <h2>➕ New Order</h2>
      <form onSubmit={handleSubmit}>
        
        {/* CUSTOMER INFO */}
        <div style={{ marginBottom: '10px' }}>
          <label>Customer Name:</label><br/>
          <input 
            type="text" 
            name="customerName" 
            value={formData.customerName} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* PHONE NUMBER - NEW */}
        <div style={{ marginBottom: '10px' }}>
          <label>Phone Number (for customer linking):</label><br/>
          <input 
            type="tel" 
            name="customerPhone" 
            value={formData.customerPhone} 
            onChange={handleChange} 
            placeholder="e.g. 09123456789"
            style={{ width: '100%', padding: '8px' }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            If customer has an account, order will be linked automatically
          </small>
        </div>

        {/* Service Type */}
        <div style={{ marginBottom: '10px' }}>
          <label>Service Type:</label><br/>
          <select name="serviceType" value={formData.serviceType} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="Full-Service">Full-Service</option>
            <option value="Self-Service">Self-Service</option>
          </select>
        </div>

        {/* SERVICE INPUTS */}
        {formData.serviceType === 'Full-Service' ? (
          <div style={{ marginBottom: '10px' }}>
            <label>Weight (kg):</label><br/>
            <input type="number" name="weight" min="0" step="0.1" value={formData.weight} onChange={handleChange} style={{ width: '100%', padding: '8px' }}/>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label>Wash:</label>
              <input type="number" name="washCount" min="0" step="1" value={formData.washCount} onChange={handleChange} style={{ width: '100%' }}/>
            </div>
            <div style={{ flex: 1 }}>
              <label>Dry:</label>
              <input type="number" name="dryCount" min="0" step="1" value={formData.dryCount} onChange={handleChange} style={{ width: '100%' }}/>
            </div>
          </div>
        )}

        {/* ADD-ONS SECTION */}
        <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #ddd' }}>
          <h4>🛒 Add-ons (Detergents, etc.)</h4>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <select 
              value={selectedItem} 
              onChange={(e) => setSelectedItem(e.target.value)}
              style={{ flex: 2, padding: '5px' }}
            >
              {inventoryItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.itemName} (₱{item.unitPrice}) - Stock: {item.stockLevel}
                </option>
              ))}
            </select>
            
              <input 
              type="number" 
              value={itemQuantity} 
              onChange={(e) => setItemQuantity(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} 
              min="1"
              style={{ width: '50px', padding: '5px' }}
            />
            
            <button type="button" onClick={addToCart} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', padding: '0 10px' }}>
              Add
            </button>
          </div>

          {cart.length > 0 && (
            <ul style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
              {cart.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.itemName} (+₱{item.price * item.quantity})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TOTAL & SUBMIT */}
        <div style={{ marginBottom: '15px' }}>
          <label>Total Price (₱):</label><br/>
          <input type="number" name="totalPrice" value={formData.totalPrice} readOnly style={{ width: '100%', padding: '8px', backgroundColor: '#e9ecef', fontWeight: 'bold' }}/>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', width: '100%' }}>
          Confirm Order
        </button>

      </form>
    </div>
  );
};

export default OrderForm;
