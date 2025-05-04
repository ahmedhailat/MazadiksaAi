import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Auction } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export function ClosedAuctions() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const { data: auctions, isLoading, error } = useQuery<Auction[]>({
    queryKey: ["/api/auctions/closed"],
  });
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <tbody className="divide-y divide-gray-200">
          {Array(4).fill(null).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Skeleton className="w-10 h-10 rounded-md" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-5 w-24" />
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <Skeleton className="h-4 w-8" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-5 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      );
    }
    
    if (error) {
      return (
        <tbody>
          <tr>
            <td colSpan={5} className="px-6 py-10 text-center text-destructive">
              Failed to load closed auctions. Please try again later.
            </td>
          </tr>
        </tbody>
      );
    }
    
    if (!auctions || auctions.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
              No closed auctions available at the moment.
            </td>
          </tr>
        </tbody>
      );
    }
    
    return (
      <tbody className="divide-y divide-gray-200">
        {auctions.map((auction) => {
          const title = isArabic ? auction.titleAr : auction.title;
          const closedDate = new Date(auction.endTime);
          const formattedDate = formatDistanceToNow(closedDate, { 
            addSuffix: true,
            locale: isArabic ? ar : enUS
          });
          
          // In a real app, we would have category data to display
          // Here we'll just use the category ID
          const categoryLabel = `Category ${auction.categoryId}`;
          
          // In a real app, we would get the winner info from the user data
          // For now, we'll simulate a winner with first letter of winner ID
          const winnerInitial = auction.winnerId 
            ? String.fromCharCode(65 + (auction.winnerId % 26)) 
            : "?";
          
          return (
            <tr key={auction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <img
                    src={auction.imageUrl}
                    alt={title}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-xs text-gray-500">{categoryLabel}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-bold text-primary">
                {auction.currentPrice.toLocaleString()} {t("auctions.sar")}
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                {formattedDate}
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                {auction.bidCount}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium">{winnerInitial}.</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };
  
  return (
    <section className="py-12 md:py-16 bg-sand">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutralDark">
            {t("auctions.recentlyClosed")}
          </h2>
          <Link 
            href="/auctions?status=closed"
            className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors"
          >
            {t("common.viewAll")}
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Link>
        </div>
        
        {/* Auctions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-4 text-right">{t("auctions.product")}</th>
                <th className="px-6 py-4 text-right">{t("auctions.finalPrice")}</th>
                <th className="px-6 py-4 text-right hidden md:table-cell">{t("auctions.closeDate")}</th>
                <th className="px-6 py-4 text-right hidden md:table-cell">{t("auctions.bidCount")}</th>
                <th className="px-6 py-4 text-right">{t("auctions.winner")}</th>
              </tr>
            </thead>
            {renderContent()}
          </table>
        </div>
      </div>
    </section>
  );
}
