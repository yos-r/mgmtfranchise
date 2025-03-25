import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FranchiseHeader() {
  const franchise = {
    name: "CENTURY 21 Saint-Germain",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=600",
    description: "Premium Location in Saint-Germain",
    status: "active"
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="tagline-1">{franchise.name}</CardTitle>
            <p className="body-lead text-muted-foreground">{franchise.description}</p>
          </div>
          <Badge variant="outline" className="label-2">
            {franchise.status === "active" ? "Active Franchise" : "Pending Franchise"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
          <img
            src={franchise.image}
            alt={franchise.name}
            className="object-cover w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}