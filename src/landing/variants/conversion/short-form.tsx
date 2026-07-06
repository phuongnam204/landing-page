'use client';
import React, { useState } from 'react';
import type { ConversionSlotProps } from '../../slots';
import { getPrograms } from '../../../content/catalog';

export function ShortFormConversion({ selectedProgramId, onSubmit }: ConversionSlotProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const programName = selectedProgramId ? getPrograms().find(p => p.id === selectedProgramId)?.name : null;

  return (
    <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden">
      <form onSubmit={e => { e.preventDefault(); if (name.trim() && phone.trim()) onSubmit(name.trim(), phone.trim()); }}
        className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3 animate-fade-in-up">
        <div className="font-extrabold text-lg text-cta mb-1">
          {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
        </div>
        {programName && <p className="text-sm text-cta/70 -mt-2 mb-1">Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.</p>}
        <input type="text" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta" />
        <input type="tel" placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta" />
        <button type="submit" className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft mt-2">Gửi thông tin</button>
      </form>
    </div>
  );
}
