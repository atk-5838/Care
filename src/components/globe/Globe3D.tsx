import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  Flame, 
  MapPin, 
  Users, 
  ChevronRight, 
  Crosshair, 
  ShieldAlert, 
  Zap, 
  Radio, 
  Building2, 
  AlertCircle 
} from 'lucide-react';
import { Incident, UrgencyLevel } from '../../types';
import { GlobeControls, GlobeLayerState } from './GlobeControls';
import { INITIAL_INCIDENTS, INITIAL_VOLUNTEERS } from '../../data/mockData';

interface Globe3DProps {
  incidents?: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  selectedIncidentId?: string;
}

// Tactical coordinates for secondary layers
const MOCK_CRITICAL_FACILITIES = [
  { id: 'FAC-01', name: 'St. Jude Regional Trauma Center', lat: 34.053, lng: -118.250, type: 'HOSPITAL', capacity: '92%' },
  { id: 'FAC-02', name: 'Harbor Evacuation Shelter #4', lat: 33.748, lng: -118.260, type: 'SHELTER', capacity: '68%' },
  { id: 'FAC-03', name: 'Pine Valley Emergency Logistics Depot', lat: 34.185, lng: -118.520, type: 'DEPOT', capacity: '45%' },
  { id: 'FAC-04', name: 'Coast Guard Air Station Base', lat: 34.015, lng: -118.480, type: 'HELIPAD', capacity: '100%' }
];

const MOCK_SENSOR_RELAYS = [
  { id: 'SEN-01', name: 'Hydro Acoustic Sensor #07', lat: 34.019, lng: -118.495, status: 'CRITICAL' },
  { id: 'SEN-02', name: 'LIDAR Air Array Grid 12', lat: 34.055, lng: -118.240, status: 'CRITICAL' },
  { id: 'SEN-03', name: 'Ultrasonic Flow Transducer 9B', lat: 33.945, lng: -118.150, status: 'WARNING' },
  { id: 'SEN-04', name: 'Seismic Accelerometer Node 4', lat: 34.180, lng: -118.540, status: 'NORMAL' },
  { id: 'SEN-05', name: 'Comms Microtower Lookout C3', lat: 34.148, lng: -118.140, status: 'WARNING' }
];

// Simplified continent landmass polyline coordinates for tactical 3D sphere projection
const CONTINENT_PATHS: [number, number][][] = [
  // North America rough outline
  [[-130, 50], [-124, 48], [-120, 38], [-117, 32], [-105, 23], [-97, 26], [-82, 25], [-80, 32], [-70, 42], [-65, 45], [-60, 55], [-75, 65], [-95, 68], [-120, 65], [-130, 50]],
  // South America rough outline
  [[-80, 8], [-77, -5], [-72, -18], [-70, -35], [-65, -52], [-55, -40], [-38, -10], [-50, 0], [-70, 10], [-80, 8]],
  // Europe & Mediterranean
  [[-10, 38], [-5, 44], [2, 48], [10, 54], [18, 58], [25, 65], [30, 70], [35, 60], [28, 45], [20, 40], [12, 44], [0, 40], [-10, 38]],
  // Asia rough outline
  [[40, 60], [60, 65], [90, 70], [120, 70], [140, 60], [135, 45], [120, 32], [105, 20], [80, 15], [70, 25], [55, 30], [45, 40], [40, 60]],
  // Africa rough outline
  [[-15, 30], [-17, 15], [-10, 5], [10, 4], [12, -10], [18, -30], [25, -34], [32, -28], [40, -10], [50, 12], [42, 25], [30, 32], [10, 35], [-15, 30]],
  // Australia
  [[115, -22], [118, -34], [135, -35], [150, -35], [152, -24], [142, -12], [130, -15], [115, -22]]
];

