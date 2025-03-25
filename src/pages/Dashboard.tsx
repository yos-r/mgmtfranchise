/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddFranchise } from "@/components/franchises/add-franchise";
import { FranchiseDetail } from "@/components/franchises/franchise-detail";
import { useState } from "react";
import { SettingsPage } from "@/components/settings/settings-page";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { NavbarLayout } from "@/components/navbar/navbar-layout";

export function Dashboard() {

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

    const [selectedFranchise, setSelectedFranchise] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
    const [isAddingFranchise, setIsAddingFranchise] = useState(false);
    const [currentSection, setCurrentSection] = useState<'main' | 'settings'>('main');
    const [settingsSection, setSettingsSection] = useState<'profile' | 'company' | 'team' | 'appearance' | 'notifications' | 'security'>('profile');

    if (isAddingFranchise) {

        return (<NavbarLayout
            setCurrentSection={setCurrentSection}
            onBackClick={() => setIsAddingFranchise(false)}
            title="Add New Franchise"
        >
            <AddFranchise onCancel={() => setIsAddingFranchise(false)} />
        </NavbarLayout>)
    }

    if (selectedFranchise) {
        return (
            <NavbarLayout
                setCurrentSection={setCurrentSection}
                onBackClick={() => setSelectedFranchise(null)}
                title="Franchise Details"
            >
                <FranchiseDetail />
            </NavbarLayout>
        );
    }


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
                franchises={franchises}
                setIsAddingFranchise={setIsAddingFranchise}
                setSelectedFranchise={setSelectedFranchise}
                setViewMode={setViewMode}
                viewMode={viewMode}
            />
        </NavbarLayout>

    )

}
