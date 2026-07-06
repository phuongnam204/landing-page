import { describe, it, expect } from 'vitest';
import { registry } from '../registry';

describe('registry', () => {
  it('có đủ 4 slot bắt buộc', () => {
    expect(registry.hook).toBeDefined(); expect(registry.minigame).toBeDefined();
    expect(registry.payoff).toBeDefined(); expect(registry.conversion).toBeDefined();
  });
  it('hook two-column là component', () => expect(typeof registry.hook['two-column']).toBe('function'));
  it('minigame có findgame và skincare', () => {
    expect(typeof registry.minigame['findgame']).toBe('function');
    expect(typeof registry.minigame['skincare']).toBe('function');
  });
  it('programs grid là component', () => expect(typeof registry.programs['grid']).toBe('function'));
  it('done contact-info là component', () => expect(typeof registry.done['contact-info']).toBe('function'));
});
