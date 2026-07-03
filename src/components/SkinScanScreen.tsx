'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import {
  generateSpots,
  findNearestUnfoundSpot,
  resolveConditionByZone,
  ZONE_META,
  type AcneSpot,
  type SkinZone,
} from './MinigameCore/skinScanLogic';
import type { SkinCondition } from '../content/quiz';

// TODO(go-live): thay bằng ảnh chân dung da sạch có license thương mại.
const FACE_IMAGE_URL =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=560&fit=crop&crop=faces';

const SPOT_COUNT = 6;
const CATCH_RADIUS = 9; // theo % khung ảnh
const HINT_L1_MS = 5000; // sáng vùng sau ~5s không tiến triển
const HINT_L2_MS = 9000; // khoanh sát sau ~9s
const SAFETY_MS = 22000; // lưới an toàn: tự mở hết sau ~22s

export function SkinScanScreen({
  onComplete,
}: {
  onComplete: (result: SkinCondition, stats: { foundCount: number; zoneLabel: string }) => void;
}) {
  const [phase, setPhase] = useState<'find' | 'report'>('find');
  const foundCountRef = useRef(SPOT_COUNT);

  if (phase === 'find') {
    return (
      <FindGame
        onAllFound={(count) => {
          foundCountRef.current = count;
          setPhase('report');
        }}
      />
    );
  }

  return (
    <ReportStep
      onPick={(zone) => {
        const result = resolveConditionByZone(zone);
        onComplete(result, {
          foundCount: foundCountRef.current,
          zoneLabel: ZONE_META[zone].label,
        });
      }}
    />
  );
}

function FindGame({ onAllFound }: { onAllFound: (count: number) => void }) {
  const [spots, setSpots] = useState<AcneSpot[]>(() => generateSpots(SPOT_COUNT));
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const spotsRef = useRef(spots);
  spotsRef.current = spots;
  const lastFindRef = useRef(Date.now());
  const boardRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const foundCount = spots.filter((s) => s.found).length;
  const firstUnfound = spots.find((s) => !s.found) ?? null;

  function commit(next: AcneSpot[]) {
    spotsRef.current = next;
    setSpots(next);
    if (next.every((s) => s.found) && !doneRef.current) {
      doneRef.current = true;
      onAllFound(next.length);
    }
  }

  function handlePointer(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const hit = findNearestUnfoundSpot(spotsRef.current, x, y, CATCH_RADIUS);
    if (!hit) return;
    lastFindRef.current = Date.now();
    setHintLevel(0);
    commit(spotsRef.current.map((s) => (s.id === hit.id ? { ...s, found: true } : s)));
  }

  // Gợi ý tăng dần + lưới an toàn, tính theo thời gian kể từ lần khoanh trúng gần nhất.
  useEffect(() => {
    const timer = setInterval(() => {
      if (doneRef.current) return;
      const hasUnfound = spotsRef.current.some((s) => !s.found);
      if (!hasUnfound) return;
      const elapsed = Date.now() - lastFindRef.current;
      if (elapsed >= SAFETY_MS) {
        commit(spotsRef.current.map((s) => ({ ...s, found: true })));
        return;
      }
      if (elapsed >= HINT_L2_MS) setHintLevel(2);
      else if (elapsed >= HINT_L1_MS) setHintLevel(1);
      else setHintLevel(0);
    }, 500);
    return () => clearInterval(timer);
    // Deps intentionally empty: the effect reads only refs (spotsRef/lastFindRef/doneRef)
    // and stable setState setters, so it never needs to re-subscribe or re-close over state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PlayfulBackdrop>
      <div className="flex flex-col items-center md:flex-row md:items-center md:gap-10">
        <div style={frameStyle}>
        <div style={{ padding: '16px 18px 12px', color: '#fff' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.3px', opacity: 0.85 }}>
            SOI THỬ LÀN DA
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.35, marginTop: 4 }}>
            Chạm để khoanh hết các nốt mụn bạn thấy 👀
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.18)', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(foundCount / SPOT_COUNT) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg,#FF5C9E,#B39DFF)',
                  borderRadius: 99,
                  transition: 'width 300ms ease',
                }}
              />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFB8D4', whiteSpace: 'nowrap' }}>
              {foundCount} / {SPOT_COUNT} nốt
            </div>
          </div>
        </div>

        <ScanBoard
          boardRef={boardRef}
          spots={spots}
          hintLevel={hintLevel}
          firstUnfound={firstUnfound}
          onPointer={handlePointer}
        />

        <div style={{ padding: '12px 18px 16px', color: 'rgba(255,255,255,.7)', fontSize: 12, textAlign: 'center' }}>
          Đừng lo — nếu bí, tụi mình sẽ hé lộ giúp bạn 💡
        </div>
        </div>
        <PlayfulPanel foundCount={foundCount} />
      </div>
    </PlayfulBackdrop>
  );
}

