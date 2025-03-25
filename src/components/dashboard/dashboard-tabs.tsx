import { Award, BarChart2, FileText, LayoutGrid, MapIcon, Plus, TicketCheck, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { FranchiseMap } from "../franchises/franchise-map";
import { FranchiseCard } from "../franchises/franchise-card";
import { FranchiseTable } from "../franchises/franchise-table";
import { RoyaltiesTab } from "../royalties/royalties-tab";
import { PerformanceTab } from "../performance/performance-tab";
import { TrainingTab } from "../training/training-tab";
import { SupportTab } from "../support/support-tab";
import { t } from "@/lib/i18n";
interface DashboardTabsProps {
    franchises: any[];
    viewMode: string;
    setViewMode: React.Dispatch<React.SetStateAction<"list" | "grid" | "map">>;
    setSelectedFranchise: (id: number) => void;
    setIsAddingFranchise: (isAdding: boolean) => void;

}
export function DashboardTabs({ franchises, viewMode, setViewMode, setIsAddingFranchise, setSelectedFranchise }: DashboardTabsProps) {
    return (
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview" className="button-2">{t('overview')}</TabsTrigger>
                <TabsTrigger value="franchises" className="button-2">{t('franchises')}</TabsTrigger>
                <TabsTrigger value="royalties" className="button-2">{t('royalties')}</TabsTrigger>
                <TabsTrigger value="performance" className="button-2">{t('performance')}</TabsTrigger>
                <TabsTrigger value="training" className="button-2">{t('training')}</TabsTrigger>
                <TabsTrigger value="support" className="button-2">{t('support')}</TabsTrigger>
                <TabsTrigger value="helpdesk" className="button-2">Helpdesk</TabsTrigger>

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
                                <BarChart2 className="h-8 w-8 text-muted-foreground" />
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
                            <FranchiseTable franchises={franchises} onFranchiseSelect={setSelectedFranchise} />

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
    )
}
