/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { SettingsPage } from "@/components/settings/settings-page";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { NavbarLayout } from "@/components/navbar/navbar-layout";

export function Dashboard() {
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
    const [currentSection, setCurrentSection] = useState<'main' | 'settings'>('main');
    const [settingsSection, setSettingsSection] = useState<'profile' | 'company' | 'team' | 'appearance' | 'notifications' | 'security'>('profile');

    if (currentSection === 'settings') {
        return (
            <SettingsPage setCurrentSection={setCurrentSection} />
        );
    }

    return (
        <NavbarLayout
            setCurrentSection={setCurrentSection}
            setSettingsSection={setSettingsSection}
        >
            <DashboardTabs
                setViewMode={setViewMode}
                viewMode={viewMode}
            />
        </NavbarLayout>

    )

}
