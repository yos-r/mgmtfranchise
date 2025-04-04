import { useState, useEffect, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

// Import separated components
import VisitActionPlans from "./visit-action-plans";
import VisitHistory from "./visit-history";
import VisitDocuments from "./visit-documents";
import VisitSummary from "./visit-summary";
import VisitChecklist from "./visit-checklist";
import FranchiseInfoCard from "./franchise-info-card";
import VisitInternalNotes from "./visit-internal-notes";

// Skeleton components for loading states
const HeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-32 rounded-full" />
    </div>
  </div>
);

const InfoCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48 mb-2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </CardContent>
  </Card>
);

const ActionPlansSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40 mb-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const VisitHistorySkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32 mb-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-muted">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const ChecklistSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-36 mb-2" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2 pl-4">
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2 rounded" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2 rounded" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const SummarySkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32 mb-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <Skeleton className="h-full w-3/4" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <Skeleton className="h-full w-2/3" />
      </div>
    </CardContent>
  </Card>
);

export default function VisitDetail({ assistanceId, onBack }) {
  const [isLoading, setIsLoading] = useState(true);
  const [visit, setVisit] = useState(null);
  const [franchise, setFranchise] = useState(null);
  const [consultant, setConsultant] = useState(null);
  const [conformity, setConformity] = useState(0);
  
  // Mock agents data (static as requested)
  const [agents] = useState(["Jean Martin", "Sophie Bernard", "Thomas Klein"]);
  
  // Edit observations state - we'll keep this for compatibility
  const [isEditingObservations, setIsEditingObservations] = useState(false);
  const [observations, setObservations] = useState("");
  
  const { toast } = useToast();
  const isMounted = useRef(true);

  useEffect(() => {
    // Set up the mount status
    isMounted.current = true;
    
    if (assistanceId) {
      fetchVisitData();
    }
    
    // Cleanup function that runs when component unmounts
    return () => {
      isMounted.current = false;
      // If you need to call onBack when unmounting, uncomment the next line
      // onBack();
    };
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
      
      // Only update state if component is still mounted
      if (isMounted.current) {
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
      }

      // Fetch franchise data
      if (visitData.franchise_id) {
        const { data: franchiseData, error: franchiseError } = await supabase
          .from('franchises')
          .select('*')
          .eq('id', visitData.franchise_id)
          .single();
        
        if (franchiseError) throw franchiseError;
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          setFranchise(franchiseData);
        }
      }

      // Fetch consultant data
      if (visitData.consultant_id) {
        const { data: consultantData, error: consultantError } = await supabase
          .from('team_members')
          .select('id, first_name, last_name, email, role')
          .eq('id', visitData.consultant_id)
          .single();
        
        if (consultantError) throw consultantError;
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          setConsultant(consultantData);
        }
      }
    } catch (error) {
      console.error("Error fetching visit data:", error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to load visit details. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
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
      <div className="container mx-auto py-6 space-y-6">
        <HeaderSkeleton />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side skeletons (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <InfoCardSkeleton />
            <ActionPlansSkeleton />
            <VisitHistorySkeleton />
          </div>
          
          {/* Right side skeletons (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <ChecklistSkeleton />
            <SummarySkeleton />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          </div>
        </div>
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
             visit={visit}
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
        </div>
        
        <div className="lg:col-span-1 space-y-6">
        <VisitSummary 
            franchise={franchise} 
            getStatusBadgeClass={getStatusBadgeClass} 
            assistance={assistanceWithConformity} 
          />
          <VisitChecklist 
            visitId={assistanceId} 
            onConformityChange={handleConformityChange} 
          />
          
          <VisitDocuments 
            visitId={assistanceId} 
            isAdmin={true}
          />
          <VisitInternalNotes 
            visitId={assistanceId}
            initialNotes={visit.observations || ""}
            notesBy={visit.observations_by || ""}
          />
        </div>
      </div>
    </div>
  );
}