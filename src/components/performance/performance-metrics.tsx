import {  Badge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
interface PerformanceMetricsProps {
    performanceMetrics:any[]
}
export function PerformanceMetrics({performanceMetrics}:PerformanceMetricsProps) {
    return (
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
    )
}