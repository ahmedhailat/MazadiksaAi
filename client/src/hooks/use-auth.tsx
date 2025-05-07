import { createContext, ReactNode, useContext } from "react";
import axios from "axios";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await axios.post(`${API_URL}/api/login`, credentials, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t("auth.loginTitle"),
        description: `${t("auth.welcomeText")}, ${user.fullName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.loginTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const response = await axios.post(`${API_URL}/api/register`, credentials, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t("auth.registerTitle"),
        description: `${t("auth.welcomeText")}, ${user.fullName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.registerTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${API_URL}/api/logout`, {}, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: t("common.logout"),
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.logout"),
        Description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
