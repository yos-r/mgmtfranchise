import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Percent, Building2, ListFilter } from "lucide-react";

const monthlyData = [
  {
    month: "Jan 2024",
    "CENTURY 21 Saint-Germain": 890000,
    "CENTURY 21 Confluence": 720000,
    "CENTURY 21 Vieux Port": 650000,
    "CENTURY 21 Bordeaux Centre": 580000,
  },
  {
    month: "Feb 2024",
    "CENTURY 21 Saint-Germain": 920000,
    "CENTURY 21 Confluence": 750000,
    "CENTURY 21 Vieux Port": 680000,
    "CENTURY 21 Bordeaux Centre": 600000,
  },
  {
    month: "Mar 2024",
    "CENTURY 21 Saint-Germain": 880000,
    "CENTURY 21 Confluence": 730000,
    "CENTURY 21 Vieux Port": 670000,
    "CENTURY 21 Bordeaux Centre": 590000,
  },
];

const performanceMetrics = [
  {
    id: 1,
    franchise: "CENTURY 21 Saint-Germain",
    listings: 145,
    transactions: 48,
    marketShare: 23.5,
    avgDaysOnMarket: 32,
    conversionRate: 33.1,
    revenue: "€890,000",
    yoyGrowth: 12.5,
  },
  {
    id: 2,
    franchise: "CENTURY 21 Confluence",
    listings: 112,
    transactions: 37,
    marketShare: 18.2,
    avgDaysOnMarket: 38,
    conversionRate: 33.0,
    revenue: "€720,000",
    yoyGrowth: 8.3,
  },
  {
    id: 3,
    franchise: "CENTURY 21 Vieux Port",
    listings: 98,
    transactions: 31,
    marketShare: 15.8,
    avgDaysOnMarket: 41,
    conversionRate: 31.6,
    revenue: "€650,000",
    yoyGrowth: 6.7,
  },
  {
    id: 4,
    franchise: "CENTURY 21 Bordeaux Centre",
    listings: 87,
    transactions: 26,
    marketShare: 13.2,
    avgDaysOnMarket: 45,
    conversionRate: 29.9,
    revenue: "€580,000",
    yoyGrowth: 4.2,
  },
];

const marketShareData = [
  { name: "Saint-Germain", value: 23.5 },
  { name: "Confluence", value: 18.2 },
  { name: "Vieux Port", value: 15.8 },
  { name: "Bordeaux", value: 13.2 },
  { name: "Others", value: 29.3 },
];

function MetricCard({ title, value, change, icon: Icon, trend }: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  trend: "up" | "down";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tagline-3">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="numbers text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <p className={`legal ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
            {change}% from last month
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceTab() {
  const [timeframe, setTimeframe] = useState("3m");
  const totalListings = performanceMetrics.reduce((acc, curr) => acc + curr.listings, 0);
  const totalTransactions = performanceMetrics.reduce((acc, curr) => acc + curr.transactions, 0);
  const avgConversionRate = performanceMetrics.reduce((acc, curr) => acc + curr.conversionRate, 0) / performanceMetrics.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">Performance Analytics</h2>
          <p className="body-lead text-muted-foreground">
            Track and analyze franchise performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="button-2">
            <ListFilter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Listings"
          value={totalListings}
          change={5.2}
          icon={Building2}
          trend="up"
        />
        <MetricCard
          title="Total Transactions"
          value={totalTransactions}
          change={3.8}
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${avgConversionRate.toFixed(1)}%`}
          change={-1.2}
          icon={Percent}
          trend="down"
        />
        <MetricCard
          title="Market Share"
          value="70.7%"
          change={2.1}
          icon={TrendingUp}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="tagline-2">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="CENTURY 21 Saint-Germain"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="CENTURY 21 Confluence"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="CENTURY 21 Vieux Port"
                    stroke="#9333ea"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="CENTURY 21 Bordeaux Centre"
                    stroke="#ea580c"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="tagline-2">Market Share Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketShareData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Detailed Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">Franchise</TableHead>
                <TableHead className="label-1 text-right">Listings</TableHead>
                <TableHead className="label-1 text-right">Transactions</TableHead>
                <TableHead className="label-1 text-right">Market Share</TableHead>
                <TableHead className="label-1 text-right">Avg. Days on Market</TableHead>
                <TableHead className="label-1 text-right">Conversion Rate</TableHead>
                <TableHead className="label-1 text-right">Revenue</TableHead>
                <TableHead className="label-1 text-right">YoY Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceMetrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="body-1 font-medium">
                    {metric.franchise}
                  </TableCell>
                  <TableCell className="numbers text-right">{metric.listings}</TableCell>
                  <TableCell className="numbers text-right">{metric.transactions}</TableCell>
                  <TableCell className="numbers text-right">{metric.marketShare}%</TableCell>
                  <TableCell className="numbers text-right">{metric.avgDaysOnMarket}</TableCell>
                  <TableCell className="numbers text-right">{metric.conversionRate}%</TableCell>
                  <TableCell className="numbers text-right">{metric.revenue}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={`${
                        metric.yoyGrowth >= 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      } label-2`}
                    >
                      {metric.yoyGrowth}%
                    </Badge>
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