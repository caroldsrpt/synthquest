import { useRunStore } from '@/stores/runStore';
import { useMetaStore } from '@/stores/metaStore';
import { ENEMIES } from '@/game/data/enemies';
import { SCENARIOS } from '@/game/data/scenarios';
import { COLORS } from '@/utils/constants';

// --- Teaching advice based on enemy type ---

interface TeachingAdvice {
  title: string;
  explanation: string;
  tip: string;
}

const HALLUCINATION_ENEMIES = new Set(['junkGenerator', 'confabulator']);
const DEBUFF_ENEMIES = new Set(['promptInjector', 'timeoutError']);
const HIGH_DAMAGE_ENEMIES = new Set(['ghostEndpoint', 'theMonolith', 'theGatekeeper', 'theOverfitter']);
const SWARM_ENEMIES = new Set(['tokenFlood', 'dataFragment']);

function getTeachingAdvice(enemyDefIds: string[]): TeachingAdvice {
  // Check for hallucination-heavy enemies first (most teaching-relevant)
  if (enemyDefIds.some((id) => HALLUCINATION_ENEMIES.has(id))) {
    const name = enemyDefIds.find((id) => HALLUCINATION_ENEMIES.has(id))!;
    const enemyName = ENEMIES[name]?.name || 'The enemy';
    return {
      title: 'Overwhelmed by Fabricated Data',
      explanation: `${enemyName} flooded you with hallucination status effects. Each hallucination stack has a chance to deal damage every turn — they pile up fast if you can't clear them.`,
      tip: 'Grounding cards absorb hallucination damage. Cards that remove debuffs or prevent status effects also help. Think of it like fact-checking: you need a source of truth to counter made-up data.',
    };
  }

  // Debuff-heavy enemies
  if (enemyDefIds.some((id) => DEBUFF_ENEMIES.has(id))) {
    const name = enemyDefIds.find((id) => DEBUFF_ENEMIES.has(id))!;
    const enemyName = ENEMIES[name]?.name || 'The enemy';
    return {
      title: 'Worn Down by Status Effects',
      explanation: `${enemyName} applied debuffs that weakened you over time — confused, throttled, or vulnerable. These reduce your energy, damage, or defenses each turn.`,
      tip: 'Cards that remove or prevent debuffs would help here. Input validation and system prompts act as filters — just like in real AI systems, you need to sanitize harmful inputs before they cause damage.',
    };
  }

  // High single-target damage
  if (enemyDefIds.some((id) => HIGH_DAMAGE_ENEMIES.has(id))) {
    const name = enemyDefIds.find((id) => HIGH_DAMAGE_ENEMIES.has(id))!;
    const enemyName = ENEMIES[name]?.name || 'The enemy';
    return {
      title: 'Too Much Unblocked Damage',
      explanation: `${enemyName} hit hard and you couldn't absorb enough damage. Without sufficient Firewall (block), big attacks go straight to your integrity.`,
      tip: 'Block cards and Firewall protect you each turn. Watch enemy intent icons — when you see a big attack coming, prioritize defense that turn. A balanced deck needs both offense and defense.',
    };
  }

  // Swarm / multi-enemy
  if (enemyDefIds.length > 1 || enemyDefIds.some((id) => SWARM_ENEMIES.has(id))) {
    return {
      title: 'Overwhelmed by Numbers',
      explanation: 'Multiple enemies attacked you simultaneously. Each one deals damage separately, and blocking only reduces one hit at a time.',
      tip: 'Area-of-effect (AoE) cards hit all enemies at once. When facing groups, prioritize eliminating the weakest enemies first to reduce incoming damage per turn.',
    };
  }

  // Generic fallback
  return {
    title: 'System Integrity Lost',
    explanation: 'Your system ran out of integrity before you could defeat all enemies.',
    tip: 'Building a balanced deck with both Attack and Block cards is key. Watch enemy intents to decide whether to attack or defend each turn. Rest sites restore integrity — use them wisely.',
  };
}

// --- Component ---

const PIXEL_FONT = "'Press Start 2P', monospace";

