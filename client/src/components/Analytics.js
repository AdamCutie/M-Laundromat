import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState({ revenue: 0, count: 0, breakdown: [] });
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await orderService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  // Prepare data for the chart
  const chartData = stats.breakdown.map((item) => ({
    name: item._id, // "Pending" or "Completed"
    value: item.count
  }));

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
      
      {/* LEFT SIDE: NUMBERS */}
      <div style={{ textAlign: 'center' }}>
        <h3>💰 Total Revenue</h3>
        <h1 style={{ color: 'green', fontSize: '40px', margin: '10px 0' }}>
          ₱{stats.revenue.toLocaleString()}
        </h1>
        <p>Total Orders: {stats.count}</p>
      </div>

      {/* RIGHT SIDE: CHART */}
      <div>
        <h4>Order Status</h4>
        <PieChart width={250} height={250}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

    </div>
  );
};

export default Analytics;