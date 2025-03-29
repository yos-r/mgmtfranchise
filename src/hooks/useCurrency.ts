import { useState, useEffect, createContext, useContext, createElement } from 'react';
import { supabase } from '@/lib/auth';

// Simple currency types
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CNY';

export interface CurrencySettings {
  code: CurrencyCode;
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCY_PRESETS = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    position: 'before',
    decimalPlaces: 0,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  USD: {
    code: 'USD',
    symbol: '$',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    position: 'before',
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  }
};

// Create context
const CurrencyContext = createContext(undefined);

// Provider component
export function CurrencyProvider(props) {
  const [settings, setSettings] = useState(CURRENCY_PRESETS.EUR);
  const [loading, setLoading] = useState(true);
  
  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('id', 'currency')
          .single();
          
        if (!error && data?.value?.code) {
          const code = data.value.code;
          if (CURRENCY_PRESETS[code]) {
            setSettings(CURRENCY_PRESETS[code]);
          }
        }
      } catch (err) {
        console.error('Error loading currency settings:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadSettings();
  }, []);
  
  // Update currency
  async function updateCurrency(code) {
    try {
      if (!CURRENCY_PRESETS[code]) return;
      
      await supabase
        .from('app_settings')
        .upsert({
          id: 'currency',
          value: { code }
        });
      
      setSettings(CURRENCY_PRESETS[code]);
    } catch (err) {
      console.error('Error updating currency:', err);
    }
  }
  
  // Format currency
  function formatCurrency(amount) {
    try {
      const { symbol, position, decimalPlaces, thousandsSeparator, decimalSeparator } = settings;
      
      // Format number
      const parts = amount.toFixed(decimalPlaces).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      
      const formattedNumber = parts.length > 1 
        ? parts.join(decimalSeparator)
        : parts[0];
        
      // Add symbol in correct position
      return position === 'before' 
        ? `${symbol}${formattedNumber}`
        : `${formattedNumber}${symbol}`;
    } catch (err) {
      return `${settings.symbol}${amount.toFixed(2)}`;
    }
  }
  
  // Create value object
  const value = {
    currencySettings: settings,
    isLoading: loading,
    updateCurrency,
    formatCurrency
  };
  
  // Render provider
  return createElement(
    CurrencyContext.Provider,
    { value },
    props.children
  );
}

// Hook to use currency
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}