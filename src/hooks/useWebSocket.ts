import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketEventMessage, TelemetryLog, Incident } from '../types';

export type WebSocketConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'mock';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  mockIntervalMs?: number;
  onMessage?: (message: WebSocketEventMessage) => void;
  onStatusChange?: (status: WebSocketConnectionStatus) => void;
}

const MOCK_REGIONS = [
  'Sector 7 - Coastline',
  'Sector 3 - North Ridge',
  'Sector 12 - Urban Core',
  'Sector 9 - River Basin',
  'Sector 4 - Foothills',
  'Sector 1 - Port Terminal'
];

const MOCK_TELEMETRY_MSGS: Array<{ message: string; type: TelemetryLog['type']; status: TelemetryLog['status']; source: string }> = [
  { message: 'Seismic acoustic sensor array #21 recorded 4.8 Mw aftershock tremor', type: 'SENSOR', status: 'WARNING', source: 'USGS-NODE-21' },
  { message: 'Water level threshold exceeded in Lower Catchment 4B (+1.4m/hr)', type: 'SENSOR', status: 'CRITICAL', source: 'HYDRO-GAUGE-09' },
  { message: 'Paramedic Quick Response Unit #04 arrived on site at St. Jude Shelter', type: 'DISPATCH', status: 'NORMAL', source: 'CAD-AUTO-ROUTER' },
  { message: 'Gemini Multimodal pipeline processed 14 drone surveillance frames', type: 'INGESTION', status: 'NORMAL', source: 'GEMINI-SAT-FEED' },
  { message: 'Groq LPU completed dispatch optimization for Sector 7 in 84ms', type: 'SYSTEM', status: 'NORMAL', source: 'GROQ-CORE-LPU' },
  { message: 'Cell tower micro-station backup battery depleted; switching to solar satellite uplink', type: 'ALERT', status: 'WARNING', source: 'COMMS-TOWER-C3' },
  { message: 'Mass casualty decontamination squad dispatched to Chemical Depot #2', type: 'DISPATCH', status: 'CRITICAL', source: 'EOC-ALPHA' },
  { message: 'Thermal imaging camera cluster detected 3 heat signatures in collapsed warehouse', type: 'INGESTION', status: 'CRITICAL', source: 'DRONE-THERMAL-8' }
];

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url,
    autoConnect = true,
    mockIntervalMs = 4500,
    onMessage,
    onStatusChange
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>(
    url ? 'connecting' : 'mock'
  );
  const [lastMessage, setLastMessage] = useState<WebSocketEventMessage | null>(null);
  const [messages, setMessages] = useState<WebSocketEventMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());
  const onMessageRef = useRef(onMessage);
  const onStatusChangeRef = useRef(onStatusChange);

  // Keep callback refs updated to avoid re-triggering effects
  useEffect(() => {
    onMessageRef.current = onMessage;
    onStatusChangeRef.current = onStatusChange;
  });

  const updateStatus = useCallback((status: WebSocketConnectionStatus) => {
    setConnectionStatus(status);
    onStatusChangeRef.current?.(status);
  }, []);

  const dispatchEvent = useCallback((eventMsg: WebSocketEventMessage) => {
    setLastMessage(eventMsg);
    setMessages((prev) => [eventMsg, ...prev.slice(0, 99)]); // maintain last 100
    onMessageRef.current?.(eventMsg);

    // Call subscribers
    const typeSubs = subscribersRef.current.get(eventMsg.type);
    if (typeSubs) {
      typeSubs.forEach((cb) => {
        try {
          cb(eventMsg.data);
        } catch (err) {
          console.error('[CareLink WebSocket] Subscriber callback error:', err);
        }
      });
    }

    const allSubs = subscribersRef.current.get('*');
    if (allSubs) {
      allSubs.forEach((cb) => {
        try {
          cb(eventMsg);
        } catch (err) {
          console.error('[CareLink WebSocket] Wildcard callback error:', err);
        }
      });
    }
  }, []);

  // Send message
  const send = useCallback((payload: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      // Mock echo / log in dev
      console.log('[CareLink WebSocket Mock Send]:', payload);
    }
  }, []);

  // Subscribe to typed events
  const subscribe = useCallback((type: string, callback: (data: unknown) => void) => {
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, new Set());
    }
    subscribersRef.current.get(type)!.add(callback);

    return () => {
      subscribersRef.current.get(type)?.delete(callback);
    };
  }, []);

  // Real WebSocket or Mock Interval runner
  useEffect(() => {
    if (!autoConnect) return;

    if (url) {
      // Try connecting to real WebSocket URL
      updateStatus('connecting');
      let socket: WebSocket;
      try {
        socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
          updateStatus('connected');
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            dispatchEvent(parsed);
          } catch {
            dispatchEvent({
              id: `ws-${Date.now()}`,
              type: 'TELEMETRY_LOG',
              timestamp: new Date().toISOString(),
              data: event.data
            });
          }
        };

        socket.onerror = () => {
          // Fall back gracefully to mock in prototype
          console.warn('[CareLink WebSocket] Connection error. Operating in mock crisis stream mode.');
          updateStatus('mock');
        };

        socket.onclose = () => {
          updateStatus('disconnected');
        };
      } catch {
        updateStatus('mock');
      }

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }

    // Default Mock Stream Fallback
    updateStatus('mock');
    let counter = 1;

    const interval = setInterval(() => {
      const region = MOCK_REGIONS[Math.floor(Math.random() * MOCK_REGIONS.length)];
      const template = MOCK_TELEMETRY_MSGS[Math.floor(Math.random() * MOCK_TELEMETRY_MSGS.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newLog: TelemetryLog = {
        id: `tl-${Date.now()}-${counter++}`,
        timestamp: timeStr,
        region,
        type: template.type,
        status: template.status,
        message: template.message,
        source: template.source
      };

      const eventMsg: WebSocketEventMessage<TelemetryLog> = {
        id: `evt-${Date.now()}`,
        type: 'TELEMETRY_LOG',
        timestamp: now.toISOString(),
        data: newLog
      };

      dispatchEvent(eventMsg);
    }, mockIntervalMs);

    return () => clearInterval(interval);
  }, [url, autoConnect, mockIntervalMs, updateStatus, dispatchEvent]);

  return {
    isConnected: connectionStatus === 'connected' || connectionStatus === 'mock',
    connectionStatus,
    isMock: connectionStatus === 'mock',
    lastMessage,
    messages,
    send,
    subscribe
  };
}
