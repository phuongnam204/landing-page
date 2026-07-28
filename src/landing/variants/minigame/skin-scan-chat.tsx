'use client';
import { useState, useEffect, useRef } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../slots';
import type { ConditionId } from '../../../content/quiz';
import { skinConditions } from '../../../content/quiz';

// ─── Decision tree ─────────────────────────────────────────────────────────────

type TreeNode = {
  question: string;
  options: Array<{
    label: string;
    next?: string;
    result?: ConditionId;
  }>;
};

const TREE: Record<string, TreeNode> = {
  'q1': {
    question: 'Buổi sáng thức dậy, da bạn thường như thế nào?',
    options: [
      { label: 'Khô căng, đôi khi bong tróc',           next: 'dry' },
      { label: 'Bình thường, không có gì đặc biệt',      next: 'normal' },
      { label: 'Hơi bóng ở vùng T, má thì ổn',           next: 'mild-oily' },
      { label: 'Rất bóng, kể cả hai má',                  next: 'heavy-oily' },
      { label: 'Vài chỗ da bị lõm, trông không đều',     result: 'da-seo-ro' },
    ],
  },
  'dry': {
    question: 'Da bạn hay gặp vấn đề gì?',
    options: [
      { label: 'Đỏ, ngứa, kích ứng dễ khi đổi sản phẩm', result: 'da-nhay-cam' },
      { label: 'Nổi mụn ở cằm hoặc quanh miệng',          result: 'mun-noi-tiet' },
      { label: 'Chỉ khô căng, không kích ứng gì nhiều',   result: 'da-nhay-cam' },
    ],
  },
  'normal': {
    question: 'Bạn có gặp vấn đề nào với da không?',
    options: [
      { label: 'Không, da đang khá ổn',                              result: 'clean-skin' },
      { label: 'Đôi khi nổi mụn',                                    next: 'normal-acne' },
      { label: 'Hay đỏ hoặc kích ứng với sản phẩm',                  result: 'da-nhay-cam' },
      { label: 'Mới bắt đầu quan tâm, chưa hiểu da mình lắm',       result: 'da-moi-bat-dau' },
    ],
  },
  'normal-acne': {
    question: 'Mụn thường xuất hiện ở vùng nào?',
    options: [
      { label: 'Cằm và quanh miệng',        result: 'mun-noi-tiet' },
      { label: 'Trán và mũi',               result: 'lo-chan-long' },
      { label: 'Hai má hoặc nhiều vùng',    result: 'mun-trung-ca' },
    ],
  },
  'mild-oily': {
    question: 'Bạn có nổi mụn không?',
    options: [
      { label: 'Có, mọc ở một vài vùng',                                   next: 'mild-oily-acne' },
      { label: 'Không, chủ yếu là bóng dầu và lỗ chân lông to',           result: 'lo-chan-long' },
    ],
  },
  'mild-oily-acne': {
    question: 'Mụn hay mọc ở đâu nhất?',
    options: [
      { label: 'Cằm và quanh miệng',     result: 'mun-noi-tiet' },
      { label: 'Trán và mũi',            result: 'lo-chan-long' },
      { label: 'Hai má hoặc nhiều vùng', result: 'mun-trung-ca' },
    ],
  },
  'heavy-oily': {
    question: 'Bạn có nổi mụn không?',
    options: [
      { label: 'Có',                                          next: 'heavy-oily-acne' },
      { label: 'Không, da chỉ rất bóng và lỗ chân lông to', result: 'lo-chan-long' },
    ],
  },
  'heavy-oily-acne': {
    question: 'Mụn chủ yếu xuất hiện ở đâu?',
    options: [
      { label: 'Cằm và quanh miệng',              result: 'mun-noi-tiet' },
      { label: 'Trán, mũi và mặt rất dầu',        result: 'da-nhon-mun-viem' },
      { label: 'Hai má hoặc rải rác nhiều vùng',  result: 'da-nhon-mun-viem' },
    ],
  },
};

// ─── Zone info per condition ────────────────────────────────────────────────────

const CONDITION_ZONE: Partial<Record<ConditionId, { zoneLabel: string; zoneIds: string[] }>> = {
  'mun-noi-tiet':    { zoneLabel: 'Cằm & quanh miệng',  zoneIds: ['chin'] },
  'lo-chan-long':    { zoneLabel: 'Vùng chữ T',          zoneIds: ['forehead', 'nose'] },
  'da-nhon-mun-viem':{ zoneLabel: 'Vùng T và má',        zoneIds: ['forehead', 'nose', 'left-cheek', 'right-cheek'] },
  'mun-trung-ca':    { zoneLabel: 'Hai má',              zoneIds: ['left-cheek', 'right-cheek'] },
};

// ─── Types ──────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'chatting' | 'analyzing';

// ─── Sub-components ─────────────────────────────────────────────────────────────

