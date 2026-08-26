import React, { useState, useEffect } from 'react';
import { apiStore } from './services/apiStore';
import { Navigation, PlatformTab } from './components/Navigation';
import { WebAdminDashboard } from './components/web/WebAdminDashboard';
import { MobileCustomerApp } from './components/mobile/MobileCustomerApp';
import { DesktopWorkerApp } from './components/desktop/DesktopWorkerApp';
import { ApiSchemaExplorer } from './components/api-explorer/ApiSchemaExplorer';
import { CodebaseViewer } from './components/architecture/CodebaseViewer';
import { Vehicle, User, Transaction, DashboardStats, ApiLogEntry } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<PlatformTab>('web');
  
  // State synchronized with central apiStore
  const [vehicles, setVehicles] = useState<Vehicle[]>(apiStore.getVehicles('Web Admin'));
  const [users, setUsers] = useState<User[]>(apiStore.getUsers('Web Admin'));
  const [transactions, setTransactions] = useState<Transaction[]>(apiStore.getTransactions('Web Admin'));
  const [stats, setStats] = useState<DashboardStats>(apiStore.getStats());
  const [logs, setLogs] = useState<ApiLogEntry[]>(apiStore.getApiLogs());

  useEffect(() => {
    // Subscribe to store updates across all platforms
    const unsubscribe = apiStore.subscribe(() => {
      setVehicles(apiStore.getVehicles('Web Admin'));
      setUsers(apiStore.getUsers('Web Admin'));
      setTransactions(apiStore.getTransactions('Web Admin'));
      setStats(apiStore.getStats());
      setLogs(apiStore.getApiLogs());
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Multi-Platform Navigation & System Control */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logsCount={logs.length}
      />

      {/* Main Content Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'web' && (
          <WebAdminDashboard
            stats={stats}
            vehicles={vehicles}
            users={users}
            transactions={transactions}
          />
        )}

        {activeTab === 'mobile' && (
          <MobileCustomerApp
            vehicles={vehicles}
            users={users}
            transactions={transactions}
          />
        )}

        {activeTab === 'desktop' && (
          <DesktopWorkerApp
            vehicles={vehicles}
          />
        )}

        {activeTab === 'api' && (
          <ApiSchemaExplorer
            logs={logs}
          />
        )}

        {activeTab === 'architecture' && (
          <CodebaseViewer />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Vehicle Lending System</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Multi-Client Architecture (Cars, Bikes & Bicycles)</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Web (React+Vite)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Mobile (Expo)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Desktop (C# WinForms)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Central REST API</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
