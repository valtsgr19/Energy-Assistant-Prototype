/**
 * API Client
 * 
 * Handles HTTP requests to the backend API with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    // Load token from localStorage on first use (if available)
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      this.token = window.localStorage.getItem('auth_token');
    }
    this.initialized = true;
  }

  setToken(token: string) {
    this.initialize();
    this.token = token;
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
      window.localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.initialize();
    this.token = null;
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.removeItem === 'function') {
      window.localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    this.initialize();
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    this.initialize();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add custom headers from options
    if (options.headers) {
      const optHeaders = options.headers as Record<string, string>;
      Object.assign(headers, optHeaders);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Add status code to error message for better debugging
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        } else if (response.status === 403) {
          throw new Error('Access denied');
        } else if (response.status === 404) {
          throw new Error('Resource not found');
        } else if (response.status === 409) {
          throw new Error(errorMessage); // Conflict (e.g., email already registered)
        } else if (response.status >= 500) {
          throw new Error('Server error - Please try again later');
        } else {
          throw new Error(errorMessage);
        }
      }

      return response.json();
    } catch (error) {
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError) {
        throw new Error('Network error - Please check your internet connection');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
