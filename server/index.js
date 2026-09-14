const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// ===== MIDDLEWARE =====
app.use(cors());          // izinkan web/mobile akses
app.use(express.json());  // parse body JSON

// ===== LOAD "DATABASE" (in-memory) =====
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const raw = fs.readFileSync(DB_PATH, 'utf-8');
let db = JSON.parse(raw);

console.log(`📦 Loaded ${db.vehicles.length} vehicles, ${db.users.length} users, ${db.transactions.length} transactions`);

// Helper: simulate network delay (biar kerasa "real")
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// ===== LOGGING MIDDLEWARE =====
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/', (req, res) => {
  res.json({
    name: 'VehLend API',
    version: '1.0.0',
    endpoints: [
      'GET    /api/vehicles',
      'GET    /api/vehicles/:id',
      'POST   /api/vehicles',
      'PUT    /api/vehicles/:id',
      'PATCH  /api/vehicles/:id',
      'DELETE /api/vehicles/:id',
      'GET    /api/users',
      'GET    /api/transactions',
      'POST   /api/transactions',
      'PATCH  /api/transactions/:id',
      'GET    /api/hubs',
      'GET    /api/stats',
    ],
  });
});

// ============================================================
// VEHICLES
// ============================================================

// GET /api/vehicles?type=car&status=available&search=tesla
app.get('/api/vehicles', async (req, res) => {
  await delay();
  const { type, status, search } = req.query;
  let result = [...db.vehicles];

  if (type && type !== 'all') {
    result = result.filter((v) => v.type === type);
  }
  if (status) {
    result = result.filter((v) => v.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter((v) =>
      [v.name, v.brand, v.model, v.licensePlate, v.serialNumber, v.locationHub]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }

  res.json(result);
});

// GET /api/vehicles/:id
app.get('/api/vehicles/:id', async (req, res) => {
  await delay();
  const v = db.vehicles.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(v);
});

// POST /api/vehicles
app.post('/api/vehicles', async (req, res) => {
  await delay();
  const newVehicle = {
    id: `veh_${String(db.vehicles.length + 1).padStart(3, '0')}_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  db.vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

// PUT /api/vehicles/:id (full replace)
app.put('/api/vehicles/:id', async (req, res) => {
  await delay();
  const idx = db.vehicles.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Vehicle not found' });
  db.vehicles[idx] = { ...db.vehicles[idx], ...req.body, id: req.params.id };
  res.json(db.vehicles[idx]);
});

// PATCH /api/vehicles/:id (partial update)
app.patch('/api/vehicles/:id', async (req, res) => {
  await delay();
  const idx = db.vehicles.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Vehicle not found' });
  db.vehicles[idx] = { ...db.vehicles[idx], ...req.body };
  res.json(db.vehicles[idx]);
});

// DELETE /api/vehicles/:id
app.delete('/api/vehicles/:id', async (req, res) => {
  await delay();
  const idx = db.vehicles.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Vehicle not found' });
  const [deleted] = db.vehicles.splice(idx, 1);
  res.json(deleted);
});

// ============================================================
// USERS
// ============================================================
app.get('/api/users', async (req, res) => {
  await delay();
  const { role, verificationStatus } = req.query;
  let result = [...db.users];
  if (role) result = result.filter((u) => u.role === role);
  if (verificationStatus) result = result.filter((u) => u.verificationStatus === verificationStatus);
  res.json(result);
});

app.get('/api/users/:id', async (req, res) => {
  await delay();
  const u = db.users.find((x) => x.id === req.params.id);
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(u);
});

app.patch('/api/users/:id', async (req, res) => {
  await delay();
  const idx = db.users.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  db.users[idx] = { ...db.users[idx], ...req.body };
  res.json(db.users[idx]);
});

// ============================================================
// TRANSACTIONS
// ============================================================
app.get('/api/transactions', async (req, res) => {
  await delay();
  const { userId, status } = req.query;
  let result = [...db.transactions];
  if (userId) result = result.filter((t) => t.userId === userId);
  if (status) result = result.filter((t) => t.status === status);
  res.json(result);
});

app.get('/api/transactions/:id', async (req, res) => {
  await delay();
  const t = db.transactions.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ message: 'Transaction not found' });
  res.json(t);
});

app.post('/api/transactions', async (req, res) => {
  await delay();
  const newTx = {
    id: `tx_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.transactions.unshift(newTx);

  // Side-effect: tandai kendaraan jadi reserved
  const vehIdx = db.vehicles.findIndex((v) => v.id === newTx.vehicleId);
  if (vehIdx !== -1) {
    db.vehicles[vehIdx].status = 'reserved';
  }

  res.status(201).json(newTx);
});

app.patch('/api/transactions/:id', async (req, res) => {
  await delay();
  const idx = db.transactions.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Transaction not found' });

  db.transactions[idx] = {
    ...db.transactions[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  // Side-effect: kalau transaksi approved/active, ubah status kendaraan
  const tx = db.transactions[idx];
  const vehIdx = db.vehicles.findIndex((v) => v.id === tx.vehicleId);
  if (vehIdx !== -1) {
    if (tx.status === 'approved' || tx.status === 'active') {
      db.vehicles[vehIdx].status = 'rented';
    } else if (tx.status === 'completed' || tx.status === 'cancelled' || tx.status === 'rejected') {
      db.vehicles[vehIdx].status = 'available';
    }
  }

  res.json(db.transactions[idx]);
});

// ============================================================
// HUBS
// ============================================================
app.get('/api/hubs', async (req, res) => {
  await delay(50);
  res.json(db.hubs);
});

// ============================================================
// DASHBOARD STATS
// ============================================================
app.get('/api/stats', async (req, res) => {
  await delay();
  const totalVehicles = db.vehicles.length;
  const availableVehicles = db.vehicles.filter((v) => v.status === 'available').length;
  const activeRentals = db.vehicles.filter((v) => v.status === 'rented').length;
  const underMaintenance = db.vehicles.filter((v) => v.status === 'maintenance').length;
  const totalUsers = db.users.length;
  const pendingVerifications = db.users.filter((u) => u.verificationStatus === 'pending').length;
  const pendingBookings = db.transactions.filter((t) => t.status === 'pending_verification').length;
  const totalRevenueToday = db.transactions
    .filter((t) => t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + (t.totalCost || 0), 0);

  res.json({
    totalVehicles,
    availableVehicles,
    activeRentals,
    underMaintenance,
    totalUsers,
    pendingVerifications,
    pendingBookings,
    totalRevenueToday,
    fleetBreakdown: {
      cars: db.vehicles.filter((v) => v.type === 'car').length,
      bikes: db.vehicles.filter((v) => v.type === 'bike').length,
      bicycles: db.vehicles.filter((v) => v.type === 'bicycle').length,
    },
  });
});

// ============================================================
// RESET endpoint (buat demo — balik ke kondisi awal)
// ============================================================
app.post('/api/reset', (req, res) => {
  db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  res.json({ message: 'Database reset to initial state', counts: {
    vehicles: db.vehicles.length,
    users: db.users.length,
    transactions: db.transactions.length,
  }});
});

// ===== START =====
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 VehLend API Server running');
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://${getLocalIP()}:${PORT}`);
  console.log('');
  console.log('   Test: curl http://localhost:4000/api/vehicles');
  console.log('');
});

// Helper: dapatkan IP LAN
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}