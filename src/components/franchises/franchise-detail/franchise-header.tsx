import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FranchiseHeader({franchise}: any) {


  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <img src={franchise.logo} className="rounded-sm w-14 h-14 object-cover" alt={`${franchise.name} logo`} />
            <div>
              <CardTitle className="tagline-1">{franchise.name}</CardTitle>
              <p className="body-lead text-muted-foreground">{franchise.owner_name}</p>
            </div>
            </div>
          <Badge variant="outline" className="label-2">
            {franchise.status === "active" ? "Active Franchise" : "Pending Franchise"}
          </Badge>
        </div>
      </CardHeader>
      {/* <CardContent>
        <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
          <img
            src={franchise.image}
            alt={franchise.name}
            className="object-cover w-full h-full"
          />
        </div>
      </CardContent> */}
    </Card>
  );
}