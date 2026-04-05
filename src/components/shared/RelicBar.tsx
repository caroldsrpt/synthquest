import { useState } from 'react';
import { RELICS } from '@/game/data/relics';

const PIXEL = "'Press Start 2P', monospace";

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#60a5fa',
  rare: '#fbbf24',
  boss: '#ef4444',
};

export function RelicBar({ relicIds }: { relicIds: string[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (relicIds.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
      {relicIds.map((id) => {
        const relic = RELICS[id];
        if (!relic) return null;
        const color = RARITY_COLORS[relic.rarity] || '#9ca3af';
        return (
          <div
            key={id}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: 24,
              height: 24,
              border: `2px solid ${color}`,
              background: 'rgba(12, 8, 24, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              cursor: 'default',
              position: 'relative',
            }}
            title={`${relic.name}: ${relic.description}`}
          >
            <span style={{ fontSize: 12 }}>
              {relic.name.charAt(0).toUpperCase()}
            </span>

            {hovered === id && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                padding: '10px 14px',
                background: 'rgba(12, 8, 24, 0.95)',
                border: `2px solid ${color}`,
                boxShadow: '0 0 20px rgba(0,0,0,0.7)',
                fontFamily: PIXEL,
                minWidth: 200,
                maxWidth: 280,
                zIndex: 100,
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: 9, color, marginBottom: 6, letterSpacing: 1 }}>
                  {relic.name}
                </div>
                <div style={{ fontSize: 8, color: '#c4b89a', lineHeight: 1.5 }}>
                  {relic.description}
                </div>
                <div style={{ fontSize: 7, color: '#6b7280', marginTop: 6, fontStyle: 'italic' }}>
                  {relic.aiConcept}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
