import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import sv from "./locales/sv.json";
import en from "./locales/en.json";

const savedLanguage = localStorage.getItem("bookwise-language");

const initialLanguage =
  savedLanguage === "en" || savedLanguage === "sv" ? savedLanguage : "sv";

i18n.use(initReactI18next).init({
  resources: {
    sv: {
      translation: sv,
    },
    en: {
      translation: en,
    },
  },
  lng: initialLanguage,
  fallbackLng: "sv",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  if (language === "sv" || language === "en") {
    localStorage.setItem("bookwise-language", language);
  }
});

export default i18n;
