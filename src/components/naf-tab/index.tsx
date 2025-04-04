import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Receipt,
  Plus,
  Eye,
  Euro,
  Calendar,
  Info,
  Banknote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { MarketingActionDetail } from "./marketing-action-detail";
import { CreateActionDialog } from "./create-action-dialog";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketingAction {
  id: string;
  title: string;
  type: string;
  budget: number;
  spent: number;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
  images?: { url: string; name: string }[];
  youtube_url?: string;
  attachments?: { name: string; url: string; type: string; size: string }[];
}

interface BudgetData {
  totalBudget: number;
  totalCollected: number;
  remainingBudget: number;
}

export function NAFTab() {
  const {formatCurrency}=useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<MarketingAction | null>(null);
  const [marketingActions, setMarketingActions] = useState<MarketingAction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [budgetData, setBudgetData] = useState<BudgetData>({
    totalBudget: 0,
    totalCollected: 0,
    remainingBudget: 0
  });
  const { toast } = useToast();

  // Generate array of years from 2020 to current year
  const years = Array.from(
    { length: new Date().getFullYear() - 2020 + 1 },
    (_, i) => (2020 + i).toString()
  ).reverse();

  async function calculateMarketingBudget(franchiseId = null, year = null) {
    try {
      // Build base queries
      let budgetQuery = supabase
        .from('royalty_payments')
        .select('marketing_amount, due_date')
        .neq('status', 'grace');
        
      let spentQuery = supabase
        .from('royalty_payments')
        .select('marketing_amount, due_date')
        .eq('status', 'paid');
      
      // Add franchise filter if provided
      if (franchiseId) {
        budgetQuery = budgetQuery.eq('franchise_id', franchiseId);
        spentQuery = spentQuery.eq('franchise_id', franchiseId);
      }
      
      // Add year filter if provided
      if (year) {
        // Create date range for the specified year
        const startOfYear = new Date(parseInt(year), 0, 1).toISOString();
        const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59).toISOString();
        
        // Filter both queries by the date range
        budgetQuery = budgetQuery
          .gte('due_date', startOfYear)
          .lte('due_date', endOfYear);
          
        spentQuery = spentQuery
          .gte('due_date', startOfYear)
          .lte('due_date', endOfYear);
      }
      
      // Execute both queries in parallel
      const [budgetResult, spentResult] = await Promise.all([
        budgetQuery,
        spentQuery
      ]);
      
      // Check for errors
      if (budgetResult.error) {
        throw budgetResult.error;
      }
      
      if (spentResult.error) {
        throw spentResult.error;
      }
      
      // Calculate totals
      const totalBudget = budgetResult.data.reduce(
        (sum, payment) => sum + (payment.marketing_amount || 0), 
        0
      );
      
      const totalCollected = spentResult.data.reduce(
        (sum, payment) => sum + (payment.marketing_amount || 0), 
        0
      );
      
      return {
        totalBudget,
        totalCollected,
        remainingBudget: totalBudget - totalCollected
      };
    } catch (error) {
      console.error('Error calculating marketing budget:', error);
      throw error;
    }
  }

  // Load budget data
  const loadBudgetData = async () => {
    setStatsLoading(true);
    try {
      // Pass the selected year to the calculateMarketingBudget function
      const data = await calculateMarketingBudget(null, selectedYear);
      setBudgetData(data);
    } catch (error) {
      console.error("Error loading budget data:", error);
      toast({
        title: "Error loading budget data",
        description: "Failed to load marketing budget information",
        variant: "destructive",
      });
    } finally {
      // Minimal timeout for skeleton
      setTimeout(() => setStatsLoading(false), 100);
    }
  };

  const loadMarketingActions = async () => {
    try {
      setActionsLoading(true);
      const startOfYear = new Date(parseInt(selectedYear), 0, 1).toISOString();
      const endOfYear = new Date(parseInt(selectedYear), 11, 31).toISOString();

      const { data: actions, error: actionsError } = await supabase
        .from('marketing_actions')
        .select(`
          *,
          marketing_action_media (
            id,
            name,
            url,
            type
          ),
          marketing_action_attachments (
            id,
            name,
            url,
            type,
            size
          )
        `)
        .gte('start_date', startOfYear)
        .lte('end_date', endOfYear)
        .order('start_date', { ascending: false });

      if (actionsError) throw actionsError;

      const formattedActions = actions.map(action => ({
        ...action,
        images: action.marketing_action_media
          ?.filter((media: any) => media.type === 'image')
          .map((media: any) => ({
            url: media.url,
            name: media.name
          })),
        youtube_url: action.marketing_action_media
          ?.find((media: any) => media.type === 'youtube')
          ?.url,
        attachments: action.marketing_action_attachments
      }));

      setMarketingActions(formattedActions);
    } catch (error: any) {
      toast({
        title: "Error loading marketing actions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // Minimal timeout for skeleton
      setTimeout(() => {
        setActionsLoading(false);
        setIsLoading(false);
      }, 150);
    }
  };

  // Load data when component mounts or year changes
  useEffect(() => {
    setIsLoading(true);
    loadMarketingActions();
    loadBudgetData();
  }, [selectedYear]);

  // Handle creating a new action
  const handleActionCreated = (newAction: MarketingAction) => {
    // Add the new action to the state immediately
    setMarketingActions(prev => [newAction, ...prev]);
    toast({
      title: "Marketing action created",
      description: "The marketing action has been created successfully",
    });
    setIsDialogOpen(false);
  };

  // Handle action update
  const handleActionUpdated = (updatedAction: MarketingAction) => {
    setMarketingActions(prev => 
      prev.map(action => action.id === updatedAction.id ? updatedAction : action)
    );
    setSelectedAction(updatedAction);
    toast({
      title: "Action updated",
      description: "The marketing action has been updated successfully",
    });
  };

  // Handle action deletion
  const handleActionDeleted = (actionId: string) => {
    setMarketingActions(prev => prev.filter(action => action.id !== actionId));
    setSelectedAction(null);
    toast({
      title: "Action deleted",
      description: "The marketing action has been deleted successfully",
    });
  };

  const activeActions = marketingActions.filter(action => action).length;
  const totalSpent = marketingActions.reduce((sum, action) => sum + (action.spent || 0), 0);
  const ytdSpentPercentage = budgetData.totalBudget > 0 ? Math.round((totalSpent / budgetData.totalBudget) * 100) : 0;

  if (selectedAction) {
    return (
      <MarketingActionDetail 
        action={selectedAction} 
        onBack={() => setSelectedAction(null)} 
        onDelete={handleActionDeleted}
        onUpdate={handleActionUpdated}
      />
    );
  }

  // Card skeleton component
  const CardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-36" />
      </CardContent>
    </Card>
  );

  // Table row skeleton
  const TableRowSkeleton = ({ columns = 7 }) => (
    <TableRow>
      {Array(columns).fill(0).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className={`h-5 ${i === 0 ? 'w-40' : i === columns - 1 ? 'w-28 ml-auto' : 'w-20'}`} />
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">National Marketing Fund</h2>
          <p className="body-lead text-muted-foreground">
            Manage and track marketing budget and activities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="button-1" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Marketing Action
          </Button>
        </div>
        <CreateActionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleActionCreated}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="tagline-3 flex gap-x-2">Annual Budget
                <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This value represents the total marketing royalties ({formatCurrency(budgetData.totalBudget)}) for the year {selectedYear} .</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="numbers text-2xl font-bold">{formatCurrency(budgetData.totalBudget)}</div>
                <p className="legal text-muted-foreground">
                  Budget for {selectedYear}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="tagline-3 flex gap-x-2">Collected Budget
                <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This value represents the total paid marketing royalties ({formatCurrency(budgetData.totalCollected)}) for the year {selectedYear} .</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="numbers text-2xl font-bold">{formatCurrency(budgetData.totalCollected)}</div>
                <p className="legal text-muted-foreground">
                  Paid marketing royalties in {selectedYear} 
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="tagline-3">
                  <div className="flex items-center gap-2">
                    YTD Spent
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This percentage represents the ratio of funds spent on marketing actions ({formatCurrency(totalSpent) }) to the total annual budget ({formatCurrency(budgetData.totalBudget)}).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="numbers text-2xl font-bold">{ytdSpentPercentage}%</div>
                <p className="legal text-muted-foreground">
                  Of annual marketing budget
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="tagline-3 flex gap-x-2"> Campaigns
                <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This value represents the campaigns organized for the year {selectedYear} .</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="numbers text-2xl font-bold">{activeActions}</div>
                <p className="legal text-muted-foreground">
                  In {selectedYear}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="tagline-3 flex gap-x-2">
                  Available Balance <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This value represents the difference between the collected marketing royalties ({formatCurrency(budgetData.totalCollected)}) and the funds spent on marketing actions ({formatCurrency(totalSpent)}) .</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider></CardTitle>
                
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div 
                  className={`numbers text-2xl font-bold ${budgetData.totalCollected - totalSpent < 0 ? 'text-red-500' : ''}`}
                >
                  {formatCurrency(budgetData.totalCollected - totalSpent)}
                </div>
                <p className="legal text-muted-foreground">
                  Remaining marketing funds
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {actionsLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="label-1"><Skeleton className="h-5 w-16" /></TableHead>
                  <TableHead className="label-1"><Skeleton className="h-5 w-12" /></TableHead>
                  <TableHead className="label-1"><Skeleton className="h-5 w-16" /></TableHead>
                  <TableHead className="label-1"><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead className="label-1"><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead className="label-1"><Skeleton className="h-5 w-16" /></TableHead>
                  <TableHead className="label-1 text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="label-1">Action</TableHead>
                  <TableHead className="label-1">Type</TableHead>
                  <TableHead className="label-1">Spent</TableHead>
                  <TableHead className="label-1">Start Date</TableHead>
                  <TableHead className="label-1">End Date</TableHead>
                  <TableHead className="label-1">Status</TableHead>
                  <TableHead className="label-1 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketingActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">{action.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{action.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Banknote className="h-3 w-3 text-muted-foreground" />
                        <span>{formatCurrency(action.spent)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(action.start_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(action.end_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          action.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : action.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : action.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {action.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedAction(action)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {marketingActions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No marketing actions found for {selectedYear}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}