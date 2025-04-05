import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { signOut } from '@/lib/auth'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';

export const SettingsDropdown = () => {
  const navigate = useNavigate();

  const settingsSections = [
    { label: 'Profil', section: 'profile' },
    // { label: 'Entreprise', section: 'company' },
    // { label: 'Équipe', section: 'team' },
    // { label: 'Apparence', section: 'appearance' },
    // { label: 'Notifications', section: 'notifications' },
    { label: 'Sécurité', section: 'security' }
  ];

  // Navigate directly to the settings page with the appropriate section
  const handleSectionChange = (section: string) => {
    navigate(`/settings/${section}`);
  };
    
  const handleSignOut = () => {
    signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className='cursor-pointer'>
        <DropdownMenuLabel className="label-1">Paramètres</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {settingsSections.map((item) => (
          <DropdownMenuItem 
            key={item.section}
            onClick={() => handleSectionChange(item.section)} 
            className="body-1 cursor-pointer"
          >
            {item.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="body-1 cursor-pointer"
        >
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};