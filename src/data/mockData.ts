import { Incident, Volunteer, TelemetryLog } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-8091',
    title: 'Coastal Highway 1 Mudslide & Vehicle Submersion',
    location: {
      name: 'Sector 7 - Coastline (Pier 14 Bypass)',
      lat: 34.0195,
      lng: -118.4912,
      region: 'Sector 7 - Coastline'
    },
    urgency: 'CRITICAL',
    status: 'INVESTIGATING',
    extractedNeeds: ['Urban Search & Rescue (USAR)', 'Heavy Hydraulic Cutters', 'Inflatable Boats'],
    assignedVolunteers: 4,
    reportedAt: '10:48:12 UTC',
    summary: 'Flash mudflow collapsed retaining barrier onto commuter highway. 4 passenger vehicles partially buried. Rising tide threatening vehicle access.',
    casualties: 5,
    priorityScore: 97,
    requiredSkills: ['Heavy USAR Certification', 'Swiftwater Rescue Technician', 'EMT-Paramedic']
  },
  {
    id: 'INC-8088',
    title: 'Metro Substation Transformer Fire & Toxic Smoke',
    location: {
      name: 'Sector 12 - Urban Core (Grid Station 4)',
      lat: 34.0537,
      lng: -118.2427,
      region: 'Sector 12 - Urban Core'
    },
    urgency: 'CRITICAL',
    status: 'DISPATCHED',
    extractedNeeds: ['Class B Chemical Foam', 'SCBA Oxygen Gear', 'Perimeter Evacuation'],
    assignedVolunteers: 6,
    reportedAt: '10:39:50 UTC',
    summary: 'High-voltage oil-filled transformer ruptured. Dense toxic plume drifting toward dense residential high-rises. Thermal scan shows core temp 820°C.',
    casualties: 2,
    priorityScore: 94,
    requiredSkills: ['Hazmat Level A Operations', 'Toxicologist / Advanced Triage', 'SCBA Equipment Specialist']
  },
  {
    id: 'INC-8085',
    title: 'Residential Care Facility Structural Fractures',
    location: {
      name: 'Sector 3 - North Ridge (Pine Valley)',
      lat: 34.1808,
      lng: -118.5360,
      region: 'Sector 3 - North Ridge'
    },
    urgency: 'HIGH',
    status: 'DISPATCHED',
    extractedNeeds: ['Patient Evacuation Vans', 'Pneumatic Shoring', 'Oxygen Concentrators'],
    assignedVolunteers: 8,
    reportedAt: '10:22:15 UTC',
    summary: '4.8 Mw aftershock compromised load-bearing masonry in geriatric recovery wing. 42 non-ambulatory patients require immediate tactical relocation.',
    casualties: 0,
    priorityScore: 88,
    requiredSkills: ['Crisis Logistics Specialist', 'Structural Assessment', 'EMT-Paramedic', 'Trauma Nurse']
  },
  {
    id: 'INC-8082',
    title: 'Levee Overtopping at Agricultural Spillway',
    location: {
      name: 'Sector 9 - River Basin (Canal Lock 3)',
      lat: 33.9425,
      lng: -118.1571,
      region: 'Sector 9 - River Basin'
    },
    urgency: 'HIGH',
    status: 'OPEN',
    extractedNeeds: ['Heavy Sandbagging Units', 'High-Capacity Trash Pumps', 'Livestock Containment'],
    assignedVolunteers: 3,
    reportedAt: '10:05:40 UTC',
    summary: 'Water discharge rate exceeded 3,400 cu ft/sec. Crested primary earthen berm by 18cm. Secondary reservoir gate jammed.',
    casualties: 0,
    priorityScore: 82,
    requiredSkills: ['Zodiac Pilot / Coxswain', 'Waterborne Medic', 'Heavy Equipment Operator']
  },
  {
    id: 'INC-8079',
    title: 'Cellular Microtower Generator Failure',
    location: {
      name: 'Sector 4 - Foothills (Lookout Peak)',
      lat: 34.1450,
      lng: -118.1445,
      region: 'Sector 4 - Foothills'
    },
    urgency: 'MODERATE',
    status: 'INVESTIGATING',
    extractedNeeds: ['Diesel Fuel Canisters', 'Satellite BGAN Uplink', 'Technician Escort'],
    assignedVolunteers: 2,
    reportedAt: '09:51:04 UTC',
    summary: 'Backup diesel generator threw alternator belt during storm gusts. Sector 4 emergency radio dispatch relay running on 18% reserve capacitor.',
    casualties: 0,
    priorityScore: 68,
    requiredSkills: ['Emergency First Responder', 'Radio Comms Technician']
  },
  {
    id: 'INC-8074',
    title: 'Port Crane Hydraulic Fluid Leak & Dock Blockage',
    location: {
      name: 'Sector 1 - Port Terminal (Berth 22)',
      lat: 33.7432,
      lng: -118.2673,
      region: 'Sector 1 - Port Terminal'
    },
    urgency: 'LOW',
    status: 'RESOLVED',
    extractedNeeds: ['Absorbent Containment Booms', 'Industrial Hazmat Sweepers'],
    assignedVolunteers: 2,
    reportedAt: '09:15:30 UTC',
    summary: 'Container gantry boom line rupture. 400 liters hydraulic fluid contained on apron before reaching saltwater basin. Crane stabilized.',
    casualties: 0,
    priorityScore: 45,
    requiredSkills: ['Hazmat Level A Operations']
  }
];

