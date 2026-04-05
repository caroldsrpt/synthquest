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

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 45,
    }}>
      <div style={{
        fontFamily: PIXEL,
        fontSize: 8,
        color: '#fbbf24',
        marginBottom: 12,
        letterSpacing: 1,
      }}>
        SKILL CHECK
      </div>
      <div style={{
        fontFamily: PIXEL,
        fontSize: 7,
        color: '#c4b89a',
        marginBottom: 16,
      }}>
        {def.description}
      </div>

      {checkType === 'crosshair' && <CrosshairCheck onResult={onResult} />}
      {checkType === 'temperatureSlider' && <TemperatureSlider onResult={onResult} />}
      {checkType === 'patternMatch' && <PatternMatchCheck onResult={onResult} />}
      {checkType === 'calibrationDial' && <CalibrationDial onResult={onResult} />}
      {checkType === 'batchTiming' && <BatchTimingCheck onResult={onResult} />}
    </div>
  );
}
