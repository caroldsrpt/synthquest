import type { CardInstance } from '../../game/data/types';
import { CARDS } from '../../game/data/cards';
import { getCardCost, getCardName, getCardDescription } from '../../utils/cardUtils';
import { COLORS } from '../../utils/constants';

interface CardComponentProps {
  card: CardInstance;
  index: number;
  selected: boolean;
  playable: boolean;
  onClick: (index: number) => void;
  small?: boolean;
}

export function CardComponent({ card, index, selected, playable, onClick, small }: CardComponentProps) {
  const def = CARDS[card.defId];
  if (!def) return null;

  const cost = getCardCost(card);
  const name = getCardName(card);
  const desc = getCardDescription(card);
  const catColor = COLORS.categories[def.category] || '#888';
  const rarityColor = COLORS.rarity[def.rarity] || '#fff';
  const w = small ? 120 : 150;
  const h = small ? 170 : 210;

  return (
    <div
      onClick={() => playable && onClick(index)}
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        border: `2px solid ${selected ? '#fff' : playable ? catColor : '#374151'}`,
        background: selected
          ? `linear-gradient(180deg, ${catColor}33 0%, ${catColor}11 100%)`
          : playable
          ? `linear-gradient(180deg, #1a1a3e 0%, #0f0f23 100%)`
          : '#0a0a15',
        cursor: playable ? 'pointer' : 'default',
        fontFamily: 'monospace',
        color: playable ? '#e0e0e0' : '#4b5563',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.15s',
        transform: selected ? 'translateY(-12px) scale(1.05)' : 'none',
        boxShadow: selected ? `0 8px 24px ${catColor}44` : 'none',
        flexShrink: 0,
        opacity: playable ? 1 : 0.6,
        position: 'relative',
      }}
    >
      {/* Cost orb */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: COLORS.energy,
          color: '#0f0f23',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 'bold',
        }}
      >
        {cost}
      </div>

      {/* Category badge */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          fontSize: 9,
          padding: '2px 6px',
          borderRadius: 3,
          background: `${catColor}33`,
          color: catColor,
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }}
      >
        {def.category}
      </div>

      {/* Card icon area */}
      <div
        style={{
          height: small ? 50 : 65,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${catColor}33`,
          fontSize: small ? 20 : 28,
        }}
      >
        {getCategoryIcon(def.category)}
      </div>

      {/* Name */}
      <div
        style={{
          padding: '6px 8px 2px',
          fontSize: small ? 11 : 12,
          fontWeight: 'bold',
          textAlign: 'center',
          color: card.upgraded ? COLORS.rarity.rare : '#e0e0e0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </div>

      {/* Description */}
      <div
        style={{
          flex: 1,
          padding: '2px 8px 6px',
          fontSize: small ? 9 : 10,
          color: '#9ca3af',
          lineHeight: 1.4,
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {desc}
      </div>

      {/* Keywords */}
      {def.keywords && def.keywords.length > 0 && (
        <div style={{ padding: '0 8px 4px', display: 'flex', gap: 4, justifyContent: 'center' }}>
          {def.keywords.filter((k) => k !== 'autoplay').map((kw) => (
            <span
              key={kw}
              style={{
                fontSize: 8,
                padding: '1px 4px',
                borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                color: '#6b7280',
                textTransform: 'uppercase',
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Rarity indicator */}
      <div style={{ height: 2, background: rarityColor, opacity: 0.6 }} />
    </div>
  );
}

function getCategoryIcon(cat: string): string {
  switch (cat) {
    case 'text': return '\u270E'; // pencil
    case 'structure': return '\u26E8'; // shield
    case 'logic': return '\u2699'; // gear
    case 'vision': return '\u25C9'; // eye
    case 'noise': return '\u2604'; // comet
    default: return '\u2726';
  }
}
