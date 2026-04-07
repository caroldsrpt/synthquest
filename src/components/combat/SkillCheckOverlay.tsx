import { useRef, useCallback } from 'react';
import type { SkillCheckType } from '@/game/data/skillChecks';
import { SKILL_CHECK_DEFS } from '@/game/data/skillChecks';
import { CrosshairCheck } from './skillchecks/CrosshairCheck';
import { TemperatureSlider } from './skillchecks/TemperatureSlider';
import { PatternMatchCheck } from './skillchecks/PatternMatchCheck';
import { CalibrationDial } from './skillchecks/CalibrationDial';
import { BatchTimingCheck } from './skillchecks/BatchTimingCheck';

const PIXEL = "'Press Start 2P', monospace";

export function SkillCheckOverlay({
  checkType,
  onResult,
}: {
  checkType: SkillCheckType;
  onResult: (multiplier: number) => void;
}) {
  const def = SKILL_CHECK_DEFS[checkType];
  const handled = useRef(false);

  const handleResult = useCallback((mult: number) => {
    if (handled.current) return;
    handled.current = true;
    onResult(mult);
  }, [onResult]);

  // For timing-based checks, clicking ANYWHERE on the overlay should trigger the stop
  // The individual check components expose their click handlers via onMouseDown
  // But as a fallback, clicking the backdrop also triggers a "miss" result
  const handleBackdropClick = useCallback(() => {
    // This is a safety net — most checks handle their own clicks
    // Only fires if the check component didn't catch the click
  }, []);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        cursor: 'pointer',
      }}
    >
      <div style={{
        fontFamily: PIXEL,
        fontSize: 8,
        color: '#fbbf24',
        marginBottom: 12,
        letterSpacing: 1,
        pointerEvents: 'none',
      }}>
        SKILL CHECK
      </div>
      <div style={{
        fontFamily: PIXEL,
        fontSize: 7,
        color: '#c4b89a',
        marginBottom: 16,
        pointerEvents: 'none',
      }}>
        {def.description}
      </div>

      {checkType === 'crosshair' && <CrosshairCheck onResult={handleResult} />}
      {checkType === 'temperatureSlider' && <TemperatureSlider onResult={handleResult} />}
      {checkType === 'patternMatch' && <PatternMatchCheck onResult={handleResult} />}
      {checkType === 'calibrationDial' && <CalibrationDial onResult={handleResult} />}
      {checkType === 'batchTiming' && <BatchTimingCheck onResult={handleResult} />}
    </div>
  );
}
