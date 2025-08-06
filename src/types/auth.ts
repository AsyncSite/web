// User related types
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role?: string;
  bio?: string;
  profileImage?: string;
  roles: string[];
  isActive: boolean;
  systemRole?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Login related types
export interface LoginRequest {
  username: string; // Can be email or username
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  roles: string[];
}

// Registration related types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  profileImage?: string;
}

export interface RegisterResponse {
  email: string;
  name: string;
  message: string;
}

// Token related types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

// Profile related types
export interface UpdateProfileRequest {
  name?: string;
  role?: string;
  bio?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: (options?: { redirectTo?: string }) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
}