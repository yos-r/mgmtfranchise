import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Building,
  User,
  Clipboard,
  Check,
  Image,
  HistoryIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

interface AssistanceDetailProps {
  assistanceId?: string;
  onBack: () => void;
}

export default function VisitDetail({ 
  assistanceId,
  onBack
}: AssistanceDetailProps) {
  const [isLoading, setIsLoading] = useState(!!assistanceId);
  const [assistance, setAssistance] = useState<any>(null);
  const [franchise, setFranchise] = useState<any>(null);
  const [consultant, setConsultant] = useState<any>(null);
  
  // État pour les actions recommandées
  const [actions, setActions] = useState<any[]>([]);
  const [newAction, setNewAction] = useState("");
  const [actionStatus, setActionStatus] = useState("pending");
  
  // État pour les checklists
  const [checklists, setChecklists] = useState({
    cleanliness: {
      floorClean: false,
      windowsClean: false,
      workspacesClean: false,
      bathroomsClean: false,
      storageOrganized: false,
      trashBinsEmpty: false
    },
    agentAppearance: {
      dresscodeCompliant: false,
      personalHygiene: false,
      posturePresentation: false
    },
    signageAndWindow: {
      signageVisible: false,
      cleanWindow: false,
      compliantDisplay: false,
      noDefectiveAds: false
    },
    atmosphere: {
      welcomingAtmosphere: false,
      regularFrequentation: false,
      spaceOrganization: false,
      reasonableWaitingTime: false
    },
    other: {
      equipmentCompliance: false,
      agencySecurity: false,
      sanitaryRules: false
    }
  });
  
  // État pour les agents présents
  const [agents, setAgents] = useState<string[]>([]);
  const [newAgent, setNewAgent] = useState("");
  const [isEditingAgents, setIsEditingAgents] = useState(false);
  
  // État pour l'historique des visites
  const [visitHistory, setVisitHistory] = useState<any[]>([]);
  
  // État pour les modifications
  const [isEditing, setIsEditing] = useState(false);
  const [observations, setObservations] = useState("");
  const [checklistsUpdated, setChecklistsUpdated] = useState(false);
  
  const { toast } = useToast();

  // Simuler le chargement des données
  useEffect(() => {
    if (assistanceId) {
      fetchAssistanceData(assistanceId);
    }
  }, [assistanceId]);

  const fetchAssistanceData = async (id: string) => {
    setIsLoading(true);
    
    try {
      // Simulons les données obtenues depuis Supabase
      const assistanceData = {
        id: id,
        franchise_id: "1bd81810-a830-4dca-8780-c27247d99ece",
        consultant_id: "b7cb7763-0bb3-46e2-9c0e-a41b4b29e256",
        type: "quarterly review",
        date: "2025-03-15",
        time: "10:00",
        duration: "3h",
        status: "completed",
        observations: "L'agence est bien tenue et respecte parfaitement les standards de la marque. L'équipe est dynamique et les résultats sont au rendez-vous. Quelques améliorations peuvent être apportées concernant l'affichage en vitrine."
      };
      
      // Simulons les données de la franchise
      const franchiseData = {
        id: "1bd81810-a830-4dca-8780-c27247d99ece",
        name: "CENTURY 21 S A",
        owner_name: "S A",
        company_name: "CENTURY 21 S A",
        tax_id: "123456",
        email: "contact@century21sa.fr",
        phone: "+33 2 34 56 78 90",
        address: "1050 IXELLES",
        status: "active",
        coordinates: { lat: "4.387792256761006", lng: "50.84584016324202" },
        owner_email: "sa@aol.com"
      };
      
      // Simulons les données du consultant
      const consultantData = {
        id: "b7cb7763-0bb3-46e2-9c0e-a41b4b29e256",
        name: "Marie Dupont",
        role: "Consultant senior"
      };
      
      // Simulons les données des actions recommandées
      const actionsData = [
        { 
          id: "1", 
          action: "Mettre à jour les affiches en vitrine avec les nouvelles normes", 
          status: "completed", 
          deadline: "2025-03-30"
        },
        { 
          id: "2", 
          action: "Former les nouveaux agents aux outils CRM", 
          status: "in_progress", 
          deadline: "2025-04-15"
        },
        { 
          id: "3", 
          action: "Vérifier la conformité du logo sur tous les supports", 
          status: "pending", 
          deadline: "2025-04-30"
        }
      ];
      
      // Simulons l'historique des visites
      const historyData = [
        {
          id: "h1",
          date: "2025-01-10",
          type: "technical support",
          summary: "Installation du nouveau logiciel CRM"
        },
        {
          id: "h2",
          date: "2024-10-15",
          type: "quarterly review",
          summary: "Revue trimestrielle standard"
        },
        {
          id: "h3",
          date: "2024-07-22",
          type: "training",
          summary: "Formation sur les nouvelles réglementations immobilières"
        }
      ];
      
      // Simulons la liste des agents
      const agentsData = ["Jean Martin", "Sophie Bernard", "Thomas Klein"];
      
      // Mettre à jour les états
      setAssistance(assistanceData);
      setFranchise(franchiseData);
      setConsultant(consultantData);
      setActions(actionsData);
      setVisitHistory(historyData);
      setAgents(agentsData);
      setObservations(assistanceData.observations);
      
      // Simulons des valeurs pour les checklists
      setChecklists({
        cleanliness: {
          floorClean: true,
          windowsClean: true,
          workspacesClean: true,
          bathroomsClean: false,
          storageOrganized: true,
          trashBinsEmpty: true
        },
        agentAppearance: {
          dresscodeCompliant: true,
          personalHygiene: true,
          posturePresentation: true
        },
        signageAndWindow: {
          signageVisible: true,
          cleanWindow: true,
          compliantDisplay: false,
          noDefectiveAds: true
        },
        atmosphere: {
          welcomingAtmosphere: true,
          regularFrequentation: true,
          spaceOrganization: true,
          reasonableWaitingTime: true
        },
        other: {
          equipmentCompliance: true,
          agencySecurity: true,
          sanitaryRules: true
        }
      });
      
    } catch (error) {
      console.error("Error fetching assistance data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'assistance.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAction = () => {
    if (!newAction.trim()) return;
    
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const newActionItem = {
      id: `new-${Date.now()}`,
      action: newAction,
      status: actionStatus,
      deadline: format(nextMonth, "yyyy-MM-dd")
    };
    
    setActions([...actions, newActionItem]);
    setNewAction("");
    setActionStatus("pending");
    
    toast({
      title: "Action ajoutée",
      description: "L'action a été ajoutée avec succès."
    });
  };

  const handleDeleteAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
    toast({
      title: "Action supprimée",
      description: "L'action a été supprimée avec succès."
    });
  };

  const handleUpdateActionStatus = (id: string, status: string) => {
    setActions(actions.map(action => 
      action.id === id ? { ...action, status } : action
    ));
    toast({
      title: "Statut mis à jour",
      description: `Le statut de l'action a été changé en "${status}".`
    });
  };

  const handleAddAgent = () => {
    if (!newAgent.trim()) return;
    setAgents([...agents, newAgent]);
    setNewAgent("");
  };

  const handleRemoveAgent = (index: number) => {
    const updatedAgents = [...agents];
    updatedAgents.splice(index, 1);
    setAgents(updatedAgents);
  };

  const handleSaveChecklists = () => {
    toast({
      title: "Checklists enregistrées",
      description: "Les checklists ont été mises à jour avec succès."
    });
    setChecklistsUpdated(false);
  };

  const handleChecklistChange = (category: string, item: string, checked: boolean) => {
    setChecklists({
      ...checklists,
      [category]: {
        ...checklists[category],
        [item]: checked
      }
    });
    setChecklistsUpdated(true);
  };

  const handleSaveObservations = () => {
    if (assistance) {
      setAssistance({
        ...assistance,
        observations
      });
      toast({
        title: "Observations enregistrées",
        description: "Les observations ont été mises à jour avec succès."
      });
      setIsEditing(false);
    }
  };

  // Helper function pour le badge de statut
  const getStatusBadgeClass = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des détails de l'assistance...</p>
      </div>
    );
  }

  if (!assistance || !franchise) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p>Assistance non trouvée</p>
        <Button onClick={onBack}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Retour</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Détails de l'assistance pour {franchise.name}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              <span>{format(new Date(assistance.date), "d MMMM yyyy")}</span>
              <Clock className="ml-3 mr-1 h-3.5 w-3.5" />
              <span>{assistance.time}</span>
              <span className="mx-2">•</span>
              <span>{assistance.duration}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusBadgeClass(assistance.status)}>
            {assistance.status}
          </Badge>
          <Badge variant="outline">
            {assistance.type}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations agence et historique (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Informations sur l'agence</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-video w-full overflow-hidden rounded-md bg-muted mb-4">
                  <img 
                    src="https://www.century21.fr/imagesBien/202/3332/webmaster_1_202_3332_0_2_0.jpg" 
                    alt={franchise.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{franchise.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{franchise.address}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Responsable: {franchise.owner_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{franchise.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Agents présents
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingAgents(!isEditingAgents)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      <span>{isEditingAgents ? "Terminer" : "Modifier"}</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {agents.map((agent, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{agent}</span>
                        {isEditingAgents && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveAgent(index)}
                            className="h-7 w-7 p-0"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {isEditingAgents && (
                      <div className="flex mt-2">
                        <Input
                          className="flex-1 h-8 text-sm mr-2"
                          placeholder="Ajouter un agent"
                          value={newAgent}
                          onChange={(e) => setNewAgent(e.target.value)}
                        />
                        <Button size="sm" onClick={handleAddAgent} className="h-8">
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Consultant
                  </h3>
                  <div className="text-sm">
                    {consultant?.name} - {consultant?.role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Historique des visites d'assistance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions effectuées</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitHistory.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        {format(new Date(visit.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{visit.type}</Badge>
                      </TableCell>
                      <TableCell>{visit.summary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Commentaires sur l'assistance</CardTitle>
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsEditing(false);
                        setObservations(assistance.observations);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveObservations}
                    >
                      Enregistrer
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="whitespace-pre-wrap text-sm">
                  {observations || "Aucune observation"}
                </div>
              ) : (
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="min-h-32"
                  placeholder="Ajoutez vos observations ici..."
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Actions recommandées</CardTitle>
                <div className="flex items-center space-x-2">
                  <select 
                    className="text-xs border rounded px-2 py-1"
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                  >
                    <option value="pending">En attente</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  <Input
                    className="text-sm h-8 w-64"
                    placeholder="Nouvelle action..."
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddAction}
                    disabled={!newAction.trim()}
                    className="h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.action}</TableCell>
                      <TableCell>
                        {format(new Date(action.deadline), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(action.status)}>
                          {action.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {action.status !== "completed" && (
                              <DropdownMenuItem onClick={() => handleUpdateActionStatus(action.id, "completed")}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                Marquer comme terminé
                              </DropdownMenuItem>
                            )}
                            {action.status !== "in_progress" && (
                              <DropdownMenuItem onClick={() => handleUpdateActionStatus(action.id, "in_progress")}>
                                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                Marquer comme en cours
                              </DropdownMenuItem>
                            )}
                            {action.status !== "pending" && (
                              <DropdownMenuItem onClick={() => handleUpdateActionStatus(action.id, "pending")}>
                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                Marquer comme en attente
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAction(action.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {actions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Aucune action recommandée pour le moment
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        {/* Checklists (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Checklists</CardTitle>
                {checklistsUpdated && (
                  <Button 
                    size="sm" 
                    onClick={handleSaveChecklists}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cleanliness" className="w-full">
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="cleanliness" className="text-xs">Propreté</TabsTrigger>
                  <TabsTrigger value="agentAppearance" className="text-xs">Agents</TabsTrigger>
                  <TabsTrigger value="signageAndWindow" className="text-xs">Enseigne</TabsTrigger>
                  <TabsTrigger value="atmosphere" className="text-xs">Ambiance</TabsTrigger>
                  <TabsTrigger value="other" className="text-xs">Autre</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cleanliness" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="floorClean" 
                      checked={checklists.cleanliness.floorClean}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('cleanliness', 'floorClean', !!checked)
                      }
                    />
                    <label 
                      htmlFor="floorClean"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Sol propre et sans débris
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="windowsClean" 
                      checked={checklists.cleanliness.windowsClean}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('cleanliness', 'windowsClean', !!checked)
                      }
                    />
                    <label 
                      htmlFor="windowsClean"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Fenêtres et vitres propres
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="workspacesClean" 
                      checked={checklists.cleanliness.workspacesClean}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('cleanliness', 'workspacesClean', !!checked)
                      }
                    />
                    <label 
                      htmlFor="workspacesClean"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Surfaces de travail propres
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bathroomsClean" 
                      checked={checklists.cleanliness.bathroomsClean}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('cleanliness', 'bathroomsClean', !!checked)
                      }
                    />
                    <label 
                      htmlFor="bathroomsClean"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Sanitaires propres et fonctionnels
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="storageOrganized" 
                      checked={checklists.cleanliness.storageOrganized}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('cleanliness', 'storageOrganized', !!checked)
                      }
                    />
                    <label 
                      htmlFor="storageOrganized"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Zone de stockage en ordre
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="trashBinsEmpty" 
                      checked={checklists.cleanliness.trashBinsEmpty}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('cleanliness', 'trashBinsEmpty', !!checked)
                      }
                    />
                    <label 
                      htmlFor="trashBinsEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Poubelles vides et bien placées
                    </label>
                  </div>
                </TabsContent>
                
                <TabsContent value="agentAppearance" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dresscodeCompliant" 
                      checked={checklists.agentAppearance.dresscodeCompliant}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('agentAppearance', 'dresscodeCompliant', !!checked)
                      }
                    />
                    <label 
                      htmlFor="dresscodeCompliant"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Tenue vestimentaire conforme
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="personalHygiene" 
                      checked={checklists.agentAppearance.personalHygiene}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('agentAppearance', 'personalHygiene', !!checked)
                      }
                    />
                    <label 
                      htmlFor="personalHygiene"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Hygiène personnelle des agents
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="posturePresentation" 
                      checked={checklists.agentAppearance.posturePresentation}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('agentAppearance', 'posturePresentation', !!checked)
                      }
                    />
                    <label 
                      htmlFor="posturePresentation"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Posture et présentation des agents
                    </label>
                  </div>
                </TabsContent>
                
                <TabsContent value="signageAndWindow" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="signageVisible" 
                      checked={checklists.signageAndWindow.signageVisible}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('signageAndWindow', 'signageVisible', !!checked)
                      }
                    />
                    <label 
                      htmlFor="signageVisible"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enseigne visible et en bon état
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cleanWindow" 
                      checked={checklists.signageAndWindow.cleanWindow}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('signageAndWindow', 'cleanWindow', !!checked)
                      }
                    />
                    <label 
                      htmlFor="cleanWindow"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vitrine propre et bien présentée
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="compliantDisplay" 
                      checked={checklists.signageAndWindow.compliantDisplay}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('signageAndWindow', 'compliantDisplay', !!checked)
                      }
                    />
                    <label 
                      htmlFor="compliantDisplay"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Affichage conforme
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="noDefectiveAds" 
                      checked={checklists.signageAndWindow.noDefectiveAds}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('signageAndWindow', 'noDefectiveAds', !!checked)
                      }
                    />
                    <label 
                      htmlFor="noDefectiveAds"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Pas de publicité défectueuse
                    </label>
                  </div>
                </TabsContent>
                
                <TabsContent value="atmosphere" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="welcomingAtmosphere" 
                      checked={checklists.atmosphere.welcomingAtmosphere}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('atmosphere', 'welcomingAtmosphere', !!checked)
                      }
                    />
                    <label 
                      htmlFor="welcomingAtmosphere"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ambiance calme et accueillante
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="regularFrequentation" 
                      checked={checklists.atmosphere.regularFrequentation}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('atmosphere', 'regularFrequentation', !!checked)
                      }
                    />
                    <label 
                      htmlFor="regularFrequentation"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Fréquentation régulière
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="spaceOrganization" 
                      checked={checklists.atmosphere.spaceOrganization}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('atmosphere', 'spaceOrganization', !!checked)
                      }
                    />
                    <label 
                      htmlFor="spaceOrganization"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Organisation des espaces
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="reasonableWaitingTime" 
                      checked={checklists.atmosphere.reasonableWaitingTime}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('atmosphere', 'reasonableWaitingTime', !!checked)
                      }
                    />
                    <label 
                      htmlFor="reasonableWaitingTime"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Délai d'attente raisonnable
                    </label>
                  </div>
                </TabsContent>
                
                <TabsContent value="other" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="equipmentCompliance" 
                      checked={checklists.other.equipmentCompliance}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('other', 'equipmentCompliance', !!checked)
                      }
                    />
                    <label 
                      htmlFor="equipmentCompliance"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Conformité des équipements
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="agencySecurity" 
                      checked={checklists.other.agencySecurity}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('other', 'agencySecurity', !!checked)
                      }
                    />
                    <label 
                      htmlFor="agencySecurity"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Sécurité de l'agence
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sanitaryRules" 
                      checked={checklists.other.sanitaryRules}
                      onCheckedChange={(checked) => 
                        handleChecklistChange('other', 'sanitaryRules', !!checked)
                      }
                    />
                    <label 
                      htmlFor="sanitaryRules"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Conformité avec les règles sanitaires
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="mr-4">Conforme</span>
                
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Non conforme</span>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Résumé de l'assistance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Durée</span>
                  <span className="text-sm">{assistance.duration}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline">{assistance.type}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Statut</span>
                  <Badge className={getStatusBadgeClass(assistance.status)}>
                    {assistance.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Actions</span>
                  <span className="text-sm">{actions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conformité globale</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">85%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                  <div className="flex items-center">
                    <Image className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">Photo vitrine.jpg</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                  <div className="flex items-center">
                    <Image className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">Photo enseigne.jpg</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                  <div className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2 text-red-500" />
                    <span className="text-sm">Rapport d'assistance.pdf</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}