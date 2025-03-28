// components/language-toggle.tsx
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Language, getCurrentLanguage } from "@/lib/i18n";

// Define available languages with labels
const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export function LanguageToggle() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  
  // Load language preference on component mount
  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
  }, []);

  // Change language and save to localStorage
  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    
    // Force a re-render of the application
    window.dispatchEvent(new Event('languageChange'));
    window.location.reload();

  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(lang => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => changeLanguage(lang.code as Language)}
            className={currentLanguage === lang.code ? "bg-accent font-medium" : ""}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}