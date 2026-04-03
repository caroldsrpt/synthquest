import { useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { SCENARIOS } from '../../game/data/scenarios';
import { createCardInstance } from '../../utils/cardUtils';
import { ShopDiagram } from '../scenario/ShopDiagram';
import { S1_TextGeneration } from '../scenario/S1_TextGeneration';
import { S2_Temperature } from '../scenario/S2_Temperature';
import { S3_Hallucination } from '../scenario/S3_Hallucination';
import { S4_Grounding } from '../scenario/S4_Grounding';
import { S5_PromptEngineering } from '../scenario/S5_PromptEngineering';
import { S6_ContextWindow } from '../scenario/S6_ContextWindow';

type ScenarioPhase = 'playing' | 'popup' | 'done';

export function ScenarioScreen() {
  const run = useRunStore();
  const [phase, setPhase] = useState<ScenarioPhase>('playing');
  const scenarioId = run.currentScenarioId;
  const scenario = scenarioId ? SCENARIOS[scenarioId] : null;

  if (!scenario) return null;

  const handleComplete = () => {
    setPhase('popup');
  };

  const handleDismissPopup = () => {
    // Award card
    const card = createCardInstance(scenario.cardRewardId);
    run.addCardToDeck(card);
    run.completeScenario(scenario.id);
    setPhase('done');
    // Return to map
    run.setCurrentScenario(null);
    run.setScreen('map');
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0c0c1a', fontFamily: 'monospace', color: '#e0e0e0',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      {/* Shop diagram - top */}
      <ShopDiagram />

      {/* Scenario title bar */}
      <div style={{
        padding: '8px 20px',
        borderBottom: '1px solid #1e2030',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ color: '#7b68ee', fontWeight: 'bold', fontSize: 14 }}>
            S{scenario.number}: {scenario.title}
          </span>
          <span style={{ color: '#374151', fontSize: 12, marginLeft: 12 }}>
            {scenario.concept}
          </span>
        </div>
        <button
          onClick={handleComplete}
          style={{
            fontSize: 10, padding: '4px 10px', background: 'none',
            border: '1px solid #374151', borderRadius: 4, color: '#4b5563',
            fontFamily: 'monospace', cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>

      {/* Scenario content - center */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {phase === 'playing' && (
          <ScenarioContent scenarioId={scenario.id} onComplete={handleComplete} />
        )}
      </div>

      {/* Instruction bar - bottom */}
      {phase === 'playing' && (
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid #1e2030',
          background: '#080812',
          fontSize: 12, color: '#6b7280', textAlign: 'center',
        }}>
          {scenario.instruction}
        </div>
      )}

      {/* Popup overlay */}
      {phase === 'popup' && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={handleDismissPopup}
        >
          <div
            style={{
              maxWidth: 480, padding: '32px 40px',
              background: '#1a1a3e',
              border: '2px solid #7b68ee',
              borderRadius: 12,
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 11, color: '#7b68ee', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              Concept Unlocked
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: '0 0 12px', color: '#e0e0e0' }}>
              {scenario.popupTitle}
            </h2>
            <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginBottom: 20 }}>
              {scenario.popupText}
            </p>
            <div style={{
              padding: '8px 16px', background: '#7b68ee22', border: '1px solid #7b68ee44',
              borderRadius: 8, fontSize: 12, color: '#a78bfa', marginBottom: 20,
            }}>
              Card earned: <strong>{scenario.cardRewardId}</strong>
            </div>
            <button
              onClick={handleDismissPopup}
              style={{
                padding: '10px 32px', background: '#7b68ee33',
                border: '2px solid #7b68ee', borderRadius: 8,
                color: '#e0e0e0', fontFamily: 'monospace', fontWeight: 'bold',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Routes to the correct scenario component
function ScenarioContent({ scenarioId, onComplete }: { scenarioId: string; onComplete: () => void }) {
  switch (scenarioId) {
    case 's1_textGeneration': return <S1_TextGeneration onComplete={onComplete} />;
    case 's2_temperature': return <S2_Temperature onComplete={onComplete} />;
    case 's3_hallucination': return <S3_Hallucination onComplete={onComplete} />;
    case 's4_grounding': return <S4_Grounding onComplete={onComplete} />;
    case 's5_promptEng': return <S5_PromptEngineering onComplete={onComplete} />;
    case 's6_contextWindow': return <S6_ContextWindow onComplete={onComplete} />;
    // Act 2 & 3 scenarios will be added here
    default:
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={onComplete} style={{
            padding: '12px 24px', background: '#7b68ee33', border: '2px solid #7b68ee',
            borderRadius: 8, color: '#e0e0e0', fontFamily: 'monospace', cursor: 'pointer',
          }}>
            Complete Scenario (placeholder)
          </button>
        </div>
      );
  }
}
