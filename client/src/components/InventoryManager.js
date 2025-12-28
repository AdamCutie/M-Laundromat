import React, { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  // Simple form state for adding new items
  const [newItem, setNewItem] = useState({ itemName: '', stockLevel: 0, unitPrice: 0 });

  // Load inventory on startup
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await inventoryService.getInventory();
      setInventory(data);
    } catch (err) {
      console.error("Failed to load inventory");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.addItem(newItem);
      setNewItem({ itemName: '', stockLevel: 0, unitPrice: 0 }); // Reset form
      fetchInventory(); // Refresh list
      alert("Item Added!");
    } catch (err) {
      alert("Error adding item");
    }
  };

  // --- NEW: Restock Logic ---
  const handleRestock = async (item) => {
    // 1. Ask user for amount
    const addedStockStr = window.prompt(`Restocking "${item.itemName}".\nCurrent Stock: ${item.stockLevel}\n\nHow many are you adding?`);
    
    if (!addedStockStr) return; // User clicked Cancel

    const addedStock = parseInt(addedStockStr);
    
    if (isNaN(addedStock) || addedStock <= 0) {
      return alert("Please enter a valid number.");
    }

    // 2. Calculate new total
    const newTotal = item.stockLevel + addedStock;

    // 3. Send to server
    try {
      await inventoryService.update(item._id, { stockLevel: newTotal });
      fetchInventory(); // Refresh to see the change
      alert(`Success! Stock is now ${newTotal}.`);
    } catch (err) {
      alert("Restock failed");
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '10px', border: '1px solid #ddd' }}>
      <h3>📦 Inventory Manager</h3>

      {/* ADD ITEM FORM */}
      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        <input 
          placeholder="Item Name (e.g. Ariel)" 
          value={newItem.itemName}
          onChange={e => setNewItem({...newItem, itemName: e.target.value})}
          required
          style={{ padding: '8px', flex: 2 }}
        />
        <input 
          type="number" 
          placeholder="Price" 
          value={newItem.unitPrice}
          onChange={e => setNewItem({...newItem, unitPrice: e.target.value})}
          required
          style={{ padding: '8px', flex: 1 }}
        />
        <input 
          type="number" 
          placeholder="Stock" 
          value={newItem.stockLevel}
          onChange={e => setNewItem({...newItem, stockLevel: e.target.value})}
          required
          style={{ padding: '8px', flex: 1 }}
        />
        <button type="submit" style={{ padding: '8px 15px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          + Add
        </button>
      </form>

      {/* INVENTORY TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Item</th>
            <th style={{ padding: '10px' }}>Price</th>
            <th style={{ padding: '10px' }}>Stock Level</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.itemName}</td>
              <td style={{ padding: '10px' }}>₱{item.unitPrice}</td>
              
              {/* Colored Stock Alert */}
              <td style={{ padding: '10px', color: item.stockLevel < 10 ? 'red' : 'green', fontWeight: 'bold' }}>
                {item.stockLevel} {item.stockLevel < 10 && "⚠️ LOW"}
              </td>

              <td style={{ padding: '10px' }}>
                <button 
                  onClick={() => handleRestock(item)}
                  style={{
                    padding: '5px 10px',
                    background: '#00b894',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  + Restock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryManager;