# Vehicle Lending System - Multi-Client Ecosystem

A comprehensive multi-platform Vehicle Lending System supporting **Cars**, **Bikes**, and **Bicycles** with a centralized Mock REST API (swappable to MockAPI.io), dedicated Web Admin portal, React Native Mobile customer client, and C# Windows Forms physical inventory worker terminal.

---

## 1. Multi-Platform Ecosystem Structure

```
vehicle-lending-system/
├── mock-api/
│   ├── db.json                      # Centralized Mock REST Schema (Users, Vehicles, Transactions)
│   └── package.json                 # json-server runner
│
├── web/                             # [ADMIN ROLE] React + Vite + TypeScript Web Portal
│   ├── src/
│   │   ├── api/client.ts            # Axios / Fetch client with interceptors
│   │   ├── services/vehicleService.ts
│   │   ├── components/              # Statistics KPIs, Fleet CRUD, KYC Verification
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── mobile/                          # [CUSTOMER ROLE] React Native / Expo Mobile App
│   ├── src/
│   │   ├── screens/VehicleCatalogScreen.tsx  # FlatList catalog with pull-to-refresh
│   │   ├── components/VehicleCard.tsx
│   │   └── navigation/
│   ├── app.json
│   └── package.json
│
├── desktop/                         # [WORKER ROLE] C# .NET 9.0 Windows Forms Client
│   ├── src/
│   │   ├── Services/VehicleApiService.cs     # Thread-safe HttpClient async data fetching
│   │   ├── Forms/VehicleInventoryForm.cs     # DataGridView physical check-in UI
│   │   └── Models/VehicleDto.cs
│   └── VehicleLendingSystem.Desktop.csproj
│
└── README.md
```

---

## 2. Centralized Mock JSON Schema (`/mock-api/db.json`)

The REST backend schema defines three core interconnected entities:
- **`vehicles`**: Universal fleet inventory supporting `car`, `bike`, and `bicycle` types with `status` (`available`, `rented`, `maintenance`, `reserved`), `hourlyRate`, `dailyRate`, `fuelOrBatteryLevel`, and `locationHub`.
- **`users`**: Identity store with role segregation (`admin`, `worker`, `customer`), driver license records, and KYC `verificationStatus` (`verified`, `pending`, `rejected`).
- **`transactions`**: Lending lifecycle records tracking `status` (`pending_verification` -> `approved` -> `active` -> `completed`), hubs, durations, and payment settlements.

---

## 3. Web Admin Integration (`/web/src/api/client.ts`)

Provides typed Axios/Fetch client with interceptors:
- `getAllVehicles(params)` - Supports category and hub filters
- `createVehicle(payload)` - Adds new vehicle to fleet
- `updateVehicleStatus(id, status, fuelLevel)` - Real-time state update
- `updateTransactionStatus(id, status)` - Approves customer loan requests

---

## 4. C# WinForms Worker HttpClient Service (`/desktop/src/Services/VehicleApiService.cs`)

Provides asynchronous methods using .NET `SocketsHttpHandler` and `System.Text.Json`:
```csharp
public async Task<List<VehicleDto>> GetVehicleInventoryAsync(CancellationToken cancellationToken = default);
public async Task<bool> UpdatePhysicalStatusAsync(string vehicleId, string status, int fuelLevel, string notes, CancellationToken cancellationToken = default);
```

---

## 5. React Native Customer FlatList (`/mobile/src/screens/VehicleCatalogScreen.tsx`)

Features:
- `FlatList` with `RefreshControl` pull-to-refresh
- Category filter chips (🚗 Cars, 🏍️ Bikes, 🚲 Bicycles)
- Real-time availability badges and battery/fuel telemetry
- `handleBorrowRequest()` submitting reservations to the central REST store
