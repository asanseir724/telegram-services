import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import base translations
import translationEN from './locales/en/translation.json';
import translationFA from './locales/fa/translation.json';

// Define currency information for each language
export const currencyConfig = {
  en: {
    code: 'USD',
    symbol: '$',
    rate: 1, // Base rate (USD)
    format: (price: number) => `$${price.toFixed(2)}`
  },
  fa: {
    code: 'IRR',
    symbol: 'تومان',
    rate: 50000, // Example conversion rate (1 USD = 50,000 Toman)
    format: (price: number) => `${Math.round(price * 50000).toLocaleString('fa-IR')} تومان`
  }
};

// Initial resources with base translations
const resources = {
  en: {
    translation: translationEN
  },
  fa: {
    translation: translationFA
  }
};

// Function to deeply merge objects
function deepMerge(target: any, source: any) {
  const isObject = (obj: any) => obj && typeof obj === 'object';
  
  if (!isObject(target) || !isObject(source)) {
    return source;
  }
  
  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];
    
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = sourceValue;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = deepMerge({ ...targetValue }, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  
  return target;
}

// Function to set nested value in object using dot notation
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Initialize i18next with base translations first
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fa', // Set Persian as default language
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

// Function to load custom translations from the API
const loadCustomTranslations = async (language: string) => {
  try {
    const response = await fetch(`/api/translations/${language}`);
    if (response.ok) {
      const customTranslations = await response.json();
      
      // Convert flat custom translations to nested object
      const nestedCustomTranslations: Record<string, any> = {};
      
      Object.entries(customTranslations).forEach(([key, value]) => {
        setNestedValue(nestedCustomTranslations, key, value);
      });
      
      // Get the current translations for the language
      const currentTranslations = i18n.getResourceBundle(language, 'translation');
      
      // Merge custom translations with base translations
      const mergedTranslations = deepMerge({ ...currentTranslations }, nestedCustomTranslations);
      
      // Update the resources with merged translations
      i18n.addResourceBundle(language, 'translation', mergedTranslations, true, true);
    }
  } catch (error) {
    console.error(`Failed to load custom translations for ${language}:`, error);
  }
};

// Load custom translations for both languages
const initializeCustomTranslations = async () => {
  await Promise.all([
    loadCustomTranslations('en'),
    loadCustomTranslations('fa')
  ]);
};

// Initialize custom translations
initializeCustomTranslations();

export default i18n;