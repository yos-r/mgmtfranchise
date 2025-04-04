import { Building, MapPin, User, Phone, Mail, Users, ExternalLink, Building2, Plus, X, Calendar, Clock, CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function FranchiseInfoCard({ franchise, consultant, visit, agents: initialAgents }) {
  if (!franchise) return null;

  // State for agent management
  const [agents, setAgents] = useState(initialAgents || [
    "John Smith",
    "Maria Garcia",
    "Robert Johnson"
  ]);
  const [newAgent, setNewAgent] = useState("");
  const [isAddingAgent, setIsAddingAgent] = useState(false);

  // State for support visits and consultant data
  const [supportVisits, setSupportVisits] = useState([]);
  const [assignedConsultant, setAssignedConsultant] = useState(consultant || null);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  const { toast } = useToast();

  // Fetch support visits for this franchise
  useEffect(() => {
    const fetchSupportVisits = async () => {
      if (!franchise.id) return;

      try {
        setIsLoadingVisits(true);

        // Query to get the latest support visits and the consultant details
        const { data, error } = await supabase
          .from('support_visits')
          .select(`
            id,
            type,
            date,
            time,
            duration,
            status,
            observations,
            conformity,
            consultant_id,
            team_members:consultant_id (
              first_name,
              last_name,
              email,
              role
            )
          `)
          .eq('id', visit.id)
          .order('date', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform the data to include formatted date and time
          const transformedVisits = data.map(visit => ({
            ...visit,
            formattedDate: format(new Date(visit.date), 'MMM d, yyyy'),
            consultant: visit.team_members ?
              `${visit.team_members.first_name} ${visit.team_members.last_name}` :
              'Unassigned'
          }));

          setSupportVisits(transformedVisits);
          console.log()
          if (data[0].team_members) {
            setAssignedConsultant({
              id: data[0].consultant_id,
              name: `${data[0].team_members.first_name} ${data[0].team_members.last_name} `,
              email: data[0].team_members.email,
              role: data[0].team_members.role
            });
          }
        }
      } catch (error) {
        console.error("Error fetching support visits:", error);
        toast({
          title: "Error",
          description: "Failed to load support visit information",
          variant: "destructive"
        });
      } finally {
        setIsLoadingVisits(false);
      }
    };

    fetchSupportVisits();
  }, [franchise.id]);

  // Get the first letters of franchise name for avatar fallback
  const getInitials = (name) => {
    return name?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAddAgent = () => {
    if (newAgent.trim()) {
      setAgents([...agents, newAgent.trim()]);
      setNewAgent("");
      setIsAddingAgent(false);
    }
  };

  const handleRemoveAgent = (indexToRemove) => {
    setAgents(agents.filter((_, index) => index !== indexToRemove));
  };

  // Support visit status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1">
          <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex items-center space-x-4">
              {franchise.logo ? (
                <img
                  src={franchise.logo}
                  alt={franchise.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{franchise.name}</h1>
                  {franchise.status === 'terminated' && (
                    <Badge variant="destructive">Terminated</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{franchise.company_name}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-3">Franchise Details</h3>
                <div className="space-y-2">
                  {franchise.company_name && franchise.company_name !== franchise.name && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{franchise.company_name}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{franchise.address}</span>
                  </div>
                  {franchise.tax_id && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 flex justify-center items-center text-xs rounded bg-muted text-muted-foreground">
                        #
                      </span>
                      <span className="text-sm">Tax ID: {franchise.tax_id}</span>
                    </div>
                  )}
                </div>
                <Separator className="my-4" />
                <h3 className="text-lg font-medium mb-3">Owner Information</h3>
                <div className="flex items-start space-x-3">
                  {franchise.owner_avatar ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={franchise.owner_avatar} alt={franchise.owner_name} />
                      <AvatarFallback>{getInitials(franchise.owner_name)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{franchise.owner_name}</div>
                    <div className="flex flex-col space-y-1 mt-1">
                      {franchise.owner_email && (
                        <a
                          href={`mailto:${franchise.owner_email}`}
                          className="text-xs text-gray-600 hover:underline flex items-center"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          {franchise.owner_email}
                        </a>
                      )}
                      {franchise.owner_phone && (
                        <a
                          href={`tel:${franchise.owner_phone}`}
                          className="text-xs text-darkgold hover:underline flex items-center"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {franchise.owner_phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultant and Visits Section */}

            </div>
          </CardContent>
        </div>

        <div className="flex-1 p-6">
          <div className="mb-4">
            {isLoadingVisits ? (
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            ) : (
              <div className="flex-1">
                <h3 className="text-lg flex gap-x-2 items-center font-medium mb-3"> <User className="text-obsessedgrey w-4"></User>Consultant</h3>
                {assignedConsultant ? (
                  <div className="p-3 rounded-md bg-muted/40">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(assignedConsultant.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{assignedConsultant.name} </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {assignedConsultant.role.charAt(0).toUpperCase() + assignedConsultant.role.slice(1)}
                        </div>
                        <a
                          href={`mailto:${assignedConsultant.email}`}
                          className="text-xs text-gray-600 hover:underline flex items-center"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          {assignedConsultant.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-muted/40 text-center text-sm text-muted-foreground">
                    No consultant assigned yet
                  </div>
                )}


              </div>
            )}
            <div className="flex items-center justify-between mb-3 mt-3">
              <h3 className="text-lg font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 mt-" />
                Present Agents ({agents.length})
              </h3>

              {!isAddingAgent ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setIsAddingAgent(true)}
                >
                  <Plus className="h-3 w-3" />
                  Add Agent
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingAgent(false)}
                >
                  Cancel
                </Button>
              )}
            </div>

            {isAddingAgent && (
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Enter agent name"
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddAgent}
                  disabled={!newAgent.trim()}
                >
                  Add
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {agents.length > 0 ? (
                agents.map((agent, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/40 group"
                  >
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{agent}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAgent(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No agents added yet
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </Card>
  );
}