import { Building, Loader2 } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { AppearanceForm } from "./appearance-form";
import { CompanyForm } from "./company-form";
import { NotificationsForm } from "./notifications-form";
import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";
import { SettingsLayout } from "./settings-layout";
import { TeamForm } from "./team-form";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { useNavigate, useParams, useLocation } from "react-router-dom";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  // Get the section from the URL if available, default to 'profile'
  const [settingsSection, setSettingsSection] = useState<string>(
    params.section || location.state?.section || 'profile'
  );
  
  const [companyName, setCompanyName] = useState<string>("CENTURY 21");
  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleSectionChange = (section: string) => {
    setSettingsSection(section);
    // Update the URL to reflect the current section
    navigate(`/settings/${section}`, { replace: true });
  };

  const handleBackClick = () => {
    // Navigate back to the main dashboard
    navigate('/');
  };

  useEffect(() => {
    // Update section based on URL params if they change
    if (params.section && params.section !== settingsSection) {
      setSettingsSection(params.section);
    }
  }, [params.section]);

  useEffect(() => {
    // Function to fetch company settings
    const fetchCompanySettings = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("id", "company")
          .single();

        if (error) {
          console.error("Error fetching company settings:", error);
        } else if (data && data.value) {
          // Set company name
          if (data.value.name) {
            setCompanyName(data.value.name);
          }
          
          // Set company logo
          if (data.value.logo) {
            setCompanyLogo('https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg');
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanySettings();
  }, []);

  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : companyLogo ? (
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg'
                className="h-8 w-8 object-contain"
                alt="Company Logo"
              />
            ) : (
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg'
                className="h-8 w-8 object-contain"
                alt="Company Logo"
              />
            )}
            <h1 className="text-xl font-semibold">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Loading...
                </span>
              ) : (
                `${companyName} Franchise Management`
              )}
            </h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="button-1"
            >
              ← Back to Dashboard
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <SettingsLayout 
        currentSection={settingsSection} 
        onSectionChange={handleSectionChange}
      >
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