'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import type { ConditionId } from '../../../content/quiz';

// ─── Signal types ─────────────────────────────────────────────────────────────
type S1 = 'acne-chin' | 'oily-tzone' | 'scar-dark' | 'clean';
type S2 = 'hormonal' | 'diet' | 'unknown';
type S3 = 'oily-inflamed' | 'sensitive' | 'neutral';
type Phase = 'intro' | 'chatting' | 'analyzing';
type ActiveScene = 's1' | 's2' | 's3' | 's4' | null;

// ─── Condition resolution ─────────────────────────────────────────────────────
function resolveConditionId(s1: S1, s2: S2 | null, s3: S3 | null): ConditionId {
  if (s1 === 'clean')                                return 'clean-skin';
  if (s3 === 'sensitive')                            return 'da-nhay-cam';
  if (s1 === 'scar-dark')                            return 'da-seo-ro';
  if (s1 === 'acne-chin' && s2 === 'hormonal')       return 'mun-noi-tiet';
  if (s1 === 'acne-chin' && s2 === 'diet')           return 'da-nhon-mun-viem';
  if (s1 === 'acne-chin')                            return 'mun-trung-ca';
  if (s1 === 'oily-tzone' && s3 === 'oily-inflamed') return 'da-nhon-mun-viem';
  if (s1 === 'oily-tzone')                           return 'lo-chan-long';
  if (s3 === 'neutral')                              return 'clean-skin';
  return 'da-moi-bat-dau';
}

function resolveTriggerNote(s2: S2): string {
  if (s2 === 'hormonal') return 'Trigger chính: nội tiết / stress';
  if (s2 === 'diet')     return 'Trigger chính: chế độ ăn';
  return 'Trigger chưa xác định';
}

function resolveZone(s1: S1): { label: string; ids: string[] } {
  if (s1 === 'acne-chin')  return { label: 'vùng cằm', ids: ['chin-jaw'] };
  if (s1 === 'oily-tzone') return { label: 'vùng chữ T', ids: ['nose', 'forehead'] };
  return { label: '', ids: [] };
}

// ─── Scene icons ──────────────────────────────────────────────────────────────
function IconSunrise() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="21" r="7" fill="var(--lp-accent)" opacity="0.75" />
      <path d="M18 4v4M6 13l3 3M30 13l-3 3M2 21h4M30 21h4" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M4 29 Q11 22 18 29 Q25 36 32 29" stroke="var(--lp-primary)" strokeWidth="1.5" fill="none" opacity="0.15" />
    </svg>
  );
}

function IconThought() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <ellipse cx="18" cy="15" rx="12" ry="8" fill="var(--lp-accent)" opacity="0.15" stroke="var(--lp-accent)" strokeWidth="1.5" />
      <text x="18" y="19" textAnchor="middle" fontSize="12" fill="var(--lp-accent)" fontWeight="700">?</text>
      <circle cx="12" cy="26" r="2.5" fill="var(--lp-accent)" opacity="0.35" />
      <circle cx="8"  cy="32" r="1.5" fill="var(--lp-accent)" opacity="0.2" />
    </svg>
  );
}

function IconSunNoon() {
  const rays = [0, 60, 120, 180, 240, 300];
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="18" r="7"  fill="var(--lp-accent)" opacity="0.85" />
      <circle cx="18" cy="18" r="11" fill="var(--lp-accent)" opacity="0.1" />
      {rays.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={i}
            x1={18 + 13 * Math.cos(rad)} y1={18 + 13 * Math.sin(rad)}
            x2={18 + 17 * Math.cos(rad)} y2={18 + 17 * Math.sin(rad)}
            stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.55"
          />
        );
      })}
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path d="M22 6 A13 13 0 1 0 22 30 A9 9 0 1 1 22 6Z" fill="var(--lp-accent)" opacity="0.65" />
      <circle cx="28" cy="9"  r="1.5" fill="var(--lp-accent)" opacity="0.35" />
      <circle cx="31" cy="16" r="1"   fill="var(--lp-accent)" opacity="0.25" />
    </svg>
  );
}

// ─── Message types ────────────────────────────────────────────────────────────
type ChoiceItem = { id: string; label: string; continuation: string };
type Msg =
  | { kind: 'in';  id: number; iconKey: 1|2|3|4; text: string }
  | { kind: 'out'; id: number; text: string };
