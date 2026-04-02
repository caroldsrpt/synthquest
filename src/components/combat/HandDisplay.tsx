import type { CardInstance } from '../../game/data/types';
import { CardComponent } from './CardComponent';
import { getCardCost } from '../../utils/cardUtils';

interface HandDisplayProps {
  hand: CardInstance[];
  energy: number;
  selectedIndex: number | null;
  onSelectCard: (index: number) => void;
}

export function HandDisplay({ hand, energy, selectedIndex, onSelectCard }: HandDisplayProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: '0 16px',
        minHeight: 220,
        overflowX: 'auto',
      }}
    >
      {hand.map((card, i) => {
        const cost = getCardCost(card);
        const playable = cost <= energy;
        return (
          <CardComponent
            key={card.id}
            card={card}
            index={i}
            selected={selectedIndex === i}
            playable={playable}
            onClick={onSelectCard}
          />
        );
      })}
      {hand.length === 0 && (
        <div style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: 14, padding: 20 }}>
          No cards in hand
        </div>
      )}
    </div>
  );
}
