import React, { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDropdown } from './settings-dropdown';
interface NavbarLayoutProps {
  children: ReactNode;
  setCurrentSection: React.Dispatch<React.SetStateAction<"main" | "settings">>;
  setSettingsSection?: React.Dispatch<React.SetStateAction<"security" | "profile" | "company" | "team" | "appearance" | "notifications">>;
  onBackClick?: () => void;
  backButtonText?: string;
  title?: string;
}

export const NavbarLayout: React.FC<NavbarLayoutProps> = ({
  children,
  setCurrentSection,
  setSettingsSection,
  onBackClick,
  backButtonText = '← Back to Dashboard',
  title = 'CENTURY 21 Franchise Management'
}) => {
  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <img src='https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg' className='w-10 h-10'></img>

            <h1 className="text-xl">{title}</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {onBackClick && (
              <Button
                variant="ghost"
                onClick={onBackClick}
                className="button-1"
              >
                {backButtonText}
              </Button>
            )}
            <SettingsDropdown
              setCurrentSection={setCurrentSection}
              setSettingsSection={setSettingsSection}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </div>
  );
};