import { GameUpgrade } from './types';

// World Settings
export const TILE_SIZE = 32; // Visual size in pixels
export const LOGIC_FPS = 20;
export const TICK_RATE = 1000 / LOGIC_FPS;
export const WORLD_WIDTH = 80 * TILE_SIZE; // Matches classic 80 columns roughly
export const WORLD_HEIGHT = 24 * TILE_SIZE; // Matches classic 24 rows roughly

// Combat Settings
export const ATTACK_RANGE = TILE_SIZE * 2.5; // Attack radius
export const ATTACK_ARC = 1.0; // Radians (~60 degrees)
export const ATTACK_DURATION = 0.2; // How long the visual lasts in seconds

// Colors
export const COLOR_WALL = '#404040';
export const COLOR_FLOOR = '#1a1a1a';
export const COLOR_PLAYER = '#3b82f6'; // Blue-500
export const COLOR_MONSTER = '#ef4444'; // Red-500
export const COLOR_GOLD = '#eab308'; // Yellow-500
export const COLOR_ITEM = '#a855f7'; // Purple-500
export const COLOR_TRAP = '#f97316'; // Orange-500
export const COLOR_POTION_AGILITY = '#22c55e'; // Green-500
export const COLOR_RING_AGILITY = '#06b6d4'; // Cyan-500

// Stats
export const BASE_PLAYER_STATS = {
  hp: 12,
  maxHp: 12,
  str: 16,
  armor: 4,
  exp: 0,
  level: 1,
  gold: 0,
  souls: 0,
  speed: 150, // pixels per second
  agility: 12,
};

// Upgrades
export const UPGRADES: GameUpgrade[] = [
  {
    id: 'max_hp',
    name: 'Vitality',
    description: 'Increases Max HP by 5 per level.',
    cost: 50,
    level: 0,
    maxLevel: 10,
    statKey: 'maxHp',
    effect: (lvl) => lvl * 5,
  },
  {
    id: 'base_damage',
    name: 'Strength',
    description: 'Increases Damage by 1 per level.',
    cost: 50,
    level: 0,
    maxLevel: 10,
    statKey: 'str',
    effect: (lvl) => lvl * 1,
  },
  {
    id: 'agility',
    name: 'Agility',
    description: 'Increases Agility by 1 per level (Speed & Atk Speed).',
    cost: 50,
    level: 0,
    maxLevel: 10,
    statKey: 'agility',
    effect: (lvl) => lvl * 1,
  },
];

// Monsters (Simplified A-Z subset)
export const MONSTER_TEMPLATES = [
  { label: '🦠', name: 'Aquator', hp: 25, damage: '0d0', exp: 20, speed: 100 },
  { label: '🦇', name: 'Bat', hp: 10, damage: '1d3', exp: 2, speed: 180 },
  { label: '🐴', name: 'Centaur', hp: 32, damage: '3d3', exp: 15, speed: 100 },
  { label: '🐲', name: 'Dragon', hp: 145, damage: '4d6', exp: 5000, speed: 100 },
  { label: '🐦', name: 'Emu', hp: 11, damage: '1d3', exp: 2, speed: 120 },
  { label: '👹', name: 'Hobgoblin', hp: 15, damage: '1d3', exp: 3, speed: 100 },
  { label: '👺', name: 'Orc', hp: 25, damage: '1d6', exp: 5, speed: 100 },
  { label: '🐍', name: 'Snake', hp: 8, damage: '1d3', exp: 2, speed: 100 },
  { label: '🧌', name: 'Troll', hp: 75, damage: '4d6', exp: 125, speed: 90 },
  { label: '🧟', name: 'Zombie', hp: 21, damage: '1d7', exp: 8, speed: 70 },
];
