import { apiClient } from '../client';
import { normalizeTransaction, normalizeTransactions } from '../normalizer';

export const transactionService = {
  /** Semua transaksi */
  async getAll(): Promise<any[]> {
    const raw = await apiClient.get<any[]>('/transactions');
    return normalizeTransactions(raw);
  },

  /** Yang butuh approval admin */
  async getPending(): Promise<any[]> {
    const raw = await apiClient.get<any[]>('/transactions/pending');
    return normalizeTransactions(raw);
  },

  /** Filter by user */
  async getByUser(userId: string): Promise<any[]> {
    const raw = await apiClient.get<any[]>('/transactions', { userId });
    return normalizeTransactions(raw);
  },

  /** ADMIN ACTION: Setujui → kendaraan otomatis jadi 'rented' */
  async approve(id: string, adminId?: string): Promise<any> {
    return apiClient.patch(`/transactions/${id}/approve`, {
      approvedByAdminId: adminId ?? 'usr_004',
    });
  },

  /** ADMIN ACTION: Tolak → kendaraan kembali 'available' */
  async reject(id: string, reason?: string, adminId?: string): Promise<any> {
    return apiClient.patch(`/transactions/${id}/reject`, {
      reason: reason ?? 'Tidak memenuhi syarat',
      approvedByAdminId: adminId ?? 'usr_004',
    });
  },
};