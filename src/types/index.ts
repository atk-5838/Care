export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'DISPATCHED' | 'RESOLVED';

export interface LocationCoordinates {
  name: string;
  lat: number;
  lng: number;
  region: string;
}

export interface Incident {
  id: string;
  title: string;
  location: LocationCoordinates;
  urgency: UrgencyLevel;
  status: IncidentStatus;
  extractedNeeds: string[];
  assignedVolunteers: number;
  reportedAt: string;
  summary: string;
  casualties?: number;
  priorityScore: number;
  requiredSkills: string[];
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  matchScore: number; // 0 to 100
  skills: string[];
  etaMinutes: number;
  distanceKm: number;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ENGAGED';
  avatar?: string;
  phone?: string;
  assignedIncidentId?: string;
}

export type TelemetryStatus = 'CRITICAL' | 'WARNING' | 'NORMAL' | 'INFO';

export interface TelemetryLog {
  id: string;
  timestamp: string;
  region: string;
  type: 'ALERT' | 'DISPATCH' | 'SENSOR' | 'INGESTION' | 'SYSTEM';
  status: TelemetryStatus;
  message: string;
  source: string;
}

export interface GeminiAnalysisResult {
  summary: string;
  detectedHazards: string[];
  extractedNeeds: string[];
  confidence: number;
  urgencyAssessment: UrgencyLevel;
  damageSeverity: 'SEVERE' | 'MODERATE' | 'MILD';
  estimatedVictims: number;
  geotaggedLocation?: {
    name: string;
    lat: number;
    lng: number;
    region: string;
  };
  keySignals: string[];
}

export interface GroqProcessingResult {
  taxonomyCategory: string;
  priorityScore: number; // 1-100
  requiredSkills: string[];
  dispatchPlan: string;
  estimatedPersonnelNeeded: number;
  triageQueue: 'ALPHA_IMMEDIATE' | 'BRAVO_URGENT' | 'CHARLIE_STANDARD';
  executionLatencyMs: number;
  recommendedSupplies: string[];
}

export interface WebSocketEventMessage<T = unknown> {
  id: string;
  type: 'INCIDENT_NEW' | 'INCIDENT_UPDATED' | 'TELEMETRY_LOG' | 'VOLUNTEER_STATUS' | 'HEARTBEAT';
  timestamp: string;
  data: T;
}
