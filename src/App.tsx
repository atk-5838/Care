import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Users, 
  Radio, 
  Zap, 
  Clock, 
  Flame, 
  X, 
  Play, 
  RotateCcw,
  CheckCircle2,
  Satellite,
  Globe,
  Send,
  Sparkles,
  MapPin,
  Check,
  Layers,
  ChevronRight
} from 'lucide-react';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { TelemetryFeed } from './components/monitoring/TelemetryFeed';
import { Globe3D } from './components/globe/Globe3D';
import { SmartMatchPanel } from './components/matching/SmartMatchPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { useGeminiIngestion } from './hooks/useGeminiIngestion';
import { useGroqProcessor } from './hooks/useGroqProcessor';
import { Incident, UrgencyLevel } from './types';
import { INITIAL_INCIDENTS } from './data/mockData';

const PRESET_SCENARIOS = [
  {
    name: 'Coastal Surge',
    text: 'Coastal Highway 1 Mudslide & Vehicle Submersion. Fast rising sea surge. 4 passenger vehicles partially buried. 5 victims trapped with rising water.'
  },
  {
    name: 'Urban Seismic',
    text: 'Magnitude 5.2 Tremor at Metro Subway Station North Exit. Concrete stairway structural failure with 12 commuters trapped. Gas smell reported in concourse.'
  },
  {
    name: 'Wildfire Canyon',
    text: 'Rapid brushfire flare-up at Pine Valley Ridge. High 45 knot gusts. 18 residential structures threatened. Urgent water tanker and structural defense crew needed.'
  },
  {
    name: 'Hazmat Facility',
    text: 'Industrial ammonia refrigeration tank rupture in Sector 4 logistics hub. Toxic gas plume expanding towards eastern residential block. Evac perimeter required.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'globe' | 'matching' | 'telemetry' | 'pipeline'>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INITIAL_INCIDENTS[0]);

  // Hook integrations
  const { isConnected, isMock, messages } = useWebSocket({ mockIntervalMs: 4000 });
  const { analyzeReport, isAnalyzing, progress: geminiProgress, stageMessage: geminiStage, result: geminiResult, reset: resetGemini } = useGeminiIngestion();
  const { processTaxonomy, isProcessing, progress: groqProgress, stageMessage: groqStage, result: groqResult, reset: resetGroq } = useGroqProcessor();

  const [sampleReport, setSampleReport] = useState(PRESET_SCENARIOS[0].text);
  const [committedIncidentSuccess, setCommittedIncidentSuccess] = useState<Incident | null>(null);

  const runFullPipeline = async () => {
    resetGroq();
    setCommittedIncidentSuccess(null);
    const gResult = await analyzeReport({
      rawText: sampleReport,
      region: 'Sector 7 - Coastline'
    });
    await processTaxonomy(gResult);
  };

  const handleCommitIncident = () => {
    if (!geminiResult || !groqResult) return;

    const newId = `INC-${Math.floor(Math.random() * 800 + 150)}`;
    const parsedUrgency: UrgencyLevel = 
      geminiResult.urgencyAssessment === 'CRITICAL' ? 'CRITICAL' :
      geminiResult.urgencyAssessment === 'HIGH' ? 'HIGH' :
      geminiResult.urgencyAssessment === 'LOW' ? 'LOW' : 'MODERATE';

    const newIncident: Incident = {
      id: newId,
      title: sampleReport.slice(0, 52).trim() + (sampleReport.length > 52 ? '...' : ''),
      summary: sampleReport,
      urgency: parsedUrgency,
      location: {
        name: 'Sector 7 Coastline / Route 1 Marker 42',
        lat: 34.025 + (Math.random() * 0.08 - 0.04),
        lng: -118.490 + (Math.random() * 0.08 - 0.04),
        region: 'Sector 7 - Coastline'
      },
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assignedVolunteers: 0,
      requiredSkills: groqResult.requiredSkills,
      status: 'OPEN',
      priorityScore: groqResult.priorityScore,
      extractedNeeds: geminiResult.extractedNeeds
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setCommittedIncidentSuccess(newIncident);
  };

  const handleVolunteerDispatched = (volunteerId: string, incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, assignedVolunteers: inc.assignedVolunteers + 1, status: 'DISPATCHED' }
          : inc
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 tactical-grid flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Mission Control Command Header */}
      <header className="border-b border-white/10 bg-[#0A101D]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-xl tracking-wider text-white">CARELINK 2.0</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                CRISIS OPS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                PHASE F5 VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight hidden sm:block">
              Disaster Operations • Smart Match Scoring • Category Weighting Sliders • CAD Dispatch Modal
            </p>
          </div>
        </div>

        {/* Tactical Navigation Tabs with Mobile Horizontal Scrolling */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs font-mono overflow-x-auto max-w-full no-scrollbar">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-rose-600 text-white font-bold shadow-md glow-red'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>DASHBOARD</span>
          </button>

          <button
            id="tab-globe"
            onClick={() => setActiveTab('globe')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'globe'
                ? 'bg-cyan-600 text-white font-bold shadow-md glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="flex items-center space-x-1.5">
              <span>3D GLOBE</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            </span>
          </button>

          <button
            id="tab-matching"
            onClick={() => setActiveTab('matching')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'matching'
                ? 'bg-amber-600 text-white font-bold shadow-md glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>SMART MATCH</span>
          </button>

          <button
            id="tab-telemetry"
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-emerald-600 text-white font-bold shadow-md glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>TELEMETRY FEED</span>
          </button>

          <button
            id="tab-pipeline"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI PIPELINE</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>

        {/* Right Status */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-md glass-panel-subtle text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold">STREAM:</span>
            <span className="text-slate-300">LIVE WS</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>10:54 UTC</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* PHASE F2 TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-6">
            <OverviewDashboard
              incidents={incidents}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              selectedIncidentId={selectedIncident?.id}
              onViewGlobe={() => setActiveTab('globe')}
            />

            {/* Selected Incident Drawer / Inspection Bar */}
            {selectedIncident && (
              <div className="glass-panel p-4 sm:p-5 rounded-xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-in-up">
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    selectedIncident.urgency === 'CRITICAL' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-red'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        ACTIVE INSPECTION: {selectedIncident.id}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                        selectedIncident.urgency === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {selectedIncident.urgency}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedIncident.location.name}
                      </span>
                    </div>
                    <h3 className="text-base font-display font-bold text-white tracking-wide mt-0.5">
                      {selectedIncident.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                      {selectedIncident.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => setActiveTab('matching')}
                    className="px-3.5 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-display font-semibold text-xs tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm glow-amber"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>SMART MATCH RESPONDERS</span>
                  </button>
                  <button
                    onClick={() => {
                      setSampleReport(`${selectedIncident.title}. ${selectedIncident.summary}`);
                      setActiveTab('pipeline');
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-display font-semibold text-xs tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-md glow-cyan"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>ANALYZE IN AI PIPELINE</span>
                  </button>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="p-2 rounded-lg glass-panel hover:bg-white/10 text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE F3 TAB: 3D GEOSPATIAL GLOBE & TACTICAL HUD */}
        {activeTab === 'globe' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-wide flex items-center space-x-2">
                  <span>3D GEOSPATIAL CRISIS GLOBE</span>
                  <span className="text-xs font-mono font-normal text-cyan-400">
                    [ORBITAL RECON HUD]
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Interactive 3D sphere with continuous pulsing CRITICAL beacons, glassmorphic layer toggles, and live HTML hover telemetry overlay.
                </p>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>CONTINUOUS CRITICAL PULSE</span>
                </div>
                <div className="px-3 py-1 rounded-md glass-panel-subtle text-cyan-300 border border-cyan-500/30">
                  <span>TOOLTIP HOVER ACTIVE</span>
                </div>
              </div>
            </div>

            {/* 3D Interactive Tactical Globe */}
            <Globe3D
              incidents={incidents}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              selectedIncidentId={selectedIncident?.id}
            />

            {/* Inspection Drawer for Globe Selection */}
            {selectedIncident && (
              <div className="glass-panel p-4 sm:p-5 rounded-xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-in-up">
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    selectedIncident.urgency === 'CRITICAL' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-red'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        GLOBE TARGET SELECTED: {selectedIncident.id}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                        selectedIncident.urgency === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {selectedIncident.urgency}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedIncident.location.name}
                      </span>
                    </div>
                    <h3 className="text-base font-display font-bold text-white tracking-wide mt-0.5">
                      {selectedIncident.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                      {selectedIncident.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => setActiveTab('matching')}
                    className="px-3.5 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-display font-semibold text-xs tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm glow-amber"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>SMART MATCH RESPONDERS</span>
                  </button>
                  <button
                    onClick={() => {
                      setSampleReport(`${selectedIncident.title}. ${selectedIncident.summary}`);
                      setActiveTab('pipeline');
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-display font-semibold text-xs tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-md glow-cyan"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>ANALYZE IN AI PIPELINE</span>
                  </button>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="p-2 rounded-lg glass-panel hover:bg-white/10 text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE F4 TAB: SMART MATCH SCORING & DISPATCH OPTIMIZER */}
        {activeTab === 'matching' && (
          <div className="animate-fade-in space-y-6">
            <SmartMatchPanel
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onVolunteerDispatched={handleVolunteerDispatched}
            />
          </div>
        )}

        {/* PHASE F2 TAB 2: TELEMETRY FEED */}
        {activeTab === 'telemetry' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-wide">
                  REAL-TIME TELEMETRY & SENSOR MONITORING
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Live acoustic hydrophones, seismic arrays, LIDAR air quality, and CAD dispatch event stream.
                </p>
              </div>
              <div className="px-3 py-1 rounded-md glass-panel-subtle text-xs font-mono text-emerald-400">
                <span>PULSING LIVE TELEMETRY</span>
              </div>
            </div>

            <TelemetryFeed maxItems={150} />
          </div>
        )}

        {/* PHASE F2 TAB 3: TWO-STAGE AI PIPELINE SIMULATOR */}
        {activeTab === 'pipeline' && (
          <div className="animate-fade-in space-y-6">
            <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-display font-bold text-base tracking-wider text-white">
                    TWO-STAGE AI TRIAGE PIPELINE (GEMINI MULTIMODAL + GROQ LPU)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={runFullPipeline}
                    disabled={isAnalyzing || isProcessing}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-display font-semibold text-xs tracking-wider flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-md glow-amber"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>RUN TWO-STAGE INGESTION</span>
                  </button>
                  {(geminiResult || groqResult) && (
                    <button
                      onClick={() => { resetGemini(); resetGroq(); setCommittedIncidentSuccess(null); }}
                      className="p-2 rounded-lg glass-panel hover:bg-white/10 text-slate-300 transition-colors"
                      title="Reset Pipeline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scenario Preset Selectors */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Tactical Scenario Presets:
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {PRESET_SCENARIOS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSampleReport(preset.text);
                        setCommittedIncidentSuccess(null);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-all border ${
                        sampleReport === preset.text
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 glow-cyan font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-white/10'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={sampleReport}
                  onChange={(e) => setSampleReport(e.target.value)}
                  placeholder="Paste recon dispatch, 911 transcript, or drone telemetry..."
                  className="w-full bg-[#060910] border border-white/15 rounded-lg p-3 text-sm text-slate-200 font-sans focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>

              {/* Progressive Progress Indicator */}
              {(isAnalyzing || isProcessing) && (
                <div className="glass-panel-subtle p-3.5 rounded-lg border border-cyan-500/30 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center space-x-2 text-cyan-300 font-semibold">
                      {isAnalyzing ? (
                        <>
                          <Satellite className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span>STAGE 1: GEMINI INGESTION</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 animate-bounce text-amber-400" />
                          <span>STAGE 2: GROQ LPU PROCESSING</span>
                        </>
                      )}
                    </span>
                    <span className="text-slate-400">
                      {isAnalyzing ? `${geminiProgress}%` : `${groqProgress}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isAnalyzing ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`}
                      style={{ width: `${isAnalyzing ? geminiProgress : groqProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    {isAnalyzing ? geminiStage : groqStage}
                  </p>
                </div>
              )}

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Stage 1 */}
                <div className={`p-4 rounded-lg border ${geminiResult ? 'glass-panel-danger border-rose-500/40' : 'glass-panel-subtle border-white/5 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-rose-400 flex items-center space-x-1.5">
                      <Satellite className="w-3.5 h-3.5" />
                      <span>1. GEMINI MULTIMODAL</span>
                    </span>
                    {geminiResult && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {geminiResult.confidence}% CONF
                      </span>
                    )}
                  </div>
                  {geminiResult ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Severity:</span>
                        <span className="font-mono font-bold text-rose-400 px-1.5 py-0.5 bg-rose-950/60 rounded border border-rose-800/40">
                          {geminiResult.urgencyAssessment} • {geminiResult.damageSeverity}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Identified Hazards:</span>
                        <div className="flex flex-wrap gap-1">
                          {geminiResult.detectedHazards.map((h, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">{h}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Extracted Needs:</span>
                        <div className="flex flex-wrap gap-1">
                          {geminiResult.extractedNeeds.map((n, i) => (
                            <span key={i} className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800/50 rounded text-[11px]">{n}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Awaiting Stage 1 ingestion trigger...</p>
                  )}
                </div>

                {/* Stage 2 */}
                <div className={`p-4 rounded-lg border ${groqResult ? 'glass-panel-warning border-amber-500/40' : 'glass-panel-subtle border-white/5 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>2. GROQ LPU TAXONOMY</span>
                    </span>
                    {groqResult && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {groqResult.executionLatencyMs}ms LPU
                      </span>
                    )}
                  </div>
                  {groqResult ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Queue:</span>
                        <span className="font-mono font-bold text-amber-300 px-1.5 py-0.5 bg-amber-950/60 rounded border border-amber-800/40">
                          {groqResult.triageQueue} (Score: {groqResult.priorityScore}/100)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Required Volunteer Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {groqResult.requiredSkills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-950/80 text-amber-200 border border-amber-800/40 rounded text-[11px]">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Dispatch Protocol:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/60 p-1.5 rounded border border-white/5">
                          {groqResult.dispatchPlan}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Awaiting Stage 2 Groq classification...</p>
                  )}
                </div>
              </div>

              {/* End-to-End Integration: Commit & Dispatch CTA */}
              {geminiResult && groqResult && !committedIncidentSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-cyan-950/40 border border-rose-500/50 animate-slide-in-up flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 glow-red">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white tracking-wide">
                        DISASTER INCIDENT READY FOR OPERATIONAL COMMIT
                      </h4>
                      <p className="text-xs text-slate-300 font-mono">
                        Classified as <span className="text-rose-400 font-bold">{geminiResult.urgencyAssessment}</span> with priority score <span className="text-amber-400 font-bold">{groqResult.priorityScore}/100</span>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCommitIncident}
                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs tracking-wider flex items-center space-x-2 transition-all cursor-pointer shadow-lg glow-red shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>AUTHORIZE & COMMIT TO LIVE MISSION CONTROL</span>
                  </button>
                </div>
              )}

              {/* Success Banner with Navigation Actions */}
              {committedIncidentSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 animate-slide-in-up space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-display font-bold text-sm">
                      <Check className="w-4 h-4" />
                      <span>INCIDENT {committedIncidentSuccess.id} BROADCAST TO LIVE OPERATIONS GRID</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-300/80">
                      Live on 3D Globe & Smart Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">
                    "{committedIncidentSuccess.title}" has been appended to the active crisis registry. Responders can now be matched and dispatched immediately.
                  </p>

                  <div className="flex items-center gap-2.5 flex-wrap pt-1">
                    <button
                      onClick={() => setActiveTab('globe')}
                      className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-display font-semibold tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer glow-cyan"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>VIEW ON 3D GLOBE</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('matching')}
                      className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-display font-semibold tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer glow-amber"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>SMART MATCH RESPONDERS</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-semibold tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer glow-red"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>VIEW ON DASHBOARD</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
