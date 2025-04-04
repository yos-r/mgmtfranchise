import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Edit,
  Building,
  User,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// Import separated components
import VisitActionPlans from "./visit-action-plans";
import VisitHistory from "./visit-history";
import VisitDocuments from "./visit-documents";
import VisitSummary from "./visit-summary";
import VisitChecklist from "./visit-checklist";
import FranchiseInfoCard from "./franchise-info-card";

export default function VisitDetail({ assistanceId, onBack }) {
  const [isLoading, setIsLoading] = useState(true);
  const [visit, setVisit] = useState(null);
  const [franchise, setFranchise] = useState(null);
  const [consultant, setConsultant] = useState(null);
  const [conformity, setConformity] = useState(0);
  
  // Mock agents data (static as requested)
  const [agents] = useState(["Jean Martin", "Sophie Bernard", "Thomas Klein"]);
  
  // Edit observations state
  const [isEditingObservations, setIsEditingObservations] = useState(false);
  const [observations, setObservations] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    if (assistanceId) {
      fetchVisitData();
    }
  }, [assistanceId]);

  const fetchVisitData = async () => {
    setIsLoading(true);
    try {
      // Fetch visit data
      const { data: visitData, error: visitError } = await supabase
        .from('support_visits')
        .select('*')
        .eq('id', assistanceId)
        .single();
      
      if (visitError) throw visitError;
      setVisit(visitData);
      setObservations(visitData.observations || "");
      
      // Initialize conformity from the visit data
      if (visitData.conformity !== null && visitData.conformity !== undefined) {
        setConformity(visitData.conformity);
      } else if (visitData.checklist?.overallScore !== undefined) {
        setConformity(visitData.checklist.overallScore);
      } else {
        setConformity(0);
      }

      // Fetch franchise data
      if (visitData.franchise_id) {
        const { data: franchiseData, error: franchiseError } = await supabase
          .from('franchises')
          .select('*')
          .eq('id', visitData.franchise_id)
          .single();
        
        if (franchiseError) throw franchiseError;
        setFranchise(franchiseData);
      }

      // Fetch consultant data
      if (visitData.consultant_id) {
        const { data: consultantData, error: consultantError } = await supabase
          .from('team_members')
          .select('id, first_name, last_name, email, role')
          .eq('id', visitData.consultant_id)
          .single();
        
        if (consultantError) throw consultantError;
        setConsultant(consultantData);
      }
    } catch (error) {
      console.error("Error fetching visit data:", error);
      toast({
        title: "Error",
        description: "Failed to load visit details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateVisitObservations = async () => {
    try {
      const { error } = await supabase
        .from('support_visits')
        .update({ observations })
        .eq('id', assistanceId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Observations updated successfully.",
      });
      
      setIsEditingObservations(false);
      // Update local state
      if (visit) {
        setVisit({
          ...visit,
          observations
        });
      }
    } catch (error) {
      console.error("Error updating observations:", error);
      toast({
        title: "Error",
        description: "Failed to update observations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleDataUpdated = () => {
    fetchVisitData();
  };

  // This function will be passed to VisitChecklist and called when the conformity changes
  const handleConformityChange = (newConformity) => {
    setConformity(newConformity);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading visit details...</p>
      </div>
    );
  }

  if (!visit || !franchise) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p>Visit not found</p>
        <Button onClick={onBack}>Back</Button>
      </div>
    );
  }

  // Create an updated assistance object with the current conformity value for VisitSummary
  const assistanceWithConformity = {
    ...visit,
    conformity: conformity
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Visit Details for {franchise.name}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              <span>{format(new Date(visit.date), "d MMMM yyyy")}</span>
              {visit.time && (
                <>
                  <Clock className="ml-3 mr-1 h-3.5 w-3.5" />
                  <span>{visit.time}</span>
                </>
              )}
              <span className="mx-2">•</span>
              <span>{visit.duration}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 capitalize">
          <Badge className={getStatusBadgeClass(visit.status)}>
            {visit.status}
          </Badge>
          <Badge variant="outline capitalize">
            {visit.type.replace('_',' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agency info and visit history (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <FranchiseInfoCard 
            franchise={franchise}
            consultant={consultant}
            agents={agents}
          />
          {franchise && (
            <VisitActionPlans 
              franchiseId={franchise.id} 
              getStatusBadgeClass={getStatusBadgeClass} 
              onActionUpdated={handleDataUpdated}
            />
          )}
          
          {/* Visit History Component */}
          {franchise && (
            <VisitHistory 
              franchiseId={franchise.id} 
              getStatusBadgeClass={getStatusBadgeClass} 
            />
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Visit Comments</CardTitle>
                {!isEditingObservations ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingObservations(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsEditingObservations(false);
                        setObservations(visit.observations || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={updateVisitObservations}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditingObservations ? (
                <div className="whitespace-pre-wrap text-sm">
                  {observations || "No observations"}
                </div>
              ) : (
                <Textarea
                  value={observations || ""}
                  onChange={(e) => setObservations(e.target.value)}
                  className="min-h-32"
                  placeholder="Add your observations here..."
                />
              )}
            </CardContent>
          </Card>
          
          {/* Action Plans Component */}
          
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <VisitChecklist 
            visitId={assistanceId} 
            onConformityChange={handleConformityChange} 
          />
          <VisitSummary 
            franchise={franchise} 
            getStatusBadgeClass={getStatusBadgeClass} 
            assistance={assistanceWithConformity} 
          />
          <VisitDocuments 
            visitId={assistanceId} 
            isAdmin={true}
          />
        </div>
      </div>
    </div>
  );
}