function ChatHeader({ depth }: { depth: number }) {
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
      {depth > 0 && (
        <div className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          Câu {depth}
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
        style={{ background: 'color-mix(in srgb, var(--lp-primary) 8%, white)', color: 'var(--lp-primary)', animation: 'msg-bot 300ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
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
        style={{ background: 'var(--lp-accent)', color: '#fff', animation: 'msg-user 300ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator({ analyzing }: { analyzing?: boolean }) {
  return (
    <div className="flex gap-2.5 items-end" style={{ animation: 'fade-quick 150ms ease-out both' }}>
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

// ─── Main export ───────────────────────────────────────────────────────────────

export function SkinScanChatMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase]           = useState<Phase>('intro');
  const [nodeId, setNodeId]         = useState<string>('q1');
  const [depth, setDepth]           = useState(0);
  const [showTyping, setShowTyping] = useState(true);

  const [messages, setMessages] = useState<Array<
    { type: 'bot'; text: string } | { type: 'user'; text: string }
  >>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, showTyping]);

  // Async intro: reveal opening message after delay
  useEffect(() => {
    const t = setTimeout(() => {
      setShowTyping(false);
      setMessages([{ type: 'bot', text: 'Cho mình hỏi vài câu nhanh để phân tích đúng tình trạng da của bạn nhé!' }]);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  function startChat() {
    setPhase('chatting');
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages(m => [...m, { type: 'bot', text: TREE['q1'].question }]);
      setNodeId('q1');
      setDepth(1);
    }, 700);
  }

  function handleOptionSelect(label: string, next?: string, result?: ConditionId) {
    setMessages(m => [...m, { type: 'user', text: label }]);
    setShowTyping(true);

    if (result) {
      setTimeout(() => {
        setShowTyping(false);
        setPhase('analyzing');
        setTimeout(() => {
          const condition = skinConditions[result]!;
          const zone = CONDITION_ZONE[result];
          const minigameResult: MinigameResult = {
            conditions: [condition],
            condition,
            zoneLabel: zone?.zoneLabel ?? '',
            zoneIds: zone?.zoneIds ?? [],
            triggerNote: '',
          };
          onComplete(minigameResult);
        }, 1000);
      }, 500);
      return;
    }

    if (next) {
      setTimeout(() => {
        setShowTyping(false);
        const nextNode = TREE[next];
        if (nextNode) {
          setMessages(m => [...m, { type: 'bot', text: nextNode.question }]);
          setNodeId(next);
          setDepth(d => d + 1);
        }
      }, 650);
    }
  }

  const currentNode = TREE[nodeId];
  const currentOptions =
    phase === 'intro'     ? null :
    phase === 'analyzing' ? null :
    currentNode?.options ?? null;

  return (
    <div
      className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)]"
      style={{ animation: 'chat-panel-enter 400ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
    >
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes msg-bot {
          from { opacity: 0; transform: translateY(10px) translateX(-6px); }
          to   { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes msg-user {
          from { opacity: 0; transform: translateY(10px) translateX(6px); }
          to   { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes chip-pop {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-quick {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes chat-panel-enter {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .skin-chip {
          transition: background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }
        .skin-chip:hover {
          background: color-mix(in srgb, var(--lp-accent) 15%, white) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--lp-accent) 22%, transparent);
        }
        .skin-chip:active {
          transform: scale(0.95) translateY(0);
          box-shadow: none;
        }
      `}</style>

      <ChatHeader depth={depth} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          msg.type === 'bot'
            ? <BotMessage key={i} text={msg.text} />
            : <UserMessage key={i} text={msg.text} />
        ))}
        {showTyping && <TypingIndicator analyzing={phase === 'analyzing'} />}
        <div ref={bottomRef} />
      </div>

      {/* Intro start button */}
      {phase === 'intro' && !showTyping && (
        <div className="px-4 pb-6 pt-3">
          <button
            onClick={startChat}
            className="skin-chip w-full px-4 py-3 rounded-full text-sm font-bold border"
            style={{
              borderColor: 'var(--lp-accent)',
              color: 'var(--lp-accent)',
              background: 'color-mix(in srgb, var(--lp-accent) 6%, white)',
              animation: 'chip-pop 240ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            Bắt đầu →
          </button>
        </div>
      )}

      {/* Answer options */}
      {currentOptions && (
        <div key={nodeId} className="px-4 pb-6 pt-3 flex flex-wrap gap-2">
          {currentOptions.map((opt, i) => (
            <button
              key={`${nodeId}-${i}`}
              onClick={() => handleOptionSelect(opt.label, opt.next, opt.result)}
              className="skin-chip px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: 'var(--lp-accent)',
                color: 'var(--lp-accent)',
                background: 'color-mix(in srgb, var(--lp-accent) 6%, white)',
                animation: `chip-pop 240ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 50}ms both`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
