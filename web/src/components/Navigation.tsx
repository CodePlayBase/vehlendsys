import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  Monitor, 
  Database, 
  FolderTree, 
  RotateCcw, 
  Activity, 
  Server,
  Car
} from 'lucide-react';
import { apiStore } from '../services/apiStore';

export type PlatformTab = 'web' | 'mobile' | 'desktop' | 'api' | 'architecture';

interface NavigationProps {
  activeTab: PlatformTab;
  setActiveTab: (tab: PlatformTab) => void;
  logsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  logsCount,
}) => {
  const mockApiUrl = apiStore.getMockApiUrl();

  const handleReset = () => {
    if (confirm('Reset entire system database to default seed state?')) {
      apiStore.resetToDefaults();
    }
  };

  const navItems = [
    {
      id: 'web' as PlatformTab,
      label: 'Web Admin Portal',
      sublabel: 'React JS + Vite (Admin Role)',
      icon: LayoutDashboard,
      badge: 'Admin',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'mobile' as PlatformTab,
      label: 'Mobile Customer App',
      sublabel: 'React Native / Expo (Customer)',
      icon: Smartphone,
      badge: 'Customer',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'desktop' as PlatformTab,
      label: 'Desktop Worker Station',
      sublabel: 'C# WinForms (Worker Role)',
      icon: Monitor,
      badge: 'Worker',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'api' as PlatformTab,
      label: 'REST API & Mock Schema',
      sublabel: 'Centralized JSON Store & MockAPI',
      icon: Database,
      badge: 'API Hub',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'architecture' as PlatformTab,
      label: 'Architecture & Codebase',
      sublabel: 'Folder Trees, C# & TS Deliverables',
      icon: FolderTree,
      badge: 'Docs & Code',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Top Banner with System Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700">
            <Car className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-100">Vehicle Lending Ecosystem</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Cars, Bikes & Bicycles</span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono font-medium">
              {mockApiUrl ? `MockAPI.io: ${mockApiUrl.slice(0, 28)}...` : 'Central REST Engine: ACTIVE (Local Mock)'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('api')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 transition"
            title="View Live API Request Logs"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>API Traffic: <strong>{logsCount}</strong> calls</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-red-900/40 hover:text-red-300 text-slate-300 px-2.5 py-1 rounded border border-slate-700 hover:border-red-700/50 transition"
            title="Reset Mock Database to Initial Seed State"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
            <span>Reset DB</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Platform Tab Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Platform Switcher">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-button-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono font-medium ${
                      isActive ? 'bg-blue-700 text-blue-100 border-blue-500' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className={`text-[11px] font-normal ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
