import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TrendingUp, TrendingDown, Percent, Building2, ListFilter } from "lucide-react";
import { RevenueTrendChart } from "./revenue-trend-chart";
import { MarketShareDistribution } from "./market-share-distribution";
import { PerformanceMetrics } from "./performance-metrics";

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
        <RevenueTrendChart monthlyData={monthlyData} />
        <MarketShareDistribution marketShareData={marketShareData} />
      </div>
      <PerformanceMetrics performanceMetrics={performanceMetrics} />
    </div>
  );
}