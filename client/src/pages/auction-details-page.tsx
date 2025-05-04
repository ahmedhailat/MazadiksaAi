import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Auction, Bid, Category } from "@shared/schema";
import { AuctionTimer } from "@/components/auctions/auction-timer";
import { Loader2, Heart, ArrowRight, Clock, GavelIcon, User, DollarSign, BarChart, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AuctionDetailsPage() {
  const { t, i18n } = useTranslation();
  const [, params] = useRoute('/auctions/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  
  const auctionId = parseInt(params?.id || '0', 10);
  const isArabic = i18n.language === 'ar';
  
  // Fetch auction details
  const { 
    data: auction, 
    isLoading: isAuctionLoading, 
    error: auctionError,
    refetch: refetchAuction
  } = useQuery<Auction>({
    queryKey: [`/api/auctions/${auctionId}`],
    enabled: auctionId > 0,
  });
  
  // Fetch bids for this auction
  const { 
    data: bids, 
    isLoading: isBidsLoading,
    refetch: refetchBids
  } = useQuery<Bid[]>({
    queryKey: [`/api/auctions/${auctionId}/bids`],
    enabled: auctionId > 0,
  });
  
  // Fetch category
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const category = categories?.find(c => auction?.categoryId === c.id);
  
  // Check if auction is expired
  const isExpired = auction?.endTime ? new Date(auction.endTime) < new Date() : false;
  const isWinner = auction?.winnerId === user?.id;
  
  // Define bid schema
  const bidSchema = z.object({
    amount: z.coerce.number()
      .min(
        auction?.currentPrice ? auction.currentPrice + (auction.minBidIncrement || 0) : 0,
        t("auctions.bidTooLow", { 
          minAmount: auction?.currentPrice ? 
            (auction.currentPrice + (auction.minBidIncrement || 0)).toLocaleString() : 0 
        })
      )
  });
  
  // Bid form
  const form = useForm<z.infer<typeof bidSchema>>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: auction?.currentPrice ? auction.currentPrice + (auction.minBidIncrement || 0) : 0,
    },
  });
  
  // Update default values when auction data is loaded
  useEffect(() => {
    if (auction) {
      form.reset({
        amount: auction.currentPrice + (auction.minBidIncrement || 0),
      });
    }
  }, [auction, form]);
  
  // Favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !auction) return;
      
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${auction.id}`);
        return false;
      } else {
        await apiRequest("POST", "/api/favorites", { auctionId: auction.id });
        return true;
      }
    },
    onSuccess: (newState) => {
      if (newState !== undefined) {
        setIsFavorited(newState);
        
        toast({
          title: newState 
            ? t("auctions.addedToFavorites") 
            : t("auctions.removedFromFavorites"),
          description: newState 
            ? t("auctions.addedToFavoritesDesc") 
            : t("auctions.removedFromFavoritesDesc"),
        });
      }
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bidSchema>) => {
      if (!user || !auction) return;
      
      await apiRequest("POST", "/api/bids", {
        auctionId: auction.id,
        amount: data.amount,
      });
    },
    onSuccess: () => {
      toast({
        title: t("auctions.bidPlaced"),
        description: t("auctions.bidPlacedDesc"),
      });
      
      // Close bid dialog
      setBidDialogOpen(false);
      
      // Refetch auction and bids
      refetchAuction();
      refetchBids();
      
      // Reset form
      form.reset({
        amount: auction ? auction.currentPrice + (auction.minBidIncrement || 0) : 0,
      });
    },
    onError: (error) => {
      toast({
        title: t("auctions.bidFailed"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        title: t("common.authRequired"),
        description: t("common.loginToFavorite"),
        variant: "destructive",
      });
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };
  
  const onBidSubmit = (data: z.infer<typeof bidSchema>) => {
    if (!user) {
      toast({
        title: t("common.authRequired"),
        description: t("common.loginToBid"),
        variant: "destructive",
      });
      return;
    }
    
    placeBidMutation.mutate(data);
  };
  
  // Set page title
  useEffect(() => {
    if (auction) {
      document.title = `${isArabic ? auction.titleAr : auction.title} | مزاد KSA`;
    } else {
      document.title = `${t("common.loading")} | مزاد KSA`;
    }
  }, [auction, isArabic, t]);
  
  // Handle loading state
  if (isAuctionLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-sand py-10">
          <div className="container mx-auto px-4 flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Handle error state
  if (auctionError || !auction) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-sand py-10">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-neutralDark mb-2">
                {t("common.auctionNotFound")}
              </h1>
              <p className="text-gray-600 mb-6">
                {t("common.auctionNotFoundDesc")}
              </p>
              <Button onClick={() => navigate("/auctions")}>
                <ArrowRight className="h-4 w-4 ml-2" />
                {t("common.backToAuctions")}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  const title = isArabic ? auction.titleAr : auction.title;
  const description = isArabic ? auction.descriptionAr : auction.description;
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-sand py-10">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/">
              <a className="hover:text-primary transition-colors">{t("common.home")}</a>
            </Link>
            <span className="mx-2">/</span>
            <Link href="/auctions">
              <a className="hover:text-primary transition-colors">{t("common.activeAuctions")}</a>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary font-medium">{title}</span>
          </div>
          
          {/* Auction Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="relative">
                  <img 
                    src={auction.imageUrl} 
                    alt={title}
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 ${
                    auction.status === 'active' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  } text-white text-sm font-bold py-2 px-4 rounded-md`}>
                    {auction.status === 'active' 
                      ? t("common.active") 
                      : t("common.closed")}
                  </div>
                  
                  {/* Favorite Button */}
                  <button
                    className={`absolute top-4 left-4 p-2 rounded-full bg-white shadow-md transition-colors
                      ${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={handleFavoriteClick}
                    disabled={toggleFavoriteMutation.isPending}
                  >
                    <Heart className={`h-6 w-6 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                {/* Auction Details */}
                <div className="p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-neutralDark mb-2">
                    {title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-x-4 gap-y-2">
                    {/* Category */}
                    {category && (
                      <Link href={`/auctions?category=${category.id}`}>
                        <a className="hover:text-primary transition-colors flex items-center">
                          <BarChart className="h-4 w-4 mr-1" />
                          {isArabic ? category.nameAr : category.nameEn}
                        </a>
                      </Link>
                    )}
                    
                    {/* Bid Count */}
                    <span className="flex items-center">
                      <GavelIcon className="h-4 w-4 mr-1" />
                      {auction.bidCount} {t("auctions.bids")}
                    </span>
                    
                    {/* End Time */}
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {isExpired 
                        ? t("auctions.auctionEnded") 
                        : t("auctions.endsIn")}
                    </span>
                  </div>
                  
                  <Tabs defaultValue="description" className="mt-6">
                    <TabsList>
                      <TabsTrigger value="description">{t("common.description")}</TabsTrigger>
                      <TabsTrigger value="details">{t("common.details")}</TabsTrigger>
                      <TabsTrigger value="bids">
                        {t("common.bidHistory")} ({bids?.length || 0})
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Description Tab */}
                    <TabsContent value="description" className="mt-4">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">{description}</p>
                      </div>
                    </TabsContent>
                    
                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm text-gray-500 mb-1">{t("auctions.startingPrice")}</h3>
                            <p className="font-medium">{auction.startingPrice.toLocaleString()} {t("auctions.sar")}</p>
                          </div>
                          <div>
                            <h3 className="text-sm text-gray-500 mb-1">{t("auctions.startTime")}</h3>
                            <p className="font-medium">
                              {new Date(auction.startTime).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm text-gray-500 mb-1">{t("auctions.auctionId")}</h3>
                            <p className="font-medium">#{auction.id}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm text-gray-500 mb-1">{t("auctions.minBid")}</h3>
                            <p className="font-medium">{auction.minBidIncrement.toLocaleString()} {t("auctions.sar")}</p>
                          </div>
                          <div>
                            <h3 className="text-sm text-gray-500 mb-1">{t("auctions.endTime")}</h3>
                            <p className="font-medium">
                              {new Date(auction.endTime).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm text-gray-500 mb-1">{t("auctions.status")}</h3>
                            <p className={`font-medium ${auction.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                              {auction.status === 'active' ? t("common.active") : t("common.closed")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Bids Tab */}
                    <TabsContent value="bids" className="mt-4">
                      {isBidsLoading ? (
                        <div className="py-10 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>{t("common.loading")}</p>
                        </div>
                      ) : bids?.length === 0 ? (
                        <div className="py-10 text-center">
                          <p className="text-gray-500">{t("auctions.noBidsYet")}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bids?.map(bid => {
                            const bidTime = new Date(bid.createdAt);
                            const timeAgo = formatDistanceToNow(bidTime, { 
                              addSuffix: true,
                              locale: isArabic ? ar : enUS
                            });
                            
                            return (
                              <div 
                                key={bid.id}
                                className="flex items-center justify-between p-3 border border-gray-100 rounded-md"
                              >
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarFallback className="bg-primary text-white">
                                      {bid.userId.toString().slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {isArabic ? 'مستخدم' : 'User'} #{bid.userId}
                                      {bid.userId === user?.id && ` (${t("common.you")})`}
                                    </p>
                                    <p className="text-xs text-gray-500">{timeAgo}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-primary">
                                  {bid.amount.toLocaleString()} {t("auctions.sar")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
            
            {/* Right Column - Bid Section */}
            <div className="lg:col-span-1">
              {/* Current Price Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t("auctions.currentPrice")}</CardTitle>
                  <CardDescription>{t("auctions.highestBid")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {auction.currentPrice.toLocaleString()} <span className="text-base font-normal">{t("auctions.sar")}</span>
                  </div>
                  
                  {/* Time Remaining */}
                  {!isExpired ? (
                    <div className="bg-gray-100 p-4 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">{t("auctions.timeRemaining")}</div>
                        <div className="font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <AuctionTimer endTime={auction.endTime} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">{t("auctions.auctionStatus")}</div>
                        <div className="font-medium text-red-500">{t("auctions.auctionEnded")}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-gray-500">
                  <span>{t("auctions.bidCount")}: {auction.bidCount}</span>
                  <span>{t("auctions.minBid")}: {auction.minBidIncrement.toLocaleString()} {t("auctions.sar")}</span>
                </CardFooter>
              </Card>
              
              {/* Bid Button or Winner Notification */}
              {isExpired ? (
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle>{t("auctions.auctionEnded")}</CardTitle>
                    <CardDescription>
                      {t("auctions.auctionEndedOn", { 
                        date: new Date(auction.endTime).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isWinner ? (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-md flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-700 mb-1">{t("auctions.congratulations")}</p>
                          <p className="text-sm text-green-600">{t("auctions.youWonAuction")}</p>
                        </div>
                      </div>
                    ) : auction.winnerId ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 mb-2">{t("auctions.auctionWonBy")}</p>
                        <div className="flex justify-center">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-white">
                              {auction.winnerId.toString().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <p className="mt-2 font-medium">
                          {isArabic ? 'مستخدم' : 'User'} #{auction.winnerId}
                        </p>
                        <p className="text-primary font-bold mt-1">
                          {auction.currentPrice.toLocaleString()} {t("auctions.sar")}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">{t("auctions.noWinnerDetermined")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("auctions.placeYourBid")}</CardTitle>
                    <CardDescription>
                      {t("auctions.minimumBidAmount", { 
                        amount: (auction.currentPrice + auction.minBidIncrement).toLocaleString()
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-secondary hover:bg-secondary-dark">
                          <GavelIcon className="h-4 w-4 mr-2" />
                          {t("auctions.bidNow")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("auctions.confirmBid")}</DialogTitle>
                          <DialogDescription>
                            {t("auctions.confirmBidDesc")}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onBidSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auctions.bidAmount")}</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                      <Input 
                                        type="number" 
                                        className="pl-10" 
                                        {...field} 
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    {t("auctions.currentBid")}: {auction.currentPrice.toLocaleString()} {t("auctions.sar")}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                className="bg-secondary hover:bg-secondary-dark"
                                disabled={placeBidMutation.isPending}
                              >
                                {placeBidMutation.isPending && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                {t("auctions.placeBid")}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    {!user && (
                      <div className="mt-4 text-sm text-gray-500 text-center">
                        {t("auctions.loginToBid")}{" "}
                        <Link href="/auth">
                          <a className="text-primary hover:underline font-medium">
                            {t("common.login")}
                          </a>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-gray-500 flex flex-col items-start space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {t("auctions.bidsProcessedInstantly")}
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t("auctions.allBidsFinal")}
                    </div>
                  </CardFooter>
                </Card>
              )}
              
              {/* Seller Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t("auctions.seller")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-primary text-white">
                        {auction.sellerId.toString().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {isArabic ? 'مستخدم' : 'User'} #{auction.sellerId}
                      </p>
                      <p className="text-xs text-gray-500">{t("auctions.verifiedSeller")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
