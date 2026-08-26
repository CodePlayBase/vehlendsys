import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';

// Types matching centralized schema
export type VehicleType = 'car' | 'bike' | 'bicycle';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: VehicleType;
  licensePlate?: string;
  serialNumber: string;
  status: VehicleStatus;
  hourlyRate: number;
  dailyRate: number;
  fuelOrBatteryLevel: number;
  locationHub: string;
  imageUrl: string;
  year: number;
  seats?: number;
}

// Swappable API Base URL (Local Mock / MockAPI.io)
const API_URL = 'https://api.vehiclelending.local/v1/vehicles';

export const VehicleCatalogScreen: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch data from Mock REST API / MockAPI.io
  const fetchVehicleCatalog = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data: Vehicle[] = await response.json();
      setVehicles(data);
      applyFilters(data, selectedType, searchQuery);
    } catch (error: any) {
      console.error('Error fetching catalog:', error);
      Alert.alert('Connection Error', 'Could not load vehicle catalog. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, searchQuery]);

  useEffect(() => {
    fetchVehicleCatalog();
  }, []);

  // Filter application helper
  const applyFilters = (data: Vehicle[], type: string, query: string) => {
    let result = data;
    if (type !== 'all') {
      result = result.filter(v => v.type === type);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        v => v.name.toLowerCase().includes(q) ||
             v.brand.toLowerCase().includes(q) ||
             v.locationHub.toLowerCase().includes(q)
      );
    }
    setFilteredVehicles(result);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    applyFilters(vehicles, type, searchQuery);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(vehicles, selectedType, text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicleCatalog();
  };

  const handleBorrowRequest = (vehicle: Vehicle) => {
    if (vehicle.status !== 'available') {
      Alert.alert('Unavailable', 'This vehicle is currently not available for lending.');
      return;
    }
    Alert.alert(
      'Confirm Borrowing Request',
      `Would you like to request ${vehicle.name} for $${vehicle.hourlyRate}/hr?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Request',
          onPress: () => {
            // POST to /transactions with status 'pending_verification'
            Alert.alert('Success', 'Your booking request was submitted for Admin verification!');
          }
        }
      ]
    );
  };

  // 2. Render item component for FlatList
  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    const isAvailable = item.status === 'available';
    const statusColor =
      item.status === 'available' ? '#10B981' :
      item.status === 'rented' ? '#3B82F6' :
      item.status === 'reserved' ? '#F59E0B' : '#EF4444';

    return (
      <View style={styles.cardContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.vehicleImage}
          resizeMode="cover"
        />
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.vehicleTitle}>{item.name}</Text>
          <Text style={styles.hubSubtitle}>📍 {item.locationHub}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>⚡ {item.fuelOrBatteryLevel}% Battery/Fuel</Text>
            {item.seats && <Text style={styles.metaItem}>👥 {item.seats} Seats</Text>}
          </View>

          <View style={styles.pricingRow}>
            <View>
              <Text style={styles.priceHourly}>${item.hourlyRate.toFixed(2)}<Text style={styles.perUnit}> / hr</Text></Text>
              <Text style={styles.priceDaily}>${item.dailyRate.toFixed(2)} / day</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.borrowButton,
                !isAvailable && styles.borrowButtonDisabled
              ]}
              disabled={!isAvailable}
              onPress={() => handleBorrowRequest(item)}
            >
              <Text style={styles.borrowButtonText}>
                {isAvailable ? 'Borrow Now' : 'Not Available'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vehicle Lending</Text>
        <Text style={styles.headerSubtitle}>Rent Cars, Motorbikes & City Bicycles</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand, model or hub..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filter Category Chips */}
      <View style={styles.filterChipsRow}>
        {['all', 'car', 'bike', 'bicycle'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              selectedType === type && styles.chipActive
            ]}
            onPress={() => handleTypeSelect(type)}
          >
            <Text
              style={[
                styles.chipText,
                selectedType === type && styles.chipTextActive
              ]}
            >
              {type === 'all' ? 'All Fleet' : type === 'car' ? '🚗 Cars' : type === 'bike' ? '🏍️ Bikes' : '🚲 Bicycles'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FlatList Component */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching available vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={item => item.id}
          renderItem={renderVehicleCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Vehicles Found</Text>
              <Text style={styles.emptyText}>Try changing your category filters or search keywords.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  searchContainer: { paddingHorizontal: 20, marginVertical: 10 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  filterChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  chipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vehicleImage: { width: '100%', height: 180 },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  typeBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  cardContent: { padding: 16 },
  vehicleTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  hubSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaItem: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  priceHourly: { fontSize: 20, fontWeight: '800', color: '#111827' },
  perUnit: { fontSize: 13, fontWeight: '400', color: '#6B7280' },
  priceDaily: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  borrowButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  borrowButtonDisabled: { backgroundColor: '#D1D5DB' },
  borrowButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 250 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
});

export default VehicleCatalogScreen;
