import React, { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';

const InventoryManager = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ itemName: '', stockLevel: 0, unitPrice: 0 });

  // Load inventory on startup
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (err) {
      alert("Failed to load inventory");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.addItem(newItem);
      alert("✅ Item Added!");
      setNewItem({ itemName: '', stockLevel: 0, unitPrice: 0 }); // Reset form
      fetchInventory(); // Refresh the list immediately
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2>📦 Inventory Management</h2>
      
      {/* ADD ITEM FORM */}
      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div>
          <label>Item Name:</label><br/>
          <input 
            type="text" 
            value={newItem.itemName} 
            onChange={(e) => setNewItem({...newItem, itemName: e.target.value})} 
            required 
            style={{ padding: '5px' }}
          />
        </div>
        <div>
          <label>Stock:</label><br/>
          <input 
            type="number" 
            value={newItem.stockLevel} 
            onChange={(e) => setNewItem({...newItem, stockLevel: parseInt(e.target.value)})} 
            style={{ width: '80px', padding: '5px' }}
          />
        </div>
        <div>
          <label>Price (₱):</label><br/>
          <input 
            type="number" 
            value={newItem.unitPrice} 
            onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})} 
            required 
            style={{ width: '80px', padding: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', height: '35px' }}>
          Add Item
        </button>
      </form>

      {/* INVENTORY TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Item</th>
            <th style={{ padding: '10px' }}>Price</th>
            <th style={{ padding: '10px' }}>Stock Level</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{item.itemName}</td>
              <td style={{ padding: '10px' }}>₱{item.unitPrice}</td>
              <td style={{ padding: '10px' }}>
                <span style={{ 
                  color: item.stockLevel < 10 ? 'red' : 'green', 
                  fontWeight: 'bold' 
                }}>
                  {item.stockLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryManager;