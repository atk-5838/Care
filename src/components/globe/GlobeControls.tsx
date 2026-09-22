import React from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Flame, 
  Users, 
  Radio, 
  CloudRain, 
  Building2, 
  RotateCw, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  ShieldAlert
} from 'lucide-react';

export interface GlobeLayerState {
  threatHeatmap: boolean;
  incidentMarkers: boolean;
  responderUnits: boolean;
  sensorNodes: boolean;
  weatherSurge: boolean;
  criticalFacilities: boolean;
}

interface GlobeControlsProps {
  layers: GlobeLayerState;
  onToggleLayer: (layerKey: keyof GlobeLayerState) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetView: () => void;
  onFocusCritical: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  activeMarkerCount: number;
  criticalMarkerCount: number;
}

export const GlobeControls: React.FC<GlobeControlsProps> = ({
  layers,
  onToggleLayer,
  autoRotate,
  onToggleAutoRotate,
  onResetView,
  onFocusCritical,
  onZoomIn,
  onZoomOut,
  activeMarkerCount,
  criticalMarkerCount
}) => {
  return (
    <aside aria-label="Globe layer controls" className="glass-panel p-4 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl w-full sm:w-80 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-wider text-white">
              GEOSPATIAL LAYERS
            </h3>
            <p className="text-[10px] font-mono text-slate-400">Tactical HUD Projection</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-white/10 text-cyan-400">
            {activeMarkerCount} TARGETS
          </span>
        </div>
      </div>

      {/* Layer Toggles in Glassmorphism Card Style */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
          Tactical Overlays
        </div>

        {/* 1. Incident Markers (Always primary) */}
        <button
          onClick={() => onToggleLayer('incidentMarkers')}
          className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
            layers.incidentMarkers
              ? 'glass-card border-rose-500/40 text-white bg-rose-950/20'
              : 'glass-panel-subtle border-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Flame className={`w-3.5 h-3.5 ${layers.incidentMarkers ? 'text-rose-400' : 'text-slate-600'}`} />
            <span>Incident Markers</span>
          </div>
          <div className="flex items-center space-x-2">
            {criticalMarkerCount > 0 && layers.incidentMarkers && (
              <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[10px] font-bold animate-pulse">
                {criticalMarkerCount} CRIT
              </span>
            )}
            {layers.incidentMarkers ? (
              <Eye className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
        </button>

        {/* 2. Threat Heatmap */}
        <button
          onClick={() => onToggleLayer('threatHeatmap')}
          className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
            layers.threatHeatmap
              ? 'glass-card border-amber-500/40 text-white bg-amber-950/20'
              : 'glass-panel-subtle border-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className={`w-3.5 h-3.5 ${layers.threatHeatmap ? 'text-amber-400' : 'text-slate-600'}`} />
            <span>Hazard Density Heatmap</span>
          </div>
          {layers.threatHeatmap ? (
            <Eye className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* 3. Volunteer Responder Units */}
        <button
          onClick={() => onToggleLayer('responderUnits')}
          className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
            layers.responderUnits
              ? 'glass-card border-emerald-500/40 text-white bg-emerald-950/20'
              : 'glass-panel-subtle border-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Users className={`w-3.5 h-3.5 ${layers.responderUnits ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Volunteer GPS Beacons</span>
          </div>
          {layers.responderUnits ? (
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* 4. Telemetry Sensor Nodes */}
        <button
          onClick={() => onToggleLayer('sensorNodes')}
          className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
            layers.sensorNodes
              ? 'glass-card border-cyan-500/40 text-white bg-cyan-950/20'
              : 'glass-panel-subtle border-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Radio className={`w-3.5 h-3.5 ${layers.sensorNodes ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span>Telemetry Relays & Nodes</span>
          </div>
          {layers.sensorNodes ? (
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* 5. Critical Facilities (Shelters, Hospitals) */}
        <button
          onClick={() => onToggleLayer('criticalFacilities')}
          className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
            layers.criticalFacilities
              ? 'glass-card border-blue-500/40 text-white bg-blue-950/20'
              : 'glass-panel-subtle border-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Building2 className={`w-3.5 h-3.5 ${layers.criticalFacilities ? 'text-blue-400' : 'text-slate-600'}`} />
            <span>Shelters & Care Facilities</span>
          </div>
          {layers.criticalFacilities ? (
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* 6. Weather & Surge Plumes */}
        <button
          onClick={() => onToggleLayer('weatherSurge')}
          className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
            layers.weatherSurge
              ? 'glass-card border-indigo-500/40 text-white bg-indigo-950/20'
              : 'glass-panel-subtle border-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <CloudRain className={`w-3.5 h-3.5 ${layers.weatherSurge ? 'text-indigo-400' : 'text-slate-600'}`} />
            <span>Atmospheric Surge & Plumes</span>
          </div>
          {layers.weatherSurge ? (
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Camera / Quick Action Controls */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
          Camera & Focus
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Focus Critical Incident */}
          <button
            onClick={onFocusCritical}
            className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>FOCUS CRIT</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={onResetView}
            className="p-2 rounded-lg glass-panel hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>RESET VIEW</span>
          </button>
        </div>

        {/* Auto Rotate Toggle & Zoom Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleAutoRotate}
            className={`flex-1 p-2 rounded-lg border font-mono text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              autoRotate
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                : 'glass-panel hover:bg-white/10 border-white/10 text-slate-400'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'ROTATING' : 'ROTATE: OFF'}</span>
          </button>

          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="p-2 rounded-lg glass-panel hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}

          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="p-2 rounded-lg glass-panel hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
