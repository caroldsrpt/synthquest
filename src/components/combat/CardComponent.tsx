import { useState } from 'react';
import type { CardInstance } from '../../game/data/types';
import { CARDS } from '../../game/data/cards';
import { getCardCost, getCardName, getCardDescription } from '../../utils/cardUtils';
import { COLORS, CARD_W, CARD_H } from '../../utils/constants';

const CATEGORY_ART: Record<string, string> = {
  text: '/sprites/card-text.png',
  structure: '/sprites/card-structure.png',
  logic: '/sprites/card-logic.png',
  vision: '/sprites/card-vision.png',
  noise: '/sprites/card-noise.png',
  curse: '/sprites/card-curse.png',
};

const PX_OUTLINE_SM = [
  '-1px -1px 0 #000', ' 1px -1px 0 #000',
  '-1px  1px 0 #000', ' 1px  1px 0 #000',
  ' 0   -1px 0 #000', ' 0    1px 0 #000',
  '-1px  0   0 #000', ' 1px  0   0 #000',
].join(', ');

interface CardComponentProps {
  card: CardInstance;
  index: number;
  selected: boolean;
  playable: boolean;
  onClick: (index: number) => void;
  small?: boolean;
  wide?: boolean;
}

const KEYWORD_DESCRIPTIONS: Record<string, string> = {
  exhaust: 'EXHAUST — Removed from play after use. Cannot be drawn again this combat.',
  retain: 'RETAIN — Stays in your hand at end of turn instead of being discarded.',
  power: 'POWER — Plays once, effect lasts the entire combat.',
  hallucination: 'HALLUCINATION — Curse cards shuffled into your deck. They clog your hand and can deal damage when discarded.',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  text: 'TEXT — Generation and language model cards',
  structure: 'STRUCTURE — Firewall, grounding, and data cards',
  logic: 'LOGIC — Reasoning, tools, and planning cards',
  vision: 'VISION — Analysis and pattern recognition cards',
  noise: 'NOISE — Chaos, randomness, and risk cards',
  curse: 'CURSE — Harmful cards that clog your deck',
};

