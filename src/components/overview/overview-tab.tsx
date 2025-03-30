import { useState, useEffect } from "react";
import { Award, BarChart2, TicketCheck, Users, Wallet, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n";
import { RevenueOverviewChart } from "./revenue-overview-chart";
import { FranchiseGrowthChart } from "./franchise-growth-chart";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { FranceRegionsMap } from "./france-region-map";
import TopPerformingRegionsCard from "./top-performing-regions-card";
import { useCurrency } from "@/hooks/useCurrency";
interface OverviewStats {
  totalFranchises: number;
  monthlyRevenue: number;
  topPerformers: number;
  activeTickets: number;
  revenueGrowth: number;
  franchiseGrowth: number;
  newFranchises: number;
  ticketResolutionRate: number;
}

export function OverviewTab() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const loadStats = async () => {
    try {
      // Get total franchises
      const { data: franchises, error: franchisesError } = await supabase
        .from('franchises')
        .select('id, status');
        // .not('status', 'eq', 'terminated');

      if (franchisesError) throw franchisesError;

      // Calculate new franchises in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get franchise contracts to identify new franchises
      const { data: recentContracts, error: contractsError } = await supabase
        .from('franchise_contracts')
        .select('franchise_id, start_date')
        .gte('start_date', thirtyDaysAgo.toISOString());

      if (contractsError) throw contractsError;

      // Count unique franchises with new contracts
      const uniqueNewFranchiseIds = new Set();
      recentContracts?.forEach(contract => {
        uniqueNewFranchiseIds.add(contract.franchise_id);
      });
      const newFranchises = uniqueNewFranchiseIds.size;

      // Get monthly revenue (sum of all paid payments in current month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: payments, error: paymentsError } = await supabase
        .from('royalty_payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', startOfMonth.toISOString());

      if (paymentsError) throw paymentsError;

      // Get active tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('help_desk_tickets')
        .select('id, status')
        .in('status', ['open', 'in_progress']);

      if (ticketsError) throw ticketsError;

      // Calculate stats
      const monthlyRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const totalFranchises = franchises?.length || 0;
      const activeTickets = tickets?.length || 0;
      
      // Get last month's stats for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);

      const { data: lastMonthPayments } = await supabase
        .from('royalty_payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', lastMonth.toISOString())
        .lt('payment_date', startOfMonth.toISOString());

      const lastMonthRevenue = lastMonthPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const revenueGrowth = lastMonthRevenue ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      // Calculate franchise growth percentage
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: previousPeriodContracts } = await supabase
        .from('franchise_contracts')
        .select('franchise_id, start_date')
        .gte('start_date', sixtyDaysAgo.toISOString())
        .lt('start_date', thirtyDaysAgo.toISOString());
      
      const uniquePreviousFranchiseIds = new Set();
      previousPeriodContracts?.forEach(contract => {
        uniquePreviousFranchiseIds.add(contract.franchise_id);
      });
      const previousNewFranchises = uniquePreviousFranchiseIds.size;
      
      const franchiseGrowth = previousNewFranchises 
        ? ((newFranchises - previousNewFranchises) / previousNewFranchises) * 100 
        : 0;

      // Calculate ticket resolution rate
      const { data: resolvedTickets } = await supabase
        .from('help_desk_tickets')
        .select('id')
        .eq('status', 'resolved');

      const { data: totalTickets } = await supabase
        .from('help_desk_tickets')
        .select('id');

      const ticketResolutionRate = totalTickets?.length 
        ? (resolvedTickets?.length || 0) / totalTickets.length * 100 
        : 0;

      setStats({
        totalFranchises,
        monthlyRevenue,
        topPerformers: Math.round(totalFranchises * 0.15), // Assuming top 15% are top performers
        activeTickets,
        revenueGrowth,
        franchiseGrowth,
        newFranchises,
        ticketResolutionRate,
      });
    } catch (error) {
      console.error('Error loading overview stats:', error);
      toast({
        title: "Error loading statistics",
        description: "Failed to load overview statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Set up real-time subscriptions
    const channels = [
      supabase
        .channel('franchises_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'franchises' }, loadStats),
      supabase
        .channel('payments_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'royalty_payments' }, loadStats),
      supabase
        .channel('tickets_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'help_desk_tickets' }, loadStats),
      supabase
        .channel('contracts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_contracts' }, loadStats),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">
              {t('totalFranchises')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{stats?.totalFranchises}</div>
            <p className="legal text-muted-foreground">
              +{stats?.newFranchises} new in the last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">
              {t('monthlyRevenue')}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue)}</div>
            <p className="legal text-muted-foreground">
               Including marketing contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">
              {t('topPerformers')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{stats?.topPerformers}</div>
            <p className="legal text-muted-foreground">
              Exceeded targets this quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">
              {t('activeSupport')}
            </CardTitle>
            <TicketCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{stats?.activeTickets}</div>
            <p className="legal text-muted-foreground">
              {stats?.ticketResolutionRate.toFixed(0)}% resolution rate
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="tagline-2">{t('revenueOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueOverviewChart />
          </CardContent>
        </Card>
        {/* <TopPerformingRegionsCard/> */}


        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="tagline-2">Franchise Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <FranchiseGrowthChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="tagline-2">Upcoming Franchise Training / Support Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Franchise Lyon East", action: "Contract renewed", date: "2 days from now" },
                { name: "Franchise Marseille Central", action: "Payment received", date: "3 days ago" },
                { name: "Franchise Paris North", action: "New location opened", date: "1 week ago" },
                { name: "Franchise Nantes", action: "Training completed", date: "2 weeks ago" },
                { name: "Franchise Strasbourg", action: "Support request resolved", date: "3 weeks ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="body-1 font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {/* <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="tagline-2">Top Performing Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"].map(
                (region) => (
                  <div
                    key={region}
                    className="flex items-center justify-between"
                  >
                    <span className="body-1">{region}</span>
                    <span className="numbers text-muted-foreground">
                      €{Math.floor(Math.random() * 900000 + 100000)}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card> */}
          {/* <FranceRegionsMap /> */}

        
       
      </div>
    </div>
  );
}