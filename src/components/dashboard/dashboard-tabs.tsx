import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { RoyaltiesTab } from "../royalties/royalties-tab";
import { PerformanceTab } from "../performance/performance-tab";
import { TrainingTab } from "../training/training-tab";
import { SupportTab } from "../support/support-tab";
import { t } from "@/lib/i18n";
import { OverviewTab } from "../overview/overview-tab";
import { FranchisesTab } from "../franchises/franchises-tab";
import { HelpDeskTab } from "../help-desk/help-desk-tab";
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
                <OverviewTab></OverviewTab>
            </TabsContent>
            <TabsContent value="franchises" className="space-y-4">
                <FranchisesTab franchises={franchises} viewMode={viewMode} setViewMode={setViewMode} setIsAddingFranchise={setIsAddingFranchise} setSelectedFranchise={setSelectedFranchise}></FranchisesTab>
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
            <TabsContent value="helpdesk">
                <HelpDeskTab />
            </TabsContent>
        </Tabs>
    )
}
