'use client';
import React, { useState } from 'react';
import type { ConversionSlotProps } from '../../slots';
import { getPrograms } from '../../../content/catalog';
import { branches } from '../../../content/branches';

const PHONE_RE = /(^0[0-9]{9}$)|(^\+84[0-9]{9}$)/;

type UXState = 'idle' | 'pending' | 'error';

function PendingSpinner() {
  return (
    <svg className="inline-block animate-spin -ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8A6 6 0 0 1 2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShortFormConversion({ selectedProgramId, minigameResult, onSubmit }: ConversionSlotProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [uxState, setUxState] = useState<UXState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const programName = selectedProgramId ? getPrograms().find(p => p.id === selectedProgramId)?.name : null;

  function validatePhone(val: string): boolean {
    if (!val.trim()) { setPhoneError(''); return false; }
    if (!PHONE_RE.test(val.trim())) { setPhoneError('Số điện thoại không hợp lệ (10 số, bắt đầu 0 hoặc +84)'); return false; }
    setPhoneError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uxState === 'pending') return;
    if (!name.trim()) return;
    if (!validatePhone(phone)) return;
    if (!branch) return;

    setUxState('pending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          branch,
          skinCondition: minigameResult?.condition.label ?? '',
          programId: selectedProgramId ?? '',
          recipeId: '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể gửi thông tin, thử lại sau.');
      onSubmit(name.trim(), phone.trim());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể gửi thông tin, thử lại sau.');
      setUxState('error');
    }
  }

  return (
    <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden">
      <form onSubmit={handleSubmit}
        className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3 animate-fade-in-up">
        <div className="font-extrabold text-lg text-cta mb-1">
          {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
        </div>
        {programName && <p className="text-sm text-cta/70 -mt-2 mb-1">Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.</p>}

        <input type="text" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta" />

        <div>
          <input type="tel" placeholder="Số điện thoại" value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
            onBlur={e => validatePhone(e.target.value)}
            required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full" />
          {phoneError && <p className="text-[11px] text-red-500 mt-1 px-1">{phoneError}</p>}
        </div>

        <select value={branch} onChange={e => setBranch(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta bg-white">
          <option value="" disabled>Chọn chi nhánh gần bạn</option>
          {branches.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>

        {minigameResult && (
          <div className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta/60 bg-[var(--lp-bg-hero)]">
            <div className="font-semibold text-cta">{minigameResult.condition.label}</div>
            <div className="text-[11px] mt-0.5">Dựa trên kết quả kiểm tra của bạn</div>
          </div>
        )}

        <button type="submit" disabled={uxState === 'pending'}
          className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft mt-2 disabled:opacity-60 hover:enabled:opacity-90 transition-opacity flex items-center justify-center gap-2">
          {uxState === 'pending' ? <><PendingSpinner />Đang gửi...</> : 'Gửi thông tin'}
        </button>

        {uxState === 'error' && errorMessage && (
          <p className="text-xs text-red-500 text-center mt-1">{errorMessage}</p>
        )}

        <p className="text-xs text-cta/50 text-center mt-1">
          Bằng cách gửi thông tin, bạn đồng ý để o2skin liên hệ tư vấn.
        </p>
      </form>
    </div>
  );
}
