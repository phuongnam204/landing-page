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
    question: 'Sáng nay thức dậy, da bạn như thế nào?',
    options: [
      { label: 'Hơi khô, đôi khi bong tróc',           next: 'dry' },
      { label: 'Bình thường, không có gì đặc biệt',      next: 'normal' },
      { label: 'Hơi bóng ở vùng T, má thì ổn',           next: 'mild-oily' },
      { label: 'Rất bóng, kể cả hai má',                  next: 'heavy-oily' },
      { label: 'Vài chỗ da bị lõm, trông không đều',     next: 'skin-scar' },
    ],
  },
  'dry': {
    question: 'Da bạn còn hay gặp vấn đề gì nữa không?',
    options: [
      { label: 'Đỏ, ngứa', next: 'product-used' },
      { label: 'Nổi mụn ở cằm hoặc quanh miệng',          result: 'mun-noi-tiet' },
      { label: 'Chỉ khô căng, không kích ứng gì nhiều',   result: 'da-nhay-cam' },
    ],
  },

  'product-used': {
    question: 'Bạn có hay sử dụng các sản phẩm chăm sóc da không?',
    options: [
      { label: 'Có',    next: 'frequency' },
      { label: 'Không', result: 'da-nhay-cam' },
    ],
  },
  'frequency': {
    question: 'Tần suất sử dụng thế nào?',
    options: [
      { label: 'Khoảng 2–3 lần một ngày',                              result: 'da-nhay-cam-san-pham' },
      { label: 'Thường chỉ dùng sữa rửa mặt vào mỗi buổi sáng',       result: 'da-nhay-cam-san-pham' },
      { label: 'Rất ít khi dùng, khi nào cảm thấy da khô mới dùng',   result: 'da-nhay-cam' },
    ],
  },
  'normal': {
    question: 'Bạn có gặp vấn đề nào với da không?',
    options: [
      { label: 'Không, da đang khá ổn',                              result: 'clean-skin' },
      { label: 'Đôi khi nổi mụn',                                    next: 'normal-acne' },
      { label: 'Hay đỏ hoặc kích ứng với sản phẩm',                  result: 'da-nhay-cam-san-pham' },
      { label: 'Mới bắt đầu quan tâm, chưa hiểu da mình lắm',       result: 'da-moi-bat-dau' },
    ],
  },
  'normal-acne': {
    question: 'Mụn thường xuất hiện ở vùng nào?',
    options: [
      { label: 'Cằm và quanh miệng',        next: 'normal-acne-chin' },
      { label: 'Trán và mũi',               next: 'normal-acne-tzone' },
      { label: 'Hai má hoặc nhiều vùng',    next: 'normal-acne-cheek' },
    ],
  },
  'normal-acne-chin': {
    question: 'Mụn ở cằm có xu hướng như thế nào?',
    options: [
      { label: 'Nặng hơn trước kỳ kinh, sau đó tự bớt',    result: 'mun-noi-tiet' },
      { label: 'Sưng sâu dưới da, đau nhức khi chạm vào',  result: 'mun-noi-tiet' },
      { label: 'Nổi rải rác, không theo chu kỳ rõ ràng',   result: 'mun-trung-ca' },
    ],
  },
  'normal-acne-tzone': {
    question: 'Mụn ở trán và mũi chủ yếu là loại nào?',
    options: [
      { label: 'Mụn đầu đen, lỗ chân lông to rõ, ít sưng viêm', result: 'lo-chan-long' },
      { label: 'Mụn đỏ có mủ, thỉnh thoảng sưng đau',            result: 'mun-trung-ca' },
      { label: 'Cả đầu đen lẫn mụn đỏ xen kẽ',                   result: 'mun-trung-ca' },
    ],
  },
  'normal-acne-cheek': {
    question: 'Khi mụn ở má hết, da thường để lại gì?',
    options: [
      { label: 'Vết thâm đỏ hoặc nâu, lâu mờ',          result: 'da-mun-tham-seo' },
      { label: 'Da trở về bình thường, ít để lại dấu',   result: 'mun-trung-ca' },
      { label: 'Lỗ nhỏ lõm trên bề mặt da',              result: 'da-seo-ro' },
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
      { label: 'Cằm và quanh miệng',     next: 'normal-acne-chin' },
      { label: 'Trán và mũi',            next: 'normal-acne-tzone' },
      { label: 'Hai má hoặc nhiều vùng', next: 'normal-acne-cheek' },
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
      { label: 'Cằm và quanh miệng',              next: 'heavy-oily-acne-chin' },
      { label: 'Trán, mũi và mặt rất dầu',        next: 'heavy-oily-acne-tzone' },
      { label: 'Hai má hoặc rải rác nhiều vùng',  next: 'heavy-oily-acne-cheek' },
    ],
  },
  'heavy-oily-acne-chin': {
    question: 'Mụn ở cằm có xu hướng như thế nào?',
    options: [
      { label: 'Nặng hơn trước kỳ kinh, sau đó tự bớt',    result: 'mun-noi-tiet' },
      { label: 'Sưng sâu dưới da, đau nhức khi chạm vào',  result: 'mun-noi-tiet' },
      { label: 'Viêm đỏ liên tục, không theo chu kỳ',       result: 'da-nhon-mun-viem' },
    ],
  },
  'heavy-oily-acne-tzone': {
    question: 'Mụn ở trán và mũi trông như thế nào?',
    options: [
      { label: 'Chủ yếu đầu đen, lỗ chân lông rất to, ít sưng', result: 'lo-chan-long' },
      { label: 'Mụn đỏ viêm nhiều, mặt luôn bóng nhờn',          result: 'da-nhon-mun-viem' },
      { label: 'Cả tắc nghẽn lẫn viêm đỏ, rất khó kiểm soát',   result: 'da-nhon-mun-viem' },
    ],
  },
  'heavy-oily-acne-cheek': {
    question: 'Mụn ở má thường như thế nào?',
    options: [
      { label: 'Viêm đỏ liên tục, mặt bóng nhờn cả ở vùng má',  result: 'da-nhon-mun-viem' },
      { label: 'Mụn không nhiều nhưng hay để lại thâm hoặc sẹo', result: 'da-mun-tham-seo' },
      { label: 'Mụn vừa phải, lỗ chân lông to rõ',               result: 'mun-trung-ca' },
    ],
  },

  'skin-scar': {
    question: 'Trước đó bạn có thường xuyên nặn mụn không?',
    options: [
      { label: 'Có',                       result: 'da-seo-ro-nan-mun' },
      { label: 'Thi thoảng nặn do ngứa',  result: 'da-seo-ro-nan-mun' },
      { label: 'Gần như không',            result: 'da-seo-ro-khong-nan' },
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
        <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2 Skin Analyzer</div>
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
