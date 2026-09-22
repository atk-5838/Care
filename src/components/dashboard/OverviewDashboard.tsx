import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Users, 
  Zap, 
  ShieldCheck, 
  Radio, 
  MapPin, 
  ChevronRight, 
  Clock, 
  RefreshCw,
  Pause,
  Play,
  Filter,
  UserCheck,
  Building2,
  Ambulance,
  Globe
} from 'lucide-react';
import { Incident, UrgencyLevel } from '../../types';
import { INITIAL_INCIDENTS } from '../../data/mockData';
import { CountUpNumber } from './CountUpNumber';
import { SparklineChart } from './SparklineChart';

interface OverviewDashboardProps {
  onSelectIncident?: (incident: Incident) => void;
  selectedIncidentId?: string;
  onViewGlobe?: () => void;
  incidents?: Incident[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onSelectIncident,
  selectedIncidentId,
  onViewGlobe,
  incidents: incidentsProp
}) => {
  const [incidents, setIncidents] = useState<Incident[]>(incidentsProp || INITIAL_INCIDENTS);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState<'ALL' | UrgencyLevel>('ALL');

  useEffect(() => {
    if (incidentsProp) {
      setIncidents(incidentsProp);
      setKpis((prev) => ({
        ...prev,
        activeIncidents: incidentsProp.length,
        criticalCount: incidentsProp.filter((i) => i.urgency === 'CRITICAL').length
      }));
    }
  }, [incidentsProp]);

  // Dynamic KPI States with count-up animation triggers
  const [kpis, setKpis] = useState({
    activeIncidents: 14,
    criticalCount: 4,
    deployedResponders: 38,
    meanMatchLatency: 82,
    evacRate: 91.4
  });

  const [sparklines, setSparklines] = useState({
    incidents: [8, 9, 11, 10, 12, 13, 14],
    critical: [2, 3, 2, 4, 3, 5, 4],
    responders: [22, 25, 29, 31, 34, 36, 38],
    latency: [124, 110, 96, 88, 85, 80, 82],
    evac: [65, 72, 79, 83, 87, 90, 91.4]
  });

  const feedScrollRef = useRef<HTMLDivElement>(null);
  const isHoveringFeed = useRef(false);

  // Auto-scroll loop for the live incident feed
  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      if (feedScrollRef.current && !isHoveringFeed.current) {
        const el = feedScrollRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (maxScroll <= 0) return;

        // Smoothly scroll down incrementally, loop to top when reached bottom
        if (el.scrollTop >= maxScroll - 10) {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ top: 96, behavior: 'smooth' });
        }
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [autoScroll]);

  // Periodic KPI mutation to demonstrate live count-up animation
  const refreshKpis = () => {
    setKpis((prev) => {
      const incDiff = Math.floor(Math.random() * 3) - 1;
      const critDiff = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      const respDiff = Math.floor(Math.random() * 4) + 1;
      const latDiff = Math.floor(Math.random() * 10) - 5;
      const newInc = Math.max(10, prev.activeIncidents + incDiff);
      const newCrit = Math.max(2, Math.min(8, prev.criticalCount + critDiff));
      const newResp = Math.max(25, prev.deployedResponders + respDiff);
      const newLat = Math.max(58, Math.min(130, prev.meanMatchLatency + latDiff));
      const newEvac = Math.min(99.2, +(prev.evacRate + (Math.random() * 0.8)).toFixed(1));

      // Append sparkline trends
      setSparklines((s) => ({
        incidents: [...s.incidents.slice(1), newInc],
        critical: [...s.critical.slice(1), newCrit],
        responders: [...s.responders.slice(1), newResp],
        latency: [...s.latency.slice(1), newLat],
        evac: [...s.evac.slice(1), newEvac]
      }));

      return {
        activeIncidents: newInc,
        criticalCount: newCrit,
        deployedResponders: newResp,
        meanMatchLatency: newLat,
        evacRate: newEvac
      };
    });
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (activeUrgencyFilter === 'ALL') return true;
    return inc.urgency === activeUrgencyFilter;
  });

  return (
    <div className="space-y-6">
      {/* KPI CARDS SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide flex items-center space-x-2">
            <span>OPERATIONAL SITUATION DASHBOARD</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              [SECTOR 1-12 ACTIVE TRIAGE]
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time disaster telemetry, survivor density estimates, and rapid responder dispatch metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onViewGlobe && (
            <button
              onClick={onViewGlobe}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-xs font-mono text-cyan-300 border border-cyan-500/40 flex items-center space-x-2 transition-all cursor-pointer shadow-sm glow-cyan"
              title="Switch to 3D Geospatial Globe"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">VIEW IN 3D GLOBE</span>
            </button>
          )}

          <button
            onClick={refreshKpis}
            className="px-3 py-1.5 rounded-lg glass-panel hover:bg-white/10 text-xs font-mono text-cyan-300 border border-cyan-500/30 flex items-center space-x-2 transition-all cursor-pointer"
            title="Simulate KPI live shift"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SIMULATE TELEMETRY SHIFT</span>
          </button>
        </div>
      </div>

      {/* KPI 5-Card Grid with Inline Sparkline Charts & Count-Up Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Incidents */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider text-[11px]">ACTIVE INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              <CountUpNumber value={kpis.activeIncidents} />
            </div>
            <SparklineChart data={sparklines.incidents} color="red" width={76} height={26} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-rose-400 font-semibold">+3 in last 60m</span>
            <span className="text-slate-500">6 zones reporting</span>
          </div>
        </div>

        {/* Card 2: Critical Urgency */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden border-glow-red animate-pulse-red">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider text-[11px] text-rose-300 font-semibold">
              CRITICAL THREATS
            </span>
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-display font-bold text-rose-200 tracking-tight">
              <CountUpNumber value={kpis.criticalCount} />
            </div>
            <SparklineChart data={sparklines.critical} color="red" width={76} height={26} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-rose-400 font-bold">DEFCON 1 PROTOCOL</span>
            <span className="text-rose-300/80">USAR / Hazmat</span>
          </div>
        </div>

        {/* Card 3: Deployed Volunteers */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider text-[11px]">FIELD RESPONDERS</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              <CountUpNumber value={kpis.deployedResponders} />
            </div>
            <SparklineChart data={sparklines.responders} color="emerald" width={76} height={26} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold">89% On-Station</span>
            <span className="text-slate-500">12 Squads</span>
          </div>
        </div>

        {/* Card 4: Mean Match Latency */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider text-[11px]">GROQ LPU LATENCY</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              <CountUpNumber value={kpis.meanMatchLatency} suffix="ms" />
            </div>
            <SparklineChart data={sparklines.latency} color="cyan" width={76} height={26} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-400 font-semibold">Sub-100ms Routing</span>
            <span className="text-slate-500">Fast taxonomy</span>
          </div>
        </div>

        {/* Card 5: Evacuation / Containment */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider text-[11px]">EVACUATION METRIC</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              <CountUpNumber value={kpis.evacRate} decimals={1} suffix="%" />
            </div>
            <SparklineChart data={sparklines.evac} color="amber" width={76} height={26} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400 font-semibold">420 Sheltered</span>
            <span className="text-slate-500">Perimeter clear</span>
          </div>
        </div>
      </div>

      {/* LIVE INCIDENT FEED SECTION WITH PULSING "LIVE" BADGE & AUTO-SCROLL */}
      <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center space-x-3">
            {/* Pulsing "LIVE" Badge */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 glow-red">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-rose-300 uppercase">
                LIVE
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-base tracking-wider text-white">
                TRIAGE INCIDENT PIPELINE
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                {filteredIncidents.length} active records
              </span>
            </div>
          </div>

          {/* Controls: Urgency Filter & Auto-Scroll Toggle */}
          <div className="flex items-center space-x-3">
            {/* Urgency Filter Chips */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-white/10 text-xs font-mono">
              {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveUrgencyFilter(filter)}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold cursor-pointer ${
                    activeUrgencyFilter === filter
                      ? filter === 'CRITICAL'
                        ? 'bg-rose-600 text-white shadow'
                        : filter === 'HIGH'
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-cyan-700 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                autoScroll
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title={autoScroll ? 'Pause auto-scrolling' : 'Resume auto-scrolling'}
            >
              {autoScroll ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span>AUTO-SCROLL: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-slate-400" />
                  <span>AUTO-SCROLL: OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Live Feed List Container */}
        <div
          ref={feedScrollRef}
          onMouseEnter={() => { isHoveringFeed.current = true; }}
          onMouseLeave={() => { isHoveringFeed.current = false; }}
          className="space-y-3 max-h-[460px] overflow-y-auto pr-1.5 focus:outline-none"
        >
          {filteredIncidents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No incidents matching urgency filter &quot;{activeUrgencyFilter}&quot;
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const isCrit = incident.urgency === 'CRITICAL';
              const isHigh = incident.urgency === 'HIGH';
              const isSelected = selectedIncidentId === incident.id;

              return (
                <div
                  key={incident.id}
                  onClick={() => onSelectIncident?.(incident)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-950/50 scale-[1.008]'
                      : isCrit
                      ? 'glass-panel-danger border-rose-500/35 hover:border-rose-400 hover:bg-rose-950/50'
                      : isHigh
                      ? 'glass-panel-warning border-amber-500/35 hover:border-amber-400 hover:bg-amber-950/50'
                      : 'glass-card border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2">
                    <div className="flex items-center space-x-2.5 flex-wrap">
                      {/* Urgency Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider uppercase flex items-center space-x-1.5 ${
                          isCrit
                            ? 'bg-rose-600 text-white shadow-sm glow-red'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : incident.urgency === 'MODERATE'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isCrit && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                        <span>{incident.urgency}</span>
                      </span>

                      {/* Status Tag */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-white/10">
                        {incident.status}
                      </span>

                      {/* Incident ID */}
                      <span className="text-xs font-mono text-cyan-400 font-semibold">
                        {incident.id}
                      </span>

                      {/* Priority Score */}
                      <span className="text-xs font-mono text-slate-400">
                        P-SCORE: <strong className="text-white">{incident.priorityScore}</strong>/100
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{incident.reportedAt}</span>
                      </span>
                      {incident.casualties && incident.casualties > 0 && (
                        <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                          <Ambulance className="w-3.5 h-3.5" />
                          <span>{incident.casualties} Casualties</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h4 className="text-base font-display font-bold text-white tracking-wide mb-1">
                    {incident.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                    {incident.summary}
                  </p>

                  {/* Footer metadata: location, extracted needs, assigned volunteers */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-white/5">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{incident.location.name}</span>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap">
                      <div className="flex items-center space-x-1">
                        {incident.extractedNeeds.slice(0, 3).map((need, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-white/5 text-[10px] font-mono"
                          >
                            {need}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                        <UserCheck className="w-3 h-3" />
                        <span>{incident.assignedVolunteers} Assigned</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