export const Globe3D: React.FC<Globe3DProps> = ({
  incidents = INITIAL_INCIDENTS,
  onSelectIncident,
  selectedIncidentId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Rotation angles (radians)
  const rotationRef = useRef<{ lambda: number; phi: number }>({
    lambda: 118 * (Math.PI / 180), // Centered roughly on Pacific / Western US (118°W)
    phi: -34 * (Math.PI / 180)     // ~34°N
  });

  const zoomRef = useRef<number>(1);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Layer Controls State
  const [layers, setLayers] = useState<GlobeLayerState>({
    threatHeatmap: true,
    incidentMarkers: true,
    responderUnits: true,
    sensorNodes: true,
    weatherSurge: false,
    criticalFacilities: true
  });

  const [autoRotate, setAutoRotate] = useState(false);

  // Hovered Incident Tooltip State
  const [hoveredIncident, setHoveredIncident] = useState<{
    incident: Incident;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Pulse animation phase ref (0 to 1) for smooth 60fps beacon rings
  const pulsePhaseRef = useRef(0);

  const toggleLayer = (key: keyof GlobeLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetView = useCallback(() => {
    rotationRef.current = {
      lambda: 118 * (Math.PI / 180),
      phi: -34 * (Math.PI / 180)
    };
    zoomRef.current = 1.05;
    velocityRef.current = { vx: 0, vy: 0 };
  }, []);

  const focusCritical = useCallback(() => {
    const crit = incidents.find((i) => i.urgency === 'CRITICAL');
    if (crit) {
      rotationRef.current = {
        lambda: -crit.location.lng * (Math.PI / 180),
        phi: -crit.location.lat * (Math.PI / 180)
      };
      zoomRef.current = 1.25;
      velocityRef.current = { vx: 0, vy: 0 };
    }
  }, [incidents]);

  const zoomIn = () => {
    zoomRef.current = Math.min(2.4, zoomRef.current + 0.2);
  };

  const zoomOut = () => {
    zoomRef.current = Math.max(0.65, zoomRef.current - 0.2);
  };

  // Spherical projection function: Converts (lat, lng) to canvas (x, y, visible, distance)
  const projectPoint = useCallback((lat: number, lng: number, radius: number, cx: number, cy: number) => {
    const lambda = (lng * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;

    const rotLambda = rotationRef.current.lambda;
    const rotPhi = rotationRef.current.phi;

    // Relative angles
    const deltaLambda = lambda + rotLambda;

    // 3D Cartesian coordinates on unit sphere
    const x0 = Math.cos(phi) * Math.sin(deltaLambda);
    const y0 = Math.sin(phi);
    const z0 = Math.cos(phi) * Math.cos(deltaLambda);

    // Rotate around X-axis by rotPhi
    const cosP = Math.cos(rotPhi);
    const sinP = Math.sin(rotPhi);
    const y1 = y0 * cosP - z0 * sinP;
    const z1 = y0 * sinP + z0 * cosP;
    const x1 = x0;

    const visible = z1 > -0.05; // Visible on front hemisphere
    const screenX = cx + x1 * radius;
    const screenY = cy - y1 * radius;

    return { x: screenX, y: screenY, visible, depth: z1 };
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.38;
      const radius = baseRadius * zoomRef.current;

      // Handle auto-rotate or inertia decay
      if (autoRotate && !isDraggingRef.current) {
        rotationRef.current.lambda += 0.003;
      } else if (!isDraggingRef.current) {
        rotationRef.current.lambda += velocityRef.current.vx;
        rotationRef.current.phi += velocityRef.current.vy;
        velocityRef.current.vx *= 0.94;
        velocityRef.current.vy *= 0.94;
        // Clamp vertical angle to avoid pole flipping
        rotationRef.current.phi = Math.max(-1.3, Math.min(1.3, rotationRef.current.phi));
      }

      // Update pulse phase for continuous CRITICAL pulse rings
      pulsePhaseRef.current = (pulsePhaseRef.current + 0.02) % 1;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere Radial Glow Behind Globe
      const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      atmoGrad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
      atmoGrad.addColorStop(0.5, 'rgba(14, 116, 144, 0.08)');
      atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Globe Sphere Dark Water Base
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip(); // Clip everything to the sphere

      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, '#0E1726');
      sphereGrad.addColorStop(0.7, '#070D18');
      sphereGrad.addColorStop(1, '#03060B');
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // 3. Graticule Lines (Latitude & Longitude Grid)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';

      // Longitudes every 30 degrees
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -80; lat <= 80; lat += 5) {
          const pt = projectPoint(lat, lng, radius, cx, cy);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Latitudes every 20 degrees
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 6) {
          const pt = projectPoint(lat, lng, radius, cx, cy);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // 4. Continent Outlines (Tactical wireframe landmasses)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.fillStyle = 'rgba(14, 116, 144, 0.08)';
      ctx.lineWidth = 1.25;

      CONTINENT_PATHS.forEach((poly) => {
        ctx.beginPath();
        let first = true;
        poly.forEach(([lng, lat]) => {
          const pt = projectPoint(lat, lng, radius, cx, cy);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        });
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      });

      // 5. Threat Density Heatmap (If enabled)
      if (layers.threatHeatmap) {
        incidents.forEach((inc) => {
          const pt = projectPoint(inc.location.lat, inc.location.lng, radius, cx, cy);
          if (pt.visible && pt.depth > 0) {
            const isCrit = inc.urgency === 'CRITICAL';
            const heatRadius = isCrit ? radius * 0.24 : radius * 0.16;
            const heatGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, heatRadius);
            
            if (isCrit) {
              heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
              heatGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.12)');
              heatGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            } else {
              heatGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
              heatGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
              heatGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
            }

            ctx.fillStyle = heatGrad;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, heatRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 6. Sensor Nodes Layer (If enabled)
      if (layers.sensorNodes) {
        MOCK_SENSOR_RELAYS.forEach((node) => {
          const pt = projectPoint(node.lat, node.lng, radius, cx, cy);
          if (pt.visible && pt.depth > 0.1) {
            ctx.fillStyle = node.status === 'CRITICAL' ? '#EF4444' : '#06B6D4';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 7. Critical Facilities (If enabled)
      if (layers.criticalFacilities) {
        MOCK_CRITICAL_FACILITIES.forEach((fac) => {
          const pt = projectPoint(fac.lat, fac.lng, radius, cx, cy);
          if (pt.visible && pt.depth > 0.1) {
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
          }
        });
      }

      // 8. Responder Beacons (If enabled)
      if (layers.responderUnits) {
        INITIAL_VOLUNTEERS.forEach((v, idx) => {
          const offsetLat = 34.05 + (idx * 0.04 - 0.08);
          const offsetLng = -118.25 + (idx * 0.05 - 0.1);
          const pt = projectPoint(offsetLat, offsetLng, radius, cx, cy);
          if (pt.visible && pt.depth > 0.1) {
            ctx.fillStyle = '#10B981';
            ctx.beginPath();
            // Small diamond
            ctx.moveTo(pt.x, pt.y - 3.5);
            ctx.lineTo(pt.x + 3.5, pt.y);
            ctx.lineTo(pt.x, pt.y + 3.5);
            ctx.lineTo(pt.x - 3.5, pt.y);
            ctx.closePath();
            ctx.fill();
          }
        });
      }

      // Spherical Edge Shading (Dark rim)
      const edgeGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius);
      edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      edgeGrad.addColorStop(1, 'rgba(3, 7, 18, 0.7)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore(); // Exit sphere clipping

      // 9. Globe Perimeter Glowing Ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 10. INCIDENT MARKERS WITH CONTINUOUS PULSING FOR "CRITICAL" URGENCY
      if (layers.incidentMarkers) {
        incidents.forEach((inc) => {
          const pt = projectPoint(inc.location.lat, inc.location.lng, radius, cx, cy);
          if (pt.visible && pt.depth > 0.05) {
            const isCrit = inc.urgency === 'CRITICAL';
            const isHigh = inc.urgency === 'HIGH';
            const isSelected = selectedIncidentId === inc.id;

            const primaryColor = isCrit ? '#EF4444' : isHigh ? '#F59E0B' : '#06B6D4';

            // CONTINUOUS PULSING BEACON RINGS FOR CRITICAL MARKERS
            if (isCrit) {
              const phase1 = pulsePhaseRef.current;
              const phase2 = (pulsePhaseRef.current + 0.5) % 1;

              // Wave ring 1
              const r1 = 6 + phase1 * 26;
              const alpha1 = Math.max(0, (1 - phase1) * 0.85);
              ctx.strokeStyle = `rgba(239, 68, 68, ${alpha1})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, r1, 0, Math.PI * 2);
              ctx.stroke();

              // Wave ring 2
              const r2 = 6 + phase2 * 26;
              const alpha2 = Math.max(0, (1 - phase2) * 0.85);
              ctx.strokeStyle = `rgba(248, 113, 113, ${alpha2})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, r2, 0, Math.PI * 2);
              ctx.stroke();
            } else if (isHigh) {
              // Subtle ring for High
              const phase = pulsePhaseRef.current;
              const r = 5 + phase * 16;
              const alpha = Math.max(0, (1 - phase) * 0.5);
              ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
              ctx.lineWidth = 1.25;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Central Marker Core
            const coreRadius = isCrit ? 6.5 : isHigh ? 5.5 : 4.5;
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, coreRadius, 0, Math.PI * 2);
            ctx.fill();

            // Inner white dot
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isCrit ? 2.5 : 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Selected crosshair reticle
            if (isSelected) {
              ctx.strokeStyle = '#38BDF8';
              ctx.lineWidth = 2;
              ctx.strokeRect(pt.x - 12, pt.y - 12, 24, 24);
            }
          }
        });
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [incidents, layers, autoRotate, selectedIncidentId, projectPoint]);

  // Handle Canvas Resize via ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Avoid 0 sizes
        if (width > 0 && height > 0) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          const ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(dpr, dpr);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Mouse Interaction: Drag to rotate
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      const sensitivity = 0.0055 / zoomRef.current;
      rotationRef.current.lambda += dx * sensitivity;
      rotationRef.current.phi += dy * sensitivity;

      velocityRef.current = { vx: dx * sensitivity * 0.8, vy: dy * sensitivity * 0.8 };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Marker Hover Detection for Tooltip Overlay
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.38 * zoomRef.current;

    let hitIncident: Incident | null = null;
    let hitScreenPos = { x: 0, y: 0 };

    if (layers.incidentMarkers) {
      for (const inc of incidents) {
        const pt = projectPoint(inc.location.lat, inc.location.lng, radius, cx, cy);
        if (pt.visible && pt.depth > 0) {
          const hitRadius = inc.urgency === 'CRITICAL' ? 18 : 14;
          const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);
          if (dist <= hitRadius) {
            hitIncident = inc;
            hitScreenPos = { x: pt.x, y: pt.y };
            break;
          }
        }
      }
    }

    if (hitIncident) {
      setHoveredIncident({
        incident: hitIncident,
        screenX: hitScreenPos.x,
        screenY: hitScreenPos.y
      });
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredIncident(null);
      canvas.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setHoveredIncident(null);
  };

  const handleClick = () => {
    if (hoveredIncident) {
      onSelectIncident?.(hoveredIncident.incident);
    }
  };

  const criticalCount = useMemo(() => {
    return incidents.filter((i) => i.urgency === 'CRITICAL').length;
  }, [incidents]);

  return (
    <div className="relative w-full h-[640px] rounded-2xl glass-panel border border-white/10 overflow-hidden flex flex-col md:flex-row">
      {/* 3D Interactive Canvas Container */}
      <div 
        ref={containerRef}
        className="relative flex-1 h-full min-h-[420px] bg-gradient-to-b from-[#060A14] to-[#04070D] flex items-center justify-center overflow-hidden select-none"
      >
        {/* Tactical Crosshair Watermark in Corner */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 text-[11px] font-mono text-cyan-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-cyan-500/20 backdrop-blur-md">
          <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>GEOSPATIAL ORTHOGRAPHIC PROJECTION • 3D SPHERE</span>
        </div>

        {/* Tactical Coordinates HUD in Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center space-x-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
          <span>LAT: 34.0522°N</span>
          <span>LNG: 118.2437°W</span>
          <span className="text-emerald-400">FPS: 60 (WEBGL-SIM)</span>
        </div>

        {/* Main Canvas Element */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* =========================================================================
            HTML TOOLTIP OVERLAY ON MARKER HOVER
            Shows: Location Name, Urgency Level, Extracted Needs, Assigned Volunteer Count
            ========================================================================= */}
        {hoveredIncident && (
          <div
            className="absolute z-30 pointer-events-auto transition-transform duration-75 animate-fade-in"
            style={{
              left: `${Math.min(Math.max(hoveredIncident.screenX + 16, 20), (containerRef.current?.clientWidth || 600) - 340)}px`,
              top: `${Math.max(hoveredIncident.screenY - 80, 20)}px`
            }}
          >
            <div className={`w-80 p-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
              hoveredIncident.incident.urgency === 'CRITICAL'
                ? 'glass-panel-danger border-rose-500/60 glow-red'
                : hoveredIncident.incident.urgency === 'HIGH'
                ? 'glass-panel-warning border-amber-500/60'
                : 'glass-panel border-cyan-500/50'
            }`}>
              {/* Header: Urgency Level & Priority */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase flex items-center space-x-1.5 ${
                    hoveredIncident.incident.urgency === 'CRITICAL'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : hoveredIncident.incident.urgency === 'HIGH'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {hoveredIncident.incident.urgency === 'CRITICAL' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    )}
                    <span>{hoveredIncident.incident.urgency} URGENCY</span>
                  </span>

                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                    {hoveredIncident.incident.id}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  P-SCORE: <strong className="text-white">{hoveredIncident.incident.priorityScore}</strong>
                </span>
              </div>

              {/* Title & Location Name */}
              <h4 className="font-display font-bold text-sm text-white tracking-wide leading-tight mb-1">
                {hoveredIncident.incident.title}
              </h4>

              <div className="flex items-center space-x-1 text-xs text-slate-300 mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate font-semibold">{hoveredIncident.incident.location.name}</span>
              </div>

              {/* Extracted Needs Chips */}
              <div className="mb-2.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Extracted Needs:
                </span>
                <div className="flex flex-wrap gap-1">
                  {hoveredIncident.incident.extractedNeeds.map((need, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-200 border border-white/10 text-[10px] font-mono"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Volunteers & Action */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{hoveredIncident.incident.assignedVolunteers} Responders Assigned</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident?.(hoveredIncident.incident);
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>INSPECT</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Glassmorphism Layer Controls Floating/Docked Sidebar */}
      <div className="p-4 md:p-5 flex items-center justify-center md:items-start bg-[#080E1B]/95 md:bg-transparent border-t md:border-t-0 md:border-l border-white/10 shrink-0">
        <GlobeControls
          layers={layers}
          onToggleLayer={toggleLayer}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
          onResetView={resetView}
          onFocusCritical={focusCritical}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          activeMarkerCount={incidents.length}
          criticalMarkerCount={criticalCount}
        />
      </div>
    </div>
  );
};
