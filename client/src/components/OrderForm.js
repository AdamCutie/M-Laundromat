import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import settingService from '../services/settingService';
import inventoryService from '../services/inventoryService'; // <--- [NEW]

const OrderForm = () => {
  // 1. STATE: Form Data
  const [formData, setFormData] = useState({
    customerName: '',
    serviceType: 'Full-Service',
    weight: 0,
    washCount: 0,
    dryCount: 0,
    totalPrice: 0
  });

  // 2. DATA STATE
  const [rates, setRates] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]); // All available products
  
  // 3. CART STATE (Items added to this order)
  const [cart, setCart] = useState([]); 
  const [selectedItem, setSelectedItem] = useState(''); // Currently selected in dropdown
  const [itemQuantity, setItemQuantity] = useState(1);

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const settings = await settingService.getSettings();
        setRates(settings);
        
        const items = await inventoryService.getInventory();
        setInventoryItems(items);
        
        // Set default selected item if inventory exists
        if (items.length > 0) setSelectedItem(items[0]._id);
      } catch (err) {
        alert("⚠️ Error loading prices. Check server.");
      }
    };
    fetchData();
  }, []);

  // 4. EFFECT: Auto-Calculate Price whenever inputs change
  useEffect(() => {
    if (!rates) return; // Wait until rates are loaded

    let servicePrice = 0;

    // 1. Calculate Service Cost
    if (formData.serviceType === 'Full-Service') {
      // Logic: Max(Weight, MinWeight) * PricePerKg
      const weightToCharge = Math.max(formData.weight || 0, rates.minWeight);
      servicePrice = weightToCharge * rates.fullServicePerKg;
    } else {
      servicePrice = 
        (formData.washCount * rates.selfServiceWash) + 
        (formData.dryCount * rates.selfServiceDry);
    }

    // 2. Calculate Add-ons Cost
    const addOnsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 3. Final Total
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
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const addToCart = () => {
    // Find the full item object from the ID
    const product = inventoryItems.find(i => i._id === selectedItem);
    if (!product) return;

    const newItem = {
      itemId: product._id,
      itemName: product.itemName,
      price: product.unitPrice,
      quantity: parseInt(itemQuantity)
    };

    // Add to cart array
    setCart([...cart, newItem]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the main data + the cart (addOns)
      await orderService.createOrder({ ...formData, addOns: cart });
      alert("✅ Order Created Successfully!");
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
          <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}/>
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
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} style={{ width: '100%', padding: '8px' }}/>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label>Wash:</label>
              <input type="number" name="washCount" value={formData.washCount} onChange={handleChange} style={{ width: '100%' }}/>
            </div>
            <div style={{ flex: 1 }}>
              <label>Dry:</label>
              <input type="number" name="dryCount" value={formData.dryCount} onChange={handleChange} style={{ width: '100%' }}/>
            </div>
          </div>
        )}

        {/* --- ADD-ONS SECTION (NEW) --- */}
        <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #ddd' }}>
          <h4>🛍️ Add-ons (Detergents, etc.)</h4>
          
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
              onChange={(e) => setItemQuantity(e.target.value)} 
              min="1"
              style={{ width: '50px', padding: '5px' }}
            />
            
            <button type="button" onClick={addToCart} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', padding: '0 10px' }}>
              Add
            </button>
          </div>

          {/* List of selected items */}
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
        {/* ----------------------------- */}

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