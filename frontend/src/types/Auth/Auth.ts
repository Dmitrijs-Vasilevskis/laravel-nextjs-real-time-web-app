import { AxiosError } from "axios";

export type AuthFormType = "login" | "register" | "forgotPassword";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  }
  
  // Error response interface
  export interface ErrorResponse {
    errors: Record<string, string[]>;
    message?: string;
  }
  
  // Hook configuration interface
  export interface UseAuthConfig {
    middleware?: "guest" | "auth";
    redirectIfAuthenticated?: string;
  }
  
  // Common form props interface
  export interface AuthFormProps {
    setErrors: (errors: Record<string, string[]>) => void;
    setStatus: (status: string | null) => void;
  }
  
  // Register parameters
  export interface RegisterParams {
    setErrors: (errors: Record<string, string[]>) => void;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }
  
  // Login parameters
  export interface LoginParams {
    setErrors: (errors: Record<string, string[]>) => void;
    setStatus: (status: string | null) => void;
    email: string;
    password: string;
    remember?: boolean;
  }
  
  // Forgot password parameters
  export interface ForgotPasswordParams {
    setErrors: (errors: Record<string, string[]>) => void;
    setStatus: (status: string | null) => void;
    email: string;
  }
  
  // Reset password parameters
  export interface ResetPasswordParams {
    setErrors: (errors: Record<string, string[]>) => void;
    setStatus: (status: string | null) => void;
    email: string;
    password: string;
    password_confirmation: string;
    token?: string;
  }

  export interface ResendEmailVerificationParams {
    setStatus: (status: string | null) => void;
  }
  
  // Return type of the useAuth hook
  export interface UseAuthReturn {
    user: User | undefined;
    register: (params: RegisterParams) => Promise<void>;
    login: (params: LoginParams) => Promise<void>;
    forgotPassword: (params: ForgotPasswordParams) => Promise<void>;
    resetPassword: (params: ResetPasswordParams) => Promise<void>;
    resendEmailVerification: (params: ResendEmailVerificationParams) => void;
    logout: () => Promise<void>;
    isLoggedIn: boolean;
  }
  
  // SWR error type
  export interface SWRAuthError extends AxiosError<ErrorResponse> {}
  
  // Optional: If you want to type the mutate function more specifically
  export interface AuthMutate {
    mutate: (
      data?: User | Promise<User> | undefined,
      shouldRevalidate?: boolean
    ) => Promise<User | undefined>;
  }