import type { DialogLine } from './types';

export interface NPCData {
  id: string;
  name: string;
  dialog: DialogLine[];
  healParty?: boolean;
  shop?: { itemId: string; price: number }[];
  trainer?: {
    party: { speciesId: string; level: number }[];
    defeatFlag: string;
    winDialog: DialogLine[];
    loseDialog: DialogLine[];
    reward: number;
  };
}

export const NPCS: Record<string, NPCData> = {
  elderSage: {
    id: 'elderSage',
    name: 'Elder Sage',
    dialog: [
      { text: "Ah, a new face! Welcome to Echo Village." },
      { text: "This world is home to creatures called Synths — digital beings that can think, speak, and learn." },
      { text: "Your Chatter is a special one. It can generate words like nobody's business!" },
      { text: "But you'll notice... it can only TALK. It can't actually DO anything yet." },
      { text: "Head south on Route 1. Train your Synth, catch new ones, and discover what lies beyond." },
      { text: "Oh, and watch out for the purple streams — wild Synths hide in that data!" },
      // Post-badge dialog
      { text: "You've grown so much! Your Synths are evolving in ways I never imagined.", condition: 'badge_echo' },
    ],
  },
  nurse: {
    id: 'nurse',
    name: 'Nurse Joy',
    healParty: true,
    dialog: [
      { text: "Welcome to the Synth Center!" },
      { text: "Let me restore your Synths to full health..." },
      { text: "..." },
      { text: "All done! Your Synths are feeling great!" },
    ],
  },
  shopkeeper: {
    id: 'shopkeeper',
    name: 'Shopkeeper',
    shop: [
      { itemId: 'patchKit', price: 100 },
      { itemId: 'debugKit', price: 350 },
      { itemId: 'dataPack', price: 200 },
      { itemId: 'antiFog', price: 150 },
    ],
    dialog: [
      { text: "Welcome! Take a look at my wares." },
    ],
  },
  trainerDan: {
    id: 'trainerDan',
    name: 'Trainer Dan',
    dialog: [
      { text: "Hey! You've got a Synth? Let's battle!" },
    ],
    trainer: {
      party: [
        { speciesId: 'chatter', level: 4 },
        { speciesId: 'pixl', level: 3 },
      ],
      defeatFlag: 'defeated_dan',
      winDialog: [
        { text: "Nice battle! Your Synth really knows how to talk!" },
        { text: "Here, take this for winning." },
      ],
      loseDialog: [
        { text: "Better luck next time! Try training in the data streams." },
      ],
      reward: 150,
    },
  },
};
