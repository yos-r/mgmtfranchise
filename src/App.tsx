import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import { LoginPage } from '@/pages/Login';
import { Toaster } from '@/components/ui/toaster';
import { Building2, Settings2, Search, BellRing } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FranchiseDetail } from "@/components/franchise-detail";
import { RoyaltiesTab } from "@/components/royalties-tab";
import { PerformanceTab } from "@/components/performance-tab";
import { TrainingTab } from "@/components/training-tab";
import { SupportTab } from "@/components/support-tab";
import { AddFranchise } from "@/components/add-franchise";
import { SettingsLayout } from "@/components/settings/settings-layout";
import { ProfileForm } from "@/components/settings/profile-form";
import { CompanyForm } from "@/components/settings/company-form";
import { TeamForm } from "@/components/settings/team-form";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { NotificationsForm } from "@/components/settings/notifications-form";
import { SecurityForm } from "@/components/settings/security-form";
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Wallet,
  Award,
  BarChart3,
  TicketCheck,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal,
  FileText,
  TrendingUp,
  LayoutGrid,
  Map as MapIcon,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


const franchises = [
  {
    id: 1,
    name: "CENTURY 21 Saint-Germain",
    owner: "Marie Laurent",
    location: "Paris",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    revenue: "€890,000",
    status: "active",
    performance: "excellent",
    agents: 12,
    email: "saint-germain@century21.fr",
    phone: "+33 1 42 86 00 00",
  },
  {
    id: 2,
    name: "CENTURY 21 Confluence",
    owner: "Thomas Bernard",
    location: "Lyon",
    coordinates: { lat: 45.7640, lng: 4.8357 },
    revenue: "€720,000",
    status: "active",
    performance: "good",
    agents: 8,
    email: "confluence@century21.fr",
    phone: "+33 4 72 40 00 00",
  },
  {
    id: 3,
    name: "CENTURY 21 Vieux Port",
    owner: "Sophie Martin",
    location: "Marseille",
    coordinates: { lat: 43.2965, lng: 5.3698 },
    revenue: "€650,000",
    status: "active",
    performance: "good",
    agents: 10,
    email: "vieux-port@century21.fr",
    phone: "+33 4 91 00 00 00",
  },
  {
    id: 4,
    name: "CENTURY 21 Bordeaux Centre",
    owner: "Pierre Dubois",
    location: "Bordeaux",
    coordinates: { lat: 44.8378, lng: -0.5792 },
    revenue: "€580,000",
    status: "pending",
    performance: "average",
    agents: 6,
    email: "bordeaux-centre@century21.fr",
    phone: "+33 5 56 00 00 00",
  },
];
function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPerformanceBadge(performance: string) {
  switch (performance) {
    case "excellent":
      return <Badge className="bg-green-500">Excellent</Badge>;
    case "good":
      return <Badge className="bg-blue-500">Good</Badge>;
    case "average":
      return <Badge className="bg-yellow-500">Average</Badge>;
    default:
      return <Badge className="bg-gray-500">Unknown</Badge>;
  }
}
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

