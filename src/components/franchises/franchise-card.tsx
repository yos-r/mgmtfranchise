import { MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FranchiseCardProps {
  franchise: {
    id: number;
    name: string;
    owner: string;
    location: string;
    revenue: string;
    status: string;
    performance: string;
    agents: number;
    email: string;
    phone: string;
  };
  onSelect: (id: number) => void;
}

export function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPerformanceBadge(performance: string) {
  switch (performance) {
    case "excellent":
      return <Badge className="bg-green-500">Excellent</Badge>;
    case "good":
      return <Badge className="bg-blue-500">Good</Badge>;
    case "average":
      return <Badge className="bg-yellow-500">Average</Badge>;
    default:
      return <Badge className="bg-gray-500">Unknown</Badge>;
  }
}

export function FranchiseCard({ franchise, onSelect }: FranchiseCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelect(franchise.id)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="body-1 font-medium">{franchise.name}</h3>
              <p className="legal text-muted-foreground">{franchise.owner}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(franchise.status)} label-2`}>
              {franchise.status}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="body-1">{franchise.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="legal text-muted-foreground">Revenue</p>
              <p className="numbers font-medium">{franchise.revenue}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="legal text-muted-foreground">Agents</p>
              <p className="numbers font-medium">{franchise.agents}</p>
            </div>
          </div>
          <div className="pt-2">
            {getPerformanceBadge(franchise.performance)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}