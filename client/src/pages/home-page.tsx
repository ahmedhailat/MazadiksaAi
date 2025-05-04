import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedAuctions } from "@/components/home/featured-auctions";
import { CategorySection } from "@/components/home/category-section";
import { HighlightedAuction } from "@/components/home/highlighted-auction";
import { ClosedAuctions } from "@/components/home/closed-auctions";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { Newsletter } from "@/components/home/newsletter";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t, i18n } = useTranslation();
  
  // Set the page title
  useEffect(() => {
    document.title = "مزادي KSA | المزاد الإلكتروني الفاخر في المملكة العربية السعودية";
  }, []);

  return (
    <>
      <Helmet>
        <html lang={i18n.language} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} />
        <meta name="description" content="منصة مزادي KSA - المنصة الرائدة للمزادات الإلكترونية الفاخرة في المملكة العربية السعودية. اكتشف قطع نادرة ومميزة واشترك في المزايدة اليوم!" />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <HeroSection />
          <FeaturedAuctions />
          <CategorySection />
          <HighlightedAuction />
          <ClosedAuctions />
          <HowItWorks />
          <Testimonials />
          <Newsletter />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
