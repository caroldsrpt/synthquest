/** Contextual speech bubble messages from Byte during combat.
 *  Each trigger fires once per run (tracked in runStore.teachingTriggersShown).
 */
export interface ByteSpeech {
  id: string;
  text: string;
  /** Condition to check before showing. Returns true if should show. */
  condition: (context: {
    turn: number;
    phase: string;
    handSize: number;
    energy: number;
    maxEnergy: number;
    integrity: number;
    maxIntegrity: number;
    firewall: number;
  }) => boolean;
}

export const BYTE_SPEECHES: ByteSpeech[] = [
  {
    id: 'first_hand',
    text: "Click a card to play it!",
    condition: ({ turn, phase }) => turn === 1 && phase === 'playerTurn',
  },
  {
    id: 'first_block',
    text: "Firewall blocks incoming damage. It resets each turn!",
    condition: ({ turn, firewall }) => turn <= 2 && firewall > 0,
  },
  {
    id: 'low_health',
    text: "We're running low on supplies... be careful!",
    condition: ({ integrity, maxIntegrity }) => integrity < maxIntegrity * 0.3 && integrity > 0,
  },
  {
    id: 'full_energy',
    text: "Don't forget to use all your energy before ending your turn!",
    condition: ({ turn, energy, maxEnergy }) => turn === 2 && energy === maxEnergy,
  },
];
