import { createContext, ReactNode, useContext } from "react";
import axios from "axios";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  login: UseMutationResult<SelectUser, Error, LoginData>;
  register: UseMutationResult<SelectUser, Error, RegisterCredentials>;
  logout: UseMutationResult<void, Error, void>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
interface RegisterCredentials extends InsertUser {
  confirmPassword: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/user");
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiClient.post("/api/login", credentials);
      return response.data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t("common.login_success"),
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.login_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate required fields
      if (!credentials.username || !credentials.password) {
        throw new Error("Username and password are required");
      }

      const response = await apiClient.post("/api/register", credentials);
      return response.data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t("common.registration_success"),
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.registration_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: t("common.logout_success"),
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.logout_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: error ? null : user || null,
        isLoading,
        login: loginMutation,
        register: registerMutation,
        logout: logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
