import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Layers, 
  Terminal, 
  Smartphone, 
  Monitor, 
  LayoutDashboard, 
  Database,
  Download
} from 'lucide-react';

interface CodeSnippet {
  id: string;
  title: string;
  category: 'structure' | 'schema' | 'web' | 'csharp' | 'mobile';
  filePath: string;
  language: string;
  description: string;
  code: string;
}

const CODE_DELIVERABLES: CodeSnippet[] = [
  {
    id: 'folder-tree',
    title: '1. Complete Initial Ecosystem Folder Structure',
    category: 'structure',
    filePath: 'vehicle-lending-system/ (Project Root Structure)',
    language: 'plaintext',
    description: 'Multi-client unified architecture covering /web (Admin), /mobile (Customer), /desktop (Worker), and /mock-api centralized REST schema.',
    code: `vehicle-lending-system/
├── mock-api/
│   ├── db.json                      # Centralized Mock REST Database (Users, Vehicles, Transactions)
│   ├── routes.json                  # Custom rewrite routes for json-server or MockAPI.io
│   └── package.json                 # Mock API script runner (json-server / express)
│
├── web/                             # [ADMIN ROLE] Web Admin Management Portal
│   ├── public/                      # Static assets & favicons
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # Axios / Fetch client with interceptors & MockAPI swapper
│   │   ├── components/
│   │   │   ├── dashboard/           # Statistics KPIs & fleet utilization metrics
│   │   │   ├── vehicles/            # Fleet table, CRUD forms, status toggles (Cars/Bikes/Bicycles)
│   │   │   ├── verification/        # Booking approval queue & driver license audits
│   │   │   └── users/               # Customer accounts & KYC verification table
│   │   ├── services/
│   │   │   ├── vehicleService.ts    # Typed CRUD & filtering methods
│   │   │   └── bookingService.ts    # Loan authorization & payment lifecycle service
│   │   ├── types/
│   │   │   └── index.ts             # Shared domain interfaces
│   │   ├── App.tsx                  # Root Admin layout & routing
│   │   └── main.tsx                 # React DOM mount point
│   ├── index.html
│   ├── package.json                 # React + Vite + TypeScript dependencies
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── mobile/                          # [CUSTOMER ROLE] React Native / Expo Mobile App
│   ├── assets/                      # App icons, splash screens, vector badges
│   ├── src/
│   │   ├── api/
│   │   │   └── api.ts               # Mobile Fetch API adapter
│   │   ├── components/
│   │   │   ├── VehicleCard.tsx      # Reusable vehicle item with badges & price
│   │   │   ├── CategoryChips.tsx    # Filter chips (All, Cars, Bikes, Bicycles)
│   │   │   └── BorrowModal.tsx      # Reservation duration slider & checkout
│   │   ├── screens/
│   │   │   ├── VehicleCatalogScreen.tsx # FlatList data-fetching screen with pull-to-refresh
│   │   │   ├── MyTripsScreen.tsx    # Active loans & pending request status
│   │   │   └── ProfileScreen.tsx    # User KYC & driver license upload
│   │   ├── navigation/
│   │   │   └── BottomTabNavigator.tsx
│   │   └── types/
│   │       └── index.ts
│   ├── app.json                     # Expo configuration
│   ├── App.tsx                      # Root Mobile Entry
│   ├── package.json                 # React Native, Expo, Lucide dependencies
│   └── tsconfig.json
│
├── desktop/                         # [WORKER ROLE] C# Windows Forms Desktop Application
│   ├── src/
│   │   ├── Forms/
│   │   │   ├── VehicleInventoryForm.cs       # WinForms DataGridView & Physical Check-In UI
│   │   │   ├── VehicleInventoryForm.Designer.cs
│   │   │   └── BarcodeLookupDialog.cs        # VIN / Serial scanner dialog
│   │   ├── Services/
│   │   │   └── VehicleApiService.cs          # HttpClient asynchronous data-fetching core
│   │   ├── Models/
│   │   │   ├── VehicleDto.cs                 # JSON serializable DTOs
│   │   │   └── UpdateVehicleStatusRequest.cs
│   │   └── Program.cs                        # Application.Run entry point
│   ├── App.config                            # BaseUrl configuration (mockapi.io switchable)
│   └── VehicleLendingSystem.Desktop.csproj   # .NET 9.0 Windows Forms project file
│
└── README.md                        # Setup instructions & API integration guide`
  },
  {
    id: 'mock-schema',
    title: '2. Centralized Mock JSON Schema (Users, Vehicles, Transactions)',
    category: 'schema',
    filePath: 'mock-api/db.json',
    language: 'json',
    description: 'Relational data store schema supporting Cars, Bikes, and Bicycles with rates, real-time availability, battery levels, and booking transactions.',
    code: `{
  "users": [
    {
      "id": "usr_001",
      "fullName": "Sarah Jenkins",
      "email": "sarah.j@example.com",
      "phoneNumber": "+1-555-0192",
      "role": "customer",
      "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      "verificationStatus": "verified",
      "driverLicenseNumber": "DL-98472910-A",
      "idCardNumber": "ID-7728109",
      "membershipTier": "premium",
      "rating": 4.9,
      "totalRentals": 14,
      "createdAt": "2026-01-15T08:30:00Z"
    },
    {
      "id": "usr_004",
      "fullName": "David Thorne (Lead Admin)",
      "email": "admin.david@vehiclelending.com",
      "phoneNumber": "+1-555-0100",
      "role": "admin",
      "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      "verificationStatus": "verified",
      "idCardNumber": "ID-1000001",
      "membershipTier": "vip",
      "rating": 5.0,
      "totalRentals": 0,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "usr_005",
      "fullName": "Thomas Briggs (Hub Worker)",
      "email": "worker.thomas@vehiclelending.com",
      "phoneNumber": "+1-555-0177",
      "role": "worker",
      "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      "verificationStatus": "verified",
      "idCardNumber": "ID-5000021",
      "membershipTier": "standard",
      "rating": 4.8,
      "totalRentals": 0,
      "createdAt": "2025-03-12T09:00:00Z"
    }
  ],
  "vehicles": [
    {
      "id": "veh_001",
      "name": "Tesla Model 3 Long Range",
      "brand": "Tesla",
      "model": "Model 3 LR",
      "type": "car",
      "licensePlate": "EV-849-TX",
      "serialNumber": "TSLA3-998201-2025",
      "status": "available",
      "hourlyRate": 18.5,
      "dailyRate": 95.0,
      "fuelOrBatteryLevel": 92,
      "locationHub": "Downtown Central Station",
      "imageUrl": "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=600",
      "year": 2025,
      "transmission": "automatic",
      "seats": 5,
      "conditionNotes": "Battery charged to 92%. Tires inspected.",
      "lastMaintainedDate": "2026-02-18",
      "createdAt": "2025-06-10T10:00:00Z"
    },
    {
      "id": "veh_004",
      "name": "Honda CB500X Urban Adventure",
      "brand": "Honda",
      "model": "CB500X",
      "type": "bike",
      "licensePlate": "BK-902-NY",
      "serialNumber": "HON-CB5-102948",
      "status": "available",
      "hourlyRate": 8.5,
      "dailyRate": 45.0,
      "fuelOrBatteryLevel": 85,
      "locationHub": "Downtown Central Station",
      "imageUrl": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600",
      "year": 2024,
      "transmission": "manual",
      "seats": 2,
      "conditionNotes": "Helmet and safety vest provided in rear top case.",
      "lastMaintainedDate": "2026-02-15",
      "createdAt": "2025-08-01T11:00:00Z"
    },
    {
      "id": "veh_007",
      "name": "Trek Allant+ 8 Electric City Bike",
      "brand": "Trek",
      "model": "Allant+ 8 e-Bike",
      "type": "bicycle",
      "licensePlate": "N/A (Bicycle)",
      "serialNumber": "TRK-EBIKE-88392",
      "status": "available",
      "hourlyRate": 3.5,
      "dailyRate": 20.0,
      "fuelOrBatteryLevel": 88,
      "locationHub": "Downtown Central Station",
      "imageUrl": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600",
      "year": 2025,
      "transmission": "n/a",
      "seats": 1,
      "conditionNotes": "Bosch smart motor, hydraulic disc brakes.",
      "lastMaintainedDate": "2026-02-22",
      "createdAt": "2025-05-18T10:15:00Z"
    }
  ],
  "transactions": [
    {
      "id": "tx_1001",
      "userId": "usr_001",
      "vehicleId": "veh_002",
      "userName": "Sarah Jenkins",
      "vehicleName": "Toyota RAV4 Hybrid",
      "vehicleType": "car",
      "licensePlate": "HY-204-CA",
      "startDateTime": "2026-02-24T08:00:00Z",
      "endDateTime": "2026-02-25T08:00:00Z",
      "durationHours": 24,
      "totalCost": 75.0,
      "status": "active",
      "paymentStatus": "paid",
      "paymentMethod": "credit_card",
      "pickupHub": "Downtown Central Station",
      "dropoffHub": "Northside Metro Hub",
      "notes": "Verified by David Thorne. Customer picked up keys at kiosk.",
      "createdAt": "2026-02-23T19:20:00Z",
      "updatedAt": "2026-02-24T08:05:00Z"
    }
  ]
}`
  },
  {
    id: 'web-axios',
    title: '3. Web Admin Axios / Fetch Boilerplate Integration',
    category: 'web',
    filePath: 'web/src/api/client.ts',
    language: 'typescript',
    description: 'Typed HTTP API client with interceptors, error serialization, and base URL configurability for live MockAPI.io endpoints.',
    code: `import { Vehicle, VehicleStatus, VehicleType } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.vehiclelending.local/v1';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  public setBaseURL(url: string) {
    this.baseURL = url;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = \`\${this.baseURL}\${endpoint.startsWith('/') ? '' : '/'}\${endpoint}\`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.defaultHeaders, ...(options.headers as any || {}) },
    });

    if (!response.ok) {
      throw new Error(\`HTTP Error \${response.status}: \${response.statusText}\`);
    }

    if (response.status === 204) return {} as T;
    return (await response.json()) as T;
  }

  public get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(\`\${endpoint}\${query}\`, { method: 'GET' });
  }

  public post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  public patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// --- VEHICLE SERVICE LAYER ---
export const vehicleService = {
  getAllVehicles: (params?: { type?: VehicleType; status?: VehicleStatus }) => 
    apiClient.get<Vehicle[]>('/vehicles', params),
  
  createVehicle: (data: Omit<Vehicle, 'id' | 'createdAt'>) => 
    apiClient.post<Vehicle>('/vehicles', data),

  updateStatus: (id: string, status: VehicleStatus, fuelLevel?: number) =>
    apiClient.patch<Vehicle>(\`/vehicles/\${id}\`, { status, fuelOrBatteryLevel: fuelLevel }),

  deleteVehicle: (id: string) => 
    apiClient.delete<void>(\`/vehicles/\${id}\`),
};`
  },
  {
    id: 'csharp-http',
    title: '4. C# WinForms Worker HttpClient Asynchronous Data Fetching',
    category: 'csharp',
    filePath: 'desktop/src/Services/VehicleApiService.cs',
    language: 'csharp',
    description: 'Thread-safe C# HttpClient service using SocketsHttpHandler, async/await, System.Text.Json, CancellationToken, and patch status mutations.',
    code: `using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace VehicleLendingSystem.Desktop.Services
{
    public class VehicleDto
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("brand")] public string Brand { get; set; } = string.Empty;
        [JsonPropertyName("type")] public string Type { get; set; } = string.Empty;
        [JsonPropertyName("licensePlate")] public string? LicensePlate { get; set; }
        [JsonPropertyName("serialNumber")] public string SerialNumber { get; set; } = string.Empty;
        [JsonPropertyName("status")] public string Status { get; set; } = string.Empty;
        [JsonPropertyName("hourlyRate")] public decimal HourlyRate { get; set; }
        [JsonPropertyName("fuelOrBatteryLevel")] public int FuelOrBatteryLevel { get; set; }
        [JsonPropertyName("locationHub")] public string LocationHub { get; set; } = string.Empty;
        [JsonPropertyName("conditionNotes")] public string? ConditionNotes { get; set; }
    }

    /// <summary>
    /// Thread-safe Asynchronous HTTP API Service for WinForms Worker Application.
    /// </summary>
    public class VehicleApiService : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _jsonOptions;

        public VehicleApiService(string baseUrl = "https://api.vehiclelending.local/v1")
        {
            var handler = new SocketsHttpHandler
            {
                PooledConnectionLifetime = TimeSpan.FromMinutes(15),
                MaxConnectionsPerServer = 10
            };

            _httpClient = new HttpClient(handler)
            {
                BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/"),
                Timeout = TimeSpan.FromSeconds(15)
            };

            _httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json")
            );
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "VehicleLending-DesktopWorker/1.0");

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
        }

        /// <summary>
        /// Asynchronously fetches live physical inventory from the REST API.
        /// </summary>
        public async Task<List<VehicleDto>> GetVehicleInventoryAsync(CancellationToken cancellationToken = default)
        {
            using var response = await _httpClient.GetAsync("vehicles", HttpCompletionOption.ResponseHeadersRead, cancellationToken)
                .ConfigureAwait(false);

            response.EnsureSuccessStatusCode();

            await using var contentStream = await response.Content.ReadAsStreamAsync(cancellationToken)
                .ConfigureAwait(false);

            var vehicles = await JsonSerializer.DeserializeAsync<List<VehicleDto>>(contentStream, _jsonOptions, cancellationToken)
                .ConfigureAwait(false);

            return vehicles ?? new List<VehicleDto>();
        }

        /// <summary>
        /// Updates physical vehicle status, fuel/battery level, and worker condition notes.
        /// </summary>
        public async Task<bool> UpdatePhysicalStatusAsync(
            string vehicleId, 
            string status, 
            int fuelLevel, 
            string notes, 
            CancellationToken cancellationToken = default)
        {
            var payload = new
            {
                status = status.ToLowerInvariant(),
                fuelOrBatteryLevel = fuelLevel,
                conditionNotes = notes,
                lastMaintainedDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(payload, _jsonOptions),
                Encoding.UTF8,
                "application/json"
            );

            using var response = await _httpClient.PatchAsync($"vehicles/{vehicleId}", jsonContent, cancellationToken)
                .ConfigureAwait(false);

            return response.IsSuccessStatusCode;
        }

        public void Dispose() => _httpClient.Dispose();
    }
}`
  },
  {
    id: 'mobile-flatlist',
    title: '5. React Native FlatList Data-Fetching Component',
    category: 'mobile',
    filePath: 'mobile/src/screens/VehicleCatalogScreen.tsx',
    language: 'typescript',
    description: 'React Native FlatList component with pull-to-refresh (RefreshControl), category filtering, real-time availability badges, and borrow request submission.',
    code: `import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet, TextInput, SafeAreaView, Alert
} from 'react-native';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  type: 'car' | 'bike' | 'bicycle';
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  hourlyRate: number;
  dailyRate: number;
  fuelOrBatteryLevel: number;
  locationHub: string;
  imageUrl: string;
}

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
      if (!response.ok) throw new Error(\`HTTP Error: \${response.status}\`);
      const data: Vehicle[] = await response.json();
      setVehicles(data);
      applyFilters(data, selectedType, searchQuery);
    } catch (error) {
      Alert.alert('Connection Error', 'Could not load vehicle catalog.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, searchQuery]);

  useEffect(() => {
    fetchVehicleCatalog();
  }, []);

  const applyFilters = (data: Vehicle[], type: string, query: string) => {
    let result = data;
    if (type !== 'all') result = result.filter(v => v.type === type);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(v => v.name.toLowerCase().includes(q) || v.locationHub.toLowerCase().includes(q));
    }
    setFilteredVehicles(result);
  };

  const handleBorrowRequest = (vehicle: Vehicle) => {
    if (vehicle.status !== 'available') {
      Alert.alert('Unavailable', 'This vehicle is currently in use or under maintenance.');
      return;
    }
    Alert.alert(
      'Confirm Borrowing Request',
      \`Request \${vehicle.name} for $\${vehicle.hourlyRate}/hr?\`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit Request', 
          onPress: () => Alert.alert('Success', 'Booking request submitted for Admin verification!')
        }
      ]
    );
  };

  // 2. Render item component for FlatList
  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    const isAvailable = item.status === 'available';
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <Text style={[styles.statusBadge, { backgroundColor: isAvailable ? '#10B981' : '#EF4444' }]}>
              {item.status.toUpperCase()}
            </Text>
            <Text style={styles.typeBadge}>{item.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.hub}>📍 {item.locationHub}</Text>
          <View style={styles.footerRow}>
            <Text style={styles.price}>$\${item.hourlyRate.toFixed(2)} / hr</Text>
            <TouchableOpacity
              style={[styles.btn, !isAvailable && styles.btnDisabled]}
              disabled={!isAvailable}
              onPress={() => handleBorrowRequest(item)}
            >
              <Text style={styles.btnText}>{isAvailable ? 'Borrow Now' : 'In Use'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredVehicles}
        keyExtractor={item => item.id}
        renderItem={renderVehicleCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVehicleCatalog(); }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Vehicle Lending</Text>
            <TextInput
              style={styles.search}
              placeholder="Search cars, bikes, bicycles..."
              value={searchQuery}
              onChangeText={q => { setSearchQuery(q); applyFilters(vehicles, selectedType, q); }}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  search: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, marginHorizontal: 16, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  image: { width: '100%', height: 160 },
  content: { padding: 14 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  statusBadge: { color: '#FFF', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeBadge: { backgroundColor: '#374151', color: '#FFF', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  hub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  btn: { backgroundColor: '#2563EB', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});

export default VehicleCatalogScreen;`
  }
];

