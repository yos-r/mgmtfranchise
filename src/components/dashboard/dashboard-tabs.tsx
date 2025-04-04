import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { ChevronDown } from "lucide-react";
import { RoyaltiesTab } from "../royalties/royalties-tab";
import { PerformanceTab } from "../performance/performance-tab";
import { TrainingTab } from "../training/training-tab";
import { SupportTab } from "../support/support-tab";
import { t } from "@/lib/i18n";
import { OverviewTab } from "../overview/overview-tab";
import { FranchisesTab } from "../franchises/franchises-tab";
import { HelpDeskTab } from "../help-desk/help-desk-tab";
import { MarketAnalysis } from "../business-development/market-analysiS";
import { NAFTab } from "../naf-tab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DashboardTabsProps {
  viewMode: string;
  setViewMode: React.Dispatch<React.SetStateAction<"list" | "grid" | "map">>;
  setSelectedFranchise?: any;
}

export function DashboardTabs({ viewMode, setViewMode, setSelectedFranchise }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const [selectedVisit,setSelectedVisit] = useState(null);
  const handleVisitSelect = (visit) => {
    setActiveTab("support");
    setSelectedVisit(visit);
  };
  const handleBack = () => {
    setSelectedVisit(null);
  };

  // Define tab data for easier management
  const primaryTabs = [
    { value: "overview", label: t('overview') },
    { value: "franchises", label: t('franchises') },
    { value: "royalties", label: t('royalties') },
    { value: "naf", label: "NAF" },
    { value: "training", label: t('training') },
    { value: "support", label: t('support') },
    { value: "helpdesk", label: "Helpdesk" }
  ];
  
  const secondaryTabs = [
    { value: "performance", label: t('performance') },
    { value: "dev", label: "Business Development" }
  ];
  
  // All tabs combined for mobile dropdown
  const allTabs = [...primaryTabs, ...secondaryTabs];

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      {/* Mobile view - Dropdown menu */}
      <div className="md:hidden w-full mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-2 border rounded-md bg-white">
            <span>{allTabs.find(tab => tab.value === activeTab)?.label}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {allTabs.map(tab => (
              <DropdownMenuItem 
                key={tab.value} 
                onClick={() => handleTabChange(tab.value)}
              >
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tablet view - Scrollable tabs */}
      <div className="hidden md:block lg:hidden">
        <TabsList className="flex overflow-x-auto hide-scrollbar py-1">
          {allTabs.map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="button-2 rounded whitespace-nowrap"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Desktop view - Separated tab groups */}
      <div className="hidden lg:flex lg:justify-between lg:items-center">
        <div className="tablist-primary">
          <TabsList className="bg-muted rounded-md">
            {primaryTabs.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="button-2"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="tablist-secondary">
          <TabsList className="bg-muted rounded-md">
            {secondaryTabs.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="button-2"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <TabsContent value="overview" className="space-y-4">
        <OverviewTab />
      </TabsContent>
      <TabsContent value="franchises" className="space-y-4">
        <FranchisesTab viewMode={viewMode} setViewMode={setViewMode} onVisitSelect={handleVisitSelect}  />
      </TabsContent>
      <TabsContent value="royalties">
        <RoyaltiesTab />
      </TabsContent>
      <TabsContent value="performance">
        <PerformanceTab onHome={()=>setActiveTab('overview')} />
      </TabsContent>
      <TabsContent value="training">
        <TrainingTab />
      </TabsContent>
      <TabsContent value="support">
        <SupportTab  onSelect={handleVisitSelect} onBack={handleBack} selectedVisit={selectedVisit}/>
      </TabsContent>
      <TabsContent value="helpdesk">
        <HelpDeskTab />
      </TabsContent>
      <TabsContent value="dev">
        <MarketAnalysis />
      </TabsContent>
      <TabsContent value="naf">
        <NAFTab />
      </TabsContent>

    </Tabs>
  );
}