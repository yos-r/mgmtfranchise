import { Card,CardHeader,CardContent,CardTitle } from "../ui/card";
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
interface RevenueTrendChartProps {
  monthlyData:any[]
}
export function RevenueTrendChart({monthlyData}:RevenueTrendChartProps) {
    return (
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
    )
}