import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Edit, Save, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/hooks/useCurrency";

interface DistributionChannel {
  name: string;
  amount: number;
  percentage: number;
}

interface ChannelDistributionCardProps {
  spent: number;
  actionId: string;
  initialDistribution?: Record<string, number>;
  onUpdate?: (updatedDistribution: Record<string, number>) => void;
}

// More elegant color palette
const CHART_COLORS = [
  "#edb103",
  "#BEAF87",
  "#ef4436",
  "#0866ff", // Indigo
];

export function ChannelDistributionCard({
  spent,
  actionId,
  initialDistribution = { "social media": 35, "email": 25, "search ads": 30, "website": 10 },
  onUpdate
}: ChannelDistributionCardProps) {
  const { formatCurrency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [distribution, setDistribution] = useState<Record<string, number>>(initialDistribution);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  // Effect to initialize distribution from props
  useEffect(() => {
    if (initialDistribution && Object.keys(initialDistribution).length > 0) {
      setDistribution(initialDistribution);
    }
  }, [initialDistribution]);

  // Initialize input values when editing mode changes
  useEffect(() => {
    if (isEditing) {
      const initialInputs: Record<string, string> = {};
      Object.entries(distribution).forEach(([key, value]) => {
        initialInputs[key.toLowerCase()] = Math.round(value).toString();
      });
      setInputValues(initialInputs);
    }
  }, [isEditing, distribution]);

  // Convert distribution object to array for rendering with calculated amounts
  const distributionArray: DistributionChannel[] = Object.entries(distribution).map(
    ([name, percentage]) => {
      const amount = (spent * percentage) / 100;
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        percentage,
        amount
      };
    }
  );

  // Format data for pie chart
  const chartData = distributionArray.map(item => ({
    name: item.name,
    value: item.percentage,
    amount: item.amount
  }));

  // Handle input value change
  const handleInputChange = (name: string, value: string) => {
    const lowerName = name.toLowerCase();

    // Only allow numbers
    const numValue = value.replace(/[^0-9]/g, '');

    // Update input value
    setInputValues(prev => ({
      ...prev,
      [lowerName]: numValue
    }));

    // Also update the distribution directly for real-time visual feedback
    // but don't adjust other values automatically
    setDistribution(prev => ({
      ...prev,
      [lowerName]: parseInt(numValue) || 0
    }));
  };

  // Apply input changes without automatic adjustment
  const applyInputChanges = () => {
    let newDistribution = { ...distribution };

    // Convert all inputs to numbers
    Object.entries(inputValues).forEach(([key, value]) => {
      const numValue = parseInt(value) || 0;
      newDistribution[key] = numValue;
    });

    // Update distribution with raw values (no adjustment)
    setDistribution(newDistribution);
  };

  // Adjust values to ensure they sum to 100
  const adjustForTotal = (dist: Record<string, number>): Record<string, number> => {
    const result: Record<string, number> = {};
    const total = Object.values(dist).reduce((sum, val) => sum + val, 0);

    if (total === 0) {
      // If all values are 0, distribute evenly
      const channels = Object.keys(dist);
      const equalValue = 100 / channels.length;
      channels.forEach(key => {
        result[key] = equalValue;
      });
    } else {
      // Scale values to sum to 100
      Object.entries(dist).forEach(([key, value]) => {
        result[key] = Math.round((value / total) * 100);
      });

      // Handle rounding errors to ensure total is exactly 100
      const newTotal = Object.values(result).reduce((sum, val) => sum + val, 0);
      if (newTotal !== 100) {
        // Find the channel with the highest value to adjust
        const [maxChannel] = Object.entries(result)
          .sort((a, b) => b[1] - a[1])[0];

        result[maxChannel] += (100 - newTotal);
      }
    }

    return result;
  };

  // Save distribution to Supabase with verification
  const handleSave = async () => {
    // First apply any pending changes
    applyInputChanges();

    // Calculate total to verify
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);

    // Check if total is 100%
    if (total !== 100) {
      // Notify user about incorrect total
      toast({
        title: "Warning",
        description: `Distribution total is ${total}%, not 100%. Would you like to adjust automatically?`,
        variant: "warning",
        action: (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => {
              // Adjust values to 100%
              const adjusted = adjustForTotal(distribution);
              setDistribution(adjusted);

              // Update input values
              const updatedInputs: Record<string, string> = {};
              Object.entries(adjusted).forEach(([key, value]) => {
                updatedInputs[key.toLowerCase()] = Math.round(value).toString();
              });
              setInputValues(updatedInputs);

              // Notify about adjustment
              toast({
                title: "Adjusted",
                description: "Distribution has been automatically adjusted to 100%.",
                variant: "default",
              });
            }}>
              Adjust
            </Button>
            <Button variant="destructive" size="sm" onClick={() => {
              // Proceed with saving the unbalanced distribution
              saveDistributionToSupabase();
            }}>
              Save anyway
            </Button>
          </div>
        )
      });
      return;
    }

    // If total is 100%, proceed with saving
    saveDistributionToSupabase();
  };

  // Function to save the distribution to Supabase
  const saveDistributionToSupabase = async () => {
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
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

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

  // Custom tooltip formatter to show both percentage and amount
  const customTooltipFormatter = (value, name, entry) => {
    const amount = (spent * value) / 100;
    return [
      `${value}% (${formatCurrency(amount)})`,
      entry.payload.name
    ];
  };

  // Calculate total of current distribution
  const currentTotal = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Channel Distribution</CardTitle>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${currentTotal !== 100 ? 'text-red-500' : 'text-green-600'}`}>
                Total: {currentTotal}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm border-0"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-sm px-1"
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

        {/* Distribution List with Sliders and/or Input Fields */}
        <div className="space-y-5">
          {distributionArray.map((channel, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center">
                  <span className="h-3 w-3 mr-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                  {channel.name}
                </span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-3">
                    {/* {formatCurrency(channel.amount)} */}
                  </span>
                  {isEditing ? (
                    <div className="w-16">
                      <Input
                        type="text"
                        value={inputValues[channel.name.toLowerCase()] || '0'}
                        onChange={(e) => handleInputChange(channel.name, e.target.value)}
                        onBlur={applyInputChanges}
                        className="h-6 text-sm text-right pr-1"
                        suffix="%"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium w-10 text-right">
                      {Math.round(channel.percentage)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative pt-1">
                {/* Always show the slider, but it's only interactive in display mode */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      width: `${channel.percentage}%`,
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChannelDistributionCard;