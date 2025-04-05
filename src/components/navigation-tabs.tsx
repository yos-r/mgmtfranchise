import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
// import { Tabs } from "./ui/tabs";
import { ChevronDown } from "lucide-react";

import { t } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
interface NavigationTabsProps {
  className?: string;
}

export function NavigationTabs({ className }: NavigationTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the current path's first segment to determine active tab
  const currentPath = location.pathname.split('/')[1] || 'overview';
  
  // Define tab data for easier management
  const primaryTabs = [
    { value: "overview", label: t('overview'), path: "/overview" },
    { value: "franchises", label: t('franchises'), path: "/franchises" },
    { value: "royalties", label: t('royalties'), path: "/royalties" },
    { value: "naf", label: "NAF", path: "/naf" },
    { value: "training", label: t('training'), path: "/training" },
    { value: "support", label: t('support'), path: "/support" },
    { value: "helpdesk", label: "Helpdesk", path: "/helpdesk" }
  ];
  
  const secondaryTabs = [
    { value: "performance", label: t('performance'), path: "/performance" },
    { value: "dev", label: "Business Development", path: "/dev" }
  ];
  
  // All tabs combined for mobile dropdown
  const allTabs = [...primaryTabs, ...secondaryTabs];

  // Handle tab change
  const handleTabChange = (path: string) => {
    navigate(path);
  };

  return (
    <div className={className}>
      <Tabs value={currentPath} className="space-y-4">
        {/* Mobile view - Dropdown menu */}
        <div className="md:hidden w-full mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-2 border rounded-md bg-white">
              <span>{allTabs.find(tab => tab.value === currentPath)?.label || 'Navigation'}</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              {allTabs.map(tab => (
                <DropdownMenuItem 
                  key={tab.value} 
                  onClick={() => handleTabChange(tab.path)}
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
                onClick={() => handleTabChange(tab.path)}
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
                  onClick={() => handleTabChange(tab.path)}
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
                  onClick={() => handleTabChange(tab.path)}
                  className="button-2"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      </Tabs>
    </div>
  );
}