export const INITIAL_TELEMETRY_LOGS: TelemetryLog[] = [
  {
    id: 'TL-1001',
    timestamp: '10:52:14',
    region: 'Sector 7 - Coastline',
    type: 'ALERT',
    status: 'CRITICAL',
    message: 'Hydrographic acoustic sensor detected 1.6m wave surge breach near Pier 14 breakwater.',
    source: 'HYDRO-SENSOR-07'
  },
  {
    id: 'TL-1002',
    timestamp: '10:50:38',
    region: 'Sector 12 - Urban Core',
    type: 'SENSOR',
    status: 'CRITICAL',
    message: 'Air quality optical LIDAR detected VOC elevation (>420 ppm) downwind of Grid Station 4.',
    source: 'AQI-LIDAR-GRID12'
  },
  {
    id: 'TL-1003',
    timestamp: '10:48:50',
    region: 'Sector 7 - Coastline',
    type: 'DISPATCH',
    status: 'WARNING',
    message: 'CAD Auto-Router deployed USAR Squad Bravo (4 responders) to Coastal Highway 1 mudslide.',
    source: 'CAD-AUTO-ROUTER'
  },
  {
    id: 'TL-1004',
    timestamp: '10:46:12',
    region: 'Sector 3 - North Ridge',
    type: 'INGESTION',
    status: 'NORMAL',
    message: 'Gemini Multimodal parsed drone reconnaissance stream: 3 egress corridors identified.',
    source: 'GEMINI-SAT-FEED'
  },
  {
    id: 'TL-1005',
    timestamp: '10:44:05',
    region: 'Sector 12 - Urban Core',
    type: 'SYSTEM',
    status: 'NORMAL',
    message: 'Groq LPU synthesized volunteer skill taxonomy in 78ms with 96% match confidence.',
    source: 'GROQ-CORE-LPU'
  },
  {
    id: 'TL-1006',
    timestamp: '10:41:20',
    region: 'Sector 9 - River Basin',
    type: 'SENSOR',
    status: 'WARNING',
    message: 'Canal Lock 3 ultrasonic level transducer reports water velocity at 8.4 knots.',
    source: 'FLOW-METER-9B'
  },
  {
    id: 'TL-1007',
    timestamp: '10:38:00',
    region: 'Sector 4 - Foothills',
    type: 'ALERT',
    status: 'WARNING',
    message: 'Microtower C3 power switchover to emergency solar backup active (14.2V nominal).',
    source: 'COMMS-TOWER-C3'
  },
  {
    id: 'TL-1008',
    timestamp: '10:35:45',
    region: 'Sector 1 - Port Terminal',
    type: 'DISPATCH',
    status: 'NORMAL',
    message: 'Berth 22 hazmat absorbent boom deployment completed. Environmental spill secure.',
    source: 'EOC-HARBOR-DIV'
  }
];

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'VOL-01',
    name: 'Dr. Elena Rostova',
    role: 'Trauma Surgeon & USAR Lead',
    matchScore: 98,
    skills: ['Heavy USAR Certification', 'EMT-Paramedic', 'Structural Assessment'],
    etaMinutes: 6,
    distanceKm: 2.3,
    status: 'AVAILABLE',
    phone: '+1 (555) 382-9011'
  },
  {
    id: 'VOL-02',
    name: 'Marcus Vance',
    role: 'Swiftwater Operations Specialist',
    matchScore: 93,
    skills: ['Swiftwater Rescue Technician', 'Zodiac Pilot / Coxswain', 'Waterborne Medic'],
    etaMinutes: 11,
    distanceKm: 4.8,
    status: 'AVAILABLE',
    phone: '+1 (555) 774-2390'
  },
  {
    id: 'VOL-03',
    name: 'Captain Tariq Morales',
    role: 'Industrial Hazmat Commander',
    matchScore: 89,
    skills: ['Hazmat Level A Operations', 'Toxicologist / Advanced Triage', 'SCBA Equipment Specialist'],
    etaMinutes: 14,
    distanceKm: 6.2,
    status: 'AVAILABLE',
    phone: '+1 (555) 419-8204'
  },
  {
    id: 'VOL-04',
    name: 'Sarah Chen, PE',
    role: 'Disaster Structural Engineer',
    matchScore: 86,
    skills: ['Structural Assessment', 'Pneumatic Shoring', 'Crisis Logistics Specialist'],
    etaMinutes: 18,
    distanceKm: 8.5,
    status: 'AVAILABLE',
    phone: '+1 (555) 902-1144'
  },
  {
    id: 'VOL-05',
    name: 'David O’Connor',
    role: 'K-9 Search Handler',
    matchScore: 82,
    skills: ['K-9 Search Dog Handler', 'Emergency First Responder'],
    etaMinutes: 22,
    distanceKm: 11.0,
    status: 'AVAILABLE',
    phone: '+1 (555) 632-4481'
  }
];
