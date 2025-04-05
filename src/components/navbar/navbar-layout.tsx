import React, { ReactNode, useState, useEffect } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDropdown } from './settings-dropdown';
import { ThemeToggle } from '../theme-toggle';
import { LanguageToggle } from '../language-toggle';
import { CurrencyToggle } from '../currency-toggle';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarLayoutProps {
  children: ReactNode;
  title?: string;
}

export const NavbarLayout: React.FC<NavbarLayoutProps> = ({
  children,
  title
}) => {
  const [companyName, setCompanyName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentSection, setCurrentSection] = useState<"main" | "settings">("main");
  const [settingsSection, setSettingsSection] = useState<"security" | "profile" | "company" | "team" | "appearance" | "notifications">("profile");
  
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/' && location.pathname !== '/overview';

  useEffect(() => {
    // Function to fetch company name from app_settings
    const fetchCompanyName = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("id", "company")
          .single();

        if (error) {
          console.error("Error fetching company settings:", error);
          setCompanyName("Franchise Management");
        } else if (data && data.value && data.value.name) {
          setCompanyName(data.value.name);
        } else {
          setCompanyName("Franchise Management");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setCompanyName("Franchise Management");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyName();
  }, []);

  // Handle settings section changes internally
  const handleSettingsSectionChange = (section: "security" | "profile" | "company" | "team" | "appearance" | "notifications") => {
    setSettingsSection(section);
    setCurrentSection("settings");
    navigate('/settings');
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/');
  };

  // Compute the full title
  const fullTitle = title || `${companyName} Franchise Management`;

  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <img 
              src='https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg' 
              className='w-9 h-9' 
              alt="Company Logo"
            />

            <h1 className="text-xl font-semibold">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </div>
              ) : fullTitle}
            </h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {/* {showBackButton && (
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="button-1"
              >
                ← Back to Dashboard
              </Button>
            )} */}
            <SettingsDropdown
              
            />
            <ThemeToggle />
            <LanguageToggle />
            <CurrencyToggle />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </div>
  );
};