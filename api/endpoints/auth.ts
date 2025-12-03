import axiosInstance from "../config/axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Dynamic interface that can accept any key-value pairs for profile update
export interface CompleteProfileData {
  [key: string]: any; // Allow any dynamic fields like fullName, phoneNumber, color, etc.
}

export interface AuthResponse {
  success?: boolean;
  status?: string;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      [key: string]: any; // Allow additional dynamic user fields
    };
    accessToken: string;
    refreshToken: string;
    token?: string;
  };
}

const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/customer/auth/login", credentials);
    return response.data;
  },

  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/customer/auth/register", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/customer/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/customer/auth/reset-password", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/customer/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },

  completeProfile: async (
    profileData: CompleteProfileData,
    token: string
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.patch("/customer/auth/profile", profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/customer/auth/logout");
    return response.data;
  },

  updateDeviceToken: async (deviceToken: string, platform?: "ios" | "android"): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/customer/auth/device-token", {
      deviceToken,
      platform,
    });
    return response.data;
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get("/customer/auth/profile");
    return response.data;
  },
};

export default authApi;
