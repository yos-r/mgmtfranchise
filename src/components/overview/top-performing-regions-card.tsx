import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
const TopPerformingRegionsCard = () => {
  const [viewMode, setViewMode] = useState('revenue');
  const { formatCurrency } = useCurrency();
  // Sample data for top performing regions with more context
  const regionData = [
    { name: "Paris", revenue: 842500, growth: 12.3 },
    { name: "Lyon", revenue: 651200, growth: 8.7 },
    { name: "Marseille", revenue: 587400, growth: -2.1 },
    { name: "Bordeaux", revenue: 498600, growth: 5.8 },
    { name: "Toulouse", revenue: 421300, growth: 3.2 }
  ];

  // Sort regions by selected view mode
  const sortedRegions = [...regionData].sort((a, b) => 
    viewMode === 'revenue' ? b.revenue - a.revenue : b.growth - a.growth
  );
  
  // Format currency values
  

  // Format growth values with + or - sign
  const formatGrowth = (value) => {
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Top Performing Regions</CardTitle>
          {/* <div className="flex gap-2">
            <Button 
              variant={viewMode === 'revenue' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode('revenue')}
            >
              Revenue
            </Button>
            <Button 
              variant={viewMode === 'growth' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode('growth')}
            >
              Growth
            </Button>
          </div> */}
        </div>
      </CardHeader>
      <CardContent>
        {/* <div className="w-full h-[240px] mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedRegions}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                tick={{ fontSize: 10 }}
                domain={viewMode === 'growth' ? [-5, 15] : [0, 'auto']}
                tickFormatter={viewMode === 'revenue' ? formatCurrency : formatGrowth}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value) => [
                  viewMode === 'revenue' ? formatCurrency(value) : formatGrowth(value),
                  viewMode === 'revenue' ? 'Revenue' : 'Growth Rate'
                ]}
              />
              <Bar 
                dataKey={viewMode} 
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              >
                {sortedRegions.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={viewMode === 'growth' && entry.growth < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> */}
        
        <div className="space-y-2 mt-4">
          {sortedRegions.map((region) => (
            <div key={region.name} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-medium">{region.name}</span>
                {region.growth > 0 ? (
                  <TrendingUp size={16} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={16} className="text-rose-500" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {formatGrowth(region.growth)}
                </span>
                <span className="font-medium">
                  {formatCurrency(region.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformingRegionsCard;