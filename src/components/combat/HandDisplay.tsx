import { useState } from 'react';
import type { CardInstance } from '../../game/data/types';
import { CardComponent } from './CardComponent';
import { getCardCost } from '../../utils/cardUtils';
import { VIEWPORT_WIDTH, CARD_W, CARD_H, CARD_VISIBLE_H, CARD_FAN_OVERLAP, CARD_HOVER_LIFT, COMBAT_HAND_H } from '../../utils/constants';

interface HandDisplayProps {
  hand: CardInstance[];
  energy: number;
  selectedIndex: number | null;
  onSelectCard: (index: number) => void;
}

export function HandDisplay({ hand, energy, selectedIndex, onSelectCard }: HandDisplayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (hand.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: 12 }}>
          No cards in hand
        </div>
      </div>
    );
  }

  const cardCount = hand.length;
  // Calculate fan layout
  const maxFanWidth = VIEWPORT_WIDTH - 140; // leave room for END TURN button
  const naturalWidth = cardCount * (CARD_W - CARD_FAN_OVERLAP) + CARD_FAN_OVERLAP;
  const totalFanWidth = Math.min(maxFanWidth, naturalWidth);
  const spacing = cardCount > 1
    ? (totalFanWidth - CARD_W) / (cardCount - 1)
    : 0;
  const startX = (VIEWPORT_WIDTH - totalFanWidth) / 2;

  // Card base Y: positioned so only CARD_VISIBLE_H shows above the bottom clip
  const baseY = COMBAT_HAND_H - CARD_VISIBLE_H;

  // Rotation: ±3° per card from center, max ±12°
  const maxAngle = Math.min(12, cardCount * 1.5);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
    }}>
      {hand.map((card, i) => {
        const cost = getCardCost(card);
        const playable = cost <= energy;
        const isHovered = hoveredIndex === i;
        const isSelected = selectedIndex === i;

        const left = startX + i * spacing;

        // Rotation based on position in fan
        const centerOffset = cardCount > 1 ? (i / (cardCount - 1)) * 2 - 1 : 0; // -1 to 1
        const rotation = centerOffset * maxAngle;

        // Slight vertical arc (center cards slightly higher)
        const arcOffset = Math.abs(centerOffset) * 8;

        const restY = baseY + arcOffset;
        let translateY = 0;
        let scale = 1;
        let rot = rotation;
        let zIndex = i + 1;

        if (isHovered) {
          translateY = -(CARD_HOVER_LIFT + arcOffset);
          scale = 1.12;
          rot = 0;
          zIndex = 50;
        } else if (isSelected) {
          translateY = -(40 + arcOffset);
          scale = 1.05;
          rot = 0;
          zIndex = 40;
        }

        return (
          <div
            key={card.id}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              position: 'absolute',
              left,
              top: restY,
              zIndex,
              transform: `translateY(${translateY}px) rotate(${rot}deg) scale(${scale})`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.15s ease-out',
              willChange: 'transform',
              filter: isHovered ? `drop-shadow(0 0 12px rgba(168,130,255,0.6))` : 'none',
            }}
          >
            <CardComponent
              card={card}
              index={i}
              selected={isSelected}
              playable={playable}
              onClick={onSelectCard}
            />
          </div>
        );
      })}
    </div>
  );
}
