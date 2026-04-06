import { useState } from 'react';
import { useRunStore } from '../../stores/runStore';
import { useMetaStore } from '../../stores/metaStore';
import { KNOWLEDGE_ENTRIES, type KnowledgeEntry } from '../../game/data/knowledgeEntries';
import { SCENARIOS } from '../../game/data/scenarios';

const PIXEL = "'Press Start 2P', monospace";

const PX_OUTLINE = [
  '-2px -2px 0 #000', ' 2px -2px 0 #000',
  '-2px  2px 0 #000', ' 2px  2px 0 #000',
  ' 0   -2px 0 #000', ' 0    2px 0 #000',
  '-2px  0   0 #000', ' 2px  0   0 #000',
].join(', ');

const CATEGORY_LABELS: Record<KnowledgeEntry['category'], string> = {
  basics: 'Act 1 — The Basics',
  integration: 'Act 2 — Integration',
  advanced: 'Act 3 — Advanced',
};

const CATEGORY_COLORS: Record<KnowledgeEntry['category'], string> = {
  basics: '#4ade80',
  integration: '#60a5fa',
  advanced: '#c084fc',
};

export function KnowledgeBaseScreen() {
  const setScreen = useRunStore((s) => s.setScreen);
  const knowledgeUnlocked = useMetaStore((s) => s.knowledgeUnlocked);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);

  const unlockedCount = KNOWLEDGE_ENTRIES.filter((e) =>
    knowledgeUnlocked.includes(e.id),
  ).length;

  const categories: KnowledgeEntry['category'][] = ['basics', 'integration', 'advanced'];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0c0a14',
      fontFamily: 'monospace', color: '#e0e0e0',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid #1a1130',
      }}>
        <div>
          <h1 style={{
            fontFamily: PIXEL, fontSize: 16, color: '#f0e6d3',
            textShadow: PX_OUTLINE, margin: 0, letterSpacing: 2,
          }}>
            Knowledge Base
          </h1>
          <p style={{
            fontFamily: PIXEL, fontSize: 8, color: '#6b4fa0',
            textShadow: PX_OUTLINE, marginTop: 6, letterSpacing: 1,
          }}>
            {unlockedCount}/{KNOWLEDGE_ENTRIES.length} concepts unlocked
          </p>
        </div>
        <button
          onClick={() => setScreen('title')}
          style={{
            fontFamily: PIXEL, fontSize: 9, padding: '8px 16px',
            background: 'rgba(12, 8, 24, 0.85)',
            border: '2px solid #6b4fa0',
            boxShadow: 'inset 0 0 0 1px #1a1130, inset 0 0 0 2px #3d2d5c',
            color: '#c4b89a', cursor: 'pointer', letterSpacing: 1,
            textShadow: PX_OUTLINE,
          }}
        >
          Back
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '12px 24px 4px' }}>
        <div style={{
          width: '100%', height: 6, background: '#1a1130',
          border: '1px solid #3d2d5c', borderRadius: 1,
        }}>
          <div style={{
            width: `${(unlockedCount / KNOWLEDGE_ENTRIES.length) * 100}%`,
            height: '100%', background: '#6b4fa0',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '8px 24px 24px',
      }}>
        {categories.map((cat) => {
          const entries = KNOWLEDGE_ENTRIES.filter((e) => e.category === cat);
          return (
            <div key={cat} style={{ marginBottom: 24 }}>
              {/* Category header */}
              <div style={{
                fontFamily: PIXEL, fontSize: 10, color: CATEGORY_COLORS[cat],
                textShadow: PX_OUTLINE, letterSpacing: 2,
                marginBottom: 12, paddingBottom: 6,
                borderBottom: `1px solid ${CATEGORY_COLORS[cat]}33`,
              }}>
                {CATEGORY_LABELS[cat]}
              </div>

              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 10,
              }}>
                {entries.map((entry) => {
                  const unlocked = knowledgeUnlocked.includes(entry.id);
                  return (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      unlocked={unlocked}
                      categoryColor={CATEGORY_COLORS[cat]}
                      onClick={() => unlocked && setSelectedEntry(entry)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail overlay */}
      {selectedEntry && (
        <DetailOverlay
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}

function EntryCard({ entry, unlocked, categoryColor, onClick }: {
  entry: KnowledgeEntry;
  unlocked: boolean;
  categoryColor: string;
  onClick: () => void;
}) {
  const scenario = Object.values(SCENARIOS).find((s) => s.id === entry.scenarioId);
  const scenarioNumber = scenario?.number ?? '?';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px',
        background: unlocked ? 'rgba(12, 8, 24, 0.85)' : 'rgba(8, 5, 16, 0.6)',
        border: unlocked ? `2px solid ${categoryColor}55` : '2px solid #1a1130',
        boxShadow: unlocked
          ? `inset 0 0 0 1px #1a1130, 0 0 12px ${categoryColor}15`
          : 'none',
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        opacity: unlocked ? 1 : 0.5,
      }}
      onMouseEnter={(e) => {
        if (unlocked) {
          e.currentTarget.style.borderColor = categoryColor;
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px #1a1130, 0 0 20px ${categoryColor}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (unlocked) {
          e.currentTarget.style.borderColor = `${categoryColor}55`;
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px #1a1130, 0 0 12px ${categoryColor}15`;
        }
      }}
    >
      {/* Number badge */}
      <div style={{
        fontFamily: PIXEL, fontSize: 7, color: unlocked ? categoryColor : '#2a2040',
        textShadow: PX_OUTLINE, letterSpacing: 1, marginBottom: 6,
      }}>
        S{scenarioNumber}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: PIXEL, fontSize: 9,
        color: unlocked ? '#f0e6d3' : '#2a2040',
        textShadow: unlocked ? PX_OUTLINE : 'none',
        lineHeight: 1.5, marginBottom: 6,
      }}>
        {unlocked ? entry.title : '???'}
      </div>

      {/* Description */}
      <div style={{
        fontFamily: 'monospace', fontSize: 11,
        color: unlocked ? '#8a8a9a' : '#1a1530',
        lineHeight: 1.5,
      }}>
        {unlocked ? entry.shortDescription : `Complete scenario ${scenarioNumber} to unlock`}
      </div>
    </div>
  );
}

function DetailOverlay({ entry, onClose }: {
  entry: KnowledgeEntry;
  onClose: () => void;
}) {
  const categoryColor = CATEGORY_COLORS[entry.category];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560, width: '90%', maxHeight: 480,
          overflow: 'auto', padding: '32px 40px',
          background: 'rgba(12, 8, 24, 0.95)',
          border: `3px solid ${categoryColor}`,
          boxShadow: `inset 0 0 0 2px #1a1130, inset 0 0 0 4px #3d2d5c, 0 0 40px ${categoryColor}30`,
        }}
      >
        {/* Category tag */}
        <div style={{
          fontFamily: PIXEL, fontSize: 7, color: categoryColor,
          textTransform: 'uppercase', letterSpacing: 3, marginBottom: 10,
        }}>
          {CATEGORY_LABELS[entry.category]}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: PIXEL, fontSize: 14, color: '#f0e6d3',
          textShadow: PX_OUTLINE, margin: '0 0 16px', lineHeight: 1.6,
        }}>
          {entry.title}
        </h2>

        {/* Full description */}
        <p style={{
          fontFamily: 'monospace', fontSize: 13, color: '#b0b0c0',
          lineHeight: 1.8, marginBottom: 20,
        }}>
          {entry.fullDescription}
        </p>

        {/* Real-world example */}
        <div style={{
          background: 'rgba(107, 79, 160, 0.1)',
          border: '1px solid #3d2d5c',
          padding: '14px 16px', marginBottom: 24,
        }}>
          <div style={{
            fontFamily: PIXEL, fontSize: 7, color: '#6b4fa0',
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8,
          }}>
            Real-World Example
          </div>
          <p style={{
            fontFamily: 'monospace', fontSize: 12, color: '#9ca3af',
            lineHeight: 1.7, margin: 0,
          }}>
            {entry.realWorldExample}
          </p>
        </div>

        {/* Close button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: PIXEL, fontSize: 10, padding: '10px 28px',
              background: 'rgba(12, 8, 24, 0.85)',
              border: `2px solid ${categoryColor}`,
              boxShadow: 'inset 0 0 0 1px #1a1130, inset 0 0 0 2px #3d2d5c',
              color: '#c4b89a', cursor: 'pointer', letterSpacing: 2,
              textShadow: PX_OUTLINE,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
