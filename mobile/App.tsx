import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  TextInput,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { apiClient } from './src/api/client';
import type { Vehicle, User, Transaction, VehicleType, VehicleStatus } from './src/types';
import { normalizeTransactions, normalizeVehicles } from './src/api/normalizer';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Hub didefinisikan lokal (males fetch, cuma 5 string)
const HUBS = [
  'Downtown Central Station',
  'Northside Metro Hub',
  'West End District Hub',
  'Airport Terminus Hub',
  'University Campus Point',
];

// Dummy customer untuk demo (nanti ganti dengan hasil login)
const DUMMY_CUSTOMER: User = {
  id: 'USR-CUS-01',
  fullName: 'Ahmad Fauzi',
  email: 'ahmad.fauzi@student.univ.ac.id',
  phoneNumber: '+6287811223344',
  role: 'customer',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  verificationStatus: 'verified',
  driverLicenseNumber: 'SIM A - 98012398412',
  idCardNumber: 'ID-7728109',
  membershipTier: 'premium',
  rating: 4.9,
  totalRentals: 14,
  createdAt: '2026-01-15T08:30:00Z',
};

// ============================================================
// STATUS HELPERS
// ============================================================
const STATUS_META: Record<VehicleStatus, { label: string; bg: string; fg: string }> = {
  available: { label: '🟢 Tersedia', bg: '#dcfce7', fg: '#15803d' },
  rented: { label: '🟡 Sedang Disewa', bg: '#fef3c7', fg: '#b45309' },
  maintenance: { label: '🔴 Perbaikan', bg: '#fee2e2', fg: '#b91c1c' },
  reserved: { label: '🔵 Dipesan', bg: '#dbeafe', fg: '#1d4ed8' },
};

