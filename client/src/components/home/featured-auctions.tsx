import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Auction } from "@shared/schema";
import { AuctionCard } from "@/components/auctions/auction-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export function FeaturedAuctions() {
  const { t } = useTranslation();
  
  const { data: auctions, isLoading, error } = useQuery<Auction[]>({
    queryKey: ["/api/auctions/featured"],
  });
  
  const renderContent = () => {
    if (isLoading) {
      return Array(3).fill(null).map((_, index) => (
        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
          <Skeleton className="w-full h-48" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex justify-between items-center mb-4">
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ));
    }
    
    if (error) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-destructive">
            Failed to load featured auctions. Please try again later.
          </p>
        </div>
      );
    }
    
    if (!auctions || auctions.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">
            No featured auctions available at the moment.
          </p>
        </div>
      );
    }
    
    return auctions.map((auction) => (
      <AuctionCard key={auction.id} auction={auction} />
    ));
  };
  
  return (
    <section className="py-12 md:py-16 bg-sand">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutralDark">
            {t("auctions.featuredAuctions")}
          </h2>
          <Link 
            href="/auctions"
            className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors"
          >
            {t("common.viewAll")}
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Link>
        </div>
        
        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderContent()}
        </div>
      </div>
    </section>
  );
}
