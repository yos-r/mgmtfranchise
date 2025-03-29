import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DollarSign, Euro, JapaneseYen, PoundSterling } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencyCode, CURRENCY_PRESETS } from '@/hooks/useCurrency';

export const CurrencyToggle = () => {
  const { currencySettings, updateCurrency, isLoading } = useCurrency();
  
  const currencies = [
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'JPY', label: 'Japanese Yen (¥)' },
    { code: 'CNY', label: 'Chinese Yuan (¥)' }
  ];

  // Get the appropriate icon based on current currency
  const getCurrencyIcon = () => {
    switch (currencySettings.code) {
      case 'EUR':
        return <Euro className="h-4 w-4" />;
      case 'GBP':
        return <PoundSterling className="h-4 w-4" />;
      case 'JPY':
      case 'CNY':
        return <JapaneseYen className="h-4 w-4" />;
      case 'USD':
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="none" size="icon" disabled={isLoading}>
          {getCurrencyIcon()}
          <span className="sr-only">Toggle currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => updateCurrency(currency.code as CurrencyCode)}
            className={
              currencySettings.code === currency.code ? 'bg-muted' : ''
            }
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">{CURRENCY_PRESETS[currency.code as CurrencyCode].symbol}</span>
              <span>{currency.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};