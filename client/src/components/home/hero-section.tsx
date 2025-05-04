import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLocation } from "wouter";

export function HeroSection() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <section className="relative bg-neutral-dark overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=1500&h=500&fit=crop"
          alt="صورة المزاد الرئيسية"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight mb-4">
            <span className="text-secondary font-playfair">
              {t("hero.title")}
            </span>
            <br />
            {t("hero.subtitle")}
          </h1>
          <p className="text-white text-lg md:text-xl mb-8 opacity-90">
            {t("hero.description")}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="flex flex-col md:flex-row items-center bg-white bg-opacity-10 backdrop-blur-md p-1 rounded-lg border border-white border-opacity-20">
              <div className="flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  className="w-full py-3 px-5 bg-transparent text-white placeholder-white placeholder-opacity-75 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-auto mt-2 md:mt-0">
                <Button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-6 rounded-md transition-colors"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t("hero.searchButton")}
                </Button>
              </div>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap justify-start gap-x-8 gap-y-4">
            <div className="text-white">
              <p className="text-2xl md:text-3xl font-bold text-secondary">+1,500</p>
              <p className="text-sm opacity-75">{t("hero.activeAuctions")}</p>
            </div>
            <div className="text-white">
              <p className="text-2xl md:text-3xl font-bold text-secondary">+25,000</p>
              <p className="text-sm opacity-75">{t("hero.registeredUsers")}</p>
            </div>
            <div className="text-white">
              <p className="text-2xl md:text-3xl font-bold text-secondary">+10</p>
              <p className="text-sm opacity-75">{t("hero.totalValue")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
