import { useRunStore } from '../../stores/runStore';

// Simple box-and-wire diagram that grows as scenarios are completed
// Each scenario adds a new visual element

interface DiagramBox {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  icon?: string;
  badge?: string;
}

interface DiagramWire {
  from: string;
  to: string;
  dashed?: boolean;
  label?: string;
}

export function ShopDiagram({ compact }: { compact?: boolean }) {
  const completed = useRunStore((s) => s.completedScenarios);
  const has = (id: string) => completed.includes(id);

  const height = compact ? 80 : 120;
  const boxes: DiagramBox[] = [];
  const wires: DiagramWire[] = [];

  // Always show AI Box after S1
  if (has('s1_textGeneration')) {
    boxes.push({ id: 'ai', label: has('s13_agent') ? 'AI Agent' : 'AI Assistant', x: 300, y: height / 2, w: 100, h: 36, color: '#7b68ee', icon: has('s2_temperature') ? '\u{1F321}' : undefined, badge: has('s3_hallucination') && !has('s4_grounding') ? '\u26A0\uFE0F' : has('s4_grounding') ? '\u2705' : undefined });
  }

  // Database after S4
  if (has('s4_grounding')) {
    boxes.push({ id: 'db', label: 'Database', x: 500, y: height / 2, w: 80, h: 36, color: '#60a5fa' });
    wires.push({ from: 'ai', to: 'db' });
  }

  // Search funnel after S7 (RAG)
  if (has('s7_rag')) {
    boxes.push({ id: 'search', label: 'Search', x: 410, y: height / 2, w: 60, h: 28, color: '#34d399' });
    // Rewire: ai → search → db
    wires.length = 0;
    wires.push({ from: 'ai', to: 'search' }, { from: 'search', to: 'db' });
  }

  // Prompt panel after S5
  if (has('s5_promptEng')) {
    boxes.push({ id: 'prompt', label: 'Prompt', x: 300, y: 10, w: 70, h: 24, color: '#a78bfa' });
    wires.push({ from: 'prompt', to: 'ai', dashed: true });
  }

  // Context meter after S6
  if (has('s6_contextWindow')) {
    boxes.push({ id: 'ctx', label: 'Context', x: 210, y: height / 2, w: 60, h: 24, color: '#fbbf24' });
    wires.push({ from: 'ctx', to: 'ai', dashed: true });
  }

  // API / Order System after S8
  if (has('s8_api')) {
    boxes.push({ id: 'orders', label: 'Orders API', x: 500, y: height - 20, w: 80, h: 28, color: '#f472b6' });
    wires.push({ from: 'ai', to: 'orders' });
  }

  // Orchestrator after S16
  if (has('s16_orchestration')) {
    boxes.push({ id: 'orch', label: 'Orchestrator', x: 120, y: 10, w: 90, h: 28, color: '#ef4444' });
    wires.push({ from: 'orch', to: 'ai' });
  }

  const boxMap = Object.fromEntries(boxes.map((b) => [b.id, b]));

  return (
    <div style={{
      width: '100%', height, background: '#080812', borderBottom: '1px solid #1e2030',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 4, left: 8, fontSize: 9, color: '#374151', fontFamily: 'monospace' }}>
        Byte's Bakery AI System
      </div>

      <svg width="100%" height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Wires */}
        {wires.map((w, i) => {
          const from = boxMap[w.from];
          const to = boxMap[w.to];
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x + from.w / 2} y1={from.y}
              x2={to.x - to.w / 2 + (to.x > from.x ? 0 : to.w)} y2={to.y}
              stroke={w.dashed ? '#374151' : '#4b5563'}
              strokeWidth={1.5}
              strokeDasharray={w.dashed ? '4 3' : ''}
            />
          );
        })}
      </svg>

      {/* Boxes */}
      {boxes.map((box) => (
        <div
          key={box.id}
          style={{
            position: 'absolute',
            left: box.x - box.w / 2,
            top: box.y - box.h / 2,
            width: box.w,
            height: box.h,
            borderRadius: 6,
            border: `1.5px solid ${box.color}66`,
            background: `${box.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            fontSize: compact ? 9 : 10,
            color: box.color,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          {box.icon && <span style={{ fontSize: 12 }}>{box.icon}</span>}
          {box.label}
          {box.badge && <span style={{ fontSize: 10 }}>{box.badge}</span>}
        </div>
      ))}

      {/* Empty state */}
      {boxes.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#1e2030', fontSize: 12, fontFamily: 'monospace' }}>
          Byte's Bakery needs an AI assistant. Let's build one.
        </div>
      )}
    </div>
  );
}
