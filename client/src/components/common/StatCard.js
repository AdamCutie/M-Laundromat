import React from 'react';

// A reusable card for displaying numbers (Revenue, Orders, etc.)
const StatCard = ({ title, value, icon, trend, color = 'primary' }) => {
  // Map string colors to CSS variables
  const colorMap = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)'
  };

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {title}
        </p>
        <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {value}
        </h3>
        {trend && (
           <span style={{ fontSize: '0.75rem', color: trend.includes('+') ? 'var(--success)' : 'var(--danger)' }}>
             {trend} vs last month
           </span>
        )}
      </div>
      
      <div style={{ 
        width: '48px', height: '48px', 
        borderRadius: '12px', 
        background: `var(--${color}-bg, #EEF2FF)`, 
        color: colorMap[color],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;