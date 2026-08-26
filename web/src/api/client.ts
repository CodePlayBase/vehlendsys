/**
 * Vehicle Lending System - Web Admin API Client
 * Axios / Fetch HTTP Client with Interceptors, Retry, and MockAPI.io swappable configuration.
 */

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Default to local mock JSON or swap with your live MockAPI.io endpoint:
// e.g. "https://65c123456789abcd.mockapi.io/api/v1"
export const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'https://api.vehiclelending.local/v1';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(config.headers || {}),
    };
  }

  public setBaseURL(url: string) {
    this.baseURL = url;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  public setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle standard HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          if (errorBody && errorBody.message) {
            errorMessage = errorBody.message;
          }
        } catch {
          // Response body wasn't JSON
        }
        throw new Error(errorMessage);
      }

      // If No Content (204)
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.error(`[API Client] Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  // HTTP Verb Wrappers
  public get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      queryString = `?${searchParams.toString()}`;
    }
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  public post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
});
