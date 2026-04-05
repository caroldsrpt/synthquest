import { useState } from 'react';
import { POTIONS } from '@/game/data/potions';
import type { PotionInstance } from '@/game/data/types';

const PIXEL = "'Press Start 2P', monospace";

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#60a5fa',
  rare: '#fbbf24',
};

export function PotionSlots({
  potions,
  maxSlots,
  canUse,
  onUse,
  onDiscard,
}: {
  potions: PotionInstance[];
  maxSlots: number;
  canUse: boolean;
  onUse: (potionId: string) => void;
  onDiscard: (potionId: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const slots = Array.from({ length: maxSlots }, (_, i) => potions[i] || null);

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {slots.map((potion, i) => {
        const def = potion ? POTIONS[potion.defId] : null;
        const color = def ? (RARITY_COLORS[def.rarity] || '#9ca3af') : '#3d2d5c';

        return (
          <div
            key={potion?.id || `empty-${i}`}
            onMouseEnter={() => potion && setHovered(potion.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              if (potion && canUse && def) onUse(potion.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (potion) onDiscard(potion.id);
            }}
            style={{
              width: 28,
              height: 28,
              border: `2px solid ${color}`,
              background: def ? 'rgba(12, 8, 24, 0.8)' : 'rgba(12, 8, 24, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: potion && canUse ? 'pointer' : 'default',
              position: 'relative',
              borderRadius: 4,
            }}
          >
            {def ? (
              <span style={{ fontSize: 10, color }}>
                {def.name.charAt(0)}
              </span>
            ) : (
              <span style={{ fontSize: 8, color: '#3d2d5c' }}>+</span>
            )}

            {hovered === potion?.id && def && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-25%)',
                marginBottom: 8,
                padding: '10px 14px',
                background: 'rgba(12, 8, 24, 0.95)',
                border: `2px solid ${color}`,
                boxShadow: '0 0 20px rgba(0,0,0,0.7)',
                fontFamily: PIXEL,
                minWidth: 180,
                maxWidth: 260,
                zIndex: 100,
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: 8, color, marginBottom: 4, letterSpacing: 1 }}>
                  {def.name}
                </div>
                <div style={{ fontSize: 7, color: '#c4b89a', lineHeight: 1.5, marginBottom: 4 }}>
                  {def.description}
                </div>
                <div style={{ fontSize: 6, color: '#6b7280', fontStyle: 'italic', marginBottom: 6 }}>
                  {def.aiTooltip}
                </div>
                <div style={{ fontSize: 6, color: '#8a7a66' }}>
                  {canUse ? 'Click to use | Right-click to discard' : 'Right-click to discard'}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
