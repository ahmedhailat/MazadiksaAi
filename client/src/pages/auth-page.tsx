import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthPage() {
  const { t } = useTranslation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  useEffect(() => {
    document.title = `${t("auth.loginTitle")} / ${t("auth.registerTitle")} | مزاد KSA`;
    
    // If user is already authenticated, redirect to home page
    if (user) {
      navigate("/");
    }
  }, [user, navigate, t]);
  
  // Login form schema
  const loginSchema = z.object({
    username: z.string().min(1, t("auth.usernameTitle")),
    password: z.string().min(1, t("auth.passwordTitle")),
    rememberMe: z.boolean().optional(),
  });
  
  // Register form schema
  const registerSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    fullName: z.string().min(2, { message: "Full name is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    phoneNumber: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });
  
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };
  
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...userData } = values;
    
    registerMutation.mutate({
      ...userData,
      profileImage: "", // Empty string for profile image
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <Header />
      <main className="py-12 bg-sand min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left: Auth Forms */}
              <div className="w-full md:w-1/2 p-6 md:p-10">
                <Tabs 
                  defaultValue={activeTab} 
                  onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">{t("auth.loginTitle")}</TabsTrigger>
                    <TabsTrigger value="register">{t("auth.registerTitle")}</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Tab */}
                  <TabsContent value="login">
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-neutralDark mb-2">{t("auth.loginTitle")}</h1>
                        <p className="text-gray-600">{t("auth.welcomeText")}</p>
                      </div>
                      
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("auth.usernameTitle")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={t("auth.usernamePlaceholder")} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("auth.password")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={t("auth.passwordPlaceholder")} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-center justify-between">
                            <FormField
                              control={loginForm.control}
                              name="rememberMe"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-x-reverse">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {t("auth.rememberMe")}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            <a href="#" className="text-sm text-primary hover:text-primary-dark">
                              {t("auth.forgotPassword")}
                            </a>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            {t("auth.loginButton")}
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                          {t("auth.noAccount")}{" "}
                          <button
                            onClick={() => setActiveTab("register")}
                            className="text-primary hover:text-primary-dark"
                          >
                            {t("auth.createAccount")}
                          </button>
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Register Tab */}
                  <TabsContent value="register">
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-neutralDark mb-2">{t("auth.registerTitle")}</h1>
                        <p className="text-gray-600">{t("auth.welcomeText")}</p>
                      </div>
                      
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.usernameTitle")}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t("auth.usernamePlaceholder")} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.email")}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder={t("auth.emailPlaceholder")} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("auth.fullNameTitle")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={t("auth.fullNamePlaceholder")} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("auth.phoneTitle")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="tel" 
                                    placeholder={t("auth.phonePlaceholder")} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.password")}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder={t("auth.passwordPlaceholder")} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder={t("auth.confirmPasswordPlaceholder")} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            {t("auth.registerButton")}
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                          {t("auth.haveAccount")}{" "}
                          <button
                            onClick={() => setActiveTab("login")}
                            className="text-primary hover:text-primary-dark"
                          >
                            {t("auth.loginButton")}
                          </button>
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right: Hero Image */}
              <div className="w-full md:w-1/2 bg-primary hidden md:block">
                <div className="h-full flex flex-col justify-center items-center p-10 text-white">
                  <div className="max-w-md text-center">
                    <h2 className="text-3xl font-bold mb-4 font-playfair">
                      {t("auth.welcomeText")}
                    </h2>
                    <p className="text-lg opacity-90 mb-6">
                      {t("auth.welcomeDescription")}
                    </p>
                    <img 
                      src="https://images.unsplash.com/photo-1586864387789-628af9feed72?w=500&h=300&fit=crop" 
                      alt="Luxury auction" 
                      className="rounded-lg shadow-lg mx-auto w-full max-w-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
