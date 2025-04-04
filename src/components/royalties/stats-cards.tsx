import { Euro, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
interface StatsCardsProps {
  stats: {
    totalDue: number;
    pendingPayments: number;
    latePayments: number;
    collectionRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const {formatCurrency}=useCurrency();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Total Due</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">
            {formatCurrency(stats.totalDue)}
          </div>
          <p className="legal text-muted-foreground">
            For current period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Pending Payments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">{stats.pendingPayments}</div>
          <p className="legal text-muted-foreground">
            Awaiting payment
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Late Payments</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">{stats.latePayments}</div>
          <p className="legal text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tagline-3">Collection Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="numbers text-2xl font-bold">{stats.collectionRate}%</div>
          <p className="legal text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}