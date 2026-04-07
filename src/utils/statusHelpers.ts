/** Shared status/power helper functions for combat UI */

export function getStatusDescription(status: string): string {
  switch (status) {
    case 'hallucination': return 'HALLUCINATION — Curse cards in your deck. Deal 3 damage when in your hand at end of turn. Grounded blocks it.';
    case 'grounded': return 'GROUNDED — Absorbs hallucination curse triggers. Each trigger removes 1 stack.';
    case 'context': return 'CONTEXT — Adds bonus damage or firewall to your next card that deals damage or gives firewall. Consumed after use.';
    case 'vulnerable': return 'VULNERABLE — Take 50% more damage from attacks. Reduces by 1 each turn.';
    case 'weak': return 'WEAK — Deal 25% less damage with attacks. Reduces by 1 each turn.';
    case 'throttled': return 'THROTTLED — Lose this much energy at the start of next turn.';
    case 'confused': return 'CONFUSED — Each stack randomizes 1 card cost (0-3) when drawn.';
    case 'overfit': return 'OVERFIT — Playing the same card twice in a turn halves its damage.';
    default: return status;
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'hallucination': return '#7c3aed33';
    case 'grounded': return '#05966933';
    case 'context': return '#fbbf2433';
    case 'vulnerable': return '#f9731633';
    case 'weak': return '#60a5fa33';
    case 'throttled': return '#ef444433';
    case 'confused': return '#a78bfa33';
    case 'overfit': return '#f4728633';
    default: return '#37415133';
  }
}

export function getStatusFg(status: string): string {
  switch (status) {
    case 'hallucination': return '#a78bfa';
    case 'grounded': return '#10b981';
    case 'context': return '#fbbf24';
    case 'vulnerable': return '#f97316';
    case 'weak': return '#60a5fa';
    case 'throttled': return '#ef4444';
    case 'confused': return '#c084fc';
    case 'overfit': return '#f472b6';
    default: return '#6b7280';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'hallucination': return 'Hlcn';
    case 'grounded': return 'Grnd';
    case 'context': return 'Ctx';
    case 'vulnerable': return 'Vuln';
    case 'weak': return 'Weak';
    case 'throttled': return 'Thrt';
    case 'confused': return 'Conf';
    case 'overfit': return 'Ofit';
    default: return status.slice(0, 4);
  }
}

export function getPowerLabel(type: string, amount?: number): string {
  switch (type) {
    case 'blockPerTurn': return `+${amount}FW`;
    case 'drawPerTurn': return `+${amount}Dr`;
    case 'reduceDamage': return `-${amount}Dm`;
    case 'firstCardFree': return '0Cost';
    case 'attackSplash': return `Spl${amount}`;
    default: return type.slice(0, 4);
  }
}

export function getPowerDescription(type: string, amount?: number): string {
  switch (type) {
    case 'blockPerTurn': return `MONITORING — Gain ${amount} Firewall at the start of each turn.`;
    case 'drawPerTurn': return `AUTO-COMPLETE — Draw ${amount} additional card${amount !== 1 ? 's' : ''} at the start of each turn.`;
    case 'reduceDamage': return `RATE LIMITER — Enemies deal ${amount} less damage per hit.`;
    case 'firstCardFree': return 'BATCH PROCESSING — The first card you play each turn costs 0 energy.';
    case 'attackSplash': return `ENSEMBLE MODEL — When you play an Attack, deal ${amount} damage to ALL enemies.`;
    default: return '';
  }
}

/** Whether a status is a debuff (harmful) vs buff (helpful) */
export function isDebuff(status: string): boolean {
  return ['hallucination', 'vulnerable', 'weak', 'throttled', 'confused', 'overfit'].includes(status);
}
