import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
  const { t } = useTranslation();
  
  const steps = [
    {
      number: "١", // Arabic numeral 1
      titleKey: "howItWorks.step1Title",
      descriptionKey: "howItWorks.step1Description",
    },
    {
      number: "٢", // Arabic numeral 2
      titleKey: "howItWorks.step2Title",
      descriptionKey: "howItWorks.step2Description",
    },
    {
      number: "٣", // Arabic numeral 3
      titleKey: "howItWorks.step3Title",
      descriptionKey: "howItWorks.step3Description",
    },
  ];
  
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutralDark mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("howItWorks.description")}
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3">{t(step.titleKey)}</h3>
              <p className="text-gray-600">{t(step.descriptionKey)}</p>
            </div>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="text-center mt-12">
          <Link href="/auth">
            <Button className="bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-8 rounded-md transition-colors">
              {t("howItWorks.registerNow")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