export const CodebaseViewer: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(CODE_DELIVERABLES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedSnippet = CODE_DELIVERABLES.find(s => s.id === selectedSnippetId) || CODE_DELIVERABLES[0];

  const handleCopy = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Context banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">ECOSYSTEM CODEBASE</span>
            <span className="text-slate-400">All Deliverables</span>
            <span className="text-xs text-slate-500 font-mono">Web, Mobile, WinForms, REST Schema</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Multi-Client Code & Architectural Deliverables</h2>
          <p className="text-xs text-slate-600">
            Explore the complete folder structure and full production-ready boilerplates for Web Admin (Axios), Mobile (FlatList), and C# Desktop (HttpClient).
          </p>
        </div>
      </div>

      {/* Main Code View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Navigation Selector */}
        <div className="lg:col-span-4 space-y-2">
          {CODE_DELIVERABLES.map((snippet, idx) => {
            const isSelected = snippet.id === selectedSnippet.id;
            return (
              <button
                key={snippet.id}
                onClick={() => setSelectedSnippetId(snippet.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-start space-x-3 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-100 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {snippet.category === 'structure' ? <FolderTree className="w-4 h-4" /> :
                   snippet.category === 'schema' ? <Database className="w-4 h-4" /> :
                   snippet.category === 'web' ? <LayoutDashboard className="w-4 h-4" /> :
                   snippet.category === 'csharp' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {snippet.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                    {snippet.filePath}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Code Display Canvas */}
        <div className="lg:col-span-8">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
            {/* File Header Bar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-semibold text-slate-200">{selectedSnippet.filePath}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedSnippet.language.toUpperCase()}
                </span>
              </div>

              <button
                onClick={() => handleCopy(selectedSnippet)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-700"
              >
                {copiedId === selectedSnippet.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Description Banner */}
            <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80 text-[11px] text-slate-400">
              💡 {selectedSnippet.description}
            </div>

            {/* Code Content */}
            <div className="p-4 overflow-x-auto max-h-[620px] font-mono text-xs leading-relaxed text-slate-300">
              <pre className="text-[11.5px] leading-6">
                <code>{selectedSnippet.code}</code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
