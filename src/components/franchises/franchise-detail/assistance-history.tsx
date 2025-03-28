import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { supabase } from "@/lib/auth";
import { VisitDetailsDialog } from "./visit-details-dialog"; // We'll create this next

export function AssistanceHistory({ franchise }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionPlans, setActionPlans] = useState([]);

  useEffect(() => {
    const fetchVisitData = async () => {
      if (!franchise?.id) return;
      
      setLoading(true);
      
      try {
        // Fetch support visits for this franchise
        const { data: visitsData, error: visitsError } = await supabase
          .from('support_visits')
          // .select('*')
          .select('*, team_members(*)')
          .eq('franchise_id', franchise.id)
          .order('date', { ascending: false });
        
        if (visitsError) throw visitsError;
        
        setVisits(visitsData);
      } catch (error) {
        console.error('Error fetching visit data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVisitData();
  }, [franchise?.id]);

  const fetchActionPlans = async (visitId) => {
    try {
      const { data, error } = await supabase
        .from('support_action_plans')
        .select('*')
        .eq('visit_id', visitId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setActionPlans(data || []);
    } catch (error) {
      console.error('Error fetching action plans:', error);
      setActionPlans([]);
    }
  };

  const handleViewReport = async (visit) => {
    setSelectedVisit(visit);
    await fetchActionPlans(visit.id);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Assistance Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">Loading assistance visit history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Assistance Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No assistance visits recorded.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="label-1">Type</TableHead>
                  <TableHead className="label-1">Consultant</TableHead>
                  <TableHead className="label-1">Date</TableHead>
                  <TableHead className="label-1">Duration</TableHead>
                  <TableHead className="label-1">Status</TableHead>
                  <TableHead className="label-1 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <Badge variant="outline" className="label-2">
                        {visit.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="body-1">
                      {visit.team_members?.first_name +' '+ visit.team_members?.last_name || "Unknown consultant"}
                    </TableCell>
                    <TableCell className="body-1">
                      {format(new Date(visit.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="body-1">{visit.duration}</TableCell>
                    <TableCell>
                      <Badge className={
                        visit.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : visit.status === "scheduled" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-yellow-100 text-yellow-800"
                      }>
                        {visit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="button-2"
                        onClick={() => handleViewReport(visit)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedVisit && (
        <VisitDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          visit={selectedVisit}
          actionPlans={actionPlans}
        />
      )}
    </>
  );
}