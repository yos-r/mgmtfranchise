import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Receipt,
  Plus,
  Eye,
  Euro,
  Calendar,
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
import { useToast } from "@/hooks/use-toast";
import { MarketingActionDetail } from "./marketing-action-detail";
import { CreateActionDialog } from "./create-action-dialog";
import { supabase } from "@/lib/supabase";

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

export function NAFTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<MarketingAction | null>(null);
  const [marketingActions, setMarketingActions] = useState<MarketingAction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  // Generate array of years from 2020 to current year
  const years = Array.from(
    { length: new Date().getFullYear() - 2020 + 1 },
    (_, i) => (2020 + i).toString()
  ).reverse();

  const loadMarketingActions = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketingActions();
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

  // Calculate statistics for the selected year
  const totalBudget = marketingActions.reduce((sum, action) => sum + action.budget, 0); // annual expected budget from royalties table
  const totalSpent = marketingActions.reduce((sum, action) => sum + action.spent, 0);
  const activeActions = marketingActions.filter(action => action).length;

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Annual Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">€{totalBudget.toLocaleString()}</div>
            <p className="legal text-muted-foreground">
              Budget for {selectedYear} // from marketing royalties except grace
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Collected Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">€{totalBudget.toLocaleString()}</div>
            <p className="legal text-muted-foreground">
              {selectedYear} // paid marketing royalties 
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">YTD Spent</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">€{totalBudget.toLocaleString()}</div>
            <p className="legal text-muted-foreground">
              {totalBudget > 0 ? Math.round((totalBudget / totalBudget) * 100) : 0}% of budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3"> Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{activeActions}</div>
            <p className="legal text-muted-foreground">
           In  {selectedYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Available Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">€{(totalBudget - totalSpent).toLocaleString()}</div>
            <p className="legal text-muted-foreground">
              Collected - spent
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading marketing actions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="label-1">Action</TableHead>
                  <TableHead className="label-1">Type</TableHead>
                  <TableHead className="label-1">Budget</TableHead>
                  {/* <TableHead className="label-1">Spent</TableHead> */}
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
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        <span>{action.budget.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex items-center space-x-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        <span>{action.spent.toLocaleString()}</span>
                      </div>
                    </TableCell> */}
                    <TableCell>{format(new Date(action.start_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(action.end_date), 'MMM d, yyyy')}</TableCell>
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