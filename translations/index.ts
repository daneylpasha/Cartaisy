import en from "./en.json";

export type TranslationKey = string;

// Load translations
const translations = {
  en,
};

// Get translation by key (supports nested keys like "auth.login.title")
export const t = (key: TranslationKey): string => {
  const keys = key.split(".");
  let value: any = translations.en; // Default to English for now

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key if translation not found
    }
  }

  return typeof value === "string" ? value : key;
};

// Get array of translations (for categories, slides, etc.)
export const tArray = (key: TranslationKey): string[] => {
  const keys = key.split(".");
  let value: any = translations.en;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return [];
    }
  }

  return Array.isArray(value) ? value : [];
};

export default translations;
