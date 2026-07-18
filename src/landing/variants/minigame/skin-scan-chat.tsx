'use client';
import { useState, useEffect, useRef } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../slots';
import type { ConditionId } from '../../../content/quiz';
import { skinConditions } from '../../../content/quiz';

// ─── Types ─────────────────────────────────────────────────────────────────

type S1 = 'dry' | 'normal' | 'oily-mild' | 'oily-heavy';
type S2 = 'chin-hormonal' | 'tzone' | 'cheeks' | 'no-acne';
type S3 = 'stable' | 'sensitive-mild' | 'sensitive-strong' | 'scar-dark';

type Phase = 'intro' | 'chatting' | 'analyzing';

// ─── Decision tree ─────────────────────────────────────────────────────────

function resolveConditionId(s1: S1, s2: S2, s3: S3): ConditionId {
  if (s3 === 'scar-dark')                     return 'da-seo-ro';
  if (s2 === 'chin-hormonal')                 return 'mun-noi-tiet';
  if (s3 === 'sensitive-strong')              return 'da-nhay-cam';
  if (s1 === 'oily-heavy' && s2 === 'tzone')  return 'da-nhon-mun-viem';
  if (s2 === 'tzone')                         return 'lo-chan-long';
  if (s1 === 'dry')                            return 'da-nhay-cam';
  if (s3 === 'sensitive-mild')                return 'da-nhay-cam';
  if (s2 === 'no-acne' && s1 === 'normal')    return 'clean-skin';
  if (s2 === 'cheeks')                        return 'mun-trung-ca';
  return 'da-moi-bat-dau';
}

// ─── Constants ─────────────────────────────────────────────────────────────

const ZONE_IDS: Record<S2, string[]> = {
  'chin-hormonal': ['chin'],
  'tzone':         ['forehead', 'nose'],
  'cheeks':        ['left-cheek', 'right-cheek'],
  'no-acne':       [],
};

const ZONE_LABEL: Record<S2, string> = {
  'chin-hormonal': 'Cằm & quanh miệng',
  'tzone':         'Vùng chữ T',
  'cheeks':        'Hai má',
  'no-acne':       'Không có vùng cụ thể',
};

const TRIGGER_NOTE: Record<S3, string> = {
  'stable':           'da ổn định',
  'sensitive-mild':   'nhạy cảm nhẹ',
  'sensitive-strong': 'kích ứng rõ',
  'scar-dark':        'sẹo rỗ / thâm mụn',
};

const Q1_TEXT = 'Buổi sáng thức dậy, da bạn thường như thế nào?';
const Q2_TEXT = 'Mụn hay xuất hiện ở đâu nhất?';
const Q3_TEXT = 'Da bạn có biểu hiện nào không?';

// ─── Sub-components ────────────────────────────────────────────────────────

function ChatHeader({ step, phase }: { step: 1 | 2 | 3; phase: Phase }) {
  const counter = phase === 'intro' || phase === 'analyzing' ? null : `${step} / 3`;
  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
      style={{ background: 'var(--lp-bg-hero)', borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)' }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lp-primary)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin Analyzer</div>
        <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>Phân tích vùng da</div>
      </div>
      {counter && (
        <div className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          {counter}
        </div>
      )}
    </div>
  );
}

function BotMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--lp-primary)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
      <div
        className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed"
        style={{ background: 'color-mix(in srgb, var(--lp-primary) 8%, white)', color: 'var(--lp-primary)' }}
      >
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[70%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed font-medium"
        style={{ background: 'var(--lp-accent)', color: '#fff' }}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator({ analyzing }: { analyzing?: boolean }) {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--lp-primary)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2"
        style={{ background: 'color-mix(in srgb, var(--lp-primary) 8%, white)' }}
      >
        {analyzing && (
          <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
            Đang phân tích...
          </span>
        )}
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--lp-primary)',
                opacity: 0.4,
                animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chips config ──────────────────────────────────────────────────────────

