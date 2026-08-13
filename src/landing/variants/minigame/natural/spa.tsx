'use client';
import { useCallback } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';

const SENSITIVE_SYMPTOMS = [
  {
    id: 'flushed',
    label: 'Da ửng đỏ',
    desc: 'Khi tiếp xúc ánh nắng gắt hoặc nhiệt độ cao',
    img: '/vectors/flushed.jpg',
  },
  {
    id: 'rashness',
    label: 'Phát ban và sưng đỏ',
    desc: 'Sau khi dùng mỹ phẩm, kem dưỡng hoặc kem chống nắng',
    img: '/vectors/rashness.jpg',
  },
  {
    id: 'itching',
    label: 'Ngứa rát, nóng bừng hoặc căng da',
    desc: 'Khi tiếp xúc hóa chất, bụi bẩn hoặc thời tiết',
    img: '/vectors/itching.jpg',
  },
  {
    id: 'dry',
    label: 'Bong tróc và khô da',
    desc: 'Hàng rào bảo vệ da suy yếu, dễ mất nước',
    img: '/vectors/Dry.jpg',
  },
] as const;

export function NaturalSpaMinigame({ onComplete }: MinigameSlotProps) {
  const condition = skinConditions['da-nhay-cam']!;

  const handleSelect = useCallback((label: string) => {
    onComplete({
      conditions: [condition],
      condition,
      zoneLabel: '',
      zoneIds: [],
      triggerNote: label,
    });
  }, [condition, onComplete]);

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: 'var(--lp-bg-minigame)' }}
    >
      <style>{`
        @keyframes card-enter-spa {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .spa-card {
          transition: border-color 0.14s, box-shadow 0.14s, transform 0.12s;
          cursor: pointer;
        }
        .spa-card:hover {
          border-color: var(--lp-accent) !important;
          box-shadow: 0 6px 20px color-mix(in srgb, var(--lp-accent) 28%, transparent) !important;
          transform: translateY(-3px);
        }
        .spa-card:active { transform: scale(0.96); }
      `}</style>

      {/* ── Mobile: 2×2 grid ── */}
      <div className="md:hidden flex-1 flex flex-col px-4 pt-5 pb-4 min-h-0">
        <p
          className="text-sm font-extrabold mb-4 leading-snug shrink-0"
          style={{ color: 'var(--lp-primary)' }}
        >
          Da bạn bạn nhạy cảm ? Triệu chứng thường gặp là gì ?
        </p>
        <p
          className="text-xs font-bold mb-1 uppercase tracking-widest shrink-0"
          style={{ color: 'var(--lp-accent)', letterSpacing: '0.1em' }}
        >
          Da nhạy cảm không nên xem thường - đó có thể là báo động lớn !
        </p>
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
          {SENSITIVE_SYMPTOMS.map((s, i) => (
            <button
              key={s.id}
              className="spa-card text-left rounded-2xl overflow-hidden flex flex-col h-full"
              style={{
                border: '1.5px solid var(--lp-border)',
                background: 'var(--lp-bg-card)',
                animation: `card-enter-spa 280ms ease-out ${i * 55}ms both`,
              }}
              onClick={() => handleSelect(s.label)}
              aria-label={s.label}
            >
              <img
                src={s.img}
                alt=""
                aria-hidden="true"
                className="w-full object-cover flex-1 min-h-0"
              />
              <div className="p-2.5 shrink-0">
                <p className="font-bold" style={{ fontSize: '11px', color: 'var(--lp-primary)', lineHeight: 1.35 }}>
                  {s.label}
                </p>
                <p className="mt-1" style={{ fontSize: '9.5px', color: 'var(--lp-primary)', opacity: 0.55, lineHeight: 1.45 }}>
                  {s.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop: 4-column grid ── */}
      <div className="hidden md:flex flex-1 flex-col justify-center px-10 py-10 overflow-y-auto">
        <p
          className="font-black mb-8 leading-snug"
          style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: 'var(--lp-primary)' }}
        >
           Da bạn bạn nhạy cảm ? Triệu chứng thường gặp là gì ?
        </p>
        <p
          className="text-xs font-bold mb-2 uppercase tracking-widest"
          style={{ color: 'var(--lp-accent)', letterSpacing: '0.12em' }}
        >
          Da nhạy cảm không nên xem thường - đó có thể là báo động lớn !
          
        </p>
        <div className="grid grid-cols-4 gap-5">
          {SENSITIVE_SYMPTOMS.map((s, i) => (
            <button
              key={s.id}
              className="spa-card text-left rounded-2xl overflow-hidden"
              style={{
                border: '1.5px solid var(--lp-border)',
                background: 'var(--lp-bg-card)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                animation: `card-enter-spa 300ms ease-out ${i * 60}ms both`,
              }}
              onClick={() => handleSelect(s.label)}
              aria-label={s.label}
            >
              <img
                src={s.img}
                alt=""
                aria-hidden="true"
                className="w-full object-cover"
                style={{ aspectRatio: '4/3' }}
              />
              <div className="p-4">
                <p className="font-bold" style={{ fontSize: '14px', color: 'var(--lp-primary)', lineHeight: 1.35 }}>
                  {s.label}
                </p>
                <p className="mt-1.5" style={{ fontSize: '11.5px', color: 'var(--lp-primary)', opacity: 0.6, lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
