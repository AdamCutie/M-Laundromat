// client/src/components/SettingsPanel.js
import React, { useState, useEffect } from 'react';
import settingService from '../services/settingService';

/**
 * SETTINGS PANEL
 * Admin-only component for managing system prices
 */
const SettingsPanel = () => {
  const [settings, setSettings] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullServicePerKg: 0,
    minWeight: 0,
    selfServiceWash: 0,
    selfServiceDry: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingService.getSettings();
      setSettings(data);
      setFormData({
        fullServicePerKg: data.fullServicePerKg,
        minWeight: data.minWeight,
        selfServiceWash: data.selfServiceWash,
        selfServiceDry: data.selfServiceDry
      });
    } catch (err) {
      console.error("Failed to load settings");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('Update system prices? This will affect all new orders.')) {
      return;
    }

    try {
      await settingService.updateSettings(formData);
      await fetchSettings();
      setIsEditing(false);
      alert('✅ Prices updated successfully!');
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  if (!settings) return <div>Loading settings...</div>;

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      border: '1px solid #ddd'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0 }}>⚙️ System Settings (Pricing)</h3>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Edit Prices
          </button>
        ) : (
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({
                fullServicePerKg: settings.fullServicePerKg,
                minWeight: settings.minWeight,
                selfServiceWash: settings.selfServiceWash,
                selfServiceDry: settings.selfServiceDry
              });
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                Full-Service Price per Kg (₱)
              </label>
              <input 
                type="number"
                value={formData.fullServicePerKg}
                onChange={(e) => setFormData({
                  ...formData, 
                  fullServicePerKg: parseFloat(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
                step="0.01"
                required
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                Minimum Weight (kg)
              </label>
              <input 
                type="number"
                value={formData.minWeight}
                onChange={(e) => setFormData({
                  ...formData, 
                  minWeight: parseFloat(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
                step="0.1"
                required
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                Self-Service Wash (₱)
              </label>
              <input 
                type="number"
                value={formData.selfServiceWash}
                onChange={(e) => setFormData({
                  ...formData, 
                  selfServiceWash: parseFloat(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
                step="0.01"
                required
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                Self-Service Dry (₱)
              </label>
              <input 
                type="number"
                value={formData.selfServiceDry}
                onChange={(e) => setFormData({
                  ...formData, 
                  selfServiceDry: parseFloat(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
                step="0.01"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '15px'
            }}
          >
            💾 Save Changes
          </button>
        </form>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '15px' 
        }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              marginBottom: '5px'
            }}>
              Full-Service (per kg)
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#28a745'
            }}>
              ₱{settings.fullServicePerKg}
            </div>
            <div style={{ fontSize: '11px', color: '#6c757d' }}>
              Min: {settings.minWeight}kg
            </div>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              marginBottom: '5px'
            }}>
              Self-Service Wash
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#007bff'
            }}>
              ₱{settings.selfServiceWash}
            </div>
            <div style={{ fontSize: '11px', color: '#6c757d' }}>
              per cycle
            </div>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              marginBottom: '5px'
            }}>
              Self-Service Dry
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#ffc107'
            }}>
              ₱{settings.selfServiceDry}
            </div>
            <div style={{ fontSize: '11px', color: '#6c757d' }}>
              per cycle
            </div>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            border: '1px solid #b8daff'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#004085',
              marginBottom: '5px'
            }}>
              Last Updated
            </div>
            <div style={{ 
              fontSize: '14px',
              color: '#004085'
            }}>
              {new Date(settings.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;