// Khung ảnh tương tác — chứa ảnh khuôn mặt, các nốt mụn và lớp gợi ý.
function ScanBoard({
  boardRef,
  spots,
  hintLevel,
  firstUnfound,
  onPointer,
}: {
  boardRef: RefObject<HTMLDivElement | null>;
  spots: AcneSpot[];
  hintLevel: 0 | 1 | 2;
  firstUnfound: AcneSpot | null;
  onPointer: (clientX: number, clientY: number) => void;
}) {
  return (
    <div
      ref={boardRef}
      onPointerDown={(e) => onPointer(e.clientX, e.clientY)}
      onPointerMove={(e) => {
        if (e.buttons !== 1) return;
        onPointer(e.clientX, e.clientY);
      }}
      style={{ position: 'relative', width: '100%', height: 360, background: '#111', touchAction: 'none', userSelect: 'none' }}
    >
      <img
        src={FACE_IMAGE_URL}
        alt="Khuôn mặt để soi da"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {spots.map((s) =>
        s.found ? (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: 'translate(-50%,-50%)',
              width: 36,
              height: 36,
              border: '3px solid #FF5C9E',
              borderRadius: '50%',
              boxShadow: '0 0 0 4px rgba(255,92,158,.25)',
            }}
          >
            <div style={tickStyle}>✓</div>
          </div>
        ) : (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: 'translate(-50%,-50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, #E8806F, #C64B3C)',
              boxShadow: '0 1px 3px rgba(0,0,0,.3)',
            }}
          />
        )
      )}

      {/* Gợi ý cấp 1: sáng vùng */}
      {hintLevel >= 1 && firstUnfound && (
        <div
          className="acne-hint-glow"
          style={{ left: `${firstUnfound.x}%`, top: `${firstUnfound.y}%` }}
        />
      )}
      {/* Gợi ý cấp 2: khoanh sát */}
      {hintLevel >= 2 && firstUnfound && (
        <div
          className="acne-hint-ring"
          style={{ left: `${firstUnfound.x}%`, top: `${firstUnfound.y}%` }}
        />
      )}
    </div>
  );
}

