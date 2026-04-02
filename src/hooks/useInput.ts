import { useEffect, useRef } from 'react';
import type { Direction } from '../game/data/types';

export interface InputState {
  direction: Direction | null;
  action: boolean; // Z / Enter / Space
  cancel: boolean; // X / Escape
  menu: boolean; // M / Escape (when not in dialog)
}

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};

const ACTION_KEYS = new Set(['z', 'Z', 'Enter', ' ']);
const CANCEL_KEYS = new Set(['x', 'X', 'Escape']);

export function useInput() {
  const keysDown = useRef(new Set<string>());
  const inputState = useRef<InputState>({
    direction: null,
    action: false,
    cancel: false,
    menu: false,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysDown.current.add(e.key);

      if (ACTION_KEYS.has(e.key)) {
        inputState.current.action = true;
      }
      if (CANCEL_KEYS.has(e.key)) {
        inputState.current.cancel = true;
      }
      if (e.key === 'm' || e.key === 'M') {
        inputState.current.menu = true;
      }

      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Call this each frame to get current direction held
  const getDirection = (): Direction | null => {
    for (const key of keysDown.current) {
      if (KEY_MAP[key]) return KEY_MAP[key];
    }
    return null;
  };

  // Call to consume one-shot inputs (action, cancel, menu)
  const consumeInput = (): InputState => {
    const state = {
      direction: getDirection(),
      action: inputState.current.action,
      cancel: inputState.current.cancel,
      menu: inputState.current.menu,
    };
    // Reset one-shot flags
    inputState.current.action = false;
    inputState.current.cancel = false;
    inputState.current.menu = false;
    return state;
  };

  return { getDirection, consumeInput };
}
