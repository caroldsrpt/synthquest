import { useEffect, useState } from 'react';
import { useCombatStore } from '@/stores/combatStore';
import { useRunStore } from '@/stores/runStore';
import { BYTE_SPEECHES } from '@/game/data/byteSpeechData';

const PIXEL = "'Press Start 2P', monospace";

export function ByteSpeechBubble() {
  const [text, setText] = useState<string | null>(null);
  const combat = useCombatStore();
  const run = useRunStore();

  useEffect(() => {
    if (combat.phase !== 'playerTurn') return;

    const shown = run.teachingTriggersShown;
    const context = {
      turn: combat.turn,
      phase: combat.phase,
      handSize: combat.hand.length,
      energy: combat.energy,
      maxEnergy: combat.maxEnergy,
      integrity: run.currentIntegrity,
      maxIntegrity: run.maxIntegrity,
      firewall: combat.playerFirewall,
    };

    for (const speech of BYTE_SPEECHES) {
      if (shown.includes(speech.id)) continue;
      if (speech.condition(context)) {
        setText(speech.text);
        run.markTeachingShown(speech.id);
        const timer = setTimeout(() => setText(null), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [combat.phase, combat.turn, combat.hand.length, combat.energy, combat.playerFirewall]);

  if (!text) return null;

  return (
    <div
      onClick={() => setText(null)}
      style={{
        position: 'absolute',
        left: '8%',
        bottom: '42%',
        zIndex: 25,
        padding: '10px 16px',
        background: 'rgba(12, 8, 24, 0.92)',
        border: '2px solid #a882ff',
        borderRadius: '12px 12px 12px 0',
        maxWidth: 240,
        cursor: 'pointer',
        animation: 'tipFadeIn 0.3s ease-out',
      }}
    >
      <div style={{
        fontFamily: PIXEL,
        fontSize: 7,
        color: '#c4b89a',
        lineHeight: 1.6,
      }}>
        {text}
      </div>
      <div style={{
        fontFamily: PIXEL,
        fontSize: 5,
        color: '#6b7280',
        marginTop: 4,
      }}>
        click to dismiss
      </div>
    </div>
  );
}
