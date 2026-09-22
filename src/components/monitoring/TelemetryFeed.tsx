import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, 
  Filter, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Search, 
  Pause, 
  Play, 
  Trash2,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';
import { TelemetryLog, TelemetryStatus } from '../../types';
import { INITIAL_TELEMETRY_LOGS } from '../../data/mockData';
import { useWebSocket } from '../../hooks/useWebSocket';

interface TelemetryFeedProps {
  maxItems?: number;
}

const REGION_OPTIONS = [
  'ALL REGIONS',
  'Sector 7 - Coastline',
  'Sector 12 - Urban Core',
  'Sector 3 - North Ridge',
  'Sector 9 - River Basin',
  'Sector 4 - Foothills',
  'Sector 1 - Port Terminal'
];

const STATUS_OPTIONS: Array<'ALL STATUSES' | TelemetryStatus> = [
  'ALL STATUSES',
  'CRITICAL',
  'WARNING',
  'NORMAL',
  'INFO'
];

export const TelemetryFeed: React.FC<TelemetryFeedProps> = ({ maxItems = 100 }) => {
  const [logs, setLogs] = useState<TelemetryLog[]>(INITIAL_TELEMETRY_LOGS);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL REGIONS');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL STATUSES');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Connect to the useWebSocket hook from Phase F1
  const { isConnected, isMock, subscribe } = useWebSocket({
    mockIntervalMs: 3800
  });

  // Listen to incoming WebSocket telemetry events
  useEffect(() => {
    const unsubscribe = subscribe('TELEMETRY_LOG', (rawLog: unknown) => {
      if (isPaused) return;
      const log = rawLog as TelemetryLog;
      setLogs((prev) => [log, ...prev.slice(0, maxItems - 1)]);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, isPaused, maxItems]);

  // Filtered telemetry log list
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedRegion !== 'ALL REGIONS' && log.region !== selectedRegion) {
        return false;
      }
      if (selectedStatus !== 'ALL STATUSES' && log.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesMsg = log.message.toLowerCase().includes(query);
        const matchesSource = log.source.toLowerCase().includes(query);
        const matchesRegion = log.region.toLowerCase().includes(query);
        if (!matchesMsg && !matchesSource && !matchesRegion) return false;
      }
      return true;
    });
  }, [logs, selectedRegion, selectedStatus, searchQuery]);

  const clearLogs = () => {
    setLogs([]);
  };

  const criticalCount = useMemo(() => {
    return logs.filter((l) => l.status === 'CRITICAL').length;
  }, [logs]);

  return (
    <div className="glass-panel rounded-xl border border-white/10 flex flex-col h-full overflow-hidden">
      {/* 1. PULSING "LIVE" HEADER WITH TACTICAL TELEMETRY STATUS */}
      <div className="p-4 border-b border-white/10 bg-[#0B1120]/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {/* Pulsing "LIVE" Badge with Beacon Ring */}
          <div className="relative flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 glow-emerald">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-300 uppercase">
              LIVE TELEMETRY FEED
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>STREAM: 4.8 KB/s</span>
            <span className="text-slate-600">•</span>
            <span>BUFFER: {logs.length} EVTS</span>
          </div>
        </div>

        {/* Right Header Status Badges */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          {criticalCount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center space-x-1.5 animate-pulse-red">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{criticalCount} CRITICAL LOGS</span>
            </span>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-md border flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isPaused
                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                : 'glass-panel-subtle hover:bg-white/10 text-slate-300'
            }`}
            title={isPaused ? 'Resume live incoming packets' : 'Pause packet stream'}
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-amber-400" />
                <span>PAUSED</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-400" />
                <span>STREAMING</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. FILTER CONTROLS TOOLBAR: REGION DROPDOWN & STATUS DROPDOWN */}
      <div className="p-3.5 border-b border-white/10 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2.5 items-center text-xs font-mono">
        {/* Region Filter Dropdown */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-white/10 focus-within:border-cyan-500/50">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            id="telemetry-region-filter"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            {REGION_OPTIONS.map((region) => (
              <option key={region} value={region} className="bg-[#0c1322] text-slate-200">
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-white/10 focus-within:border-cyan-500/50">
          <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            id="telemetry-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status} className="bg-[#0c1322] text-slate-200">
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-white/10 focus-within:border-cyan-500/50 sm:col-span-1 md:col-span-2">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search logs by keyword, sensor ID, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-500 hover:text-slate-300 text-[10px]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. LOG ENTRIES STREAM WITH SLIDE-IN ANIMATION */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 max-h-[520px]">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs space-y-2">
            <Radio className="w-6 h-6 mx-auto opacity-40 animate-pulse" />
            <p>No telemetry events match the active region or status criteria.</p>
            <button
              onClick={() => {
                setSelectedRegion('ALL REGIONS');
                setSelectedStatus('ALL STATUSES');
                setSearchQuery('');
              }}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isCrit = log.status === 'CRITICAL';
            const isWarn = log.status === 'WARNING';
            const isNorm = log.status === 'NORMAL';

            // Top items get slide-in animation
            const animateClass = index < 3 ? 'animate-slide-in-right' : '';

            return (
              <div
                key={log.id}
                className={`p-3 rounded-lg border text-xs font-mono transition-all ${animateClass} ${
                  isCrit
                    ? 'glass-panel-danger border-rose-500/40 glow-red'
                    : isWarn
                    ? 'glass-panel-warning border-amber-500/35'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center space-x-2">
                    {/* Status Icon */}
                    {isCrit ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    ) : isWarn ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ) : isNorm ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    )}

                    {/* Source Identifier */}
                    <span className="font-bold text-white tracking-wide text-[11px]">
                      {log.source}
                    </span>

                    {/* Type Tag */}
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 uppercase">
                      {log.type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{log.region}</span>
                    </span>
                    <span className="text-slate-300 font-semibold">{log.timestamp}</span>
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-[11px] leading-relaxed text-slate-200">
                  {log.message}
                </p>

                {/* Footer Tag */}
                <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">ID: {log.id}</span>
                  <span
                    className={`font-bold uppercase tracking-wider ${
                      isCrit
                        ? 'text-rose-400'
                        : isWarn
                        ? 'text-amber-400'
                        : isNorm
                        ? 'text-emerald-400'
                        : 'text-blue-400'
                    }`}
                  >
                    STATUS: {log.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="p-2.5 border-t border-white/10 bg-slate-950/60 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>CareLink Crisis Ingestion Engine v2.4</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Showing {filteredLogs.length} of {logs.length}</span>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-slate-500 hover:text-rose-400 flex items-center space-x-1 transition-colors cursor-pointer"
              title="Clear telemetry logs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
