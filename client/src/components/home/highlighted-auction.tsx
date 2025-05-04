import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Auction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel, Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuctionTimer } from "@/components/auctions/auction-timer";

export function HighlightedAuction() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorited, setFavorited] = useState(false);
  
  const { data: featuredAuctions, isLoading, error } = useQuery<Auction[]>({
    queryKey: ["/api/auctions/featured"],
  });
  
  // Use the first highlighted auction, or return null if none
  const highlightedAuction = featuredAuctions && featuredAuctions.length > 0 
    ? featuredAuctions[0] 
    : null;
  
  const isArabic = i18n.language === 'ar';
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!highlightedAuction) return false;
      
      if (favorited) {
        await apiRequest("DELETE", `/api/favorites/${highlightedAuction.id}`);
        return false;
      } else {
        await apiRequest("POST", "/api/favorites", { auctionId: highlightedAuction.id });
        return true;
      }
    },
    onSuccess: (newState) => {
      setFavorited(newState);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
      toast({
        title: newState 
          ? "Added to favorites" 
          : "Removed from favorites",
        description: newState 
          ? "This auction has been added to your favorites." 
          : "This auction has been removed from your favorites."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to favorites",
        variant: "destructive"
      });
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col md:flex-row animate-pulse">
          {/* Left Column - Image Skeleton */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Skeleton className="w-full h-[400px]" />
            </div>
          </div>
          
          {/* Right Column - Info Skeleton */}
          <div className="w-full md:w-1/2 md:pr-12">
            <div className="h-full flex flex-col justify-center">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-6" />
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
                <Skeleton className="h-12 w-full md:w-1/3" />
                <Skeleton className="h-12 w-full md:w-1/3" />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (error || !highlightedAuction) {
      return (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            {error 
              ? "Failed to load highlighted auction. Please try again later." 
              : "No highlighted auction available at the moment."}
          </p>
        </div>
      );
    }
    
    const title = isArabic ? highlightedAuction.titleAr : highlightedAuction.title;
    const description = isArabic ? highlightedAuction.descriptionAr : highlightedAuction.description;
    
    return (
      <div className="flex flex-col md:flex-row">
        {/* Left Column - Image */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img 
              src={highlightedAuction.imageUrl} 
              alt={title} 
              className="w-full h-auto" 
            />
            {/* Auction Badge */}
            <div className="absolute top-4 right-4 bg-secondary text-white text-sm font-bold py-2 px-4 rounded-md">
              {t("auctions.highlightedAuction")}
            </div>
          </div>
        </div>
        
        {/* Right Column - Auction Info */}
        <div className="w-full md:w-1/2 md:pr-12">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-white text-2xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
            
            <p className="text-white opacity-80 mb-6">
              {description}
            </p>
            
            {/* Auction Details */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="border-r border-white border-opacity-20 pl-4">
                <p className="text-secondary font-bold text-xl md:text-2xl">
                  {highlightedAuction.currentPrice.toLocaleString()} {t("auctions.sar")}
                </p>
                <p className="text-white text-sm opacity-70">{t("auctions.currentPrice")}</p>
              </div>
              <div>
                <p className="text-secondary font-bold text-xl md:text-2xl">
                  {highlightedAuction.bidCount}
                </p>
                <p className="text-white text-sm opacity-70">{t("auctions.bidCount")}</p>
              </div>
              <div className="border-r border-white border-opacity-20 pl-4">
                <p className="text-secondary font-bold text-xl md:text-2xl">
                  <AuctionTimer endTime={highlightedAuction.endTime} />
                </p>
                <p className="text-white text-sm opacity-70">{t("auctions.timeRemaining")}</p>
              </div>
              <div>
                <p className="text-secondary font-bold text-xl md:text-2xl">
                  {highlightedAuction.minBidIncrement.toLocaleString()} {t("auctions.sar")}
                </p>
                <p className="text-white text-sm opacity-70">{t("auctions.minBid")}</p>
              </div>
            </div>
            
            {/* Bid Controls */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
              <Link href={`/auctions/${highlightedAuction.id}`}>
                <Button className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-6 rounded-md transition-colors">
                  <Gavel className="mr-2 h-4 w-4" />
                  {t("auctions.bidNow")}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full bg-transparent hover:bg-white hover:bg-opacity-10 text-white border border-white border-opacity-40 font-medium py-3 px-6 rounded-md transition-colors"
                onClick={handleFavoriteClick}
              >
                <Heart 
                  className={`mr-2 h-4 w-4 ${favorited ? 'fill-current' : ''}`} 
                />
                {t("auctions.addToFavorites")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <section className="relative py-16 md:py-24 bg-neutralDark overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1500&h=500&fit=crop" 
          alt="صورة المزاد الرئيسية" 
          className="w-full h-full object-cover opacity-30" 
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {renderContent()}
      </div>
    </section>
  );
}
