import { useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { getCardPool, CARDS } from '../../game/data/cards';
import { createCardInstance } from '../../utils/cardUtils';
import { CardComponent } from '../combat/CardComponent';
import {
  SHOP_PRICE_COMMON,
  SHOP_PRICE_UNCOMMON,
  SHOP_PRICE_RARE,
  SHOP_CARD_REMOVAL_BASE,
  SHOP_CARD_REMOVAL_INCREMENT,
} from '../../utils/constants';
import type { CardDef, CardInstance } from '../../game/data/types';

const PIXEL_FONT = "'Press Start 2P', monospace";
const PANEL_BORDER = '3px solid #6b4fa0';
const PANEL_SHADOW = 'inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c';
const GOLD_COLOR = '#fbbf24';

function getShopPrice(rarity: string): number {
  switch (rarity) {
    case 'common': return SHOP_PRICE_COMMON;
    case 'uncommon': return SHOP_PRICE_UNCOMMON;
    case 'rare': return SHOP_PRICE_RARE;
    default: return SHOP_PRICE_COMMON;
  }
}

interface ShopItem {
  def: CardDef;
  instance: CardInstance;
  price: number;
  sold: boolean;
}

function generateShopItems(act: 1 | 2 | 3): ShopItem[] {
  const pool = getCardPool(act).filter((c) => c.rarity !== 'curse');
  const items: ShopItem[] = [];
  const usedIds = new Set<string>();

  // Target: 2 common, 2 uncommon, 1 rare (if possible), fill rest randomly
  const targets: Array<{ rarity: string; count: number }> = [
    { rarity: 'common', count: 2 },
    { rarity: 'uncommon', count: 2 },
    { rarity: 'rare', count: 1 },
  ];

  for (const target of targets) {
    const candidates = pool.filter(
      (c) => c.rarity === target.rarity && !usedIds.has(c.id)
    );
    for (let i = 0; i < target.count && candidates.length > 0; i++) {
      const idx = Math.floor(Math.random() * candidates.length);
      const card = candidates.splice(idx, 1)[0];
      usedIds.add(card.id);
      items.push({
        def: card,
        instance: createCardInstance(card.id),
        price: getShopPrice(card.rarity),
        sold: false,
      });
    }
  }

  // If we have fewer than 5, fill with any remaining
  while (items.length < 5) {
    const remaining = pool.filter((c) => !usedIds.has(c.id));
    if (remaining.length === 0) break;
    const card = remaining[Math.floor(Math.random() * remaining.length)];
    usedIds.add(card.id);
    items.push({
      def: card,
      instance: createCardInstance(card.id),
      price: getShopPrice(card.rarity),
      sold: false,
    });
  }

  return items;
}

export function ShopScreen() {
  const run = useRunStore();
  const gold = useRunStore((s) => s.gold);
  const deck = useRunStore((s) => s.deck);
  const act = useRunStore((s) => s.act);
  const cardRemovalCount = useRunStore((s) => s.cardRemovalCount);

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => generateShopItems(act));
  const [mode, setMode] = useState<'buy' | 'remove'>('buy');
  const [message, setMessage] = useState<string | null>(null);

  const removalPrice = SHOP_CARD_REMOVAL_BASE + cardRemovalCount * SHOP_CARD_REMOVAL_INCREMENT;

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 1500);
  };

  const handleBuyCard = (index: number) => {
    const item = shopItems[index];
    if (!item || item.sold) return;
    if (gold < item.price) {
      showMessage('Not enough gold!');
      return;
    }
    run.spendGold(item.price);
    run.addCardToDeck(createCardInstance(item.def.id));
    setShopItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, sold: true } : it))
    );
    showMessage(`Bought ${item.def.name}!`);
  };

  const handleRemoveCard = (cardId: string) => {
    if (gold < removalPrice) {
      showMessage('Not enough gold!');
      return;
    }
    const card = deck.find((c) => c.id === cardId);
    if (!card) return;
    const def = CARDS[card.defId];
    run.spendGold(removalPrice);
    run.removeCardFromDeck(cardId);
    showMessage(`Removed ${def?.name || 'card'}!`);
  };

  const allDeckForRemoval = deck;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#08060e',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: PIXEL_FONT,
      color: '#e0e0e0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(107,79,160,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(12, 8, 24, 0.95)',
        borderBottom: PANEL_BORDER,
        boxShadow: 'inset 0 -2px 0 #3d2d5c',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, color: '#c4b89a', letterSpacing: 2 }}>SHOP</span>
          <span style={{ fontSize: 10, color: '#6b7280' }}>Act {act}</span>
        </div>
        <div style={{
          fontSize: 14,
          color: GOLD_COLOR,
          textShadow: '0 0 8px rgba(251,191,36,0.3)',
          letterSpacing: 1,
        }}>
          {gold} G
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: 0,
        padding: '0 24px',
        background: 'rgba(12, 8, 24, 0.8)',
        borderBottom: '2px solid #2d2050',
        position: 'relative',
        zIndex: 2,
      }}>
        {(['buy', 'remove'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMode(tab)}
            style={{
              padding: '10px 24px',
              fontFamily: PIXEL_FONT,
              fontSize: 10,
              color: mode === tab ? GOLD_COLOR : '#6b7280',
              background: mode === tab ? 'rgba(251,191,36,0.08)' : 'transparent',
              border: 'none',
              borderBottom: mode === tab ? `2px solid ${GOLD_COLOR}` : '2px solid transparent',
              cursor: 'pointer',
              letterSpacing: 1,
              transition: 'all 0.15s',
            }}
          >
            {tab === 'buy' ? 'BUY CARDS' : `REMOVE CARD (${removalPrice}G)`}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px',
        position: 'relative',
        zIndex: 2,
      }}>
        {mode === 'buy' && (
          <div>
            <div style={{
              fontSize: 10,
              color: '#8a7a66',
              marginBottom: 20,
              letterSpacing: 1,
              textAlign: 'center',
            }}>
              Click a card to purchase
            </div>
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              {shopItems.map((item, index) => (
                <div
                  key={item.instance.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    opacity: item.sold ? 0.3 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <CardComponent
                    card={item.instance}
                    index={index}
                    selected={false}
                    playable={!item.sold && gold >= item.price}
                    onClick={() => handleBuyCard(index)}
                    small
                  />
                  <div style={{
                    fontSize: 10,
                    fontFamily: PIXEL_FONT,
                    color: item.sold
                      ? '#4b5563'
                      : gold >= item.price
                      ? GOLD_COLOR
                      : '#ef4444',
                    textShadow: item.sold ? 'none' : `0 0 6px ${gold >= item.price ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    letterSpacing: 1,
                  }}>
                    {item.sold ? 'SOLD' : `${item.price} G`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'remove' && (
          <div>
            <div style={{
              fontSize: 10,
              color: '#8a7a66',
              marginBottom: 8,
              letterSpacing: 1,
              textAlign: 'center',
            }}>
              Click a card to remove it from your deck
            </div>
            <div style={{
              fontSize: 9,
              color: gold >= removalPrice ? '#6b7280' : '#ef4444',
              marginBottom: 20,
              letterSpacing: 1,
              textAlign: 'center',
            }}>
              {gold >= removalPrice
                ? `Cost: ${removalPrice} G (increases by ${SHOP_CARD_REMOVAL_INCREMENT}G each removal)`
                : `Not enough gold! Need ${removalPrice} G`}
            </div>
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              {allDeckForRemoval.map((card, index) => {
                const def = CARDS[card.defId];
                if (!def) return null;
                return (
                  <div
                    key={card.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CardComponent
                      card={card}
                      index={index}
                      selected={false}
                      playable={gold >= removalPrice}
                      onClick={() => handleRemoveCard(card.id)}
                      small
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Message toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '14px 32px',
          background: 'rgba(12, 8, 24, 0.95)',
          border: PANEL_BORDER,
          boxShadow: `${PANEL_SHADOW}, 0 0 30px rgba(107,79,160,0.4)`,
          fontFamily: PIXEL_FONT,
          fontSize: 12,
          color: '#e0e0e0',
          textAlign: 'center',
          zIndex: 30,
          pointerEvents: 'none',
          letterSpacing: 1,
          lineHeight: 1.6,
          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        }}>
          {message}
        </div>
      )}

      {/* Leave Shop button */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(12, 8, 24, 0.9)',
        borderTop: '2px solid #2d2050',
      }}>
        <button
          onClick={() => run.setScreen('map')}
          style={{
            padding: '12px 36px',
            background: 'rgba(12, 8, 24, 0.85)',
            border: PANEL_BORDER,
            boxShadow: PANEL_SHADOW,
            color: '#c4b89a',
            fontFamily: PIXEL_FONT,
            fontSize: 11,
            cursor: 'pointer',
            letterSpacing: 2,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e0e0e0';
            e.currentTarget.style.boxShadow = `${PANEL_SHADOW}, 0 0 12px rgba(107,79,160,0.3)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#c4b89a';
            e.currentTarget.style.boxShadow = PANEL_SHADOW;
          }}
        >
          LEAVE SHOP
        </button>
      </div>
    </div>
  );
}
