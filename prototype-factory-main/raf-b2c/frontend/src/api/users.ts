import apiClient from './client';

export interface CreateUserResponse {
  userId: string;
  email: string;
  verificationSent: boolean;
}

export interface VerifyEmailResponse {
  token: string;
  userId: string;
  email: string;
  emailVerified: boolean;
}

export interface ProgressResponse {
  userId: string;
  email: string;
  emailVerified: boolean;
  currentStep: string;
  completedSteps: string[];
  data: any;
}

export const usersApi = {
  createUser: async (email: string): Promise<CreateUserResponse> => {
    const response = await apiClient.post('/users', { email });
    return response.data;
  },

  verifyEmail: async (userId: string, code: string): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post(`/users/${userId}/verify`, { code });
    return response.data;
  },

  getProgress: async (userId: string): Promise<ProgressResponse> => {
    const response = await apiClient.get(`/users/${userId}/progress`);
    return response.data;
  }
};
