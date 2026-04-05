import { useState } from 'react';
import { CardComponent } from '../combat/CardComponent';
import type { CardInstance, CardCategory } from '@/game/data/types';
import { CARDS } from '@/game/data/cards';

const PIXEL = "'Press Start 2P', monospace";

const CATEGORIES: { value: CardCategory | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '#c4b89a' },
  { value: 'text', label: 'Text', color: '#4ade80' },
  { value: 'structure', label: 'Structure', color: '#60a5fa' },
  { value: 'logic', label: 'Logic', color: '#fbbf24' },
  { value: 'vision', label: 'Vision', color: '#a78bfa' },
  { value: 'noise', label: 'Noise', color: '#ef4444' },
  { value: 'curse', label: 'Curse', color: '#6b7280' },
];

export function DeckViewerOverlay({
  cards,
  title,
  onClose,
}: {
  cards: CardInstance[];
  title: string;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<CardCategory | 'all'>('all');

  const filtered = filter === 'all'
    ? cards
    : cards.filter((c) => CARDS[c.defId]?.category === filter);

  // Sort: by category then by cost
  const sorted = [...filtered].sort((a, b) => {
    const aDef = CARDS[a.defId];
    const bDef = CARDS[b.defId];
    if (!aDef || !bDef) return 0;
    if (aDef.category !== bDef.category) return aDef.category.localeCompare(bDef.category);
    return aDef.cost - bDef.cost;
  });

  // Count per category for filter labels
  const counts: Record<string, number> = { all: cards.length };
  for (const c of cards) {
    const cat = CARDS[c.defId]?.category;
    if (cat) counts[cat] = (counts[cat] || 0) + 1;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: PIXEL,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '3px solid #6b4fa0',
        background: 'rgba(12, 8, 24, 0.95)',
      }}>
        <div style={{
          fontSize: 14,
          color: '#c4b89a',
          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
          letterSpacing: 2,
        }}>
          {title} ({sorted.length})
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '2px solid #6b4fa0',
            color: '#c4b89a',
            fontFamily: PIXEL,
            fontSize: 10,
            padding: '6px 14px',
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          CLOSE
        </button>
      </div>

      {/* Category filters */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 24px',
        flexWrap: 'wrap',
        background: 'rgba(12, 8, 24, 0.8)',
      }}>
        {CATEGORIES.map((cat) => {
          const count = counts[cat.value] || 0;
          if (cat.value !== 'all' && count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              style={{
                padding: '5px 12px',
                fontFamily: PIXEL,
                fontSize: 7,
                letterSpacing: 1,
                border: filter === cat.value ? `2px solid ${cat.color}` : '2px solid #3d2d5c',
                background: filter === cat.value ? 'rgba(107,79,160,0.3)' : 'transparent',
                color: cat.color,
                cursor: 'pointer',
              }}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignContent: 'flex-start',
        justifyContent: 'center',
      }}>
        {sorted.length === 0 && (
          <div style={{ color: '#6b7280', fontSize: 10, padding: 40, letterSpacing: 1 }}>
            No cards
          </div>
        )}
        {sorted.map((card, i) => (
          <div key={card.id} style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
            <CardComponent
              card={card}
              index={i}
              selected={false}
              playable={true}
              onClick={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
