export enum EntityType {
  PLAYER = 'PLAYER',
  MONSTER = 'MONSTER',
  ITEM = 'ITEM',
  TRAP = 'TRAP'
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  SHOP = 'SHOP',
  VICTORY = 'VICTORY'
}

export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  hp: number;
  maxHp: number;
  str: number;
  armor: number;
  exp: number;
  level: number;
  gold: number;
  souls: number;
  speed: number;
  agility: number;
}

export interface AttackVisual {
  active: boolean;
  angle: number;
  timer: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  pos: Position;
  size: number;
  color: string;
  label?: string; // For monsters (A-Z) or items
  stats?: Stats;
  // Combat
  cooldown: number;
  maxCooldown: number;
  // AI
  state?: 'SLEEP' | 'WANDER' | 'HUNT';
  targetPos?: Position;
  // Visuals
  attackVisual?: AttackVisual;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // Seconds remaining
  maxLife: number;
  velocity: { x: number; y: number };
}

export interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GameUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  effect: (val: number) => number; // Multiplier or adder
  statKey: keyof Stats | 'baseDamage';
}

export interface MetaProgress {
  souls: number;
  upgrades: Record<string, number>; // upgradeId -> level
  unlocks: string[];
}