const TX_STATUS_META: Record<Transaction['status'], { label: string; bg: string; fg: string }> = {
  pending_verification: { label: 'Menunggu Verifikasi', bg: '#fef3c7', fg: '#b45309' },
  approved: { label: 'Disetujui', bg: '#dbeafe', fg: '#1d4ed8' },
  active: { label: 'Aktif', bg: '#dcfce7', fg: '#15803d' },
  completed: { label: 'Selesai', bg: '#e2e8f0', fg: '#475569' },
  cancelled: { label: 'Dibatalkan', bg: '#fee2e2', fg: '#b91c1c' },
  rejected: { label: 'Ditolak', bg: '#fee2e2', fg: '#b91c1c' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <VehicleCatalogScreen />
    </SafeAreaProvider>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================
export function VehicleCatalogScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeCustomer] = useState<User>(DUMMY_CUSTOMER);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);   // ← FIX UTAMA

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | VehicleType>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'trips' | 'profile'>('catalog');

  // Borrow modal state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [durationHours, setDurationHours] = useState(4);
  const [pickupHub, setPickupHub] = useState(HUBS[0]);
  const [dropoffHub, setDropoffHub] = useState(HUBS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'e_wallet' | 'cash_at_hub'>('credit_card');
  const [bookingSuccess, setBookingSuccess] = useState<Transaction | null>(null);

  // -------- FETCH (simulasi) --------
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await apiClient.get<any[]>('/vehicles');
      const data = normalizeVehicles(raw);  // ← NORMALIZE
      console.log('✅ Normalized first vehicle:', JSON.stringify(data[0], null, 2));
      setVehicles(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
  try {
    const raw = await apiClient.get<any[]>('/transactions');
    const data = normalizeTransactions(raw); 
    // Kalau mau filter khusus user ini:
    const mine = raw.filter((t) => t.userId === activeCustomer.id);
    setTransactions(data);
  } catch (err) {
    console.error('Fetch transactions error:', err);
  }
}, [activeCustomer.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchVehicles(), fetchTransactions()]);
    setRefreshing(false);
  };

  React.useEffect(() => {
    fetchVehicles();
    fetchTransactions();
  }, [fetchVehicles]);

  // -------- FILTER --------
  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (selectedType !== 'all' && v.type !== selectedType) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.locationHub.toLowerCase().includes(q) ||
        (v.licensePlate ?? '').toLowerCase().includes(q)
      );
    });
  }, [vehicles, searchQuery, selectedType]);

  const customerTrips = useMemo(
    () => transactions.filter((t) => t.userId === activeCustomer.id),
    [transactions, activeCustomer.id]
  );

  // -------- BORROW --------
  const handleOpenBorrow = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPickupHub(vehicle.locationHub);
    setDropoffHub(vehicle.locationHub);
    setDurationHours(4);
    setBookingSuccess(null);
    setModalVisible(true);
  };

  const handleConfirmBorrow = async () => {
    if (!selectedVehicle) return;

    const totalCost =
      durationHours >= 24
        ? Math.ceil(durationHours / 24) * selectedVehicle.dailyRate
        : durationHours * selectedVehicle.hourlyRate;

    try {
      const newTx = await apiClient.post<Transaction>('/transactions', {
        userId: activeCustomer.id,
        vehicleId: selectedVehicle.id,
        userName: activeCustomer.fullName,
        vehicleName: selectedVehicle.name,
        vehicleType: selectedVehicle.type,
        licensePlate: selectedVehicle.licensePlate,
        startDateTime: new Date().toISOString(),
        endDateTime: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
        durationHours,
        totalCost,
        status: 'pending_verification',
        paymentStatus: 'paid',
        paymentMethod,
        pickupHub,
        dropoffHub,
      });

      setBookingSuccess(newTx);
      await fetchVehicles(); // refresh list (kendaraan berubah jadi reserved)
      await Promise.all([fetchVehicles(), fetchTransactions()]);
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // -------- RENDER ITEM --------
  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const isAvailable = item.status === 'available';
    const meta = STATUS_META[item.status];

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.vehicleSub} numberOfLines={1}>
                {item.brand} • {item.type.toUpperCase()}
                {item.licensePlate ? ` • ${item.licensePlate}` : ''}
              </Text>
              <Text style={styles.vehicleLocation} numberOfLines={1}>📍 {item.locationHub}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.badgeText, { color: meta.fg }]}>{meta.label}</Text>
            </View>
          </View>

          <View style={styles.telemetryRow}>
            <Text style={styles.telemetryText}>
              {item.type === 'bicycle' ? '🔋' : '⛽'} {item.fuelOrBatteryLevel}%
            </Text>
            {item.seats ? <Text style={styles.telemetryText}>👥 {item.seats}</Text> : null}
            <Text style={styles.telemetryText}>📅 {item.year}</Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceMain}>${item.dailyRate.toFixed(0)}<Text style={styles.priceUnit}>/hari</Text></Text>
              <Text style={styles.priceSub}>${item.hourlyRate.toFixed(2)}/jam</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, !isAvailable && styles.buttonDisabled]}
              disabled={!isAvailable}
              onPress={() => handleOpenBorrow(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{isAvailable ? 'Pinjam' : 'Tidak Tersedia'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // -------- RENDER TRIP ITEM --------
const renderTripItem = ({ item }: { item: Transaction }) => {
  const meta = TX_STATUS_META[item.status] ?? {
    label: item.status,
    bg: '#e2e8f0',
    fg: '#475569',
  };

  const dateText = item.startDateTime
    ? new Date(item.startDateTime).toLocaleDateString('id-ID')
    : '-';

  const durationText = item.durationHours
    ? `${item.durationHours} jam`
    : (item as any).totalDays
    ? `${(item as any).totalDays} hari`
    : '-';

  return (
    <View style={styles.tripCard}>
      <View style={styles.cardRow}>
        <Text style={styles.tripTitle}>{item.vehicleName}</Text>
        <View style={[styles.badge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.badgeText, { color: meta.fg }]}>{meta.label}</Text>
        </View>
      </View>
      <Text style={styles.tripSub}>
        {dateText} • {durationText}
      </Text>
      <View style={styles.tripFooter}>
        <Text style={styles.tripCost}>
          Total:{' '}
          <Text style={{ fontWeight: 'bold' }}>
            Rp {Number(item.totalCost ?? 0).toLocaleString('id-ID')}
          </Text>
        </Text>
        <Text style={styles.tripId}>{item.id}</Text>
      </View>
    </View>
  );
};

  const insets = useSafeAreaInsets();

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>VehLend</Text>
          <Text style={styles.headerSubtitle}>Halo, {activeCustomer.fullName.split(' ')[0]} 👋</Text>
        </View>
        <Image source={{ uri: activeCustomer.avatarUrl }} style={styles.avatar} />
      </View>

      {/* TAB: CATALOG */}
      {activeTab === 'catalog' && (
        <>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Cari mobil, motor, sepeda, hub..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {error && (
            <View style={{ backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 }}>
              <Text style={{ color: '#b91c1c', fontSize: 12 }}>⚠️ {error}</Text>
            </View>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {[
              { id: 'all', label: 'Semua' },
              { id: 'car', label: '🚗 Mobil' },
              { id: 'bike', label: '🏍️ Motor' },
              { id: 'bicycle', label: '🚲 Sepeda' },
            ].map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, selectedType === c.id && styles.chipActive]}
                onPress={() => setSelectedType(c.id as any)}
              >
                <Text style={[styles.chipText, selectedType === c.id && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isLoading && !refreshing ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Memuat kendaraan...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id}
              renderItem={renderVehicleItem}
              contentContainerStyle={styles.listPadding}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
              }
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>Tidak ada kendaraan yang cocok.</Text>
                </View>
              }
            />
          )}
        </>
      )}

      {/* TAB: MY TRIPS */}
      {activeTab === 'trips' && (
        <FlatList
          data={customerTrips}
          keyExtractor={(item) => item.id}
          renderItem={renderTripItem}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Belum ada riwayat peminjaman.</Text>
              <TouchableOpacity onPress={() => setActiveTab('catalog')}>
                <Text style={styles.linkText}>Jelajahi Katalog →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* TAB: PROFILE */}
      {activeTab === 'profile' && (
        <ScrollView contentContainerStyle={styles.profileWrap}>
          <Image source={{ uri: activeCustomer.avatarUrl }} style={styles.profileAvatar} />
          <Text style={styles.profileName}>{activeCustomer.fullName}</Text>
          <Text style={styles.profileEmail}>{activeCustomer.email}</Text>

          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Status KYC</Text>
              <Text style={[
                styles.profileValue,
                { color: activeCustomer.verificationStatus === 'verified' ? '#15803d' : '#b45309' }
              ]}>
                {activeCustomer.verificationStatus.toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>SIM</Text>
              <Text style={styles.profileValue}>{activeCustomer.driverLicenseNumber ?? '-'}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Tier</Text>
              <Text style={styles.profileValue}>{activeCustomer.membershipTier.toUpperCase()}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Total Peminjaman</Text>
              <Text style={styles.profileValue}>{activeCustomer.totalRentals}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* BOTTOM TAB BAR */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('catalog')}>
          <Text style={[styles.tabIcon, activeTab === 'catalog' && styles.tabActive]}>🚗</Text>
          <Text style={[styles.tabLabel, activeTab === 'catalog' && styles.tabActive]}>Katalog</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('trips')}>
          <Text style={[styles.tabIcon, activeTab === 'trips' && styles.tabActive]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'trips' && styles.tabActive]}>
            Pesanan ({customerTrips.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabActive]}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* ================= BORROW MODAL ================= */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {bookingSuccess ? (
              // ---- SUCCESS VIEW ----
              <View style={{ alignItems: 'center', padding: 16 }}>
                <Text style={{ fontSize: 42 }}>✅</Text>
                <Text style={styles.modalTitle}>Pengajuan Terkirim!</Text>
                <Text style={styles.modalSub}>
                  Permintaan pinjam <Text style={{ fontWeight: 'bold' }}>{selectedVehicle?.name}</Text> telah dikirim.
                </Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    ⏳ Menunggu verifikasi admin. Kode unlock akan muncul setelah disetujui.
                  </Text>
                  <Text style={styles.infoText}>
                    Ref ID: <Text style={{ fontWeight: 'bold' }}>{bookingSuccess.id}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.button, { width: '100%', marginTop: 12 }]}
                  onPress={() => {
                    setModalVisible(false);
                    setActiveTab('trips');
                  }}
                >
                  <Text style={styles.buttonText}>Lihat Pesanan Saya</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ---- FORM VIEW ----
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>Ajukan Peminjaman</Text>
                    <Text style={styles.modalSub}>{selectedVehicle?.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Duration */}
                <Text style={styles.fieldLabel}>Durasi: {durationHours} jam</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setDurationHours((h) => Math.max(1, h - 1))}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{durationHours} jam</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setDurationHours((h) => Math.min(72, h + 1))}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Pickup Hub */}
                <Text style={styles.fieldLabel}>Pickup Hub</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubRow}>
                  {HUBS.map((hub) => (
                    <TouchableOpacity
                      key={hub}
                      style={[styles.hubChip, pickupHub === hub && styles.hubChipActive]}
                      onPress={() => setPickupHub(hub)}
                    >
                      <Text style={[styles.hubChipText, pickupHub === hub && styles.hubChipTextActive]}>
                        {hub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Dropoff Hub */}
                <Text style={styles.fieldLabel}>Dropoff Hub</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubRow}>
                  {HUBS.map((hub) => (
                    <TouchableOpacity
                      key={hub}
                      style={[styles.hubChip, dropoffHub === hub && styles.hubChipActive]}
                      onPress={() => setDropoffHub(hub)}
                    >
                      <Text style={[styles.hubChipText, dropoffHub === hub && styles.hubChipTextActive]}>
                        {hub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Payment */}
                <Text style={styles.fieldLabel}>Metode Pembayaran</Text>
                <View style={styles.paymentRow}>
                  {[
                    { id: 'credit_card', label: '💳 Kartu' },
                    { id: 'e_wallet', label: '📱 E-Wallet' },
                    { id: 'cash_at_hub', label: '💵 Tunai' },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.payBtn, paymentMethod === m.id && styles.payBtnActive]}
                      onPress={() => setPaymentMethod(m.id as any)}
                    >
                      <Text style={[styles.payBtnText, paymentMethod === m.id && styles.payBtnTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Cost Breakdown */}
                <View style={styles.costBox}>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Tarif</Text>
                    <Text style={styles.costValue}>
                      ${selectedVehicle?.hourlyRate.toFixed(2)}/jam • ${selectedVehicle?.dailyRate.toFixed(2)}/hari
                    </Text>
                  </View>
                  <View style={[styles.costRow, styles.costTotalRow]}>
                    <Text style={styles.costTotalLabel}>Estimasi Total</Text>
                    <Text style={styles.costTotalValue}>
                      ${(
                        selectedVehicle
                          ? durationHours >= 24
                            ? Math.ceil(durationHours / 24) * selectedVehicle.dailyRate
                            : durationHours * selectedVehicle.hourlyRate
                          : 0
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBorrow}>
                  <Text style={styles.confirmBtnText}>Konfirmasi & Ajukan</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e2e8f0' },

  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 13,
    color: '#0f172a',
  },

  chipsRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#ffffff' },

  listPadding: { padding: 16, paddingTop: 4 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { width: '100%', height: 160, backgroundColor: '#e2e8f0' },
  cardBody: { padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  vehicleName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  vehicleSub: { fontSize: 11, color: '#64748b', marginTop: 3 },
  vehicleLocation: { fontSize: 11, color: '#64748b', marginTop: 3 },
  vehiclePrice: { fontSize: 14, fontWeight: '700', color: '#2563eb', marginTop: 6 },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  telemetryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  telemetryText: { fontSize: 11, color: '#64748b' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  priceMain: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  priceUnit: { fontSize: 11, fontWeight: '400', color: '#64748b' },
  priceSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonDisabled: { backgroundColor: '#cbd5e1' },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 12 },

  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#94a3b8', fontSize: 13 },
  linkText: { color: '#2563eb', fontWeight: '700', fontSize: 13, marginTop: 8 },

  // Trips
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tripTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1 },
  tripSub: { fontSize: 11, color: '#64748b', marginTop: 4 },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tripCost: { fontSize: 12, color: '#475569' },
  tripId: { fontSize: 10, color: '#94a3b8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  // Profile
  profileWrap: { padding: 20, alignItems: 'center' },
  profileAvatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#e2e8f0' },
  profileName: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 12 },
  profileEmail: { fontSize: 12, color: '#64748b', marginTop: 3 },
  profileCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between' },
  profileLabel: { fontSize: 12, color: '#64748b' },
  profileValue: { fontSize: 12, fontWeight: '700', color: '#0f172a' },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
  },
  tabBtn: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 10, color: '#94a3b8', marginTop: 2, fontWeight: '600' },
  tabActive: { color: '#2563eb' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 6 },
  modalSub: { fontSize: 12, color: '#64748b', marginTop: 3 },
  closeBtn: { fontSize: 20, color: '#94a3b8', padding: 4 },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 8,
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepBtnText: { fontSize: 20, fontWeight: '800', color: '#2563eb' },
  stepValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },

  hubRow: { gap: 6, paddingVertical: 2 },
  hubChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6,
  },
  hubChipActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  hubChipText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  hubChipTextActive: { color: '#2563eb', fontWeight: '700' },

  paymentRow: { flexDirection: 'row', gap: 6 },
  payBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  payBtnActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  payBtnText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  payBtnTextActive: { color: '#2563eb', fontWeight: '700' },

  costBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  costRow: { flexDirection: 'row', justifyContent: 'space-between' },
  costLabel: { fontSize: 12, color: '#64748b' },
  costValue: { fontSize: 12, color: '#334155', fontWeight: '600' },
  costTotalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 4,
  },
  costTotalLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  costTotalValue: { fontSize: 15, fontWeight: '800', color: '#15803d' },

  confirmBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },

  infoBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 4,
  },
  infoText: { fontSize: 11, color: '#92400e' },
});