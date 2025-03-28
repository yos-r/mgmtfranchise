// components/language-wrapper.tsx
import { ReactNode, useState, useEffect } from "react";
import { getCurrentLanguage } from "@/lib/i18n";

interface LanguageWrapperProps {
  children: ReactNode;
}

export function LanguageWrapper({ children }: LanguageWrapperProps) {
  const [, setLanguage] = useState(getCurrentLanguage());
  
  // This forces a re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(getCurrentLanguage());
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);
  
  return <>{children}</>;
}