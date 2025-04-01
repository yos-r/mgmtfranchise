import { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  MapPin,
  Building2,
  Home,
  TrendingUp,
  Building,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AreaDetail } from "./area-detail";

interface MarketData {
  id: string;
  areaName: string;
  areaCode: string;
  totalAgencies: number;
  listingsForSale: number;
  listingsForRent: number;
  marketCap: number;
  century21Presence: boolean;
  population: number;
  averagePrice: number;
  marketPotential: 'high' | 'medium' | 'low';
  coordinates: {
    lat: number;
    lng: number;
  };
}

const marketData: MarketData[] = [
  {
    id: '3',
    areaName: 'Woluwe-Saint-Pierre',
    areaCode: '1150',
    totalAgencies: 145,
    listingsForSale: 892,
    listingsForRent: 456,
    marketCap: 2450000000,
    century21Presence: true,
    population: 169372,
    averagePrice: 12500,
    marketPotential: 'high',
    coordinates: {
      lat: 48.8566,
      lng: 2.3522
    }
  },
  {
    id: '2',
    areaName: 'Brussels City',
    areaCode: '69006',
    totalAgencies: 78,
    listingsForSale: 445,
    listingsForRent: 234,
    marketCap: 980000000,
    century21Presence: false,
    population: 51325,
    averagePrice: 6800,
    marketPotential: 'high',
    coordinates: {
      lat: 45.7640,
      lng: 4.8357
    }
  },
  {
    id: '1',
    areaName: 'Ixelles',
    areaCode: '1050',
    totalAgencies: 92,
    listingsForSale: 567,
    listingsForRent: 345,
    marketCap: 1230000000,
    century21Presence: true,
    population: 257068,
    averagePrice: 5900,
    marketPotential: 'medium',
    coordinates: {
      lat: 44.8378,
      lng: -0.5792
    }
  },
  {
    id: '4',
    areaName: 'Etterbeek',
    areaCode: '1040',
    totalAgencies: 65,
    listingsForSale: 389,
    listingsForRent: 278,
    marketCap: 890000000,
    century21Presence: false,
    population: 80781,
    averagePrice: 4800,
    marketPotential: 'medium',
    coordinates: {
      lat: 43.2965,
      lng: 5.3698
    }
  },
  {
    id: '5',
    areaName: 'Uccle',
    areaCode: '1180',
    totalAgencies: 83,
    listingsForSale: 478,
    listingsForRent: 289,
    marketCap: 760000000,
    century21Presence: false,
    population: 319284,
    averagePrice: 4500,
    marketPotential: 'high',
    coordinates: {
      lat: 47.2184,
      lng: -1.5536
    }
  },
];

function getMarketPotentialColor(potential: string) {
  switch (potential) {
    case 'high':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function MarketAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MarketData;
    direction: 'asc' | 'desc';
  }>({ key: 'areaName', direction: 'asc' });
  const [filters, setFilters] = useState({
    showC21Only: false,
    marketPotential: [] as string[],
  });
  const [selectedArea, setSelectedArea] = useState<MarketData | null>(null);

  const handleSort = (key: keyof MarketData) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const filteredAndSortedData = useMemo(() => {
    return marketData
      .filter((item) => {
        const matchesSearch =
          item.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.areaCode.includes(searchTerm);
        const matchesC21Filter = filters.showC21Only
          ? !item.century21Presence
          : true;
        const matchesPotential =
          filters.marketPotential.length === 0 ||
          filters.marketPotential.includes(item.marketPotential);
        return matchesSearch && matchesC21Filter && matchesPotential;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortConfig.direction === 'asc'
            ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
            : (bValue ? 1 : 0) - (aValue ? 1 : 0);
        }
        return 0;
      });
  }, [searchTerm, sortConfig, filters]);

  if (selectedArea) {
    return <AreaDetail area={selectedArea} onBack={() => setSelectedArea(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">Market Analysis</h2>
          <p className="body-lead text-muted-foreground">
            Analyze potential market opportunities across different areas
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by area name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="button-2">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuCheckboxItem
              checked={filters.showC21Only}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({ ...prev, showC21Only: checked }))
              }
            >
              Show opportunities only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.marketPotential.includes('high')}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({
                  ...prev,
                  marketPotential: checked
                    ? [...prev.marketPotential, 'high']
                    : prev.marketPotential.filter((p) => p !== 'high'),
                }))
              }
            >
              High Potential
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.marketPotential.includes('medium')}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({
                  ...prev,
                  marketPotential: checked
                    ? [...prev.marketPotential, 'medium']
                    : prev.marketPotential.filter((p) => p !== 'medium'),
                }))
              }
            >
              Medium Potential
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('areaName')}
                    className="button-2"
                  >
                    Area
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="label-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('totalAgencies')}
                    className="button-2"
                  >
                    Agencies
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="label-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('listingsForSale')}
                    className="button-2"
                  >
                    For Sale
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="label-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('listingsForRent')}
                    className="button-2"
                  >
                    For Rent
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="label-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('marketCap')}
                    className="button-2"
                  >
                    Market Cap
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="label-1">C21 Present</TableHead>
                <TableHead className="label-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('marketPotential')}
                    className="button-2"
                  >
                    Potential
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="body-1 font-medium">{item.areaName}</div>
                      <div className="legal text-muted-foreground flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {item.areaCode}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="numbers">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      {item.totalAgencies}
                    </div>
                  </TableCell>
                  <TableCell className="numbers">
                    <div className="flex items-center">
                      <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                      {item.listingsForSale}
                    </div>
                  </TableCell>
                  <TableCell className="numbers">
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      {item.listingsForRent}
                    </div>
                  </TableCell>
                  <TableCell className="numbers">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                      €{(item.marketCap / 1000000).toFixed(1)}M
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.century21Presence ? 'default' : 'outline'}
                      className="label-2"
                    >
                      {item.century21Presence ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`label-2 ${getMarketPotentialColor(
                        item.marketPotential
                      )}`}
                    >
                      {item.marketPotential}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      className="button-2"
                      onClick={() => setSelectedArea(item)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}