// mobile/src/api/client.ts
import { Platform } from 'react-native';
import { normalizeVehicles, normalizeTransactions } from './normalizer';

// ⚠️ GANTI dengan IP LAN server kamu (lihat output npm run dev di folder server)
const LAN_IP = '192.168.1.10'; // ← SESUAIKAN!

function getBaseURL(): string {
  // Kalau pakai tunnel (Expo tunnel / ngrok), pakai domain publik
  // return 'https://xxxx.ngrok.io/api';

  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Emulator Android
      return `http://10.0.2.2:4000/api`;
      // Kalau HP fisik, ganti ke: `http://${LAN_IP}:4000/api`
    }
    // iOS simulator
    return `http://localhost:4000/api`;
  }
  // Production
  return 'https://api.vehlend.com/api';
}

const API_BASE_URL = getBaseURL();

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
};

export const apiClient = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { method = 'GET', body } = options;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        if (err?.message) msg = err.message;
      } catch {}
      throw new Error(msg);
    }

    if (res.status === 204) return {} as T;
    return (await res.json()) as T;
  },
  

  get: <T>(url: string) => apiClient.request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: any) => apiClient.request<T>(url, { method: 'POST', body }),
  patch: <T>(url: string, body?: any) => apiClient.request<T>(url, { method: 'PATCH', body }),
  put: <T>(url: string, body?: any) => apiClient.request<T>(url, { method: 'PUT', body }),
  delete: <T>(url: string) => apiClient.request<T>(url, { method: 'DELETE' }),
};