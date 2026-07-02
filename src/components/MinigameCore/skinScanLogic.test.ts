import { describe, it, expect } from 'vitest';
import { generateBoard, computeResultFromBoard, type BoardCharacter, type CharacterKind } from './skinScanLogic';

describe('generateBoard', () => {
  it('always produces exactly 8 characters, all unfound, at unique positions', () => {
    for (let trial = 0; trial < 50; trial++) {
      const board = generateBoard();
      expect(board).toHaveLength(8);
      expect(board.every((c) => !c.found)).toBe(true);
      const positions = new Set(board.map((c) => `${c.x},${c.y}`));
      expect(positions.size).toBe(8);
    }
  });

  it('distribution is always either 3-2-2-1 (dominant kind) or 2-2-2-2 (tie)', () => {
    for (let trial = 0; trial < 200; trial++) {
      const board = generateBoard();
      const counts: Partial<Record<CharacterKind, number>> = {};
      for (const c of board) counts[c.kind] = (counts[c.kind] ?? 0) + 1;
      expect(Object.keys(counts)).toHaveLength(4);
      const values = Object.values(counts).sort((a, b) => (b as number) - (a as number));
      const isDominant = values.join(',') === '3,2,2,1';
      const isTie = values.join(',') === '2,2,2,2';
      expect(isDominant || isTie).toBe(true);
    }
  });
});

describe('computeResultFromBoard', () => {
  function boardWithCounts(counts: Partial<Record<CharacterKind, number>>): BoardCharacter[] {
    const board: BoardCharacter[] = [];
    let i = 0;
    for (const [kind, count] of Object.entries(counts)) {
      for (let j = 0; j < (count ?? 0); j++) {
        board.push({ id: `c${i++}`, kind: kind as CharacterKind, x: 0, y: 0, found: true });
      }
    }
    return board;
  }

  it('returns da-nhon-mun-viem when mun-viem dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 3, 'dau-den': 2, 'man-do': 2, 'da-sang-khoe': 1 });
    expect(computeResultFromBoard(board).id).toBe('da-nhon-mun-viem');
  });

  it('returns lo-chan-long when dau-den dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 3, 'man-do': 2, 'da-sang-khoe': 1 });
    expect(computeResultFromBoard(board).id).toBe('lo-chan-long');
  });

  it('returns da-nhay-cam when man-do dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 1, 'man-do': 3, 'da-sang-khoe': 2 });
    expect(computeResultFromBoard(board).id).toBe('da-nhay-cam');
  });

  it('returns clean-skin when da-sang-khoe dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 2, 'man-do': 1, 'da-sang-khoe': 3 });
    expect(computeResultFromBoard(board).id).toBe('clean-skin');
  });

  it('returns da-moi-bat-dau fallback on a tie', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 2, 'man-do': 2, 'da-sang-khoe': 2 });
    expect(computeResultFromBoard(board).id).toBe('da-moi-bat-dau');
  });
});
