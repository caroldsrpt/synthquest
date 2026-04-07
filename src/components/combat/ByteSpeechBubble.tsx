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
        const timer = setTimeout(() => setText(null), 5000);
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
        left: '3%',
        bottom: '60%',
        zIndex: 25,
        padding: '10px 14px',
        background: 'rgba(12, 8, 24, 0.95)',
        border: '2px solid #a882ff',
        boxShadow: '0 0 16px rgba(168,130,255,0.3), inset 0 0 0 1px #1a1130',
        borderRadius: '12px 12px 12px 4px',
        maxWidth: 220,
        cursor: 'pointer',
        animation: 'tipFadeIn 0.3s ease-out',
      }}
    >
      {/* Tail pointing down-left toward Byte */}
      <div style={{
        position: 'absolute',
        bottom: -10,
        left: 12,
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '10px solid #a882ff',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -7,
        left: 14,
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '8px solid rgba(12, 8, 24, 0.92)',
      }} />
      <div style={{
        fontFamily: PIXEL,
        fontSize: 9,
        color: '#e0d8c8',
        lineHeight: 1.6,
        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      }}>
        {text}
      </div>
      <div style={{
        fontFamily: PIXEL,
        fontSize: 7,
        color: '#8a7a9e',
        marginTop: 8,
        letterSpacing: 1,
      }}>
        [click to dismiss]
      </div>
      {/* Speech bubble tail pointing down-left to Byte */}
      <div style={{
        position: 'absolute',
        bottom: -10,
        left: 16,
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #a882ff',
      }} />
    </div>
  );
}
