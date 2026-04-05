export type SkillCheckType = 'crosshair' | 'temperatureSlider' | 'patternMatch' | 'calibrationDial' | 'batchTiming';

export interface SkillCheckDef {
  type: SkillCheckType;
  durationMs: number;
  description: string;
}

/** Maps card defId to skill check type. Only cards listed here trigger skill checks. */
export const CARD_SKILL_CHECKS: Record<string, SkillCheckType> = {
  // Hallucination/noise cards — erratic crosshair
  hallucinateData: 'crosshair',
  dataPoisoning: 'crosshair',
  // Text generation cards — temperature slider
  temperatureMax: 'temperatureSlider',
  brainstorm: 'temperatureSlider',
  // Logic cards — pattern match
  patternMatch: 'patternMatch',
  classify: 'patternMatch',
  // Structure cards — calibration dial
  groundTruth: 'calibrationDial',
  citeSource: 'calibrationDial',
  // Multi-hit/combo cards — batch timing
  agentLoop: 'batchTiming',
  orchestrator: 'batchTiming',
};

export const SKILL_CHECK_DEFS: Record<SkillCheckType, SkillCheckDef> = {
  crosshair: {
    type: 'crosshair',
    durationMs: 2500,
    description: 'Click when the crosshair hits the target!',
  },
  temperatureSlider: {
    type: 'temperatureSlider',
    durationMs: 2500,
    description: 'Stop the meter in the sweet spot!',
  },
  patternMatch: {
    type: 'patternMatch',
    durationMs: 3000,
    description: 'Pick the matching symbol!',
  },
  calibrationDial: {
    type: 'calibrationDial',
    durationMs: 2500,
    description: 'Click when the needle hits green!',
  },
  batchTiming: {
    type: 'batchTiming',
    durationMs: 3000,
    description: 'Hit the beats in sequence!',
  },
};
