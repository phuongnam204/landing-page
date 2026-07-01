import { describe, it, expect } from 'vitest';
import { computeResult } from './quizLogic';
import { quizResults } from '../../content/quiz';

const base = {
  q1: 'nu',
  q2: 'co',
  q3: 'khong',
  q4: 'da-dung',
  q5: 'binh-thuong',
  q6: 'stress',
};

describe('computeResult — priority waterfall', () => {
  it('P1: returns mun-noi-tiet for nu + mun do + ky-kinh', () => {
    expect(computeResult({ ...base, q1: 'nu', q2: 'co', q6: 'ky-kinh' }).id).toBe('mun-noi-tiet');
  });

  it('P1: does not trigger for nam — falls through to da-nhon-mun-viem', () => {
    const result = computeResult({ ...base, q1: 'nam', q2: 'co', q6: 'ky-kinh' });
    expect(result.id).toBe('da-nhon-mun-viem');
  });

  it('P2: returns da-nhay-cam for mun do + da-dung + cang-rat', () => {
    expect(computeResult({ ...base, q2: 'co', q4: 'da-dung', q5: 'cang-rat' }).id).toBe('da-nhay-cam');
  });

  it('P2: does not trigger when q4 is chua-bao-gio (skipped product use)', () => {
    const result = computeResult({ ...base, q2: 'co', q4: 'chua-bao-gio', q5: undefined as any, q6: 'stress' });
    expect(result.id).not.toBe('da-nhay-cam');
  });

  it('P3: returns da-nhon-mun-viem for mun do + q5 nhon', () => {
    expect(computeResult({ ...base, q2: 'co', q5: 'nhon' }).id).toBe('da-nhon-mun-viem');
  });

  it('P3: returns da-nhon-mun-viem for mun do + chua-bao-gio (q5 skipped)', () => {
    expect(computeResult({ ...base, q2: 'co', q4: 'chua-bao-gio', q5: undefined as any }).id).toBe('da-nhon-mun-viem');
  });

  it('P4: returns lo-chan-long for khong mun do + co mun dau den', () => {
    expect(computeResult({ ...base, q2: 'khong', q3: 'co' }).id).toBe('lo-chan-long');
  });

  it('P5: returns clean-skin for no acne and no blackheads', () => {
    expect(computeResult({ ...base, q2: 'khong', q3: 'khong' }).id).toBe('clean-skin');
  });

  it('P6: da-moi-bat-dau is unreachable fallback — still present in quizResults', () => {
    // P3/P4/P5 are exhaustive for all q2 values in normal flow.
    // The fallback exists as a safety net; verify it is still defined.
    expect(quizResults['da-moi-bat-dau'].id).toBe('da-moi-bat-dau');
  });

  it('result always has all required fields', () => {
    const result = computeResult(base);
    expect(result.id).toBeTruthy();
    expect(result.tone).toMatch(/^(positive|concern)$/);
    expect(result.body).toBeTruthy();
    expect(result.solution).toBeTruthy();
    expect(result.suggestedProgram).toBeTruthy();
  });
});