type MsgInput =
  | { kind: 'in';  iconKey: 1|2|3|4; text: string }
  | { kind: 'out'; text: string };

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-2 rounded-full"
          style={{
            width: i < completed ? 20 : 8,
            background: i < completed
              ? 'var(--lp-accent)'
              : 'color-mix(in srgb, var(--lp-accent) 25%, transparent)',
            transition: 'width 0.35s ease, background 0.35s ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── Chat avatar ──────────────────────────────────────────────────────────────
function ChatAvatar({ icon }: { icon: React.ReactNode }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center mt-0.5"
      style={{ background: 'color-mix(in srgb, var(--lp-accent) 15%, transparent)' }}
    >
      <div style={{ transform: 'scale(0.6)', transformOrigin: 'center' }}>{icon}</div>
    </div>
  );
}

// ─── Chat bubbles ─────────────────────────────────────────────────────────────
function IncomingBubble({ msg, icon }: { msg: Extract<Msg, { kind: 'in' }>; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 animate-fade-in-up">
      <ChatAvatar icon={icon} />
      <div className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'var(--lp-bg-card)' }}>
        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--lp-primary)' }}>
          {msg.text}
        </p>
      </div>
    </div>
  );
}

function OutgoingBubble({ msg }: { msg: Extract<Msg, { kind: 'out' }> }) {
  return (
    <div className="flex justify-end animate-fade-in-up">
      <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-semibold text-white" style={{ background: 'var(--lp-accent)' }}>
        {msg.text}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 animate-fade-in-up">
      <ChatAvatar icon={icon} />
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5" style={{ background: 'var(--lp-bg-card)' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--lp-accent)', animationDelay: `${i * 0.2}s`, animationDuration: '0.8s' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Intro screen ─────────────────────────────────────────────────────────────
function IntroScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-7 px-7 text-center animate-fade-in-up">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--lp-accent) 14%, transparent)' }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <rect x="5" y="3" width="18" height="22" rx="3" stroke="var(--lp-accent)" strokeWidth="1.8" fill="none" />
          <path d="M9 10H19M9 14H16M9 18H13" stroke="var(--lp-accent)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-2.5 max-w-xs">
        <p className="font-extrabold text-xl text-cta leading-snug">
          Hãy cùng nhìn lại một ngày bình thường của bạn
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
          Đôi khi câu trả lời nằm ngay ở đó — không cần xét nghiệm, không cần phán đoán.
        </p>
      </div>
      <button
        onClick={onBegin}
        className="bg-cta text-white font-bold py-3.5 px-8 rounded-soft text-sm hover:opacity-90 transition-opacity"
      >
        Bắt đầu &#8594;
      </button>
    </div>
  );
}

// ─── Analyzing screen ─────────────────────────────────────────────────────────
function AnalyzingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in-up">
      <p className="font-extrabold text-xl text-cta">Đang phân tích da của bạn...</p>
      <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
        Chỉ mất vài giây
      </p>
      <div className="flex items-center gap-2 mt-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              background:        'var(--lp-accent)',
              animationDelay:    `${i * 0.2}s`,
              animationDuration: '0.9s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Scene data ───────────────────────────────────────────────────────────────
const S1_CHOICES: ChoiceItem[] = [
  { id: 'acne-chin',  label: 'Thấy 2-3 nốt đỏ mới trên cằm',                 continuation: 'Không phải lần đầu. Bạn thoa nhẹ kem chấm mụn lên, tự nhủ hôm nay cố đừng đụng vào.' },
  { id: 'oily-tzone', label: 'Vùng mũi-trán bóng nhớn, lỗ chân lông hơi rõ', continuation: 'Bạn rửa mặt thêm một lần nữa. Sạch — nhưng biết đến trưa mọi thứ sẽ quay lại.' },
  { id: 'scar-dark',  label: 'Mụn đã đỡ, nhưng vết thâm và sẹo vẫn còn',    continuation: 'Mụn đã đi. Nhưng những vết đó thì chưa. Bạn nhìn một lúc rồi thôi — còn phải đi làm.' },
  { id: 'clean',      label: 'Da nhìn ổn, không có gì đặc biệt',              continuation: 'Hôm nay da ổn. Bạn hài lòng — nhưng vẫn tự hỏi liệu mình có đang chăm sóc đúng cách không, và điều đó có đủ không.' },
];

