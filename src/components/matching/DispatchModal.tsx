import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Smartphone, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  FileText
} from 'lucide-react';
import { Incident, Volunteer } from '../../types';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDispatch: (volunteer: Volunteer, incident: Incident, dispatchNotes: string, priorityLevel: string) => void;
  volunteer: Volunteer | null;
  incident: Incident | null;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  onConfirmDispatch,
  volunteer,
  incident
}) => {
  const [priorityLevel, setPriorityLevel] = useState<'CODE-3' | 'CODE-2' | 'STANDARD'>('CODE-3');
  const [customNotes, setCustomNotes] = useState('Report directly to Staging Area Alpha. Bring hydraulic cutting shears and high-traction turnout gear.');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !volunteer || !incident) return null;

  // Generate realistic CAD SMS notification payload
  const smsPreview = `[CARELINK CAD ALERT #${incident.id}]
PRIORITY: ${incident.urgency} (URGENCY LEVEL)
ASSIGNED: ${volunteer.name} (${volunteer.role})
TARGET: ${incident.location.name}
COORDS: ${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}
ETA REQUIRED: < ${volunteer.etaMinutes + 2} MIN
INSTRUCTIONS: ${customNotes}
ACKNOWLEDGE BY REPLYING "10-4" OR TAP: https://cad.carelink.ops/ack/${incident.id}/${volunteer.id}`;

  const handleConfirm = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        onConfirmDispatch(volunteer, incident, customNotes, priorityLevel);
        setSentSuccess(false);
        onClose();
      }, 1200);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-cyan-500/40 shadow-2xl overflow-hidden animate-slide-in-up">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-display font-bold text-white tracking-wide">
                  DISPATCH CONFIRMATION & CAD BROADCAST
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Authorize satellite CAD paging and emergency SMS notification to volunteer unit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg glass-panel hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {sentSuccess ? (
            <div className="p-8 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 glow-emerald">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-display font-bold text-white tracking-wider">
                DISPATCH ORDER TRANSMITTED
              </h4>
              <p className="text-sm font-mono text-emerald-300">
                CAD SMS and satellite packet delivered to {volunteer.name}. Status updated to EN ROUTE.
              </p>
            </div>
          ) : (
            <>
              {/* Target Incident & Volunteer Overview Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Incident Card */}
                <div className="p-3.5 rounded-xl glass-card border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">TARGET INCIDENT</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      incident.urgency === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {incident.urgency}
                    </span>
                  </div>
                  <h4 className="text-sm font-display font-bold text-white truncate">
                    {incident.title}
                  </h4>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{incident.location.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400">
                    ID: {incident.id} • P-Score: {incident.priorityScore}
                  </div>
                </div>

                {/* Volunteer Card */}
                <div className="p-3.5 rounded-xl glass-card border border-emerald-500/30 bg-emerald-950/15 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">ASSIGNED RESPONDER</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {volunteer.matchScore}% MATCH
                    </span>
                  </div>
                  <h4 className="text-sm font-display font-bold text-white truncate">
                    {volunteer.name}
                  </h4>
                  <div className="text-xs text-slate-300 font-mono">
                    {volunteer.role}
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-emerald-300">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA: {volunteer.etaMinutes} MIN</span>
                    </span>
                    <span>DIST: {volunteer.distanceKm} KM</span>
                  </div>
                </div>
              </div>

              {/* Priority Deployment Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">
                  Priority Dispatch Code:
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setPriorityLevel('CODE-3')}
                    className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      priorityLevel === 'CODE-3'
                        ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow-sm glow-red'
                        : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">CODE-3</span>
                    <span className="text-[10px] text-rose-400">Lights & Sirens</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriorityLevel('CODE-2')}
                    className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      priorityLevel === 'CODE-2'
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 font-bold shadow-sm'
                        : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">CODE-2</span>
                    <span className="text-[10px] text-amber-400">Urgent Non-Emergency</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriorityLevel('STANDARD')}
                    className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      priorityLevel === 'STANDARD'
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 font-bold shadow-sm'
                        : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">STANDARD</span>
                    <span className="text-[10px] text-cyan-400">Routine Route</span>
                  </button>
                </div>
              </div>

              {/* Custom Dispatch Instructions */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="uppercase tracking-wider">Tactical Field Directives:</span>
                  <span className="text-slate-400 text-[10px]">Appended to SMS Alert</span>
                </div>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* SMS / Notification Preview Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="uppercase tracking-wider">Volunteer Mobile Device Preview:</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{volunteer.phone || '+1 (555) CAD-ALERT'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 font-mono text-[11px] text-slate-300 leading-relaxed relative overflow-hidden shadow-inner">
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                    CAD GATEWAY READY
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] text-cyan-300">
                    {smsPreview}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!sentSuccess && (
          <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-end space-x-3 bg-slate-950/70">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 rounded-lg glass-panel hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              ABORT
            </button>

            <button
              onClick={handleConfirm}
              disabled={isSending}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-display font-semibold text-xs tracking-wider flex items-center space-x-2 transition-all shadow-md glow-red disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>TRANSMITTING SATELLITE CAD...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>CONFIRM DISPATCH & SEND SMS</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
