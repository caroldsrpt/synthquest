import { create } from 'zustand';
import type { DialogLine } from '../game/data/types';

interface DialogStore {
  active: boolean;
  lines: DialogLine[];
  currentLine: number;
  displayedText: string;
  isTyping: boolean;
  onComplete?: () => void;

  // Shop state
  shopItems: { itemId: string; price: number }[] | null;

  startDialog: (lines: DialogLine[], onComplete?: () => void) => void;
  advanceLine: () => void;
  setDisplayedText: (text: string) => void;
  setIsTyping: (typing: boolean) => void;
  closeDialog: () => void;
  openShop: (items: { itemId: string; price: number }[]) => void;
  closeShop: () => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  active: false,
  lines: [],
  currentLine: 0,
  displayedText: '',
  isTyping: false,
  onComplete: undefined,
  shopItems: null,

  startDialog: (lines, onComplete) => {
    if (lines.length === 0) return;
    set({
      active: true,
      lines,
      currentLine: 0,
      displayedText: '',
      isTyping: true,
      onComplete,
    });
  },

  advanceLine: () => {
    const { lines, currentLine, isTyping, onComplete } = get();

    if (isTyping) {
      // Skip typing animation — show full text
      set({ displayedText: lines[currentLine].text, isTyping: false });
      return;
    }

    const nextLine = currentLine + 1;
    if (nextLine >= lines.length) {
      // Dialog complete
      set({ active: false, lines: [], currentLine: 0, displayedText: '' });
      onComplete?.();
    } else {
      set({ currentLine: nextLine, displayedText: '', isTyping: true });
    }
  },

  setDisplayedText: (text) => set({ displayedText: text }),
  setIsTyping: (typing) => set({ isTyping: typing }),

  closeDialog: () =>
    set({ active: false, lines: [], currentLine: 0, displayedText: '', onComplete: undefined }),

  openShop: (items) => set({ shopItems: items }),
  closeShop: () => set({ shopItems: null }),
}));
