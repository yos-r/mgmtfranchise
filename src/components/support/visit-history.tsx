import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function VisitHistory({ franchiseId, getStatusBadgeClass }) {
  const [visitHistory, setVisitHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    if (franchiseId) {
      fetchVisitHistory();
    }
  }, [franchiseId]);

  const fetchVisitHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_visits')
        .select('id, type, date, observations, status')
        .eq('franchise_id', franchiseId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setVisitHistory(data || []);
    } catch (error) {
      console.error("Error fetching visit history:", error);
      toast({
        title: "Error",
        description: "Failed to load visit history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Visit History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground">
            Loading visit history...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Notes</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody className="capitalize">
              {visitHistory.length > 0 ? (
                visitHistory.map((historyItem) => (
                  <TableRow key={historyItem.id}>
                    <TableCell className="font-medium">
                      {format(new Date(historyItem.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{historyItem.type.replace('_',' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(historyItem.status)}>
                        {historyItem.status}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      {historyItem.observations ? 
                        (historyItem.observations.length > 50 ? 
                          `${historyItem.observations.substring(0, 50)}...` : 
                          historyItem.observations) : 
                        "No notes"}
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No visit history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}