export function GameOverScreen() {
  const run = useRunStore();
  const meta = useMetaStore();

  const deathContext = run.deathContext;
  const enemyDefIds = deathContext?.enemyDefIds || [];
  const turnsSurvived = deathContext?.turnsSurvived || 0;
  const cardsInDeck = deathContext?.cardsInDeck || run.deck.length;

  // Get enemy names for display
  const enemyNames = enemyDefIds
    .map((id) => ENEMIES[id]?.name)
    .filter(Boolean) as string[];
  const killedByLabel = enemyNames.length > 0
    ? enemyNames.join(' & ')
    : 'Unknown';

  // Teaching advice
  const advice = getTeachingAdvice(enemyDefIds);

  // Scenario progress
  const totalScenarios = Object.keys(SCENARIOS).length;
  const completedCount = run.completedScenarios?.length || 0;

  const handleRetry = () => {
    meta.recordRun(run.act, false);
    run.startNewRun();
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #1a0505 0%, #0c0c1a 40%, #0f0f23 100%)',
      fontFamily: PIXEL_FONT,
      color: COLORS.text,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      padding: '32px 16px',
    }}>
      {/* Main panel */}
      <div style={{
        maxWidth: 640,
        width: '100%',
        background: 'rgba(15, 15, 35, 0.95)',
        border: `2px solid ${COLORS.accent}`,
        borderRadius: 8,
        padding: '32px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 0 40px rgba(123, 104, 238, 0.15), inset 0 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* DEFEAT header */}
        <h1 style={{
          fontSize: 40,
          color: COLORS.hpLow,
          margin: '0 0 4px',
          fontWeight: 'bold',
          textShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 2px 4px rgba(0,0,0,0.8)',
          letterSpacing: 4,
        }}>
          DEFEAT
        </h1>

        <div style={{
          width: 120, height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.hpLow}, transparent)`,
          margin: '8px 0 20px',
        }} />

        {/* What happened */}
        <div style={{
          width: '100%',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 6,
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 8, color: COLORS.hpLow, marginBottom: 8, letterSpacing: 1 }}>
            WHAT HAPPENED
          </div>
          <div style={{ fontSize: 10, lineHeight: 1.8, color: COLORS.text }}>
            Defeated by <span style={{ color: COLORS.hpLow, fontWeight: 'bold' }}>{killedByLabel}</span>
            {' '}on <span style={{ color: COLORS.accent }}>Act {run.act}, Floor {run.floor}</span>
          </div>
        </div>

        {/* Teaching section — what concept was your weakness */}
        <div style={{
          width: '100%',
          background: 'rgba(123, 104, 238, 0.08)',
          border: '1px solid rgba(123, 104, 238, 0.3)',
          borderRadius: 6,
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 8, color: COLORS.accent, marginBottom: 8, letterSpacing: 1 }}>
            {advice.title.toUpperCase()}
          </div>
          <div style={{ fontSize: 9, lineHeight: 1.8, color: '#b0b0c8', marginBottom: 10 }}>
            {advice.explanation}
          </div>
          <div style={{
            fontSize: 9, lineHeight: 1.8,
            color: '#a78bfa',
            borderTop: '1px solid rgba(123, 104, 238, 0.2)',
            paddingTop: 10,
          }}>
            <span style={{ color: COLORS.energy, marginRight: 6 }}>TIP:</span>
            {advice.tip}
          </div>
        </div>

        {/* Run stats */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10,
          marginBottom: 16,
        }}>
          <StatBox label="TURNS" value={String(turnsSurvived)} color={COLORS.text} />
          <StatBox label="DECK SIZE" value={String(cardsInDeck)} color={COLORS.text} />
          <StatBox label="GOLD" value={String(run.gold)} color={COLORS.gold} />
        </div>

        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 20,
        }}>
          <StatBox label="RELICS" value={String(run.relics.length)} color={COLORS.accent} />
          <StatBox label="FLOOR" value={String(run.floor)} color={COLORS.text} />
        </div>

        {/* Concepts unlocked this run */}
        <div style={{
          width: '100%',
          background: 'rgba(74, 222, 128, 0.06)',
          border: '1px solid rgba(74, 222, 128, 0.2)',
          borderRadius: 6,
          padding: '14px 16px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 8, color: COLORS.hp, marginBottom: 8, letterSpacing: 1 }}>
            CONCEPTS UNLOCKED THIS RUN
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 20, color: COLORS.hp, fontWeight: 'bold' }}>
              {completedCount}
            </div>
            <div style={{ fontSize: 9, color: '#9ca3af', lineHeight: 1.6 }}>
              / {totalScenarios} scenarios completed
            </div>
          </div>
          {completedCount > 0 && (
            <div style={{
              marginTop: 10,
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              {run.completedScenarios.map((sid) => {
                const scenario = SCENARIOS[sid];
                if (!scenario) return null;
                return (
                  <span key={sid} style={{
                    fontSize: 7,
                    padding: '3px 8px',
                    background: 'rgba(74, 222, 128, 0.12)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: 4,
                    color: COLORS.hp,
                  }}>
                    {scenario.concept}
                  </span>
                );
              })}
            </div>
          )}
          {completedCount === 0 && (
            <div style={{ fontSize: 8, color: '#6b7280', marginTop: 6 }}>
              Complete scenarios on the map to unlock AI concepts.
            </div>
          )}
        </div>

        {/* Try Again button */}
        <button
          onClick={handleRetry}
          style={{
            padding: '14px 48px',
            fontSize: 12,
            fontFamily: PIXEL_FONT,
            fontWeight: 'bold',
            color: COLORS.text,
            background: 'rgba(123, 104, 238, 0.15)',
            border: `2px solid ${COLORS.accent}`,
            borderRadius: 8,
            cursor: 'pointer',
            letterSpacing: 2,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(123, 104, 238, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(123, 104, 238, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(123, 104, 238, 0.15)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${COLORS.border}`,
      borderRadius: 6,
      padding: '10px 12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 7, color: COLORS.textDim, marginBottom: 6, letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color, fontWeight: 'bold' }}>
        {value}
      </div>
    </div>
  );
}

export function VictoryScreen() {
  const run = useRunStore();
  const meta = useMetaStore();

  const handleNewRun = () => {
    meta.recordRun(3, true);
    run.setScreen('title');
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0f2310 0%, #0f0f23 100%)',
      fontFamily: 'monospace', color: '#e0e0e0',
      border: '2px solid #333', borderRadius: 4,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <h1 style={{ fontSize: 36, color: COLORS.hp, margin: '0 0 8px', fontWeight: 'bold' }}>
        SYSTEM ONLINE
      </h1>
      <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
        You built a complete AI system from nothing.
      </p>
      <p style={{ fontSize: 12, color: '#a78bfa', maxWidth: 500, textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
        LLM to Agent to Orchestrator. That progression is exactly how real AI systems are built. You did it.
      </p>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, fontSize: 13, color: '#9ca3af' }}>
        <div>Cards: {run.deck.length}</div>
        <div>Relics: {run.relics.length}</div>
        <div>Gold: {run.gold}</div>
      </div>
      <button onClick={handleNewRun} style={{
        padding: '12px 48px', fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold',
        color: '#e0e0e0', background: 'rgba(74, 222, 128, 0.2)',
        border: '2px solid rgba(74, 222, 128, 0.5)', borderRadius: 8, cursor: 'pointer',
      }}>
        New Run
      </button>
    </div>
  );
}