// Nền pastel dùng chung cho cả hai màn: gradient + blob trôi nhẹ (reduced-motion tắt animation).
function PlayfulBackdrop({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-screen w-full relative flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg,#FDE7F1 0%,#EDE9FF 55%,#E4FBF1 100%)' }}
    >
      <span className="mg-blob" style={{ width: 220, height: 220, background: '#FFB8D4', left: -40, top: -30 }} />
      <span className="mg-blob" style={{ width: 180, height: 180, background: '#B39DFF', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob" style={{ width: 140, height: 140, background: '#8FE3BC', left: '12%', bottom: -30, animationDelay: '4s' }} />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  );
}

// Mascot "bạn nhỏ" SVG vẽ tay, dùng ở panel phải của FindGame trên desktop.
function Mascot() {
  return (
    <svg width="116" height="116" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="108" rx="30" ry="6" fill="#2D2640" opacity="0.06" />
      <path d="M32 60 Q32 26 60 26 Q88 26 88 60 L88 82 Q88 100 60 100 Q32 100 32 82 Z" fill="#B39DFF" />
      <circle cx="50" cy="62" r="6" fill="#2D2640" />
      <circle cx="72" cy="62" r="6" fill="#2D2640" />
      <circle cx="52" cy="60" r="2" fill="#fff" />
      <circle cx="74" cy="60" r="2" fill="#fff" />
      <path d="M52 76 Q60 84 68 76" stroke="#2D2640" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="74" r="5" fill="#FF9BC0" opacity="0.6" />
      <circle cx="80" cy="74" r="5" fill="#FF9BC0" opacity="0.6" />
      <path d="M60 16 l3.2 7.6 7.6 3.2 -7.6 3.2 -3.2 7.6 -3.2 -7.6 -7.6 -3.2 7.6 -3.2 z" fill="#FFCD78" />
    </svg>
  );
}

// Panel phải của FindGame — chỉ hiện từ breakpoint md trở lên.
function PlayfulPanel({ foundCount }: { foundCount: number }) {
  const remaining = SPOT_COUNT - foundCount;
  return (
    <div className="hidden md:flex flex-col gap-4 max-w-xs">
      <h2 className="text-3xl font-black text-cta leading-tight">
        Tìm hết các “bạn nhỏ” đang trốn nhé! 👀
      </h2>
      <p className="text-base text-cta/70">
        Chạm vào từng nốt trên mặt để khoanh chúng lại. Rê tay khắp vùng da nhé!
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-cta shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5C9E' }} />
          {foundCount} đã soi
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-sm font-bold text-cta/70 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-cta/30" />
          còn {remaining}
        </span>
      </div>
      <div className="mt-1"><Mascot /></div>
    </div>
  );
}

// Bản đồ khuôn mặt với 4 vùng tô màu theo ZONE_META — cột trái của ReportStep trên desktop.
function FaceMap({ className = '' }: { className?: string }) {
  const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
  return (
    <div className={`${className} flex-col items-center gap-3`}>
      <svg width="200" height="230" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bản đồ vùng da trên khuôn mặt">
        <path d="M46 100 Q46 46 100 46 Q154 46 154 100 Q154 172 100 196 Q46 172 46 100 Z" fill="#FBFDFF" stroke="#2D2640" strokeWidth="2.2" />
        <rect x="64" y="66" width="72" height="22" rx="11" fill="#FFCD78" opacity="0.5" />
        <rect x="92" y="88" width="16" height="40" rx="8" fill="#FFCD78" opacity="0.5" />
        <ellipse cx="70" cy="120" rx="15" ry="19" fill="#7DD9C0" opacity="0.5" />
        <ellipse cx="130" cy="120" rx="15" ry="19" fill="#7DD9C0" opacity="0.5" />
        <path d="M78 158 Q100 176 122 158 Q118 190 100 194 Q82 190 78 158 Z" fill="#FF5C9E" opacity="0.5" />
        <circle cx="82" cy="104" r="3" fill="#2D2640" />
        <circle cx="118" cy="104" r="3" fill="#2D2640" />
        <path d="M88 150 Q100 158 112 150" stroke="#2D2640" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <div className="flex flex-col gap-1.5 text-sm text-cta/80">
        {zones.map((z) => (
          <div key={z} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ZONE_META[z].color }} />
            <span>{ZONE_LABELS[z]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportStep({ onPick }: { onPick: (zone: SkinZone) => void }) {
  const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
  return (
    <PlayfulBackdrop>
      <div className="flex flex-col items-center md:flex-row md:items-center md:gap-10">
        <FaceMap className="hidden md:flex" />
        <div className="w-[330px] md:w-[440px] rounded-[28px] bg-[#2D2640] shadow-[0_18px_50px_rgba(45,38,64,0.35)] p-5 md:p-7">
          <div className="text-center text-white mb-4">
            <div className="text-[13px] font-bold tracking-wide" style={{ color: '#FFB8D4' }}>
              SOI XONG RỒI 🎉
            </div>
            <div className="text-lg md:text-xl font-extrabold leading-snug mt-1.5">
              Còn da của <u>bạn</u> thì hay “nổi loạn” nhất ở đâu?
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => onPick(zone)}
                style={zoneChipStyle}
              >
                <span style={{ width: 12, height: 12, borderRadius: '50%', flex: 'none', background: ZONE_META[zone].color }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>{ZONE_LABELS[zone]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PlayfulBackdrop>
  );
}

// Nhãn hiển thị đầy đủ cho nút chọn vùng (khác với ZONE_META.label ngắn dùng ở chip payoff).
const ZONE_LABELS: Record<SkinZone, string> = {
  'cam-quai-ham': 'Cằm & quai hàm',
  'chu-t': 'Vùng chữ T (trán, mũi)',
  'hai-ma': 'Hai má',
  'khong-bi': 'Gần như không bị',
};

const frameStyle: CSSProperties = {
  width: 330,
  borderRadius: 28,
  overflow: 'hidden',
  background: '#2D2640',
  boxShadow: '0 18px 50px rgba(45,38,64,0.35)',
};

const tickStyle: CSSProperties = {
  position: 'absolute',
  right: -6,
  top: -6,
  width: 18,
  height: 18,
  background: '#FF5C9E',
  borderRadius: '50%',
  color: '#fff',
  fontSize: 11,
  fontWeight: 900,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const zoneChipStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  borderRadius: 16,
  background: 'rgba(255,255,255,.08)',
  border: '2px solid rgba(255,255,255,.14)',
  color: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
};
