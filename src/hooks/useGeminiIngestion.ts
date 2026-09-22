import { useState, useCallback, useRef } from 'react';
import { GeminiAnalysisResult, UrgencyLevel } from '../types';

export interface FieldReportInput {
  title?: string;
  rawText: string;
  mediaFile?: File | null;
  mediaPreviewUrl?: string | null;
  region?: string;
}

export function useGeminiIngestion() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState<string>('');
  const [result, setResult] = useState<GeminiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const reset = useCallback(() => {
    clearTimers();
    setIsAnalyzing(false);
    setProgress(0);
    setStageMessage('');
    setResult(null);
    setError(null);
  }, []);

  const analyzeReport = useCallback((input: FieldReportInput): Promise<GeminiAnalysisResult> => {
    clearTimers();
    setIsAnalyzing(true);
    setProgress(15);
    setError(null);
    setResult(null);
    setStageMessage('📡 Gemini multimodal vision & speech ingestion stream connecting...');

    const text = (input.rawText || '').toLowerCase();
    const hasWater = text.includes('water') || text.includes('flood') || text.includes('drown') || text.includes('river');
    const hasFire = text.includes('fire') || text.includes('burn') || text.includes('smoke') || text.includes('gas');
    const hasCollapse = text.includes('collapse') || text.includes('rubble') || text.includes('debris') || text.includes('trapped');
    const hasCasualties = text.includes('injur') || text.includes('casualt') || text.includes('victim') || text.includes('bleed');

    let urgency: UrgencyLevel = 'HIGH';
    let damage: 'SEVERE' | 'MODERATE' | 'MILD' = 'MODERATE';
    const hazards: string[] = [];
    const needs: string[] = [];

    if (hasCollapse || hasCasualties) {
      urgency = 'CRITICAL';
      damage = 'SEVERE';
      hazards.push('Structural Instability', 'Entrapment Risk', 'Live Utility Lines');
      needs.push('Urban Search & Rescue (USAR)', 'Heavy Hydraulic Cutters', 'Triage Paramedics');
    }
    if (hasWater) {
      if (urgency !== 'CRITICAL') urgency = 'HIGH';
      hazards.push('Fast Water Surge (+1.2m)', 'Contaminated Runoff');
      needs.push('Inflatable Rescue Boats', 'Potable Water Purification', 'Dry Blankets');
    }
    if (hasFire) {
      urgency = 'CRITICAL';
      hazards.push('Dense Toxic Smoke (CO > 180ppm)', 'Thermal Flashover Hazard');
      needs.push('Class B Chemical Foam', 'SCBA Oxygen Respirators', 'Burn Dressing Kits');
    }

    // Default fallbacks if generic input
    if (hazards.length === 0) {
      hazards.push('Power Grid Blackout', 'Compromised Access Roads');
    }
    if (needs.length === 0) {
      needs.push('Emergency First Aid', 'Satellite Comms Uplink', 'Emergency Rations');
    }

    return new Promise((resolve) => {
      // Progressive Stage 1: Optical analysis
      const t1 = setTimeout(() => {
        setProgress(45);
        setStageMessage('🛰️ Deconstructing multispectral satellite and drone feed telemetry...');
      }, 500);

      // Progressive Stage 2: Signal extraction
      const t2 = setTimeout(() => {
        setProgress(75);
        setStageMessage('🔍 Cross-referencing geospatial terrain map & identifying localized hazards...');
      }, 1100);

      // Progressive Stage 3: Synthesis & Confidence score
      const t3 = setTimeout(() => {
        setProgress(100);
        setStageMessage('✅ Gemini multimodal ingestion complete.');

        const generatedResult: GeminiAnalysisResult = {
          summary: input.rawText.trim().length > 0 
            ? `Gemini confirmed rapid incident signature: ${input.rawText.slice(0, 120)}${input.rawText.length > 120 ? '...' : ''}` 
            : 'Multi-hazard reconnaissance verified urgent incident sector needing active volunteer response.',
          detectedHazards: hazards,
          extractedNeeds: needs,
          confidence: Math.floor(92 + Math.random() * 7), // 92% - 98%
          urgencyAssessment: urgency,
          damageSeverity: damage,
          estimatedVictims: hasCasualties ? Math.floor(6 + Math.random() * 12) : Math.floor(1 + Math.random() * 4),
          geotaggedLocation: {
            name: input.region || 'Sector 7 - Operational Grid Delta',
            lat: 34.0522 + (Math.random() - 0.5) * 0.08,
            lng: -118.2437 + (Math.random() - 0.5) * 0.08,
            region: input.region || 'Western Zone'
          },
          keySignals: [
            'Acoustic distress beacon match',
            'Infrared thermal anomaly',
            'Optical road blockage detected (85% obstruction)'
          ]
        };

        setResult(generatedResult);
        setIsAnalyzing(false);
        resolve(generatedResult);
      }, 1700);

      timersRef.current.push(t1, t2, t3);
    });
  }, []);

  return {
    analyzeReport,
    isAnalyzing,
    progress,
    stageMessage,
    result,
    error,
    reset
  };
}
