import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
// Generate mock data for 24 months of revenue
const generateRevenueData = () => {
  const currentDate = new Date();
  return Array.from({ length: 24 }, (_, index) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - index, 1);
    return {
      month: monthDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
      revenue: Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000 // Random revenue between 100k and 500k
    };
  }).reverse(); // Reverse to show most recent months first
};

export const RevenueOverviewChart: React.FC = () => {
  const revenueData = generateRevenueData();
  const {formatCurrency}=useCurrency();
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={revenueData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={(value) => `${formatCurrency((value / 1000))}K`}
            tick={{ fontSize: 10 }}
            width={40}
          />
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          
          <Legend 
            verticalAlign="bottom" 
            height={36}
          />
          <Bar 
            dataKey="revenue" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};