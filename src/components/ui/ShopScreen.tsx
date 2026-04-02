import { useGameStore } from '../../stores/gameStore';
import { useDialogStore } from '../../stores/dialogStore';
import { ITEMS } from '../../game/data/items';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../utils/constants';

export function ShopScreen() {
  const shopItems = useDialogStore((s) => s.shopItems);
  const closeShop = useDialogStore((s) => s.closeShop);
  const money = useGameStore((s) => s.player.money);
  const addItem = useGameStore((s) => s.addItem);
  const addMoney = useGameStore((s) => s.addMoney);
  const inventory = useGameStore((s) => s.inventory);
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  if (!shopItems) return null;

  const handleBuy = (itemId: string, price: number) => {
    if (money < price) return;
    addMoney(-price);
    addItem(itemId);
  };

  const handleClose = () => {
    closeShop();
    setGamePhase('overworld');
  };

  return (
    <div
      style={{
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        border: '2px solid #333',
        borderRadius: 4,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#7b68ee', margin: 0 }}>SHOP</h2>
        <div style={{ fontSize: 14 }}>
          <span style={{ color: '#fbbf24' }}>{money}</span> Tokens
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {shopItems.map(({ itemId, price }) => {
          const item = ITEMS[itemId];
          if (!item) return null;
          const owned = inventory[itemId] || 0;
          const canAfford = money >= price;

          return (
            <div
              key={itemId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #2d2d5e',
                borderRadius: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{item.description}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#6b7280', minWidth: 40 }}>
                x{owned}
              </div>
              <button
                onClick={() => handleBuy(itemId, price)}
                disabled={!canAfford}
                style={{
                  padding: '6px 16px',
                  background: canAfford ? 'rgba(123, 104, 238, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${canAfford ? '#7b68ee' : '#374151'}`,
                  borderRadius: 6,
                  color: canAfford ? '#e0e0e0' : '#4b5563',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  cursor: canAfford ? 'pointer' : 'default',
                  fontSize: 12,
                  minWidth: 80,
                }}
              >
                {price} T
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleClose}
        style={{
          marginTop: 12,
          padding: '8px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #374151',
          borderRadius: 6,
          color: '#9ca3af',
          fontFamily: 'monospace',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        [X] Close Shop
      </button>
    </div>
  );
}
