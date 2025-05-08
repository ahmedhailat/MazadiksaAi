// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18n without backend (we'll use inline resources)
i18n.use(initReactI18next).init({
  lng: 'ar', // Default language
  fallbackLng: 'ar',
  resources: {
    ar: {
      auth: {
        loginSuccess: "تم تسجيل الدخول بنجاح",
        loginError: "خطأ في تسجيل الدخول",
        registerSuccess: "تم التسجيل بنجاح",
        registerError: "خطأ في التسجيل",
        logoutSuccess: "تم تسجيل الخروج بنجاح",
        logoutError: "خطأ في تسجيل الخروج",
        passwordsNotMatch: "كلمات المرور غير متطابقة"
      }
    }
  },
  interpolation: {
    escapeValue: false // React already protects against XSS
  }
});

export default i18n;
