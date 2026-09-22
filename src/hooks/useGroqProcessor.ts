import { useState, useCallback, useRef } from 'react';
import { GeminiAnalysisResult, GroqProcessingResult } from '../types';

export function useGroqProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState<string>('');
  const [result, setResult] = useState<GroqProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const reset = useCallback(() => {
    clearTimers();
    setIsProcessing(false);
    setProgress(0);
    setStageMessage('');
    setResult(null);
    setError(null);
  }, []);

  const processTaxonomy = useCallback((geminiResult?: GeminiAnalysisResult | null): Promise<GroqProcessingResult> => {
    clearTimers();
    setIsProcessing(true);
    setProgress(20);
    setError(null);
    setResult(null);
    setStageMessage('⚡ Groq LPU: Initializing ultra-fast disaster taxonomy classification...');

    const isCritical = geminiResult?.urgencyAssessment === 'CRITICAL';
    const isHigh = geminiResult?.urgencyAssessment === 'HIGH';

    let taxonomy = 'CATEGORY_GENERAL_TRIAGE';
    let triageQueue: 'ALPHA_IMMEDIATE' | 'BRAVO_URGENT' | 'CHARLIE_STANDARD' = 'CHARLIE_STANDARD';
    let priority = 65;
    const skills: string[] = [];
    const supplies: string[] = [];

    const hazardsStr = (geminiResult?.detectedHazards || []).join(' ').toLowerCase();
    const needsStr = (geminiResult?.extractedNeeds || []).join(' ').toLowerCase();

    if (hazardsStr.includes('structural') || hazardsStr.includes('rubble') || needsStr.includes('search')) {
      taxonomy = 'CATEGORY_USAR_ALPHA (Urban Search & Collapse Rescue)';
      triageQueue = 'ALPHA_IMMEDIATE';
      priority = 98;
      skills.push('Heavy USAR Certification', 'EMT-Paramedic', 'Structural Assessment', 'K-9 Search Dog Handler');
      supplies.push('Pneumatic Shoring Kit', 'Acoustic Geophone Listening Device', 'Hydraulic Spreader/Cutters');
    } else if (hazardsStr.includes('water') || hazardsStr.includes('flood') || needsStr.includes('boat')) {
      taxonomy = 'CATEGORY_SWIFTWATER_DISASTER_EVACUATION';
      triageQueue = isCritical ? 'ALPHA_IMMEDIATE' : 'BRAVO_URGENT';
      priority = 89;
      skills.push('Swiftwater Rescue Technician', 'Zodiac Pilot / Coxswain', 'Waterborne Medic', 'Hypothermia Management');
      supplies.push('Dry Suits & PFDs', 'Motorized Inflatable Dinghies', 'Thermal Hypothermia Bags');
    } else if (hazardsStr.includes('chemical') || hazardsStr.includes('smoke') || hazardsStr.includes('toxic')) {
      taxonomy = 'CATEGORY_HAZMAT_MASS_DECONTAMINATION';
      triageQueue = 'ALPHA_IMMEDIATE';
      priority = 95;
      skills.push('Hazmat Level A Operations', 'Toxicologist / Advanced Triage', 'SCBA Equipment Specialist');
      supplies.push('Decon Shower Tent', 'Atropine / Air Purifying Canisters', 'Gas Detection Sensors');
    } else {
      taxonomy = isCritical ? 'CATEGORY_MASS_CASUALTY_INCIDENT' : 'CATEGORY_TACTICAL_RESOURCE_STAGING';
      triageQueue = isCritical ? 'ALPHA_IMMEDIATE' : (isHigh ? 'BRAVO_URGENT' : 'CHARLIE_STANDARD');
      priority = isCritical ? 92 : 78;
      skills.push('Emergency First Responder', 'Crisis Logistics Specialist', 'Bilingual Translator', 'Trauma Nurse');
      supplies.push('Trauma Medical Kits', 'Satellite BGAN Terminals', 'Portable Power Stations');
    }

    return new Promise((resolve) => {
      // Step 1: LPU token ingestion (lightning fast simulation)
      const t1 = setTimeout(() => {
        setProgress(60);
        setStageMessage('⚡ Groq LPU: Resolving skill taxonomy matrix & volunteer geospatial proximity...');
      }, 350);

      // Step 2: Final dispatch plan assembly
      const t2 = setTimeout(() => {
        setProgress(100);
        setStageMessage('⚡ Groq processing complete: Structured dispatch taxonomy ready.');

        const latency = Math.floor(62 + Math.random() * 45); // 62ms - 107ms Groq LPU latency

        const groqResult: GroqProcessingResult = {
          taxonomyCategory: taxonomy,
          priorityScore: priority,
          requiredSkills: skills,
          dispatchPlan: `Target response ETA < 18 min. Dispatching top-tier volunteers matching required credentials. Direct routing established via emergency corridor bypassing obstructed transit hubs.`,
          estimatedPersonnelNeeded: isCritical ? 5 : 3,
          triageQueue,
          executionLatencyMs: latency,
          recommendedSupplies: supplies
        };

        setResult(groqResult);
        setIsProcessing(false);
        resolve(groqResult);
      }, 850);

      timersRef.current.push(t1, t2);
    });
  }, []);

  return {
    processTaxonomy,
    isProcessing,
    progress,
    stageMessage,
    result,
    error,
    reset
  };
}
