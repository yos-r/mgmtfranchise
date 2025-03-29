export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CNY'; // Add more as needed

export interface CurrencySettings {
  code: CurrencyCode;
  symbol: string;
  position: 'before' | 'after'; // Whether symbol comes before or after the amount
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCY_PRESETS: Record<CurrencyCode, CurrencySettings> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    position: 'before',
    decimalPlaces: 2,
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
