'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import {
  generateSpots,
  findNearestUnfoundSpot,
  resolveProfileByZone,
  ZONE_META,
  type AcneSpot,
  type SkinZone,
} from './MinigameCore/skinScanLogic';
import type { QuizResult } from '../content/quiz';

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
  onComplete: (result: QuizResult, stats: { foundCount: number; zoneLabel: string }) => void;
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
        const result = resolveProfileByZone(zone);
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
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-4 overflow-hidden">
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
    </div>
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

function ReportStep({ onPick }: { onPick: (zone: SkinZone) => void }) {
  const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-4 overflow-hidden">
      <div style={{ ...frameStyle, padding: '20px 18px 22px' }}>
        <div style={{ textAlign: 'center', color: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.3px', color: '#FFB8D4' }}>
            SOI XONG RỒI 🎉
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.35, marginTop: 6 }}>
            Còn da của <u>bạn</u> thì hay “nổi loạn” nhất ở đâu?
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
