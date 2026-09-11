export type CurrencyCode =
  | 'USD' | 'KES' | 'NGN' | 'GHS' | 'UGX' | 'TZS' | 'ZAR'
  | 'INR' | 'PHP' | 'PKR' | 'BRL' | 'MXN' | 'GBP' | 'EUR' | 'CAD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateFromUSD: number;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateFromUSD: 1, locale: 'en-US' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', rateFromUSD: 150, locale: 'en-KE' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', rateFromUSD: 1600, locale: 'en-NG' },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', flag: '🇬🇭', rateFromUSD: 15, locale: 'en-GH' },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', flag: '🇺🇬', rateFromUSD: 3800, locale: 'en-UG' },
  TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', flag: '🇹🇿', rateFromUSD: 2550, locale: 'en-TZ' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', rateFromUSD: 18.5, locale: 'en-ZA' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rateFromUSD: 83, locale: 'en-IN' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', rateFromUSD: 57, locale: 'en-PH' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰', rateFromUSD: 278, locale: 'en-PK' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', rateFromUSD: 5.1, locale: 'pt-BR' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', flag: '🇲🇽', rateFromUSD: 18.2, locale: 'es-MX' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateFromUSD: 0.79, locale: 'en-GB' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateFromUSD: 0.92, locale: 'en-IE' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', rateFromUSD: 1.36, locale: 'en-CA' },
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  'Kenya': 'KES', 'Nigeria': 'NGN', 'Ghana': 'GHS', 'Uganda': 'UGX',
  'Tanzania': 'TZS', 'South Africa': 'ZAR', 'India': 'INR',
  'Philippines': 'PHP', 'Pakistan': 'PKR', 'Brazil': 'BRL',
  'Mexico': 'MXN', 'United Kingdom': 'GBP', 'United States': 'USD',
  'Canada': 'CAD', 'Ireland': 'EUR', 'Germany': 'EUR', 'France': 'EUR',
};

export function currencyFromCountry(country: string | null): CurrencyCode {
  if (!country) return 'USD';
  return COUNTRY_TO_CURRENCY[country] || 'USD';
}

export function formatCurrency(amountUSD: number, currency: CurrencyCode): string {
  const info = CURRENCIES[currency];
  const converted = amountUSD * info.rateFromUSD;
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: info.code,
    maximumFractionDigits: converted < 100 ? 2 : 0,
  }).format(converted);
}
