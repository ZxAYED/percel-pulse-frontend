import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: "Dashboard",
        map: "Map",
        book: "Book pickup",
        history: "History",
        tasks: "Tasks & COD",
        overview: "Overview",
        parcels: "Parcels",
        users: "Users",
        assignments: "Assignments",
        reports: "Reports",
        route: "Route Map",
      },
      actions: {
        logout: "Logout",
        language: "Language",
      },
      role: "Role",
    },
  },
  bn: {
    translation: {
      nav: {
        dashboard: "ড্যাশবোর্ড",
        map: "মানচিত্র",
        book: "বুকিং",
        history: "ইতিহাস",
        tasks: "কাজ ও COD",
        overview: "সংক্ষিপ্ত",
        parcels: "পার্সেল",
        users: "ব্যবহারকারী",
        assignments: "বরাদ্দ",
        reports: "রিপোর্ট",
        route: "রুট মানচিত্র",
      },
      actions: {
        logout: "লগআউট",
        language: "ভাষা",
      },
      role: "ভূমিকা",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
