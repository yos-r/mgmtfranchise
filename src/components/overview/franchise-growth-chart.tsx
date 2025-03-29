import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Generate mock data for 5 years of franchise growth
const generateGrowthData = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
  
  // Start with a base number and increase every year
  let baseCount = 25;
  const monthlyData = [];
  
  years.forEach(year => {
    // For each year, generate quarterly data
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach((quarter, qIndex) => {
      // Add some randomness to the growth
      const newFranchises = Math.floor(Math.random() * 5) + 3;
      baseCount += newFranchises;
      
      monthlyData.push({
        period: `${quarter} ${year}`,
        newFranchises: newFranchises,
        totalFranchises: baseCount,
        year: year
      });
    });
  });
  
  return monthlyData;
};

interface FranchiseGrowthChartProps {
  className?: string;
}

export const FranchiseGrowthChart: React.FC<FranchiseGrowthChartProps> = ({ className }) => {
  const [displayMode, setDisplayMode] = useState<'bar' | 'line'>('bar');
  const [showCumulative, setShowCumulative] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'all' | 'year' | '2years'>('all');
  
  const allData = generateGrowthData();
  
  // Filter data based on selected time range
  let filteredData = allData;
  if (timeRange === 'year') {
    const currentYear = new Date().getFullYear().toString();
    filteredData = allData.filter(item => item.year === currentYear);
  } else if (timeRange === '2years') {
    const currentYear = new Date().getFullYear();
    filteredData = allData.filter(item => {
      const itemYear = parseInt(item.year);
      return itemYear >= currentYear - 1;
    });
  }

  const dataKey = showCumulative ? 'totalFranchises' : 'newFranchises';
  const chartTitle = showCumulative ? 'Total Franchises' : 'New Franchises';

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as 'all' | 'year' | '2years')}>
              <ToggleGroupItem value="all" aria-label="All time">All</ToggleGroupItem>
              <ToggleGroupItem value="2years" aria-label="Last 2 years">2 Years</ToggleGroupItem>
              <ToggleGroupItem value="year" aria-label="This year">This Year</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={displayMode === 'bar' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setDisplayMode('bar')}
            >
              Bar
            </Button>
            <Button 
              variant={displayMode === 'line' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setDisplayMode('line')}
            >
              Line
            </Button>
            <Button 
              variant={showCumulative ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowCumulative(!showCumulative)}
            >
              {showCumulative ? "Cumulative" : "Growth"}
            </Button>
          </div>
        </div>
        
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            {displayMode === 'bar' ? (
              <BarChart 
                data={filteredData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  width={40}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, chartTitle]}
                />
                <Legend />
                <Bar 
                  name={chartTitle}
                  dataKey={dataKey} 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  width={40}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, chartTitle]}
                />
                <Legend />
                <Line 
                  name={chartTitle}
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke="hsl(var(--primary))" 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};