function Dashboard() {
  const [selectedFranchise, setSelectedFranchise] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [isAddingFranchise, setIsAddingFranchise] = useState(false);
  const [currentSection, setCurrentSection] = useState<'main' | 'settings'>('main');
  const [settingsSection, setSettingsSection] = useState<'profile' | 'company' | 'team' | 'appearance' | 'notifications' | 'security'>('profile');

  if (isAddingFranchise) {
    return <AddFranchise onCancel={() => setIsAddingFranchise(false)} />;
  }

  if (selectedFranchise) {
    return (
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-xl">CENTURY 21 Franchise Management</h1>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedFranchise(null)}
                className="button-1"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="space-y-4">
            <FranchiseDetail />
          </div>
        </div>
      </div>
    );
  }

  if (currentSection === 'settings') {
    return (
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-xl">CENTURY 21 Franchise Management</h1>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentSection('main')}
                className="button-1"
              >
                ← Back to Dashboard
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <SettingsLayout onSectionChange={(section) => setSettingsSection(section as any)}>
          {settingsSection === 'profile' && <ProfileForm />}
          {settingsSection === 'company' && <CompanyForm />}
          {settingsSection === 'team' && <TeamForm />}
          {settingsSection === 'appearance' && <AppearanceForm />}
          {settingsSection === 'notifications' && <NotificationsForm />}
          {settingsSection === 'security' && <SecurityForm />}
        </SettingsLayout>
      </div>
    );
  }
  // return 'yea'
  // Main dashboard view
  return (
    
    <div className="hidden flex-col md:flex">
      
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-xl">CENTURY 21 Franchise Management</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Search className="h-5 w-5" />
            <BellRing className="h-5 w-5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="label-1">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setCurrentSection('settings');
                  setSettingsSection('profile');
                }} className="body-1">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setCurrentSection('settings');
                  setSettingsSection('company');
                }} className="body-1">
                  Company
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setCurrentSection('settings');
                  setSettingsSection('team');
                }} className="body-1">
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setCurrentSection('settings');
                  setSettingsSection('appearance');
                }} className="body-1">
                  Appearance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setCurrentSection('settings');
                  setSettingsSection('notifications');
                }} className="body-1">
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setCurrentSection('settings');
                  setSettingsSection('security');
                }} className="body-1">
                  Security
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="button-2">{t('overview')}</TabsTrigger>
            <TabsTrigger value="franchises" className="button-2">{t('franchises')}</TabsTrigger>
            <TabsTrigger value="royalties" className="button-2">{t('royalties')}</TabsTrigger>
            <TabsTrigger value="performance" className="button-2">{t('performance')}</TabsTrigger>
            <TabsTrigger value="training" className="button-2">{t('training')}</TabsTrigger>
            <TabsTrigger value="support" className="button-2">{t('support')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="tagline-3">
                    Total Franchises
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="numbers text-2xl font-bold">245</div>
                  <p className="legal text-muted-foreground">
                    +4 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="tagline-3">
                    Monthly Revenue
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="numbers text-2xl font-bold">€2.4M</div>
                  <p className="legal text-muted-foreground">
                    +12.3% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="tagline-3">
                    Top Performers
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="numbers text-2xl font-bold">32</div>
                  <p className="legal text-muted-foreground">
                    Exceeded targets this quarter
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="tagline-3">
                    Active Support Tickets
                  </CardTitle>
                  <TicketCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="numbers text-2xl font-bold">18</div>
                  <p className="legal text-muted-foreground">
                    85% resolution rate
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="tagline-2">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle className="tagline-2">Top Performing Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"].map(
                      (region) => (
                        <div
                          key={region}
                          className="flex items-center justify-between"
                        >
                          <span className="body-1">{region}</span>
                          <span className="numbers text-muted-foreground">
                            €{Math.floor(Math.random() * 900000 + 100000)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="franchises" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="tagline-2">Franchise Network</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-lg border p-1">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        className="button-2"
                        onClick={() => setViewMode('list')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        className="button-2"
                        onClick={() => setViewMode('grid')}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'map' ? 'default' : 'ghost'}
                        size="sm"
                        className="button-2"
                        onClick={() => setViewMode('map')}
                      >
                        <MapIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button className="button-1" onClick={() => setIsAddingFranchise(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Franchise
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'map' ? (
                  <FranchiseMap franchises={franchises} onSelect={setSelectedFranchise} />
                ) : viewMode === 'grid' ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {franchises.map((franchise) => (
                      <FranchiseCard
                        key={franchise.id}
                        franchise={franchise}
                        onSelect={setSelectedFranchise}
                      />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="label-1">Franchise</TableHead>
                        <TableHead className="label-1">Location</TableHead>
                        <TableHead className="label-1">Status</TableHead>
                        <TableHead className="label-1">Performance</TableHead>
                        <TableHead className="label-1">Revenue</TableHead>
                        <TableHead className="label-1">Agents</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {franchises.map((franchise) => (
                        <TableRow
                          key={franchise.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedFranchise(franchise.id)}
                        >
                          <TableCell>
                            <div>
                              <div className="body-1 font-medium">{franchise.name}</div>
                              <div className="legal text-muted-foreground">
                                {franchise.owner}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="body-1">{franchise.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(franchise.status)} label-2`}>
                              {franchise.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getPerformanceBadge(franchise.performance)}
                          </TableCell>
                          <TableCell className="numbers">{franchise.revenue}</TableCell>
                          <TableCell className="numbers">{franchise.agents}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="label-1">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="body-1">
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>{franchise.email}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="body-1">
                                  <Phone className="mr-2 h-4 w-4" />
                                  <span>{franchise.phone}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="body-1">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>View Contract</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="body-1">
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  <span>Performance Report</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="royalties">
            <RoyaltiesTab />
          </TabsContent>
          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>
          <TabsContent value="training">
            <TrainingTab />
          </TabsContent>
          <TabsContent value="support">
            <SupportTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;