const S2_CHOICES: ChoiceItem[] = [
  { id: 'hormonal', label: 'Đúng trước kỳ kinh, hoặc khi deadline kéo dài',  continuation: 'Như đồng hồ sinh học. Cứ căng thẳng là biết chắc sẽ có khách không mời.' },
  { id: 'diet',     label: 'Sau mấy ngày ăn nhiều đồ ngọt hoặc đồ chiên',   continuation: 'Bạn đã test điều này nhiều lần rồi — ăn gì là da trả lời bằng mụn.' },
  { id: 'unknown',  label: 'Không rõ, mụn cứ mọc không theo quy luật gì',   continuation: 'Không đoán được — đó mới là phần khó chịu nhất.' },
];

const S3_CHOICES: ChoiceItem[] = [
  { id: 'oily-inflamed', label: 'Mặt đã bóng, vùng cằm bắt đầu ửng đỏ hơn', continuation: 'Mới sáng còn ổn. Buổi trưa đã thế này. Bạn lấy giấy thấm dầu ra.' },
  { id: 'sensitive',     label: 'Má hơi đỏ sau khi ra nắng lúc ăn trưa',     continuation: 'Da bạn phản ứng nhanh với nắng và nhiệt hơn người khác — điều đó bạn đã biết từ lâu.' },
  { id: 'neutral',       label: 'Da vẫn ổn, chưa có gì thay đổi nhiều',       continuation: 'Hôm nay có vẻ ổn. Nhưng bạn vẫn e ngại — không biết khi nào thì bùng lại.' },
];

const S4_CHOICES: ChoiceItem[] = [
  { id: 'full-routine', label: 'Tẩy trang + rửa mặt + dưỡng đủ bước',        continuation: 'Bạn chăm da như một thói quen tự nhiên. Nếu còn mụn — thì không phải do lười.' },
  { id: 'rinse-only',   label: 'Chỉ rửa mặt cho xong rồi lên giường',         continuation: 'Đủ sức đến đó là tốt lắm rồi. Nhưng da thì cần nhiều hơn thế một chút.' },
  { id: 'skip',         label: 'Mệt quá, nằm xuống và ngủ luôn',              continuation: 'Ai cũng có những ngày như vậy. Da thì ghi chép lại tất cả.' },
];

// ─── Scene config ─────────────────────────────────────────────────────────────
const SCENES = {
  s1: { iconKey: 1 as const, narrative: '07:00 Sáng — Bạn vào nhà vệ sinh, soi gương trước khi ra ngoài...', choices: S1_CHOICES },
  s2: { iconKey: 2 as const, narrative: 'Nhìn lại — mụn của bạn thường bùng sau chuyện gì?', choices: S2_CHOICES },
  s3: { iconKey: 3 as const, narrative: '12:00 Trưa — Giữa ca làm, bạn vô tình nhìn qua gương điện thoại...', choices: S3_CHOICES },
  s4: { iconKey: 4 as const, narrative: 'Tối — Cuối ngày, trước khi ngủ...', choices: S4_CHOICES },
} satisfies Record<NonNullable<ActiveScene>, { iconKey: 1|2|3|4; narrative: string; choices: ChoiceItem[] }>;

const ICON_MAP: Record<1|2|3|4, React.ReactNode> = {
  1: <IconSunrise />, 2: <IconThought />, 3: <IconSunNoon />, 4: <IconMoon />,
};

