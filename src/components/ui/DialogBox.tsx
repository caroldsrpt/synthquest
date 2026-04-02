import { useEffect, useRef } from 'react';
import { useDialogStore } from '../../stores/dialogStore';
import { VIEWPORT_WIDTH } from '../../utils/constants';

const TYPING_SPEED = 30; // ms per character

export function DialogBox() {
  const active = useDialogStore((s) => s.active);
  const lines = useDialogStore((s) => s.lines);
  const currentLine = useDialogStore((s) => s.currentLine);
  const displayedText = useDialogStore((s) => s.displayedText);
  const isTyping = useDialogStore((s) => s.isTyping);
  const advanceLine = useDialogStore((s) => s.advanceLine);
  const setDisplayedText = useDialogStore((s) => s.setDisplayedText);
  const setIsTyping = useDialogStore((s) => s.setIsTyping);

  const timerRef = useRef<number>(0);
  const charIndex = useRef(0);

  // Typewriter effect
  useEffect(() => {
    if (!active || !isTyping) return;

    const fullText = lines[currentLine]?.text || '';
    charIndex.current = 0;

    const tick = () => {
      charIndex.current++;
      if (charIndex.current >= fullText.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        return;
      }
      setDisplayedText(fullText.slice(0, charIndex.current));
      timerRef.current = window.setTimeout(tick, TYPING_SPEED);
    };

    timerRef.current = window.setTimeout(tick, TYPING_SPEED);
    return () => clearTimeout(timerRef.current);
  }, [active, isTyping, currentLine, lines, setDisplayedText, setIsTyping]);

  // Key handler
  useEffect(() => {
    if (!active) return;

    const onKey = (e: KeyboardEvent) => {
      if (['z', 'Z', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        advanceLine();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, advanceLine]);

  if (!active) return null;

  const speaker = lines[currentLine]?.speaker;
  const isLastLine = currentLine >= lines.length - 1 && !isTyping;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: VIEWPORT_WIDTH,
        padding: 0,
        pointerEvents: 'auto',
      }}
      onClick={advanceLine}
    >
      <div
        style={{
          background: 'rgba(15, 15, 35, 0.95)',
          border: '2px solid #7b68ee',
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          padding: '16px 20px',
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {speaker && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#7b68ee',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {speaker}
          </div>
        )}
        <div
          style={{
            fontSize: 15,
            color: '#e0e0e0',
            fontFamily: 'monospace',
            lineHeight: 1.5,
            minHeight: 44,
          }}
        >
          {displayedText}
          {isTyping && (
            <span style={{ opacity: 0.5, animation: 'blink 0.5s infinite' }}>|</span>
          )}
        </div>
        <div
          style={{
            textAlign: 'right',
            fontSize: 11,
            color: '#6b7280',
            fontFamily: 'monospace',
          }}
        >
          {isTyping ? '' : isLastLine ? '[Z] Close' : '[Z] Next \u25B6'}
        </div>
      </div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
