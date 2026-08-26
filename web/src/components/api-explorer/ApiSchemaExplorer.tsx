import React, { useState } from 'react';
import { 
  Database, 
  Send, 
  Download, 
  Copy, 
  Check, 
  Globe, 
  ExternalLink, 
  Activity, 
  Layers, 
  Terminal, 
  Code2,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { apiStore } from '../../services/apiStore';
import { ApiLogEntry } from '../../types';

interface ApiSchemaExplorerProps {
  logs: ApiLogEntry[];
}

export const ApiSchemaExplorer: React.FC<ApiSchemaExplorerProps> = ({ logs }) => {
  const [activeSchemaTab, setActiveSchemaTab] = useState<'schema' | 'tester' | 'logs' | 'mockapi'>('schema');
  const [mockApiInput, setMockApiInput] = useState<string>(apiStore.getMockApiUrl());
  const [copied, setCopied] = useState<boolean>(false);
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [testEndpoint, setTestEndpoint] = useState<string>('/vehicles');
  const [testRequestBody, setTestRequestBody] = useState<string>('{\n  "status": "available"\n}');
  const [testResponse, setTestResponse] = useState<string>('');

  const fullDb = apiStore.getFullDbExport();

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullDb, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDb, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'vehicle-lending-db.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveMockApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    apiStore.setMockApiUrl(mockApiInput);
    alert('MockAPI.io base URL updated! Multi-client clients will now prioritize this live endpoint.');
  };

  const handleExecuteTest = () => {
    try {
      if (testEndpoint.includes('/vehicles')) {
        const data = apiStore.getVehicles('API Explorer');
        setTestResponse(JSON.stringify(data, null, 2));
      } else if (testEndpoint.includes('/users')) {
        const data = apiStore.getUsers('API Explorer');
        setTestResponse(JSON.stringify(data, null, 2));
      } else if (testEndpoint.includes('/transactions')) {
        const data = apiStore.getTransactions('API Explorer');
        setTestResponse(JSON.stringify(data, null, 2));
      } else if (testEndpoint.includes('/stats')) {
        const data = apiStore.getStats();
        setTestResponse(JSON.stringify(data, null, 2));
      } else {
        setTestResponse(JSON.stringify({ error: 'Endpoint not found in mock router' }, null, 2));
      }
    } catch (e: any) {
      setTestResponse(JSON.stringify({ error: e.toString() }, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Context banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-600 text-white">REST API & SCHEMA</span>
            <span className="text-slate-400">/mock-api/db.json</span>
            <span className="text-xs text-slate-500 font-mono">Centralized REST Schema Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Central Mock REST API & Schema Engine</h2>
          <p className="text-xs text-slate-600">
            Provides unified relational collections for <strong>Users</strong>, <strong>Vehicles</strong>, and <strong>Transactions</strong> that can be seamlessly routed to local mock state or live MockAPI.io.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON!' : 'Copy db.json'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download db.json</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveSchemaTab('schema')}
            className={`py-3.5 border-b-2 transition flex items-center space-x-2 ${
              activeSchemaTab === 'schema'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Mock Database Schema (Users, Vehicles, Transactions)</span>
          </button>

          <button
            onClick={() => setActiveSchemaTab('mockapi')}
            className={`py-3.5 border-b-2 transition flex items-center space-x-2 ${
              activeSchemaTab === 'mockapi'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>MockAPI.io Live Switcher</span>
          </button>

          <button
            onClick={() => setActiveSchemaTab('tester')}
            className={`py-3.5 border-b-2 transition flex items-center space-x-2 ${
              activeSchemaTab === 'tester'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Interactive REST Endpoint Tester</span>
          </button>

          <button
            onClick={() => setActiveSchemaTab('logs')}
            className={`py-3.5 border-b-2 transition flex items-center space-x-2 ${
              activeSchemaTab === 'logs'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live Multi-Client Request Traffic ({logs.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: SCHEMA VIEWER */}
      {activeSchemaTab === 'schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Relational Collections Summary</h3>
              
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-blue-900">/vehicles ({fullDb.vehicles.length})</div>
                    <div className="text-blue-700 text-[11px]">Cars, Motorbikes, Bicycles with rates & status</div>
                  </div>
                  <span className="font-mono bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">200 OK</span>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-purple-900">/users ({fullDb.users.length})</div>
                    <div className="text-purple-700 text-[11px]">Admin, Worker, Customer roles & KYC verification</div>
                  </div>
                  <span className="font-mono bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">200 OK</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-emerald-900">/transactions ({fullDb.transactions.length})</div>
                    <div className="text-emerald-700 text-[11px]">Lending requests, approvals, loans, and payments</div>
                  </div>
                  <span className="font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">200 OK</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-2">
              <div className="font-bold text-white flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>REST API Conventions</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Compatible with standard REST clients (Fetch, Axios, C# HttpClient, Retrofit, Alamofire).
              </p>
              <div className="font-mono text-[11px] text-emerald-400">
                <div>GET /vehicles</div>
                <div>GET /vehicles/:id</div>
                <div>POST /vehicles</div>
                <div>PATCH /vehicles/:id</div>
                <div>GET /transactions?status=pending_verification</div>
                <div>POST /transactions</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-hidden border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span>mock-api/db.json</span>
                <span>JSON Schema (Formatted)</span>
              </div>
              <pre className="overflow-x-auto max-h-[540px] text-[11px] leading-relaxed text-emerald-300">
                {JSON.stringify(fullDb, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOCKAPI.IO SWITCHER */}
      {activeSchemaTab === 'mockapi' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-start space-x-3">
            <Globe className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">MockAPI.io Live Endpoint Switcher</h3>
              <p className="text-xs text-slate-600 mt-1">
                You can easily transition this ecosystem from local mock memory to a live cloud MockAPI.io instance.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveMockApiUrl} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                MockAPI.io Project Base URL:
              </label>
              <input
                type="url"
                placeholder="https://65c123456789abcd.mockapi.io/api/v1"
                value={mockApiInput}
                onChange={e => setMockApiInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Leave blank to operate in high-performance local simulated mock mode.
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Save Base URL Configuration
              </button>

              {mockApiInput && (
                <button
                  type="button"
                  onClick={() => {
                    setMockApiInput('');
                    apiStore.setMockApiUrl('');
                  }}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Reset to Local Mock
                </button>
              )}
            </div>
          </form>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800">How to create your mockapi.io endpoints:</h4>
            <ol className="list-decimal list-inside text-slate-600 space-y-1">
              <li>Visit <strong>mockapi.io</strong> and create a new project named <code>vehicle-lending</code>.</li>
              <li>Create resources: <code>/vehicles</code>, <code>/users</code>, and <code>/transactions</code>.</li>
              <li>Paste the generated endpoint URL above to route all multi-client calls live!</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE REST TESTER */}
      {activeSchemaTab === 'tester' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
            <select
              value={testMethod}
              onChange={e => setTestMethod(e.target.value as any)}
              className="px-3 py-2 font-bold text-xs bg-slate-100 border border-slate-300 rounded-lg"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <select
              value={testEndpoint}
              onChange={e => setTestEndpoint(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
            >
              <option value="/vehicles">/vehicles (Fetch all vehicles: cars, bikes, bicycles)</option>
              <option value="/users">/users (Fetch all registered users & roles)</option>
              <option value="/transactions">/transactions (Fetch all lending requests & transactions)</option>
              <option value="/stats">/stats (Fetch aggregated KPIs & fleet breakdown)</option>
            </select>

            <button
              onClick={handleExecuteTest}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Request</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-slate-100 font-mono text-xs shadow-2xl">
            <div className="text-slate-400 pb-2 border-b border-slate-800 flex justify-between">
              <span>Response Payload</span>
              <span>200 OK • Application/JSON</span>
            </div>
            <pre className="mt-3 overflow-x-auto max-h-[400px] text-[11px] text-emerald-400">
              {testResponse || '// Click "Send Request" to invoke mock REST endpoint'}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE TRAFFIC LOGS */}
      {activeSchemaTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">Multi-Client HTTP Traffic Stream</h3>
            <span className="text-xs text-slate-500">Live requests across Web, Mobile & C# WinForms</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Endpoint</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Origin Client</th>
                  <th className="py-2.5 px-4 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-4 text-slate-500">{log.timestamp}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        log.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                        log.method === 'PATCH' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-900 font-bold">{log.endpoint}</td>
                    <td className="py-2 px-4">
                      <span className="text-emerald-700 font-bold">{log.statusCode} OK</span>
                    </td>
                    <td className="py-2 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-sans text-[11px]">
                        {log.client}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">{log.durationMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
