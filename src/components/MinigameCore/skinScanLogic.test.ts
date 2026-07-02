import { describe, it, expect } from 'vitest';
import {
  generateSpots,
  findNearestUnfoundSpot,
  resolveProfileByZone,
  ZONE_META,
  SPOT_POOL,
  type AcneSpot,
  type SkinZone,
} from './skinScanLogic';

describe('generateSpots', () => {
  it('produces the requested count of unfound spots at unique pool positions', () => {
    for (let trial = 0; trial < 50; trial++) {
      const spots = generateSpots(6);
      expect(spots).toHaveLength(6);
      expect(spots.every((s) => !s.found)).toBe(true);
      const positions = new Set(spots.map((s) => `${s.x},${s.y}`));
      expect(positions.size).toBe(6);
      // every chosen position must come from the authored pool
      for (const s of spots) {
        expect(SPOT_POOL.some((p) => p.x === s.x && p.y === s.y)).toBe(true);
      }
    }
  });

  it('gives each spot a unique id', () => {
    const spots = generateSpots(6);
    const ids = new Set(spots.map((s) => s.id));
    expect(ids.size).toBe(spots.length);
  });
});

describe('findNearestUnfoundSpot', () => {
  const spots: AcneSpot[] = [
    { id: 'a', x: 20, y: 20, found: false },
    { id: 'b', x: 80, y: 80, found: false },
    { id: 'c', x: 22, y: 22, found: true },
  ];

  it('returns the nearest unfound spot within radius', () => {
    const hit = findNearestUnfoundSpot(spots, 21, 21, 9);
    expect(hit?.id).toBe('a');
  });

  it('returns null when nothing is within radius', () => {
    expect(findNearestUnfoundSpot(spots, 50, 50, 9)).toBeNull();
  });

  it('never returns an already-found spot', () => {
    const hit = findNearestUnfoundSpot(spots, 22, 22, 9);
    expect(hit?.id).not.toBe('c');
  });
});

describe('resolveProfileByZone', () => {
  const cases: [SkinZone, string][] = [
    ['cam-quai-ham', 'mun-noi-tiet'],
    ['chu-t', 'da-nhon-mun-viem'],
    ['hai-ma', 'da-nhay-cam'],
    ['khong-bi', 'clean-skin'],
  ];
  it.each(cases)('maps zone %s to profile %s', (zone, profileId) => {
    expect(resolveProfileByZone(zone).id).toBe(profileId);
  });

  it('falls back to da-moi-bat-dau for an unknown zone', () => {
    expect(resolveProfileByZone('nonsense' as SkinZone).id).toBe('da-moi-bat-dau');
  });
});

describe('ZONE_META', () => {
  it('has a human label and profile id for all four zones', () => {
    const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
    for (const z of zones) {
      expect(ZONE_META[z].label.length).toBeGreaterThan(0);
      expect(ZONE_META[z].profileId.length).toBeGreaterThan(0);
    }
  });
});
