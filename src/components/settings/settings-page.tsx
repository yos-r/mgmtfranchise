import { Building } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { AppearanceForm } from "./appearance-form";
import { CompanyForm } from "./company-form";
import { NotificationsForm } from "./notifications-form";
import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";
import { SettingsLayout } from "./settings-layout";
import { TeamForm } from "./team-form";
import { useState } from "react";

interface SettingsPageProps {
    // setCurrentSection: (section: string) => void;
    setCurrentSection: React.Dispatch<React.SetStateAction<"main" | "settings">>;

  }
export const SettingsPage: React.FC<SettingsPageProps> = ({ setCurrentSection }) => {
    const [settingsSection, setSettingsSection] = useState<string>('profile');
  
    const handleSectionChange = (section: string) => {
      setSettingsSection(section);
    };
  
    return (
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Building className="h-8 w-8 text-primary" />
              <h1 className="text-xl">CENTURY 21 Franchise Management</h1>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentSection('main')}
                className="button-1"
              >
                ← Retour
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <SettingsLayout onSectionChange={handleSectionChange}>
          {settingsSection === 'profile' && <ProfileForm />}
          {settingsSection === 'company' && <CompanyForm />}
          {settingsSection === 'team' && <TeamForm />}
          {settingsSection === 'appearance' && <AppearanceForm />}
          {settingsSection === 'notifications' && <NotificationsForm />}
          {settingsSection === 'security' && <SecurityForm />}
        </SettingsLayout>
      </div>
    );
  };