
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  };
  
  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
    document.documentElement.setAttribute('dir', i18n.language === 'ar' ? 'rtl' : 'ltr');
  }, [i18n.language]);
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className={`flex items-center gap-2 ${className}`}
    >
      <span>{i18n.language === 'ar' ? '🇸🇦' : '🇬🇧'}</span>
      {t('common.language')}
    </Button>
  );
}
