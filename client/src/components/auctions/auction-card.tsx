import { useState } from "react";
import { Link } from "wouter";
import { Auction } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Heart, Gavel } from "lucide-react";
import { AuctionTimer } from "./auction-timer";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuctionCardProps {
  auction: Auction;
  isFavorited?: boolean;
}

export function AuctionCard({ auction, isFavorited = false }: AuctionCardProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const { toast } = useToast();
  
  const isArabic = i18n.language === 'ar';
  const title = isArabic ? auction.titleAr : auction.title;
  const description = isArabic ? auction.descriptionAr : auction.description;
  
  const getBadgeType = () => {
    if (auction.featured) return "exclusive";
    // Other badge types could be determined based on other auction properties
    return "rare";
  };
  
  const badgeType = getBadgeType();
  const badgeText = t(`auctions.${badgeType}`);
  const badgeClass = badgeType === "exclusive" ? "bg-primary" : "bg-secondary";
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (favorited) {
        await apiRequest("DELETE", `/api/favorites/${auction.id}`);
        return false;
      } else {
        await apiRequest("POST", "/api/favorites", { auctionId: auction.id });
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
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  
  return (
    <div className="auction-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/auctions/${auction.id}`}>
        <div className="relative">
          <img 
            src={auction.imageUrl} 
            alt={title} 
            className="w-full h-48 object-cover" 
          />
          <div className={`absolute top-0 left-0 ${badgeClass} text-white text-sm font-bold py-1 px-3 rounded-br-md`}>
            {badgeText}
          </div>
          
          {/* Favorite Button */}
          <button
            className={`absolute top-0 right-0 m-2 p-2 rounded-full bg-white bg-opacity-80 transition-colors
              ${favorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
          
          {/* Timer */}
          <div className="absolute bottom-0 left-0 right-0 bg-neutralDark bg-opacity-80 text-white text-center py-2 timer-box">
            <AuctionTimer endTime={auction.endTime} />
          </div>
        </div>
      </Link>
      
      {/* Content */}
      <div className="p-4">
        <Link href={`/auctions/${auction.id}`}>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        </Link>
        
        {/* Details */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xs text-gray-500">{t("auctions.currentPrice")}</span>
            <p className="text-lg font-bold text-primary">
              {auction.currentPrice.toLocaleString()} <span className="text-sm font-normal">{t("auctions.sar")}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">{t("auctions.bidCount")}</span>
            <p className="text-lg font-bold">{auction.bidCount}</p>
          </div>
        </div>
        
        {/* Bid Button */}
        <Link href={`/auctions/${auction.id}`}>
          <Button 
            className="bid-button w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-2 rounded-md transition-colors flex items-center justify-center space-x-2 space-x-reverse"
          >
            <Gavel className="h-4 w-4 mr-2" />
            <span>{t("auctions.bidNow")}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
