import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, CheckCircle2, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { PlanVisitDialog } from "./plan-visit-dialog";
import { VisitDetail } from "./visit-detail";
import { VisitList } from "./visit-list";

export function SupportTab() {
  const [visits, setVisits] = useState([]);
  const [consultants, setConsultants] = useState({});
  const [franchises, setFranchises] = useState({});
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    plannedVisits: 0,
    completedVisits: 0,
    activeActionPlans: 0,
    supportHours: 0
  });
  const { toast } = useToast();

  // Fetch team members (consultants) and franchises first
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch consultants from team_members table
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('id, first_name, last_name, role')
          .eq('role', 'consultant')
          .order('last_name');

        if (teamError) throw teamError;
        
        // Create a consultant lookup object for easy access
        const consultantLookup = {};
        teamMembers.forEach(member => {
          consultantLookup[member.id] = {
            name: `${member.first_name} ${member.last_name}`,
            firstName: member.first_name,
            lastName: member.last_name
          };
        });
        
        setConsultants(consultantLookup);
        
        // Fetch franchises
        const { data: franchiseData, error: franchiseError } = await supabase
          .from('franchises')
          .select('id, name');
          
        if (franchiseError) throw franchiseError;
        
        // Create a franchise lookup object
        const franchiseLookup = {};
        franchiseData.forEach(franchise => {
          franchiseLookup[franchise.id] = franchise.name;
        });
        
        setFranchises(franchiseLookup);
        
      } catch (error) {
        console.error("Error fetching reference data:", error);
        toast({
          title: "Error",
          description: "Failed to load reference data. Some consultant or franchise names may not display correctly.",
          variant: "destructive",
        });
      }
    };
    
    fetchReferenceData();
  }, [toast]);

  // Set up realtime subscription
  useEffect(() => {
    // Only set up subscription when consultant and franchise data is loaded
    if (Object.keys(consultants).length === 0 || Object.keys(franchises).length === 0) {
      return;
    }

    // Create a channel for realtime changes to support_visits table
    const channel = supabase
      .channel('support_visits_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_visits'
        }, 
        (payload) => {
          console.log('Change received!', payload);
          // Refresh data when a change is detected
          fetchVisitsData();
        }
      )
      .subscribe();

    // Fetch initial data
    fetchVisitsData();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultants, franchises]);

  // Function to fetch visits data that can be reused
  const fetchVisitsData = async () => {
    setLoading(true);
    try {
      // Fetch visits data
      const { data, error } = await supabase
        .from('support_visits')
        .select(`
          id,
          franchise_id,
          consultant_id,
          type,
          date,
          time,
          duration,
          status,
          observations,
          created_at,
          updated_at
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform data to match component expectations
      const transformedVisits = data.map(visit => ({
        id: visit.id,
        franchise_id: visit.franchise_id,
        franchise: franchises[visit.franchise_id] || 'Unknown Franchise',
        consultant_id: visit.consultant_id,
        consultant: consultants[visit.consultant_id]?.name || 'Unknown Consultant',
        type: visit.type,
        date: visit.date,
        time: visit.time || '00:00',
        duration: visit.duration,
        status: visit.status,
        observations: visit.observations,
      }));

      setVisits(transformedVisits);
      calculateStats(transformedVisits);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast({
        title: "Error",
        description: "Failed to load visits data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for dashboard cards
  const calculateStats = (visitsData) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const plannedVisits = visitsData.filter(visit => 
      new Date(visit.date) <= thirtyDaysFromNow && 
      new Date(visit.date) >= now && 
      visit.status !== 'completed'
    ).length;
    
    // Calculate current quarter
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const quarterStartMonth = currentQuarter * 3;
    const quarterStartDate = new Date(currentYear, quarterStartMonth, 1);
    
    const completedVisits = visitsData.filter(visit => 
      visit.status === 'completed' && 
      new Date(visit.date) >= quarterStartDate
    ).length;
    
    // For active action plans, we'd need actual action plan data
    // This is a placeholder - in real implementation, fetch from action_plans table
    const activeActionPlans = visitsData.filter(visit => 
      visit.status === 'completed' && 
      new Date(visit.date) >= quarterStartDate
    ).length;
    
    // For support hours, calculate from visit durations
    // Assuming format like "2h" or "30m"
    let totalMinutes = 0;
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    
    visitsData.forEach(visit => {
      if (new Date(visit.date) >= currentMonthStart) {
        const duration = visit.duration || '';
        if (duration.includes('h')) {
          const hours = parseInt(duration);
          totalMinutes += hours * 60;
        } else if (duration.includes('m')) {
          const minutes = parseInt(duration);
          totalMinutes += minutes;
        }
      }
    });
    
    const supportHours = Math.round(totalMinutes / 60);
    
    setStats({
      plannedVisits,
      completedVisits,
      activeActionPlans,
      supportHours
    });
  };

  // Handle visit selection
  const handleVisitSelect = (visit) => {
    setSelectedVisit(visit);
  };

  // Go back to visit list
  const handleBack = () => {
    setSelectedVisit(null);
  };

  // Manually refresh data (can be used for "refresh" buttons or after operations)
  const refreshData = () => {
    fetchVisitsData();
  };

  if (selectedVisit) {
    return <VisitDetail 
      visit={selectedVisit} 
      onBack={handleBack} 
      consultants={consultants}
      franchises={franchises}
      onVisitUpdated={refreshData}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="tagline-1">Franchise Support</h2>
          <p className="body-lead text-muted-foreground">
            Manage assistance visits and support programs
          </p>
        </div>
        <PlanVisitDialog onSuccess={refreshData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Planned Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{stats.plannedVisits}</div>
            <p className="legal text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Completed Visits</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{stats.completedVisits}</div>
            <p className="legal text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Active Action Plans</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{stats.activeActionPlans}</div>
            <p className="legal text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Support Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{stats.supportHours}h</div>
            <p className="legal text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading visits data...
          </CardContent>
        </Card>
      ) : (
        <VisitList visits={visits} onVisitSelect={handleVisitSelect} />
      )}
    </div>
  );
}