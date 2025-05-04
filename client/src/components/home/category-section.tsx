import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export function CategorySection() {
  const { t } = useTranslation();
  
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const renderContent = () => {
    if (isLoading) {
      return Array(4).fill(null).map((_, index) => (
        <div key={index} className="relative rounded-lg overflow-hidden shadow-md h-36 md:h-48">
          <Skeleton className="w-full h-full" />
        </div>
      ));
    }
    
    if (error) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-destructive">
            Failed to load categories. Please try again later.
          </p>
        </div>
      );
    }
    
    if (!categories || categories.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">
            No categories available at the moment.
          </p>
        </div>
      );
    }
    
    return categories.map((category) => (
      <div key={category.id} className="block">
        <Link href={`/auctions?category=${category.id}`} className="group block">
          <div className="relative rounded-lg overflow-hidden shadow-md h-36 md:h-48">
            <img 
              src={category.imageUrl || "https://via.placeholder.com/400x300?text=Category"} 
              alt={category.nameAr} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark to-transparent opacity-80"></div>
            <div className="absolute bottom-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg">{category.nameAr}</h3>
              <p className="text-white text-sm opacity-75">+{category.auctionCount || 0} مزاد</p>
            </div>
          </div>
        </Link>
      </div>
    ));
  };
  
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutralDark">
            {t("auctions.browseByCategory")}
          </h2>
          <Link 
            href="/categories"
            className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors"
          >
            {t("common.viewAll")}
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Link>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {renderContent()}
        </div>
      </div>
    </section>
  );
}
