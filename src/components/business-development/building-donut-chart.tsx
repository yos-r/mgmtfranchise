import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/card';

const BuildingDonutChart = () => {
  // Data for the donut chart
  const data = [
    { name: 'Maisons de type demi-fermé', value: 51, color: '#BEAF87' },
    { name: 'Buildings et immeubles à appartements', value: 28, color: '#746649' },
    { name: 'Maisons de commerce', value: 11, color: '#252526' },
    { name: 'Autres', value: 8, color: '#DED7C3' },
    { name: 'Non classifié', value: 2, color: '#B9B2A3' }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold text-sm">{payload[0].name}</p>
          <p className="text-gray-700 text-sm">{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for the pie sections
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    // Only show labels for sections that are big enough
    if (value < 5) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#000" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="font-semibold"
        fontSize="14"
      >
        {`${value}%`}
      </text>
    );
  };

  return (
    <Card>
      <div className="w-full bg-white p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Bâtiments par type en 2024</h2>
      
        <div className="flex flex-col">
          {/* Chart container */}
          <div className="w-full h-72 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={1}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
      
          {/* Legend container - now positioned below */}
          <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BuildingDonutChart;