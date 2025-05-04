import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuctionCard } from "@/components/auctions/auction-card";
import { Auction, Category } from "@shared/schema";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

type FilterState = {
  categoryId?: string;
  priceRange: [number, number];
  status: string;
  sortBy: string;
  search: string;
};

export default function AuctionsPage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/auctions');
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  
  // Parse query parameters
  const initialCategoryId = searchParams.get('category') || undefined;
  const initialStatus = searchParams.get('status') || 'active';
  const initialSearch = searchParams.get('q') || '';
  
  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    categoryId: initialCategoryId,
    priceRange: [0, 1000000], // Default price range
    status: initialStatus,
    sortBy: 'newest',
    search: initialSearch,
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch auctions
  const { data: allAuctions, isLoading: isAuctionsLoading } = useQuery<Auction[]>({
    queryKey: ['/api/auctions'],
  });
  
  // Filter auctions based on current filters
  const filteredAuctions = allAuctions ? allAuctions.filter(auction => {
    // Filter by status
    if (filters.status === 'active' && auction.status !== 'active') return false;
    if (filters.status === 'closed' && auction.status !== 'closed') return false;
    
    // Filter by category
    if (filters.categoryId && auction.categoryId !== parseInt(filters.categoryId)) return false;
    
    // Filter by price range
    if (auction.currentPrice < filters.priceRange[0] || 
        auction.currentPrice > filters.priceRange[1]) return false;
    
    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        auction.title.toLowerCase().includes(searchLower) ||
        auction.titleAr.toLowerCase().includes(searchLower) ||
        auction.description.toLowerCase().includes(searchLower) ||
        auction.descriptionAr.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }) : [];
  
  // Sort auctions
  const sortedAuctions = [...(filteredAuctions || [])].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priceAsc':
        return a.currentPrice - b.currentPrice;
      case 'priceDesc':
        return b.currentPrice - a.currentPrice;
      case 'bidsDesc':
        return b.bidCount - a.bidCount;
      default:
        return 0;
    }
  });
  
  // Paginate auctions
  const totalPages = Math.ceil((sortedAuctions?.length || 0) / itemsPerPage);
  const displayedAuctions = sortedAuctions?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calculate maximum price for range slider
  const maxPrice = allAuctions?.reduce((max, auction) => 
    auction.currentPrice > max ? auction.currentPrice : max, 0) || 1000000;
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: (e.target as HTMLFormElement).search.value }));
    setCurrentPage(1);
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, categoryId: value === 'all' ? undefined : value }));
    setCurrentPage(1);
  };
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
    setCurrentPage(1);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
    setCurrentPage(1);
  };
  
  // Handle price range change
  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }));
    setCurrentPage(1);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      categoryId: undefined,
      priceRange: [0, maxPrice],
      status: 'active',
      sortBy: 'newest',
      search: '',
    });
    setCurrentPage(1);
  };
  
  // Set page title
  useEffect(() => {
    document.title = `${t("common.activeAuctions")} | مزاد KSA`;
  }, [t]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sand py-10">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutralDark mb-2">
              {filters.status === 'active' 
                ? t("common.activeAuctions") 
                : t("common.closedAuctions")}
            </h1>
            <p className="text-gray-600">
              {t("auctions.browseDescription")}
            </p>
          </div>
          
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="w-full md:w-1/3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    name="search"
                    placeholder={t("hero.searchPlaceholder")}
                    className="pr-10 pl-12"
                    defaultValue={filters.search}
                  />
                </div>
              </form>
              
              {/* Filters for Desktop */}
              <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                {/* Category Filter */}
                <Select 
                  value={filters.categoryId || 'all'} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("common.categories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.allCategories")}</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Status Filter */}
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t("common.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("common.active")}</SelectItem>
                    <SelectItem value="closed">{t("common.closed")}</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Sort By */}
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t("common.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t("common.newest")}</SelectItem>
                    <SelectItem value="oldest">{t("common.oldest")}</SelectItem>
                    <SelectItem value="priceAsc">{t("common.priceAsc")}</SelectItem>
                    <SelectItem value="priceDesc">{t("common.priceDesc")}</SelectItem>
                    <SelectItem value="bidsDesc">{t("common.mostBids")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Mobile Filters Button */}
              <div className="flex md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="mr-2 h-4 w-4" />
                      {t("common.filters")}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>{t("common.filters")}</SheetTitle>
                      <SheetDescription>
                        {t("common.adjustFilters")}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-6">
                      {/* Category Filter */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">{t("common.categories")}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                              id="all-categories" 
                              checked={!filters.categoryId} 
                              onCheckedChange={() => handleCategoryChange('all')}
                            />
                            <Label htmlFor="all-categories">{t("common.allCategories")}</Label>
                          </div>
                          {categories?.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox 
                                id={`category-${category.id}`} 
                                checked={filters.categoryId === category.id.toString()} 
                                onCheckedChange={() => handleCategoryChange(category.id.toString())}
                              />
                              <Label htmlFor={`category-${category.id}`}>{category.nameAr}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Status Filter */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">{t("common.status")}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                              id="status-active" 
                              checked={filters.status === 'active'} 
                              onCheckedChange={() => handleStatusChange('active')}
                            />
                            <Label htmlFor="status-active">{t("common.active")}</Label>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                              id="status-closed" 
                              checked={filters.status === 'closed'} 
                              onCheckedChange={() => handleStatusChange('closed')}
                            />
                            <Label htmlFor="status-closed">{t("common.closed")}</Label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Price Range */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">{t("common.priceRange")}</h3>
                        <div className="space-y-4">
                          <Slider 
                            min={0} 
                            max={maxPrice} 
                            step={1000} 
                            value={filters.priceRange}
                            onValueChange={handlePriceRangeChange}
                          />
                          <div className="flex justify-between">
                            <span>{filters.priceRange[0]} {t("auctions.sar")}</span>
                            <span>{filters.priceRange[1]} {t("auctions.sar")}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Sort By */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">{t("common.sortBy")}</h3>
                        <Select value={filters.sortBy} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("common.sortBy")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">{t("common.newest")}</SelectItem>
                            <SelectItem value="oldest">{t("common.oldest")}</SelectItem>
                            <SelectItem value="priceAsc">{t("common.priceAsc")}</SelectItem>
                            <SelectItem value="priceDesc">{t("common.priceDesc")}</SelectItem>
                            <SelectItem value="bidsDesc">{t("common.mostBids")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex space-x-2 space-x-reverse pt-4">
                        <SheetClose asChild>
                          <Button className="flex-1 bg-primary hover:bg-primary-dark">
                            {t("common.applyFilters")}
                          </Button>
                        </SheetClose>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={resetFilters}
                        >
                          {t("common.resetFilters")}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              {t("common.showing")} {displayedAuctions?.length || 0} {t("common.of")} {filteredAuctions?.length || 0} {t("common.auctions")}
            </p>
            
            {/* Reset Filters Button - Desktop */}
            <div className="hidden md:block">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="text-sm"
              >
                {t("common.resetFilters")}
              </Button>
            </div>
          </div>
          
          {/* Auctions Grid */}
          {isAuctionsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : displayedAuctions?.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h3 className="text-xl font-bold text-neutralDark mb-2">
                {t("common.noAuctionsFound")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("common.tryAdjustingFilters")}
              </p>
              <Button onClick={resetFilters}>
                {t("common.resetFilters")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {displayedAuctions?.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {/* First page */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis */}
                {currentPage > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {/* Pages around current */}
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = Math.min(
                    Math.max(currentPage - 1, 1) + i,
                    totalPages
                  );
                  
                  // Skip if we're showing the first or last page separately
                  if (
                    (currentPage > 3 && pageNum === 1) ||
                    (currentPage < totalPages - 2 && pageNum === totalPages)
                  ) {
                    return null;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {/* Ellipsis */}
                {currentPage < totalPages - 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
