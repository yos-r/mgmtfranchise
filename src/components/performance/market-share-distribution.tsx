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
  } from "recharts";import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
interface MarketShareDistributionProps {
    marketShareData:any[]
}
 export function MarketShareDistribution({marketShareData}:MarketShareDistributionProps) {
    return (
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
    )
 }