import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import inventoryService from '../../services/inventoryService';
import { Plus, Package, AlertTriangle, Search, Save, X, Trash2, Pencil } from 'lucide-react';

export default function Inventory({ user, onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for Adding
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: '', stockLevel: 0, unitPrice: 0, costPrice: 0 });

  // Modal State for Editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
      fetchInventory(); 
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

  // Action: Update Item
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.update(editingItem._id, editingItem);
      
      // Optimistic UI Update
      setInventory(prev => prev.map(item => item._id === editingItem._id ? editingItem : item));
      
      setShowEditModal(false);
      setEditingItem(null);
      alert("Item updated successfully!");
    } catch (err) {
      alert("Failed to update item.");
    }
  };

  const openEditModal = (item) => {
    setEditingItem({ ...item }); 
    setShowEditModal(true);
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    
    try {
      await inventoryService.deleteItem(id);
      setInventory(prev => prev.filter(item => item._id !== id)); 
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Inventory...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      
      {/* Top Stats Row */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Stats Grid (1 Col Mobile -> 3 Col Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
          <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between md:block">
            <p className="text-sm text-gray-500 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
          </div>
          <div className="bg-yellow-50 px-6 py-4 rounded-xl border border-yellow-200 shadow-sm flex items-center justify-between md:block">
            <p className="text-sm text-yellow-700 font-medium">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p>
          </div>
          <div className="bg-green-50 px-6 py-4 rounded-xl border border-green-200 shadow-sm flex items-center justify-between md:block">
            <p className="text-sm text-green-700 font-medium">Total Value</p>
            <p className="text-2xl font-bold text-green-700">₱{totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* DESKTOP TABLE (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
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
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{item.stockLevel}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">₱{item.unitPrice}</td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                      <button 
                        onClick={() => handleRestock(item)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wide mr-2 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
                      >
                        Restock
                      </button>
                      
                      <button 
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => handleDeleteItem(item._id, item.itemName)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* MOBILE CARD VIEW (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-gray-100">
            {filteredInventory.length > 0 ? filteredInventory.map((item) => {
               const isLowStock = item.stockLevel < (item.lowStockThreshold || 10);
               return (
                 <div key={item._id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{item.itemName}</h4>
                                <p className="text-emerald-600 font-bold">₱{item.unitPrice}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                             <button 
                                onClick={() => openEditModal(item)}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                             >
                                <Pencil className="w-5 h-5" />
                             </button>
                             <button 
                                onClick={() => handleDeleteItem(item._id, item.itemName)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                             >
                                <Trash2 className="w-5 h-5" />
                             </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Stock Level</p>
                             <div className="flex items-center gap-2">
                                 <span className="text-lg font-mono font-bold">{item.stockLevel}</span>
                                 {isLowStock ? (
                                    <span className="text-xs text-yellow-600 font-medium flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded-full">
                                        <AlertTriangle className="w-3 h-3" /> Low
                                    </span>
                                 ) : (
                                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">OK</span>
                                 )}
                             </div>
                        </div>
                        <button 
                            onClick={() => handleRestock(item)}
                            className="bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform"
                        >
                            + Restock
                        </button>
                    </div>
                 </div>
               );
            }) : (
                <div className="p-8 text-center text-gray-400">
                    No items found.
                </div>
            )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Item Name</label>
                <input required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})} placeholder="e.g. Ariel Powder" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Price (₱)</label>
                  <input required type="number" min="0" step="0.01" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Initial Stock</label>
                  <input required type="number" min="0" step="1" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newItem.stockLevel} onChange={e => setNewItem({...newItem, stockLevel: Number(e.target.value) || 0})} />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md">
                <Save className="w-5 h-5" /> Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Item Name</label>
                <input required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={editingItem.itemName} onChange={e => setEditingItem({...editingItem, itemName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Price (₱)</label>
                  <input required type="number" min="0" step="0.01" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={editingItem.unitPrice} onChange={e => setEditingItem({...editingItem, unitPrice: Number(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Current Stock</label>
                  <input required type="number" min="0" step="1" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={editingItem.stockLevel} onChange={e => setEditingItem({...editingItem, stockLevel: Number(e.target.value) || 0})} />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md">
                <Save className="w-5 h-5" /> Update Product
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
