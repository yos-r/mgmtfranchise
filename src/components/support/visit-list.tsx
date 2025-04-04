import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface VisitListProps {
  visits: any[];
  onVisitSelect: (visit: any) => void;
  isLoading?: boolean;
}

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-800";
    case "scheduled":
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

// Skeleton row component for loading state
const SkeletonRow = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-5 w-40" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-24 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-36" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-12" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-24 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-9 w-24 rounded-md" />
    </TableCell>
  </TableRow>
);

export function VisitList({ visits, onVisitSelect, isLoading = false }: VisitListProps) {
  // Generate skeleton rows based on a reasonable number (or use visits.length if available)
  const skeletonCount = visits?.length || 5;
  const skeletonRows = Array(skeletonCount).fill(0).map((_, index) => (
    <SkeletonRow key={`skeleton-${index}`} />
  ));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Assistance Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="label-1">Franchise</TableHead>
              <TableHead className="label-1">Consultant</TableHead>
              <TableHead className="label-1">Type</TableHead>
              <TableHead className="label-1">Date & Time</TableHead>
              <TableHead className="label-1">Duration</TableHead>
              <TableHead className="label-1">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Display skeleton rows when loading
              skeletonRows
            ) : (
              // Display actual visit data when loaded
              visits.map((visit) => (
                <TableRow
                  key={visit.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onVisitSelect(visit)}
                >
                  <TableCell className="body-1 font-medium">
                    {visit.franchise}
                  </TableCell>
                  <TableCell className="body-1">{visit.consultant}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize label-2">
                      {visit.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="body-1">
                    {format(new Date(visit.date), "dd/MM/yyyy")} at {visit.time}
                  </TableCell>
                  <TableCell className="body-1">{visit.duration}</TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusBadgeClasses(visit.status)}
                    >
                      {visit.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" className="button-2">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            
            {/* No data state */}
            {!isLoading && visits.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No visits found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}