const CHIPS_MAP = {
  intro: [{ label: 'Bắt đầu →', signal: 'start', type: 'start' as const }],
  q1: [
    { label: 'Khô căng, thỉnh thoảng bong tróc', signal: 'dry',        type: 'q1' as const },
    { label: 'Bình thường, không có gì đặc biệt', signal: 'normal',     type: 'q1' as const },
    { label: 'Bóng dầu nhẹ ở vùng T-zone',        signal: 'oily-mild',  type: 'q1' as const },
    { label: 'Rất bóng, đặc biệt trán và mũi',    signal: 'oily-heavy', type: 'q1' as const },
  ],
  q2: [
    { label: 'Cằm và quanh miệng',     signal: 'chin-hormonal', type: 'q2' as const },
    { label: 'Trán, mũi, chữ T',       signal: 'tzone',         type: 'q2' as const },
    { label: 'Hai má hoặc khắp mặt',   signal: 'cheeks',        type: 'q2' as const },
    { label: 'Hầu như không bị mụn',   signal: 'no-acne',       type: 'q2' as const },
  ],
  q3: [
    { label: 'Không, da khá ổn định',                    signal: 'stable',           type: 'q3' as const },
    { label: 'Đôi khi đỏ ngứa khi dùng sản phẩm mới',   signal: 'sensitive-mild',   type: 'q3' as const },
    { label: 'Hay kích ứng, rát, đỏ rõ',                 signal: 'sensitive-strong', type: 'q3' as const },
    { label: 'Đang có sẹo rỗ hoặc thâm mụn',             signal: 'scar-dark',        type: 'q3' as const },
  ],
} as const;

// ─── Main export ───────────────────────────────────────────────────────────

export function SkinScanChatMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase]       = useState<Phase>('intro');
  const [step, setStep]         = useState<1 | 2 | 3>(1);
  const [showTyping, setShowTyping] = useState(false);

  const s1Ref = useRef<S1 | null>(null);
  const s2Ref = useRef<S2 | null>(null);
  const s3Ref = useRef<S3 | null>(null);

  const [messages, setMessages] = useState<Array<
    { type: 'bot'; text: string } | { type: 'user'; text: string; signal: string }
  >>([{ type: 'bot', text: 'Cho mình hỏi 3 câu nhanh để phân tích đúng tình trạng da của bạn nhé!' }]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, showTyping]);

  function handleChipSelect(label: string, signal: string, signalType: 'start' | 'q1' | 'q2' | 'q3') {
    if (signalType === 'start') {
      setMessages(m => [...m, { type: 'bot', text: Q1_TEXT }]);
      setPhase('chatting');
      setStep(1);
      return;
    }

    setMessages(m => [...m, { type: 'user', text: label, signal }]);
    setShowTyping(true);

    if (signalType === 'q1') { s1Ref.current = signal as S1; }
    if (signalType === 'q2') { s2Ref.current = signal as S2; }
    if (signalType === 'q3') {
      s3Ref.current = signal as S3;
      setTimeout(() => {
        setShowTyping(false);
        setPhase('analyzing');
        setTimeout(() => {
          const s1 = s1Ref.current!;
          const s2 = s2Ref.current!;
          const s3 = s3Ref.current!;
          const conditionId = resolveConditionId(s1, s2, s3);
          const condition = skinConditions[conditionId]!;
          const result: MinigameResult = {
            conditions: [condition],
            condition,
            zoneLabel: ZONE_LABEL[s2],
            zoneIds: ZONE_IDS[s2],
            triggerNote: TRIGGER_NOTE[s3],
          };
          onComplete(result);
        }, 1000);
      }, 400);
      return;
    }

    setTimeout(() => {
      setShowTyping(false);
      if (signalType === 'q1') {
        setMessages(m => [...m, { type: 'bot', text: Q2_TEXT }]);
        setStep(2);
      } else if (signalType === 'q2') {
        setMessages(m => [...m, { type: 'bot', text: Q3_TEXT }]);
        setStep(3);
      }
    }, 400);
  }

  const currentChips =
    phase === 'intro'     ? CHIPS_MAP.intro :
    phase === 'analyzing' ? [] :
    step === 1            ? CHIPS_MAP.q1 :
    step === 2            ? CHIPS_MAP.q2 :
                            CHIPS_MAP.q3;

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)]">
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      <ChatHeader step={step} phase={phase} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          msg.type === 'bot'
            ? <BotMessage key={i} text={msg.text} />
            : <UserMessage key={i} text={msg.text} />
        ))}
        {showTyping && <TypingIndicator analyzing={phase === 'analyzing'} />}
        <div ref={bottomRef} />
      </div>

      {currentChips.length > 0 && (
        <div className="px-4 pb-6 pt-3 flex flex-wrap gap-2">
          {currentChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleChipSelect(chip.label, chip.signal, chip.type)}
              className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 active:scale-95"
              style={{
                borderColor: 'var(--lp-accent)',
                color: 'var(--lp-accent)',
                background: 'color-mix(in srgb, var(--lp-accent) 6%, white)',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
