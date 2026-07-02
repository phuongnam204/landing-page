import { quizResults, type QuizResult } from '../../content/quiz';

export type CharacterKind = 'mun-viem' | 'dau-den' | 'man-do' | 'da-sang-khoe';

export interface BoardCharacter {
  id: string;
  kind: CharacterKind;
  x: number;
  y: number;
  found: boolean;
}

const ALL_KINDS: CharacterKind[] = ['mun-viem', 'dau-den', 'man-do', 'da-sang-khoe'];

const DOMINANT_WEIGHTS: Record<CharacterKind, number> = {
  'mun-viem': 0.275,
  'dau-den': 0.275,
  'man-do': 0.275,
  'da-sang-khoe': 0.175,
};

const TIE_ROUND_CHANCE = 0.1;

const BOARD_SLOTS: { x: number; y: number }[] = [
  { x: 15, y: 22 },
  { x: 38, y: 15 },
  { x: 62, y: 20 },
  { x: 85, y: 25 },
  { x: 20, y: 68 },
  { x: 42, y: 78 },
  { x: 65, y: 65 },
  { x: 83, y: 72 },
];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickDominantKind(): CharacterKind {
  const roll = Math.random();
  let cumulative = 0;
  for (const kind of ALL_KINDS) {
    cumulative += DOMINANT_WEIGHTS[kind];
    if (roll <= cumulative) return kind;
  }
  return ALL_KINDS[ALL_KINDS.length - 1];
}

function generateCounts(): Record<CharacterKind, number> {
  const counts = { 'mun-viem': 0, 'dau-den': 0, 'man-do': 0, 'da-sang-khoe': 0 } as Record<CharacterKind, number>;
  if (Math.random() < TIE_ROUND_CHANCE) {
    for (const kind of ALL_KINDS) counts[kind] = 2;
    return counts;
  }
  const dominant = pickDominantKind();
  const others = shuffle(ALL_KINDS.filter((kind) => kind !== dominant));
  counts[dominant] = 3;
  counts[others[0]] = 2;
  counts[others[1]] = 2;
  counts[others[2]] = 1;
  return counts;
}

export function generateBoard(): BoardCharacter[] {
  const counts = generateCounts();
  const kinds: CharacterKind[] = [];
  for (const kind of ALL_KINDS) {
    for (let i = 0; i < counts[kind]; i++) kinds.push(kind);
  }
  const shuffledKinds = shuffle(kinds);
  const positions = shuffle(BOARD_SLOTS);
  return shuffledKinds.map((kind, index) => ({
    id: `${kind}-${index}`,
    kind,
    x: positions[index].x,
    y: positions[index].y,
    found: false,
  }));
}

const KIND_TO_PROFILE_ID: Record<CharacterKind, string> = {
  'mun-viem': 'da-nhon-mun-viem',
  'dau-den': 'lo-chan-long',
  'man-do': 'da-nhay-cam',
  'da-sang-khoe': 'clean-skin',
};

export type KindCounts = Record<CharacterKind, number>;

/** Tallies how many characters of each kind are on the board (all found at game end). */
export function countByKind(board: BoardCharacter[]): KindCounts {
  const counts = { 'mun-viem': 0, 'dau-den': 0, 'man-do': 0, 'da-sang-khoe': 0 } as KindCounts;
  for (const character of board) {
    counts[character.kind] += 1;
  }
  return counts;
}

export function computeResultFromBoard(board: BoardCharacter[]): QuizResult {
  const counts = countByKind(board);
  const maxCount = Math.max(...ALL_KINDS.map((kind) => counts[kind]));
  const leaders = ALL_KINDS.filter((kind) => counts[kind] === maxCount);
  if (leaders.length !== 1) {
    return quizResults['da-moi-bat-dau'];
  }
  return quizResults[KIND_TO_PROFILE_ID[leaders[0]]];
}
