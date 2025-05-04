import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  User, 
  Menu, 
  Gavel,
  LogOut
} from "lucide-react";

export function Header() {
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    { label: t("common.home"), path: "/" },
    { label: t("common.activeAuctions"), path: "/auctions" },
    { label: t("common.categories"), path: "/categories" },
    { label: t("common.closedAuctions"), path: "/auctions?status=closed" },
    { label: t("common.about"), path: "/about" },
    { label: t("common.contact"), path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <Gavel className="text-primary-dark text-2xl" />
              <span className="text-primary text-2xl font-bold">
                مزادي<span className="text-secondary">KSA</span>
              </span>
            </Link>
          </div>

          {/* Nav Menu - Desktop */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`font-medium py-2 transition-colors ${
                  location === item.path
                    ? "text-primary"
                    : "text-neutralDark hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Language Toggle */}
            <LanguageSwitcher className="text-neutralDark hover:text-primary transition-colors" />

            {/* Search */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <form onSubmit={handleSearch} className="p-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={t("hero.searchPlaceholder")}
                      className="flex-1 py-2 px-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit">
                      <Search className="h-4 w-4 mr-2" />
                      {t("common.search")}
                    </Button>
                  </div>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authentication */}
            {!user ? (
              <div className="hidden md:block">
                <Link href="/auth">
                  <Button variant="default" className="bg-primary text-white hover:bg-primary-dark">
                    {t("common.login")}
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Avatar>
                      <AvatarImage 
                        src={user.profileImage || ""} 
                        alt={user.username} 
                      />
                      <AvatarFallback className="bg-primary text-white">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.fullName || user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    {t("common.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center">
                      <Gavel className="text-primary-dark text-xl mr-2" />
                      <span className="text-primary text-xl font-bold">
                        مزادي<span className="text-secondary">KSA</span>
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  {menuItems.map((item, index) => (
                    <SheetClose asChild key={index}>
                      <Link
                        href={item.path}
                        className={`text-lg py-2 ${
                          location === item.path
                            ? "text-primary font-medium"
                            : "text-neutralDark"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    {!user ? (
                      <SheetClose asChild>
                        <Link href="/auth">
                          <Button className="w-full bg-primary text-white hover:bg-primary-dark">
                            {t("common.login")}
                          </Button>
                        </Link>
                      </SheetClose>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={user.profileImage || ""} 
                              alt={user.username} 
                            />
                            <AvatarFallback className="bg-primary text-white">
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName || user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <SheetClose asChild>
                          <Link href="/profile">
                            <Button variant="outline" className="w-full">
                              <User className="mr-2 h-4 w-4" />
                              {t("common.profile")}
                            </Button>
                          </Link>
                        </SheetClose>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t("common.logout")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
