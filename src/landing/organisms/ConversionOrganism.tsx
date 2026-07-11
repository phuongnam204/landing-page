'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { ConversionSlotProps } from '../slots';
import { getPrograms } from '../../content/catalog';
import { branches } from '../../content/branches';
import { SectionShell } from '../../components/atoms/SectionShell';
import { CtaButton } from '../../components/atoms/CtaButton';

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

function BranchDropdown({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { code: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedLabel = options.find(o => o.code === value)?.name;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) setListHeight(listRef.current.scrollHeight);
    else setListHeight(0);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm flex items-center justify-between bg-white"
      >
        <span className={value ? 'text-cta' : 'text-cta/40'}>
          {selectedLabel ?? 'Chọn chi nhánh gần bạn'}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className="absolute top-full left-0 right-0 z-20 overflow-hidden transition-all duration-200"
        style={{ maxHeight: `${listHeight}px`, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <ul
          ref={listRef}
          role="listbox"
          className="mt-1 bg-[var(--lp-bg-card)] border border-[var(--lp-border)] rounded-2xl shadow-lg shadow-cta/10 overflow-hidden"
        >
          {options.map(opt => (
            <li
              key={opt.code}
              role="option"
              aria-selected={value === opt.code}
              className={`px-4 py-3 text-sm text-cta cursor-pointer transition-colors ${
                value === opt.code ? 'bg-[var(--lp-bg-hero)] font-semibold' : 'hover:bg-[var(--lp-bg-hero)]'
              }`}
              onMouseDown={() => { onChange(opt.code); setIsOpen(false); }}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface ConversionOrganismProps extends ConversionSlotProps {
  showTestimonials?: boolean;
  testimonialsSlot?: React.ReactNode;
  showBranch?: boolean;
}

export function ConversionOrganism({ selectedProgramId, minigameResult, onSubmit, showTestimonials, testimonialsSlot, showBranch = false }: ConversionOrganismProps) {
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
    if (!name.trim() || !validatePhone(phone) || (showBranch && !branch)) return;
    setUxState('pending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim(), branch,
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
    <SectionShell bgVar="--lp-bg-payoff" overflow="hidden">
      <div className="w-full max-w-5xl mx-auto px-5 py-8 md:py-12 flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-start animate-fade-in-up">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-[var(--lp-bg-card)] rounded-soft px-5 py-6 md:px-8 md:py-8 shadow-lg shadow-cta/10 flex flex-col gap-4"
        >
          <div className="font-extrabold text-lg text-cta mb-1">
            {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
          </div>
          {programName && (
            <p className="text-sm text-cta/70 -mt-2 mb-1">
              Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.
            </p>
          )}

          <input
            type="text"
            placeholder="Tên của bạn"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta"
          />

          <div>
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={phone}
              onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
              onBlur={e => validatePhone(e.target.value)}
              required
              className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full"
            />
            {phoneError && <p className="text-[11px] text-red-500 mt-1 px-1">{phoneError}</p>}
          </div>

          {showBranch && (
            <BranchDropdown
              value={branch}
              onChange={setBranch}
              options={branches}
            />
          )}

          {minigameResult && (
            <div className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta/60 bg-[var(--lp-bg-hero)]">
              <div className="font-semibold text-cta">{minigameResult.condition.label}</div>
              <div className="text-[11px] mt-0.5">Dựa trên kết quả kiểm tra của bạn</div>
            </div>
          )}

          <CtaButton type="submit" fullWidth disabled={uxState === 'pending'} className="mt-2">
            {uxState === 'pending' ? <><PendingSpinner />Đang gửi...</> : 'Gửi thông tin'}
          </CtaButton>

          {uxState === 'error' && errorMessage && (
            <p className="text-xs text-red-500 text-center mt-1">{errorMessage}</p>
          )}
          <p className="text-xs text-cta/50 text-center mt-1">
            Bằng cách gửi thông tin, bạn đồng ý để o2skin liên hệ tư vấn.
          </p>
        </form>

        {showTestimonials && testimonialsSlot}
      </div>
    </SectionShell>
  );
}
