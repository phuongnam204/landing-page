import { describe, it, expect } from 'vitest';
import { resolveProfile } from './skinProfileLogic';

describe('resolveProfile', () => {
  it('maps chin/jaw zone to hormonal acne regardless of feel/trigger', () => {
    expect(resolveProfile('cam-quai-ham', 'dau', 'ky-kinh').id).toBe('mun-noi-tiet');
    expect(resolveProfile('cam-quai-ham', 'on-dinh', 'nang').id).toBe('mun-noi-tiet');
  });

  it('maps T-zone + oily to oily inflamed acne', () => {
    expect(resolveProfile('chu-t', 'dau', 'stress').id).toBe('da-nhon-mun-viem');
  });

  it('maps T-zone + non-oily to enlarged pores', () => {
    expect(resolveProfile('chu-t', 'kho', 'stress').id).toBe('lo-chan-long');
    expect(resolveProfile('chu-t', 'nhay-cam', 'nang').id).toBe('lo-chan-long');
  });

  it('maps cheeks to sensitive skin', () => {
    expect(resolveProfile('hai-ma', 'kho', 'thuc-khuya').id).toBe('da-nhay-cam');
  });

  it('maps no-problem + stable to clean skin', () => {
    expect(resolveProfile('khong-bi', 'on-dinh', 'nang').id).toBe('clean-skin');
  });

  it('maps no-problem + non-stable to no-routine fallback', () => {
    expect(resolveProfile('khong-bi', 'dau', 'stress').id).toBe('da-moi-bat-dau');
  });
});