export function CardComponent({ card, index, selected, playable, onClick, small, wide }: CardComponentProps) {
  const def = CARDS[card.defId];
  const [showTooltip, setShowTooltip] = useState(false);
  if (!def) return null;

  const cost = getCardCost(card);
  const name = getCardName(card);
  const desc = getCardDescription(card);
  const catColor = COLORS.categories[def.category] || '#888';
  const rarityColor = COLORS.rarity[def.rarity] || '#fff';
  const w = wide ? 120 : small ? 80 : CARD_W;
  const h = wide ? 168 : small ? 112 : CARD_H;
  const nameFont = w >= 120 ? 9 : w >= 100 ? 8 : 7;
  const artSrc = CATEGORY_ART[def.category];

  return (
    <div
      onClick={() => playable && onClick(index)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        width: w,
        height: h,
        border: `3px solid ${selected ? '#fff' : playable ? catColor : '#2a2540'}`,
        boxShadow: selected
          ? `0 0 16px ${catColor}66, inset 0 0 12px ${catColor}22`
          : playable
          ? `inset 0 0 0 1px ${catColor}33`
          : 'none',
        background: '#0c0a14',
        cursor: playable ? 'pointer' : 'default',
        color: playable ? '#e0e0e0' : '#4b5563',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.15s',
        transform: selected ? 'translateY(-12px) scale(1.05)' : 'none',
        flexShrink: 0,
        opacity: playable ? 1 : 0.6,
        position: 'relative',
      }}
    >
      {/* Cost orb */}
      <div style={{
        position: 'absolute',
        top: 3,
        left: 3,
        width: 20,
        height: 20,
        background: COLORS.energy,
        color: '#0f0f23',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: "'Press Start 2P', monospace",
        border: '2px solid #000',
        zIndex: 2,
      }}>
        {cost}
      </div>

      {/* Card art area */}
      <div style={{
        height: small ? 32 : 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `2px solid ${catColor}44`,
        background: `linear-gradient(180deg, ${catColor}15 0%, transparent 100%)`,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {artSrc && (
          <img
            src={artSrc}
            alt={def.category}
            style={{
              width: small ? 32 : 40,
              height: small ? 32 : 40,
              imageRendering: 'pixelated',
              mixBlendMode: 'screen',
              opacity: 0.9,
            }}
          />
        )}
      </div>

      {/* Type tag */}
      <div style={{
        padding: '2px 0',
        fontSize: 6,
        fontFamily: "'Press Start 2P', monospace",
        textAlign: 'center',
        color: def.category === 'curse' ? '#ef4444' : def.keywords?.includes('power') ? '#4ade80' : def.target === 'self' ? '#60a5fa' : def.target === 'allEnemies' ? '#f472b6' : def.target === 'none' ? '#fbbf24' : '#ef4444',
        letterSpacing: 1,
        textTransform: 'uppercase',
        textShadow: PX_OUTLINE_SM,
      }}>
        {def.category === 'curse' ? 'CURSE' : def.keywords?.includes('power') ? 'POWER' : def.target === 'self' ? 'FIREWALL' : def.target === 'allEnemies' ? 'AOE' : def.target === 'none' ? 'UTILITY' : 'ATTACK'}
      </div>

      {/* Name */}
      <div style={{
        padding: '1px 4px 2px',
        fontSize: small ? 7 : nameFont,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        textAlign: 'center',
        color: card.upgraded ? COLORS.rarity.rare : '#e0e0e0',
        textShadow: PX_OUTLINE_SM,
        overflow: 'hidden',
        lineHeight: 1.2,
        letterSpacing: 0,
      }}>
        {name}
      </div>

      {/* Description */}
      <div style={{
        flex: 1,
        padding: '1px 4px 3px',
        fontSize: wide ? 9 : small ? 7 : 7,
        fontFamily: 'monospace',
        color: '#9ca3af',
        lineHeight: 1.2,
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {desc}
      </div>

      {/* Keywords */}
      {def.keywords && def.keywords.length > 0 && (
        <div style={{ padding: '0 6px 3px', display: 'flex', gap: 3, justifyContent: 'center' }}>
          {def.keywords.filter((k) => k !== 'autoplay').map((kw) => (
            <span
              key={kw}
              style={{
                fontSize: 8,
                fontFamily: "'Press Start 2P', monospace",
                padding: '2px 5px',
                background: `${catColor}22`,
                border: `1px solid ${catColor}44`,
                color: catColor,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Rarity bar */}
      <div style={{ height: 3, background: rarityColor, opacity: 0.7 }} />

      {/* Hover tooltip with expanded details */}
      {showTooltip && !small && (
        <div style={{
          position: 'absolute',
          bottom: '105%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 14px',
          background: 'rgba(12, 8, 24, 0.97)',
          border: `2px solid ${catColor}`,
          boxShadow: `0 0 16px rgba(0,0,0,0.8), 0 0 8px ${catColor}33`,
          fontFamily: "'Press Start 2P', monospace",
          minWidth: 200,
          maxWidth: 280,
          zIndex: 100,
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 7, color: catColor, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
            {CATEGORY_DESCRIPTIONS[def.category] || def.category}
          </div>
          <div style={{ fontSize: 9, color: '#e0d8c8', marginBottom: 4, lineHeight: 1.5 }}>
            {desc}
          </div>
          <div style={{ fontSize: 7, color: '#8a7a66', marginBottom: 4 }}>
            Cost: {cost} energy | Rarity: {def.rarity} | Target: {def.target === 'singleEnemy' ? 'Single enemy' : def.target === 'allEnemies' ? 'All enemies' : def.target === 'self' ? 'Self' : 'None'}
          </div>
          {def.keywords && def.keywords.length > 0 && (
            <div style={{ borderTop: '1px solid #3d2d5c', paddingTop: 4, marginTop: 4 }}>
              {def.keywords.filter((k) => k !== 'autoplay').map((kw) => (
                <div key={kw} style={{ fontSize: 7, color: '#9ca3af', lineHeight: 1.6 }}>
                  {KEYWORD_DESCRIPTIONS[kw] || kw.toUpperCase()}
                </div>
              ))}
            </div>
          )}
          {/* Inline term explanations from card description */}
          {desc.toLowerCase().includes('firewall') && (
            <div style={{ fontSize: 7, color: '#60a5fa', lineHeight: 1.6, marginTop: 4 }}>
              FIREWALL — Absorbs incoming damage before HP. Resets each turn.
            </div>
          )}
          {desc.toLowerCase().includes('hallucination') && (
            <div style={{ fontSize: 7, color: '#ef4444', lineHeight: 1.6, marginTop: 4 }}>
              HALLUCINATION — Curse cards shuffled into your deck that clog your hand.
            </div>
          )}
          {card.upgraded && (
            <div style={{ fontSize: 7, color: '#fbbf24', marginTop: 4 }}>
              UPGRADED
            </div>
          )}
        </div>
      )}
    </div>
  );
}
