import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Edit, Save, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface DistributionChannel {
  name: string;
  percentage: number;
}

interface ChannelDistributionCardProps {
  actionId: string;
  initialDistribution?: Record<string, number>;
  onUpdate?: (updatedDistribution: Record<string, number>) => void;
}

// More elegant color palette
const CHART_COLORS = [
  "#BEAF87", 
  "#746649", 
  "#252526", 
  "#ded7c3", // Indigo
//   "#ded7c3"  // Pink
];

export function ChannelDistributionCard({ 
  actionId, 
  initialDistribution = { "social media": 35, "email": 25, "search ads": 30, "website": 10 },
  onUpdate 
}: ChannelDistributionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [distribution, setDistribution] = useState<Record<string, number>>(initialDistribution);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [adjustedValues, setAdjustedValues] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Effect to initialize distribution from props
  useEffect(() => {
    if (initialDistribution && Object.keys(initialDistribution).length > 0) {
      setDistribution(initialDistribution);
    }
  }, [initialDistribution]);

  // Convert distribution object to array for rendering
  const distributionArray: DistributionChannel[] = Object.entries(distribution).map(
    ([name, percentage]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      percentage
    })
  );

  // Format data for pie chart
  const chartData = distributionArray.map(item => ({
    name: item.name,
    value: item.percentage
  }));

  // Create a remaining distribution pool and adjust other channels when one changes
  const handleSliderChange = (name: string, value: number) => {
    const lowerName = name.toLowerCase();
    
    // Store the new value in adjustedValues first
    setAdjustedValues(prev => ({
      ...prev,
      [lowerName]: value
    }));

    // Calculate the difference from the previous value
    const previousValue = distribution[lowerName];
    const difference = value - previousValue;
    
    if (difference === 0) return;

    // Get other channels to distribute the difference
    const otherChannels = Object.entries(distribution)
      .filter(([channelName]) => channelName !== lowerName);
    
    if (otherChannels.length === 0) {
      setDistribution({ [lowerName]: value });
      return;
    }

    // Calculate the sum of other channels
    const otherSum = otherChannels.reduce((sum, [_, val]) => sum + val, 0);
    
    // If we're increasing this channel, decrease others proportionally
    if (difference > 0) {
      const newDistribution = { ...distribution, [lowerName]: value };
      
      // Distribute the reduction proportionally among other channels
      otherChannels.forEach(([channelName, channelValue]) => {
        // Calculate proportional reduction
        const proportion = channelValue / otherSum;
        const reduction = difference * proportion;
        newDistribution[channelName] = Math.max(0, channelValue - reduction);
      });
      
      // Round values and ensure they sum to 100
      const roundedDistribution = adjustForTotal(newDistribution);
      setDistribution(roundedDistribution);
    } 
    // If we're decreasing this channel, increase others proportionally
    else {
      const newDistribution = { ...distribution, [lowerName]: value };
      
      // Distribute the increase proportionally among other channels
      otherChannels.forEach(([channelName, channelValue]) => {
        // Calculate proportional increase
        const proportion = channelValue / otherSum;
        const increase = Math.abs(difference) * proportion;
        newDistribution[channelName] = channelValue + increase;
      });
      
      // Round values and ensure they sum to 100
      const roundedDistribution = adjustForTotal(newDistribution);
      setDistribution(roundedDistribution);
    }
  };

  // Adjust values to ensure they sum to 100
  const adjustForTotal = (dist: Record<string, number>): Record<string, number> => {
    const result: Record<string, number> = {};
    
    // Round to integers first
    Object.entries(dist).forEach(([key, value]) => {
      result[key] = Math.round(value);
    });
    
    // Calculate the total after rounding
    const total = Object.values(result).reduce((sum, val) => sum + val, 0);
    
    // Adjust for rounding errors if needed
    if (total !== 100) {
      // Find the channel with the highest value to adjust
      const [maxChannel] = Object.entries(result)
        .sort((a, b) => b[1] - a[1])[0];
      
      result[maxChannel] += (100 - total);
    }
    
    return result;
  };

  // Apply changes to finalize the slider interaction
  const applyChanges = (name: string) => {
    const value = adjustedValues[name.toLowerCase()] || distribution[name.toLowerCase()];
    
    // Calculate total of all channels after change
    const newDistribution = { ...distribution, [name.toLowerCase()]: value };
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    
    // If total is not 100, adjust other values to make it 100
    if (Math.abs(total - 100) > 0.1) {
      // Adjust other channels proportionally
      const adjustedDistribution = adjustForTotal(newDistribution);
      setDistribution(adjustedDistribution);
    } else {
      setDistribution(newDistribution);
    }
    
    // Clear adjusted values
    setAdjustedValues({});
  };

  // Save distribution to Supabase
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Format distribution for Supabase JSONB column
      const formattedDistribution = Object.fromEntries(
        Object.entries(distribution).map(([key, value]) => [key.toLowerCase(), Math.round(value)])
      );

      const { error } = await supabase
        .from('marketing_actions')
        .update({ channel_distribution: formattedDistribution })
        .eq('id', actionId);

      if (error) throw error;
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(formattedDistribution);
      }
      
      toast({
        title: "Success",
        description: "Channel distribution updated successfully.",
        variant: "default",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating channel distribution:", error);
      toast({
        title: "Error",
        description: "Failed to update channel distribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Custom active shape for pie chart
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
        />
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Custom tooltip formatter to show both name and value
  const customTooltipFormatter = (value, name, entry) => {
    return [
      `${value}%`, 
      entry.payload.name
    ];
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Channel Distribution</CardTitle>
          {isEditing ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
              className="text- border 0"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="text- px-1 "
            >
              <Edit className="h-4 w-4 mr-2 text-obsessedgrey" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Distribution Chart */}
        <div className="h-56 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                paddingAngle={3}
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={customTooltipFormatter}
                contentStyle={{ 
                  borderRadius: '6px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                  border: 'none',
                  padding: '8px 12px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                layout="horizontal"
                iconSize={10}
                iconType="circle"
                formatter={(value) => <span className="text-xs text-gray-700">{value}</span>}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution List with Sliders */}
        <div className="space-y-5">
          {distributionArray.map((channel, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center">
                  <span className="h-3 w-3 mr-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                  {channel.name}
                </span>
                <span className="text-sm font-medium">
                  {Math.round(channel.percentage)}%
                </span>
              </div>
              {isEditing ? (
                <div className="relative pt-1">
                  <Slider
                    value={[adjustedValues[channel.name.toLowerCase()] || channel.percentage]}
                    max={100}
                    step={1}
                    className="w-full"
                    onValueChange={(values) => handleSliderChange(channel.name, values[0])}
                    onValueCommit={() => applyChanges(channel.name)}
                  />
                </div>
              ) : (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-in-out" 
                    style={{ 
                      width: `${channel.percentage}%`,
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChannelDistributionCard;