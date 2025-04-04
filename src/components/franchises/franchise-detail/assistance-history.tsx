import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/auth";
import { VisitDetailsDialog } from "./visit-details-dialog";

export function AssistanceHistory({ franchise,onVisitSelect }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionPlans, setActionPlans] = useState([]);
  const [averageConformity, setAverageConformity] = useState(null);

  useEffect(() => {
    const fetchVisitData = async () => {
      if (!franchise?.id) return;
      
      setLoading(true);
      
      try {
        // Fetch support visits for this franchise
        const { data: visitsData, error: visitsError } = await supabase
          .from('support_visits')
          .select('*, team_members(*)')
          .eq('franchise_id', franchise.id)
          .order('date', { ascending: false });
        
        if (visitsError) throw visitsError;
        
        setVisits(visitsData);

        // Calculate average conformity from all visits
        const visitsWithConformity = visitsData.filter(visit => 
          visit.conformity !== null && visit.conformity !== undefined
        );
        
        if (visitsWithConformity.length > 0) {
          const total = visitsWithConformity.reduce((sum, visit) => sum + (visit.conformity || 0), 0);
          const avg = Math.round(total / visitsWithConformity.length);
          setAverageConformity(avg);
        }
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

  // Function to get color based on conformity score
  const getConformityColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 65) return "bg-emerald-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  // Function to get text color based on conformity score
  const getConformityTextColor = (score) => {
    if (score >= 80) return "text-green-700";
    if (score >= 65) return "text-emerald-700";
    if (score >= 50) return "text-yellow-700";
    if (score >= 30) return "text-orange-700";
    return "text-red-700";
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
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
          <CardTitle className="tagline-2">Assistance Visit History</CardTitle>
          
          {/* Average Conformity Badge */}
          {averageConformity !== null && (
            <div className="mt-2 sm:mt-0">
              <div className="flex items-center px-3 py-1 rounded-md bg-muted">
                <CheckCircle className="h-4 w-4 mr-2 text-obsessedgrey/60" />
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Average Conformity:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`${getConformityColor(averageConformity)} h-1.5 rounded-full transition-all duration-300 ease-in-out`} 
                        style={{ width: `${averageConformity}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getConformityTextColor(averageConformity)}`}>
                      {averageConformity}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No assistance visits recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="label-1">Type</TableHead>
                    <TableHead className="label-1">Consultant</TableHead>
                    <TableHead className="label-1">Date</TableHead>
                    <TableHead className="label-1">Duration</TableHead>
                    <TableHead className="label-1">Status</TableHead>
                    <TableHead className="label-1">Conformity</TableHead>
                    <TableHead className="label-1 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <Badge variant="outline" className="label-2 capitalize">
                          {visit.type.replace('_',' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="body-1">
                        {visit.team_members?.first_name +' '+ visit.team_members?.last_name || "Unknown consultant"}
                      </TableCell>
                      <TableCell className="body-1">
                        {format(new Date(visit.date), "dd/MM/yyyy")}
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
                      <TableCell>
                        {visit.conformity !== null && visit.conformity !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`${getConformityColor(visit.conformity)} h-1.5 rounded-full`} 
                                style={{ width: `${visit.conformity}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${getConformityTextColor(visit.conformity)}`}>
                              {visit.conformity}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not available</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="button-2"
                          onClick={() => onVisitSelect(visit)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View 
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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