import { useTranslation } from 'react-i18next';
import { currencyConfig } from '../i18n';

interface UseCurrencyReturn {
  /**
   * Format a price based on the current language
   * For EN: Formats in USD ($)
   * For FA: Formats in Toman with Persian digits
   */
  formatPrice: (price: number) => string;
  
  /**
   * Get the currency symbol for the current language
   */
  currencySymbol: string;
  
  /**
   * Get the currency code for the current language
   */
  currencyCode: string;
  
  /**
   * Get the conversion rate compared to USD
   */
  conversionRate: number;
}

/**
 * A hook that provides currency formatting based on the current language
 * EN: USD ($)
 * FA: Toman (تومان)
 */
export function useCurrency(): UseCurrencyReturn {
  const { i18n } = useTranslation();
  const language = i18n.language as 'en' | 'fa';
  
  // Use language-specific currency configuration
  const config = currencyConfig[language] || currencyConfig.en;
  
  return {
    formatPrice: config.format,
    currencySymbol: config.symbol,
    currencyCode: config.code,
    conversionRate: config.rate
  };
}