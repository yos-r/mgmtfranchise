import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Edit, Save, BarChart2, Clock, AlertCircle, TrendingUp, Target, MousePointer, Users, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface PerformanceMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cost_per_lead: number;
  roi: number;
}

interface CampaignStatusCardProps {
  actionId: string;
  endDate: string;
  status: string;
  initialMetrics?: PerformanceMetrics;
  onUpdate?: (updatedMetrics: PerformanceMetrics) => void;
}

export function CampaignStatusCard({
  actionId,
  endDate,
  status,
  initialMetrics = {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cost_per_lead: 0,
    roi: 0
  },
  onUpdate
}: CampaignStatusCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  // Initialize metrics from props
  useEffect(() => {
    if (initialMetrics) {
      setMetrics(initialMetrics);
    }
  }, [initialMetrics]);

  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  // Get campaign status display
  const getCampaignStatusDisplay = () => {
    switch (status) {
      case 'completed':
        return { text: "Completed", color: "bg-green-100 text-green-800" };
      case 'in_progress':
        return { text: "In Progress", color: "bg-blue-100 text-blue-800" };
      case 'planned':
        return { text: "Planned", color: "bg-yellow-100 text-yellow-800" };
      case 'cancelled':
        return { text: "Cancelled", color: "bg-red-100 text-red-800" };
      default:
        return { text: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  const statusDisplay = getCampaignStatusDisplay();

  // Handle input change
  const handleInputChange = (field: keyof PerformanceMetrics, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    
    setMetrics(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue
    }));
  };

  // Save metrics to database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('marketing_actions')
        .update({ performance_metrics: metrics })
        .eq('id', actionId);

      if (error) throw error;
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(metrics);
      }
      
      toast({
        title: "Success",
        description: "Performance metrics updated successfully.",
        variant: "default",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating performance metrics:", error);
      toast({
        title: "Error",
        description: "Failed to update performance metrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Generate the formatted list items
  const statusItems = [
    {
      icon: <Calendar className="h-5 w-5 text-gray-500" />,
      label: "Campaign Status",
      value: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
    },
    
    {
      icon: <Users className="h-5 w-5 text-gray-500" />,
      label: "Impressions",
      value: isEditing ? (
        <Input
          type="text"
          value={metrics.impressions.toLocaleString()}
          onChange={(e) => handleInputChange('impressions', e.target.value)}
          className="h-7 text-sm"
        />
      ) : metrics.impressions.toLocaleString()
    },
    {
      icon: <MousePointer className="h-5 w-5 text-gray-500" />,
      label: "Clicks",
      value: isEditing ? (
        <Input
          type="text"
          value={metrics.clicks.toLocaleString()}
          onChange={(e) => handleInputChange('clicks', e.target.value)}
          className="h-7 text-sm"
        />
      ) : metrics.clicks.toLocaleString()
    },
    {
      icon: <Target className="h-5 w-5 text-gray-500" />,
      label: "Conversions",
      value: isEditing ? (
        <Input
          type="text"
          value={metrics.conversions.toLocaleString()}
          onChange={(e) => handleInputChange('conversions', e.target.value)}
          className="h-7 text-sm"
        />
      ) : metrics.conversions.toLocaleString()
    },
    {
      icon: <BarChart2 className="h-5 w-5 text-gray-500" />,
      label: "CTR",
      value: isEditing ? (
        <Input
          type="text"
          value={metrics.ctr.toString()}
          onChange={(e) => handleInputChange('ctr', e.target.value)}
          className="h-7 text-sm"
          suffix="%"
        />
      ) : `${metrics.ctr}%`
    },
    {
      icon: <DollarSign className="h-5 w-5 text-gray-500" />,
      label: "Cost per Lead",
      value: isEditing ? (
        <Input
          type="text"
          value={metrics.cost_per_lead.toString()}
          onChange={(e) => handleInputChange('cost_per_lead', e.target.value)}
          className="h-7 text-sm"
          prefix="€"
        />
      ) : formatCurrency(metrics.cost_per_lead)
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-gray-500" />,
      label: "ROI",
      value: isEditing ? (
        <Input
          type="text"
          value={metrics.roi.toString()}
          onChange={(e) => handleInputChange('roi', e.target.value)}
          className="h-7 text-sm"
          suffix="%"
        />
      ) : `${metrics.roi}%`
    }
  ];

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Campaign Metrics</CardTitle>
          {isEditing ? (
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
        <div className="space-y-3">
          {statusItems.map((item, index) => (
            <div 
              key={index} 
              className={`flex justify-between items-center p-3 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} rounded-lg`}
            >
              <div className="flex items-center">
                <div className="mr-3">{item.icon}</div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className={`${isEditing && index > 1 ? 'w-32' : ''} font-medium`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CampaignStatusCard;