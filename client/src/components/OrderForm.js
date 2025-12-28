import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import settingService from '../services/settingService'; // Import the new service

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

  // 2. STATE: Store Prices (The "Brain")
  const [rates, setRates] = useState(null);

  // 3. EFFECT: Load Prices on Startup
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const settings = await settingService.getSettings();
        setRates(settings);
      } catch (err) {
        alert("⚠️ Error loading prices. Check server.");
      }
    };
    fetchRates();
  }, []);

  // 4. EFFECT: Auto-Calculate Price whenever inputs change
  useEffect(() => {
    if (!rates) return; // Wait until rates are loaded

    let calculatedPrice = 0;

    if (formData.serviceType === 'Full-Service') {
      // Logic: Max(Weight, MinWeight) * PricePerKg
      const weightToCharge = Math.max(formData.weight || 0, rates.minWeight);
      calculatedPrice = weightToCharge * rates.fullServicePerKg;
    } else {
      // Logic: (Wash * WashPrice) + (Dry * DryPrice)
      calculatedPrice = 
        (formData.washCount * rates.selfServiceWash) + 
        (formData.dryCount * rates.selfServiceDry);
    }

    // Update state ONLY if the price is different (to prevent infinite loops)
    setFormData(prev => {
      if (prev.totalPrice !== calculatedPrice) {
        return { ...prev, totalPrice: calculatedPrice };
      }
      return prev;
    });

  }, [formData.weight, formData.washCount, formData.dryCount, formData.serviceType, rates]);

  // 5. HANDLER: Handle Typing
  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // 6. SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderService.createOrder(formData);
      alert("✅ Order Created Successfully!");
      window.location.reload(); 
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (!rates) return <p>Loading System Prices...</p>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f0f8ff' }}>
      <h2>➕ New Order (Auto-Priced)</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Customer Name */}
        <div style={{ marginBottom: '10px' }}>
          <label>Customer Name:</label><br/>
          <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}/>
        </div>

        {/* Service Type */}
        <div style={{ marginBottom: '10px' }}>
          <label>Service Type:</label><br/>
          <select name="serviceType" value={formData.serviceType} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="Full-Service">Full-Service (Min {rates.minWeight}kg)</option>
            <option value="Self-Service">Self-Service (Per Load)</option>
          </select>
        </div>

        {/* CONDITIONAL INPUTS */}
        {formData.serviceType === 'Full-Service' ? (
          <div style={{ marginBottom: '10px' }}>
            <label>Weight (kg):</label><br/>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} style={{ width: '100%', padding: '8px' }}/>
            <small>Rate: ₱{rates.fullServicePerKg}/kg (Min {rates.minWeight}kg)</small>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label>Wash Cycles:</label><br/>
              <input type="number" name="washCount" value={formData.washCount} onChange={handleChange} style={{ width: '100%', padding: '8px' }}/>
              <small>₱{rates.selfServiceWash}/load</small>
            </div>
            <div style={{ flex: 1 }}>
              <label>Dry Cycles:</label><br/>
              <input type="number" name="dryCount" value={formData.dryCount} onChange={handleChange} style={{ width: '100%', padding: '8px' }}/>
              <small>₱{rates.selfServiceDry}/load</small>
            </div>
          </div>
        )}

        {/* Total Price (READ ONLY) */}
        <div style={{ marginBottom: '15px' }}>
          <label>Total Price (₱):</label><br/>
          <input 
            type="number" 
            name="totalPrice" 
            value={formData.totalPrice} 
            readOnly // <--- The magic part. User cannot edit this.
            style={{ width: '100%', padding: '8px', backgroundColor: '#e9ecef', fontWeight: 'bold' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', width: '100%' }}>
          Confirm Order
        </button>

      </form>
    </div>
  );
};

export default OrderForm;