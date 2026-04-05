import { useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { useMetaStore } from '../../stores/metaStore';
import { SCENARIOS } from '../../game/data/scenarios';
import { CARDS } from '../../game/data/cards';
import { createCardInstance } from '../../utils/cardUtils';
import { ShopDiagram } from '../scenario/ShopDiagram';
import { CardComponent } from '../combat/CardComponent';
import { S1_TextGeneration } from '../scenario/S1_TextGeneration';
import { S2_Temperature } from '../scenario/S2_Temperature';
import { S3_Hallucination } from '../scenario/S3_Hallucination';
import { S4_Grounding } from '../scenario/S4_Grounding';
import { S5_PromptEngineering } from '../scenario/S5_PromptEngineering';
import { S6_ContextWindow } from '../scenario/S6_ContextWindow';
import { S7_RAG } from '../scenario/S7_RAG';
import { S8_API } from '../scenario/S8_API';
import { S9_ToolUse } from '../scenario/S9_ToolUse';
import { S10_AIAgents } from '../scenario/S10_AIAgents';
import { S11_FewShot } from '../scenario/S11_FewShot';
import { S12_MCP } from '../scenario/S12_MCP';
import { S13_Multimodal } from '../scenario/S13_Multimodal';
import { S14_Ethics } from '../scenario/S14_Ethics';
import { S15_Automation } from '../scenario/S15_Automation';
import { S16_FineTuning } from '../scenario/S16_FineTuning';
import { S17_Safety } from '../scenario/S17_Safety';
import { S18_Orchestration } from '../scenario/S18_Orchestration';

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
    // Unlock knowledge concept in persistent meta store
    useMetaStore.getState().unlockKnowledge(scenario.concept);
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
      {phase === 'popup' && (() => {
        const rewardCard = CARDS[scenario.cardRewardId];
        const previewInstance = rewardCard ? createCardInstance(rewardCard.id) : null;
        return (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50,
            }}
            onClick={handleDismissPopup}
          >
            <div
              style={{
                maxWidth: 520, padding: '36px 44px',
                background: 'rgba(12, 8, 24, 0.95)',
                border: '3px solid #6b4fa0',
                boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 40px rgba(107,79,160,0.3)',
                textAlign: 'center',
                fontFamily: "'Press Start 2P', monospace",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontSize: 10, color: '#6b4fa0', textTransform: 'uppercase',
                letterSpacing: 4, marginBottom: 12,
              }}>
                Concept Unlocked
              </div>
              <h2 style={{
                fontSize: 18, fontWeight: 'bold', margin: '0 0 12px', color: '#f0e6d3',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}>
                {scenario.popupTitle}
              </h2>
              <p style={{
                fontSize: 13, fontFamily: 'monospace', color: '#9ca3af',
                lineHeight: 1.8, marginBottom: 24,
                maxWidth: 420, margin: '0 auto 24px',
              }}>
                {scenario.popupText}
              </p>

              {/* Card reward - actual card preview */}
              <div style={{
                fontSize: 10, color: '#6b4fa0', textTransform: 'uppercase',
                letterSpacing: 3, marginBottom: 12,
              }}>
                Card Earned
              </div>
              {previewInstance && (
                <div style={{
                  display: 'flex', justifyContent: 'center', marginBottom: 24,
                  filter: 'drop-shadow(0 0 12px rgba(168,130,255,0.4))',
                }}>
                  <CardComponent
                    card={previewInstance}
                    index={0}
                    selected={false}
                    playable={true}
                    onClick={() => {}}
                  />
                </div>
              )}

              <button
                onClick={handleDismissPopup}
                style={{
                  padding: '12px 36px',
                  background: 'rgba(12, 8, 24, 0.85)',
                  border: '3px solid #6b4fa0',
                  boxShadow: 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c',
                  color: '#c4b89a',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 12, cursor: 'pointer', letterSpacing: 2,
                }}
              >
                Continue
              </button>
            </div>
          </div>
        );
      })()}
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
    // Act 2
    case 's7_rag': return <S7_RAG onComplete={onComplete} />;
    case 's8_api': return <S8_API onComplete={onComplete} />;
    case 's9_toolUse': return <S9_ToolUse onComplete={onComplete} />;
    case 's10_agent': return <S10_AIAgents onComplete={onComplete} />;
    case 's11_fewShot': return <S11_FewShot onComplete={onComplete} />;
    case 's12_mcp': return <S12_MCP onComplete={onComplete} />;
    // Act 3
    case 's13_multimodal': return <S13_Multimodal onComplete={onComplete} />;
    case 's14_ethics': return <S14_Ethics onComplete={onComplete} />;
    case 's15_automation': return <S15_Automation onComplete={onComplete} />;
    case 's16_fineTuning': return <S16_FineTuning onComplete={onComplete} />;
    case 's17_safety': return <S17_Safety onComplete={onComplete} />;
    case 's18_orchestration': return <S18_Orchestration onComplete={onComplete} />;
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
