import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Users, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Award, 
  Flame, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  Activity,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';
import { Incident, Volunteer } from '../../types';
import { INITIAL_INCIDENTS, INITIAL_VOLUNTEERS } from '../../data/mockData';
import { DispatchModal } from './DispatchModal';

interface SmartMatchPanelProps {
  incidents?: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  onVolunteerDispatched?: (volunteerId: string, incidentId: string) => void;
}

interface WeightSettings {
  skill: number;
  distance: number;
  availability: number;
}

interface VolunteerScored extends Volunteer {
  compositeScore: number;
  skillScore: number;
  proximityScore: number;
  availabilityScore: number;
  matchedSkills: string[];
}

export const SmartMatchPanel: React.FC<SmartMatchPanelProps> = ({
  incidents = INITIAL_INCIDENTS,
  selectedIncident,
  onSelectIncident,
  onVolunteerDispatched
}) => {
  // Current active incident for matching
  const currentIncident = selectedIncident || incidents[0];

  // Weighting Sliders State (percentages, e.g. 50, 30, 20)
  const [weights, setWeights] = useState<WeightSettings>({
    skill: 50,
    distance: 30,
    availability: 20
  });

  // Track dispatched volunteers locally for immediate state feedback
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [dispatchModalVolunteer, setDispatchModalVolunteer] = useState<Volunteer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Success Toast State
  const [lastDispatchedInfo, setLastDispatchedInfo] = useState<{
    volunteerName: string;
    incidentId: string;
  } | null>(null);

  // Preset Handlers
  const applyPreset = (preset: 'balanced' | 'skill' | 'distance' | 'readiness') => {
    switch (preset) {
      case 'balanced':
        setWeights({ skill: 50, distance: 30, availability: 20 });
        break;
      case 'skill':
        setWeights({ skill: 80, distance: 10, availability: 10 });
        break;
      case 'distance':
        setWeights({ skill: 20, distance: 65, availability: 15 });
        break;
      case 'readiness':
        setWeights({ skill: 25, distance: 25, availability: 50 });
        break;
    }
  };

  // Smart Match Engine: Calculate dynamic scores and rank volunteers
  const rankedVolunteers = useMemo<VolunteerScored[]>(() => {
    if (!currentIncident) return [];

    const totalWeight = (weights.skill + weights.distance + weights.availability) || 100;
    const incSkills = new Set([
      ...currentIncident.requiredSkills.map((s) => s.toLowerCase()),
      ...currentIncident.extractedNeeds.map((s) => s.toLowerCase())
    ]);

    return INITIAL_VOLUNTEERS.map((vol) => {
      // 1. Skill Score Calculation
      const matched = vol.skills.filter((vs) => {
        const lowerVs = vs.toLowerCase();
        for (const is of incSkills) {
          if (lowerVs.includes(is) || is.includes(lowerVs)) return true;
        }
        return false;
      });

      const skillRatio = incSkills.size > 0 ? (matched.length / Math.min(3, incSkills.size)) : 0.8;
      const skillScore = Math.min(100, Math.round(skillRatio * 40 + 60)); // Baseline + match

      // 2. Proximity Score Calculation (Closer = Higher Score)
      // Scale: 0 km = 100 score, 15 km = 30 score
      const proximityScore = Math.max(15, Math.min(100, Math.round(100 - (vol.distanceKm / 14) * 75)));

      // 3. Availability Score Calculation
      let availabilityScore = 95;
      if (vol.status === 'AVAILABLE') {
        availabilityScore = Math.max(40, 100 - vol.etaMinutes * 2);
      } else if (vol.status === 'EN_ROUTE') {
        availabilityScore = 55;
      } else {
        availabilityScore = 30;
      }

      // If already dispatched in this session, mark down
      if (dispatchedIds.has(vol.id)) {
        availabilityScore = 15;
      }

      // Weighted Composite Score
      const compositeScore = Math.min(
        99,
        Math.round(
          (skillScore * weights.skill +
            proximityScore * weights.distance +
            availabilityScore * weights.availability) /
            totalWeight
        )
      );

      return {
        ...vol,
        compositeScore,
        skillScore,
        proximityScore,
        availabilityScore,
        matchedSkills: matched.length > 0 ? matched : [vol.skills[0]]
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }, [currentIncident, weights, dispatchedIds]);

  const handleOpenDispatch = (volunteer: Volunteer) => {
    setDispatchModalVolunteer(volunteer);
    setIsModalOpen(true);
  };

  const handleConfirmDispatch = (
    volunteer: Volunteer,
    incident: Incident,
    notes: string,
    priority: string
  ) => {
    setDispatchedIds((prev) => new Set([...prev, volunteer.id]));
    onVolunteerDispatched?.(volunteer.id, incident.id);
    setLastDispatchedInfo({
      volunteerName: volunteer.name,
      incidentId: incident.id
    });

    setTimeout(() => {
      setLastDispatchedInfo(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification of Successful Dispatch */}
      {lastDispatchedInfo && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-xl glow-emerald animate-slide-in-up">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono font-bold">
              CAD ALERT SENT: {lastDispatchedInfo.volunteerName} deployed to {lastDispatchedInfo.incidentId}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">STATUS: EN ROUTE (CODE-3)</span>
        </div>
      )}

      {/* Target Incident Selection & Overview Header */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-display font-bold text-lg tracking-wider text-white">
                SMART MATCH & DISPATCH OPTIMIZER
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                GROQ-LPU RANKED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Multi-criteria candidate matching with adjustable heuristic weighting for disaster response.
            </p>
          </div>

          {/* Incident Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">TARGET INCIDENT:</span>
            <select
              value={currentIncident?.id}
              onChange={(e) => {
                const found = incidents.find((i) => i.id === e.target.value);
                if (found && onSelectIncident) onSelectIncident(found);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.urgency}] {inc.id} — {inc.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Incident Summary Strip */}
        {currentIncident && (
          <div className="p-3.5 rounded-xl glass-panel-subtle border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                currentIncident.urgency === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-sm glow-red'
                  : 'bg-amber-600 text-white'
              }`}>
                {currentIncident.urgency} URGENCY
              </span>
              <div>
                <h3 className="text-sm font-display font-bold text-white">
                  {currentIncident.title}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{currentIncident.location.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Target Skills:</span>
              {currentIncident.requiredSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WEIGHTING CONTROLS CARD: Category Weighting Sliders */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm tracking-wider text-white uppercase">
              Heuristic Weight Calibration
            </h3>
            <span className="text-xs font-mono text-slate-400">
              [Dynamic Real-time Re-ranking]
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Presets:</span>
            <button
              onClick={() => applyPreset('balanced')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-white/10 cursor-pointer"
            >
              Balanced
            </button>
            <button
              onClick={() => applyPreset('skill')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-white/10 cursor-pointer"
            >
              Max Skill Fit
            </button>
            <button
              onClick={() => applyPreset('distance')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-white/10 cursor-pointer"
            >
              Closest First
            </button>
            <button
              onClick={() => applyPreset('readiness')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-white/10 cursor-pointer"
            >
              Max Readiness
            </button>
          </div>
        </div>

        {/* 3 Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          {/* Slider 1: Skill Weight */}
          <div className="space-y-2 p-3 rounded-xl glass-card border border-white/5">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>SKILL MATCH</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 font-bold">
                {weights.skill}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.skill}
              onChange={(e) => setWeights({ ...weights, skill: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <p className="text-[10px] text-slate-400 font-mono">
              Certifications, specialty gear & taxonomy overlap
            </p>
          </div>

          {/* Slider 2: Distance / Proximity Weight */}
          <div className="space-y-2 p-3 rounded-xl glass-card border border-white/5">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>PROXIMITY (DISTANCE)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold">
                {weights.distance}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.distance}
              onChange={(e) => setWeights({ ...weights, distance: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <p className="text-[10px] text-slate-400 font-mono">
              Transit radius & estimated arrival latency
            </p>
          </div>

          {/* Slider 3: Availability / Readiness Weight */}
          <div className="space-y-2 p-3 rounded-xl glass-card border border-white/5">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>AVAILABILITY & READINESS</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                {weights.availability}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.availability}
              onChange={(e) => setWeights({ ...weights, availability: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <p className="text-[10px] text-slate-400 font-mono">
              Immediate deployment vs off-duty standby state
            </p>
          </div>
        </div>
      </div>

      {/* RANKED VOLUNTEER MATCHES LIST WITH SCORE BREAKDOWN CARDS */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm tracking-wider text-white uppercase">
              Ranked Candidate Roster ({rankedVolunteers.length} Evaluated)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click &quot;DISPATCH&quot; to review CAD alert & mobile SMS
          </span>
        </div>

        <div className="space-y-3">
          {rankedVolunteers.map((vol, index) => {
            const isDispatched = dispatchedIds.has(vol.id);
            const isTopMatch = index === 0;

            return (
              <div
                key={vol.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDispatched
                    ? 'glass-panel-subtle border-white/5 opacity-70'
                    : isTopMatch
                    ? 'glass-panel border-amber-500/50 shadow-xl glow-amber'
                    : 'glass-card border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Identity & Rank */}
                  <div className="flex items-start space-x-3.5">
                    {/* Rank Indicator */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-base ${
                        isTopMatch
                          ? 'bg-amber-500 text-black shadow-md'
                          : index === 1
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{index + 1}
                      </div>
                      {isTopMatch && (
                        <span className="text-[9px] font-mono text-amber-400 font-bold uppercase mt-1">
                          OPTIMAL
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="text-base font-display font-bold text-white tracking-wide">
                          {vol.name}
                        </h4>
                        <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-white/10">
                          {vol.id}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                          isDispatched
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : vol.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {isDispatched ? 'EN ROUTE' : vol.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        {vol.role} • {vol.phone || '+1 (555) VOL-CAD'}
                      </p>

                      {/* Matched Skill Badges */}
                      <div className="flex items-center space-x-1.5 mt-2 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Skills:</span>
                        {vol.skills.map((skill, sIdx) => {
                          const isMatched = vol.matchedSkills.includes(skill);
                          return (
                            <span
                              key={sIdx}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 ${
                                isMatched
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold'
                                  : 'bg-slate-800/90 text-slate-400 border border-white/5'
                              }`}
                            >
                              {isMatched && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                              <span>{skill}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Middle Score Breakdown Cards (Skills Match, Proximity, Availability) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
                    {/* Sub-score 1: Skills Match */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center min-w-[90px]">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Skill Fit</span>
                      <span className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                        {vol.skillScore}%
                      </span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${vol.skillScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Sub-score 2: Proximity */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center min-w-[90px]">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Proximity</span>
                      <span className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                        {vol.distanceKm} km
                      </span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full"
                          style={{ width: `${vol.proximityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Sub-score 3: Availability */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center min-w-[90px]">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">ETA</span>
                      <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                        {vol.etaMinutes} min
                      </span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${vol.availabilityScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Composite Score & Action */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    {/* Large Composite Score Display */}
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Composite Match
                      </div>
                      <div className={`text-2xl font-display font-bold ${
                        vol.compositeScore >= 90
                          ? 'text-emerald-400'
                          : vol.compositeScore >= 80
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}>
                        {vol.compositeScore}%
                      </div>
                    </div>

                    {/* Action Dispatch Button */}
                    <button
                      onClick={() => handleOpenDispatch(vol)}
                      disabled={isDispatched}
                      className={`px-4 py-2 rounded-xl text-xs font-display font-semibold tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isDispatched
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                          : isTopMatch
                          ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md glow-red'
                          : 'bg-cyan-600/80 hover:bg-cyan-500 text-white shadow-md'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>DISPATCHED</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>DISPATCH</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dispatch Modal */}
      <DispatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmDispatch={handleConfirmDispatch}
        volunteer={dispatchModalVolunteer}
        incident={currentIncident}
      />
    </div>
  );
};
