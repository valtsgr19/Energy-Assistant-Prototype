/**
 * Authentication API
 */

import { apiClient } from './client';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  token: string;
}

export interface LinkEnergyAccountRequest {
  energyAccountId: string;
  energyAccountPassword: string;
}

export interface LinkEnergyAccountResponse {
  success: boolean;
  accountLinked: boolean;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    apiClient.setToken(response.token);
    return response;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    apiClient.setToken(response.token);
    return response;
  },

  linkEnergyAccount: async (data: LinkEnergyAccountRequest): Promise<LinkEnergyAccountResponse> => {
    return apiClient.post<LinkEnergyAccountResponse>('/auth/link-energy-account', data);
  },

  logout: () => {
    apiClient.clearToken();
  },
};
