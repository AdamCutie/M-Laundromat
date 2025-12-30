import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import inventoryService from '../../services/inventoryService';
import { Plus, Package, AlertTriangle, Search, Save, X, Trash2 } from 'lucide-react'; // Added Trash2 here

export default function Inventory({ user, onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for adding new item
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: '', stockLevel: 0, unitPrice: 0, costPrice: 0 });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await inventoryService.getInventory();
      setInventory(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load inventory");
      setLoading(false);
    }
  };

  // Logic: Calculate Stats
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(i => i.stockLevel < (i.lowStockThreshold || 10)).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.stockLevel * item.unitPrice), 0);

  // Logic: Filter Items
  const filteredInventory = inventory.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Action: Restock
  const handleRestock = async (item) => {
    const addedStockStr = window.prompt(`Restocking "${item.itemName}".\nCurrent: ${item.stockLevel}\n\nAdd how many?`);
    if (!addedStockStr) return;
    
    const addedStock = parseInt(addedStockStr);
    if (isNaN(addedStock) || addedStock <= 0) return alert("Invalid number");

    try {
      await inventoryService.update(item._id, { stockLevel: item.stockLevel + addedStock });
      fetchInventory(); // Refresh UI
      alert(`Success! New stock: ${item.stockLevel + addedStock}`);
    } catch (err) {
      alert("Failed to restock");
    }
  };

  // Action: Add New Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.addItem(newItem);
      setShowAddModal(false);
      setNewItem({ itemName: '', stockLevel: 0, unitPrice: 0, costPrice: 0 });
      fetchInventory();
    } catch (err) {
      alert("Error adding item: " + err.response?.data?.message);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    
    try {
      await inventoryService.deleteItem(id);
      setInventory(prev => prev.filter(item => item._id !== id)); // Optimistic UI update
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Inventory...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      {/* Top Stats Row */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
          <div className="bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </div>
          <div className="bg-yellow-50 px-6 py-3 rounded-lg border border-yellow-200 shadow-sm">
            <p className="text-sm text-yellow-700 font-medium">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
          </div>
          <div className="bg-green-50 px-6 py-3 rounded-lg border border-green-200 shadow-sm">
            <p className="text-sm text-green-700 font-medium">Total Value</p>
            <p className="text-2xl font-bold text-green-600">₱{totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const isLowStock = item.stockLevel < (item.lowStockThreshold || 10);
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.itemName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.stockLevel}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₱{item.unitPrice}</td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-3">
                      <button 
                        onClick={() => handleRestock(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Restock
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id, item.itemName)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newItem.itemName}
                  onChange={e => setNewItem({...newItem, itemName: e.target.value})}
                  placeholder="e.g. Ariel Powder"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newItem.unitPrice}
                    onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newItem.stockLevel}
                    onChange={e => setNewItem({...newItem, stockLevel: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" /> Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}