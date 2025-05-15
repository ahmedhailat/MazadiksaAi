npm install i18next react-i18next
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AuctionsPage from "@/pages/auctions-page";
import AuctionDetailsPage from "@/pages/auction-details-page";
import ProfilePage from "@/pages/profile-page";
import ContactPage from "@/pages/contact-page";
import {import useAuth from './hooks/use-auth.tsx';
import { ProtectedRoute } from "@/lib/protected-route";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auctions" component={AuctionsPage} />
      <Route path="/auctions/:id" component={AuctionDetailsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