// ─── Main export ──────────────────────────────────────────────────────────────
export function StoryDayMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase]               = useState<Phase>('intro');
  const [messages, setMessages]         = useState<Msg[]>([]);
  const [activeScene, setActiveScene]   = useState<ActiveScene>(null);
  const [typing, setTyping]             = useState<(1|2|3|4) | null>(null);
  const [completedScenes, setCompleted] = useState(0);
  const [locked, setLocked]             = useState(false);
  const [cleanPath, setCleanPath]       = useState(false);
  const threadRef                       = useRef<HTMLDivElement>(null);
  const idRef                           = useRef(0);

  // Captured signals — use refs so they're available inside setTimeout closures
  const sig1Ref = useRef<S1 | null>(null);
  const sig2Ref = useRef<S2 | null>(null);
  const sig3Ref = useRef<S3 | null>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function push(msg: MsgInput) {
    setMessages(prev => [...prev, { ...msg, id: ++idRef.current } as Msg]);
  }

  function beginChat() {
    setPhase('chatting');
    const sc = SCENES.s1;
    push({ kind: 'in', iconKey: sc.iconKey, text: sc.narrative });
    setActiveScene('s1');
  }

  function handlePick(scene: NonNullable<ActiveScene>, choice: ChoiceItem) {
    if (locked) return;
    setLocked(true);
    setActiveScene(null);

    // Store signal immediately via ref (available inside all closures below)
    const isCleanChoice = scene === 's1' && choice.id === 'clean';
    if (scene === 's1') { sig1Ref.current = choice.id as S1; if (isCleanChoice) setCleanPath(true); }
    if (scene === 's2') sig2Ref.current = choice.id as S2;
    if (scene === 's3') sig3Ref.current = choice.id as S3;

    const sc = SCENES[scene];

    // Outgoing bubble immediately
    push({ kind: 'out', text: choice.label });
    setCompleted(p => p + 1);

    // Typing indicator → continuation bubble
    setTimeout(() => {
      setTyping(sc.iconKey);
      setTimeout(() => {
        setTyping(null);
        push({ kind: 'in', iconKey: sc.iconKey, text: choice.continuation });

        if (scene === 's4') {
          // All done — fire analyzing
          setPhase('analyzing');
          setTimeout(() => {
            const s1 = sig1Ref.current!;
            const s2 = sig2Ref.current;
            const s3 = sig3Ref.current;
            const condId    = resolveConditionId(s1, s2, s3);
            const condition = skinConditions[condId] ?? skinConditions['da-moi-bat-dau'];
            if (!condition) return;
            const zone = resolveZone(s1);
            onComplete({ conditions: [condition], condition, zoneLabel: zone.label, zoneIds: zone.ids, triggerNote: resolveTriggerNote(s2 ?? 'unknown') });
          }, 1500);
          return;
        }

        // Next scene — clean path skips s2 and s3, jumps straight to s4
        const nextKey = isCleanChoice ? 's4' : scene === 's1' ? 's2' : scene === 's2' ? 's3' : 's4';
        const next = SCENES[nextKey];
        setTimeout(() => {
          setTyping(next.iconKey);
          setTimeout(() => {
            setTyping(null);
            push({ kind: 'in', iconKey: next.iconKey, text: next.narrative });
            setActiveScene(nextKey);
            setLocked(false);
          }, 500);
        }, 300);
      }, 500);
    }, 300);
  }

  const activeChoices = activeScene ? SCENES[activeScene].choices : [];

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex flex-col overflow-hidden">

      {phase === 'intro' && <IntroScreen onBegin={beginChat} />}

      {phase === 'chatting' && (
        <>
          {/* Progress header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
            <ProgressDots completed={completedScenes} total={cleanPath ? 2 : 4} />
            <span className="text-xs font-bold" style={{ color: 'color-mix(in srgb, var(--lp-accent) 55%, transparent)' }}>
              {completedScenes} / {cleanPath ? 2 : 4}
            </span>
          </div>

          {/* Scrollable thread */}
          <div ref={threadRef} className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {messages.map(msg =>
              msg.kind === 'in'
                ? <IncomingBubble key={msg.id} msg={msg} icon={ICON_MAP[msg.iconKey]} />
                : <OutgoingBubble key={msg.id} msg={msg} />
            )}
            {typing !== null && <TypingIndicator icon={ICON_MAP[typing]} />}
            {/* Scroll anchor */}
            <div />
          </div>

          {/* Quick replies pinned at bottom */}
          {activeChoices.length > 0 && (
            <div
              className="flex-shrink-0 px-5 pt-2 pb-5 flex flex-col gap-2"
              style={{ borderTop: '1px solid color-mix(in srgb, var(--lp-accent) 10%, transparent)' }}
            >
              {activeChoices.map(c => (
                <button
                  key={c.id}
                  onClick={() => handlePick(activeScene!, c)}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm font-medium text-left w-full"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--lp-accent) 45%, transparent)',
                    color: 'var(--lp-primary)',
                    background: 'color-mix(in srgb, var(--lp-bg-card) 70%, transparent)',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <span>{c.label}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="var(--lp-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {phase === 'analyzing' && <AnalyzingScreen />}
    </div>
  );
}
