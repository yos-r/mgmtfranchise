import { MapPin, MoreHorizontal, Mail, Phone, FileText, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getPerformanceBadge } from "./franchise-card";

interface FranchiseTableProps {
  franchises: any[];
  onFranchiseSelect: (franchise: any) => void;
}

export function FranchiseTable({ franchises, onFranchiseSelect }: FranchiseTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="label-1">Franchise</TableHead>
          <TableHead className="label-1">Location</TableHead>
          <TableHead className="label-1">Status</TableHead>
          {/* <TableHead className="label-1">Performance</TableHead> */}
          {/* <TableHead className="label-1">Revenue</TableHead> */}
          <TableHead className="label-1">Agents</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {franchises.map((franchise) => (
          <TableRow
            key={franchise.id}
            className="cursor-pointer"
            onClick={() => onFranchiseSelect(franchise)}
          >
            <TableCell>
              <div>
                <div className="body-1 font-medium">{franchise.name}</div>
                <div className="legal text-muted-foreground">
                  {franchise.owner_name}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="body-1">{franchise.address}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className={`capitalize rounded-sm px-2 py-1 text-xs font-medium ${getStatusColor(franchise.status)} label-2`}>
                {franchise.status}
              </span>
            </TableCell>
            {/* <TableCell>
              {getPerformanceBadge(franchise.performance)}
            </TableCell> */}
            {/* <TableCell className="numbers">{franchise.revenue}</TableCell> */}
            <TableCell className="numbers">{franchise.agents}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="label-1">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="body-1">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{franchise.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="body-1">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{franchise.phone}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="body-1">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>View Contract</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="body-1">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span>Performance Report</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}