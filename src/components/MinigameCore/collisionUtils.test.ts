import { describe, it, expect } from 'vitest';
import { withinRadius, withinBox } from './collisionUtils';

describe('withinRadius', () => {
  it('is true when point is inside the radius', () => {
    expect(withinRadius({ x: 50, y: 50 }, { x: 52, y: 53 }, 5)).toBe(true);
  });
  it('is false when point is outside the radius', () => {
    expect(withinRadius({ x: 50, y: 50 }, { x: 60, y: 60 }, 5)).toBe(false);
  });
  it('is true exactly on the boundary', () => {
    expect(withinRadius({ x: 0, y: 0 }, { x: 3, y: 4 }, 5)).toBe(true);
  });
});

describe('withinBox', () => {
  const box = { cx: 50, cy: 50, halfW: 10, halfH: 8 };
  it('is true when point is inside the box', () => {
    expect(withinBox({ x: 55, y: 45 }, box)).toBe(true);
  });
  it('is false when point is outside on x', () => {
    expect(withinBox({ x: 65, y: 50 }, box)).toBe(false);
  });
  it('is false when point is outside on y', () => {
    expect(withinBox({ x: 50, y: 61 }, box)).toBe(false);
  });
});
