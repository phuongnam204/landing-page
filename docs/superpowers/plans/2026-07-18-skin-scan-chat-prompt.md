# Opencode Prompt — Skin Scan Chat Minigame

> Prompt bàn giao đầy đủ cho opencode. Copy toàn bộ phần dưới dấu `---`.

---

## Task

Tạo file mới `src/landing/variants/minigame/skin-scan-chat.tsx` — một minigame conversational chat hỏi 3 câu để phân tích tình trạng da, sau đó gọi `onComplete()` với `MinigameResult`.

Sau đó cập nhật `src/landing/variants/minigame/electric/light-pop.tsx` để dùng component mới này thay vì `FaceMapMinigame`.

## Stack

- Next.js 15 App Router, `'use client'` bắt buộc ở dòng đầu mỗi file
- TypeScript strict
- Tailwind CSS v3 + inline `style={}` cho dynamic values
- CSS custom properties: `--lp-primary`, `--lp-accent`, `--lp-bg-hero`, `--lp-bg-payoff`
- Tailwind aliases: `cta` = `var(--lp-primary)`, `accent` = `var(--lp-accent)`, `rounded-soft` = `var(--lp-radius-card)`

---

## Files cần tạo / sửa

### 1. Tạo mới: `src/landing/variants/minigame/skin-scan-chat.tsx`

Export: `SkinScanChatMinigame` — implement `MinigameSlotProps`.

### 2. Sửa: `src/landing/variants/minigame/electric/light-pop.tsx`

Nội dung hiện tại:
```tsx
'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function ElectricLightPopMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh]">
      <FaceMapMinigame {...props} />
    </div>
  );
}
```

Sau khi sửa, import `SkinScanChatMinigame` và render trực tiếp (bỏ div wrapper):
```tsx
'use client';
import type { MinigameSlotProps } from '../../../slots';
import { SkinScanChatMinigame } from '../skin-scan-chat';

export function ElectricLightPopMinigame(props: MinigameSlotProps) {
  return <SkinScanChatMinigame {...props} />;
}
```

---

## Types (không sửa các file này)

**`src/landing/slots.ts`:**
```ts
export type MinigameResult = {
  conditions: SkinCondition[];
  condition: SkinCondition;
  zoneLabel: string;
  zoneIds: string[];
  triggerNote: string;
};

export type MinigameSlotProps = {
  onComplete: (result: MinigameResult) => void;
};
```

**`src/content/quiz.ts`** (chỉ dùng những gì cần, import đúng):
```ts
export type ConditionId =
  | 'mun-noi-tiet' | 'mun-trung-ca' | 'da-nhon-mun-viem'
  | 'da-nhay-cam'  | 'lo-chan-long'  | 'da-seo-ro'
  | 'clean-skin'   | 'da-moi-bat-dau'
  // ... (còn nhiều ID khác nhưng không dùng trong minigame này)

export interface SkinCondition {
  id: ConditionId;
  label?: string;
  tone: 'positive' | 'concern';
  body?: string;
  bridge?: string;
  color: string;
}

export const skinConditions: Partial<Record<ConditionId, SkinCondition>> = {
  'mun-noi-tiet':    { id: 'mun-noi-tiet',    tone: 'concern',  color: '#FF5C9E', label: 'Mụn nội tiết', ... },
  'da-nhon-mun-viem':{ id: 'da-nhon-mun-viem', tone: 'concern',  color: '#FFCD78', label: 'Da nhờn + mụn viêm', ... },
  'da-nhay-cam':     { id: 'da-nhay-cam',      tone: 'concern',  color: '#7DD9C0', label: 'Da nhạy cảm', ... },
  'lo-chan-long':    { id: 'lo-chan-long',      tone: 'concern',  color: '#8B6BFF', label: 'Lỗ chân lông to', ... },
  'da-seo-ro':       { id: 'da-seo-ro',        tone: 'concern',  color: '#9C7A5F', label: 'Sẹo rỗ', ... },
  'mun-trung-ca':    { id: 'mun-trung-ca',     tone: 'concern',  color: '#FF6B35', label: 'Mụn trứng cá', ... },
  'clean-skin':      { id: 'clean-skin',       tone: 'positive', color: '#B39DFF', label: 'Da ổn định', ... },
  'da-moi-bat-dau':  { id: 'da-moi-bat-dau',  tone: 'positive', color: '#A0AEC0', label: 'Chưa có routine', ... },
};
```

Import trong file mới: `import { skinConditions } from '../../../content/quiz';`  
Lookup: `skinConditions[conditionId]!` — luôn có giá trị cho 8 ID được dùng.

---

## Game Logic

### Signal types

```ts
type S1 = 'dry' | 'normal' | 'oily-mild' | 'oily-heavy';
type S2 = 'chin-hormonal' | 'tzone' | 'cheeks' | 'no-acne';
type S3 = 'stable' | 'sensitive-mild' | 'sensitive-strong' | 'scar-dark';
```

### Decision tree — resolveConditionId(s1, s2, s3)

Top-down, rule đầu tiên match thắng:

```ts
function resolveConditionId(s1: S1, s2: S2, s3: S3): ConditionId {
  if (s3 === 'scar-dark')                           return 'da-seo-ro';
  if (s2 === 'chin-hormonal')                       return 'mun-noi-tiet';
  if (s3 === 'sensitive-strong')                    return 'da-nhay-cam';
  if (s1 === 'oily-heavy' && s2 === 'tzone')        return 'da-nhon-mun-viem';
  if (s2 === 'tzone')                               return 'lo-chan-long';
  if (s1 === 'dry')                                 return 'da-nhay-cam';
  if (s3 === 'sensitive-mild')                      return 'da-nhay-cam';
  if (s2 === 'no-acne' && s1 === 'normal')          return 'clean-skin';
  if (s2 === 'cheeks')                              return 'mun-trung-ca';
  return 'da-moi-bat-dau';
}
```

### MinigameResult construction

```ts
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

// Khi gọi onComplete:
const conditionId = resolveConditionId(s1, s2, s3);
const condition   = skinConditions[conditionId]!;
onComplete({
  conditions: [condition],
  condition,
  zoneLabel:   ZONE_LABEL[s2],
  zoneIds:     ZONE_IDS[s2],
  triggerNote: TRIGGER_NOTE[s3],
});
```

---

## Questions & Chips

**Q1** — "Buổi sáng thức dậy, da bạn thường như thế nào?"

| Label chip | Signal S1 |
|---|---|
| Khô căng, thỉnh thoảng bong tróc | `dry` |
| Bình thường, không có gì đặc biệt | `normal` |
| Bóng dầu nhẹ ở vùng T-zone | `oily-mild` |
| Rất bóng, đặc biệt trán và mũi | `oily-heavy` |

**Q2** — "Mụn hay xuất hiện ở đâu nhất?"

| Label chip | Signal S2 |
|---|---|
| Cằm và quanh miệng | `chin-hormonal` |
| Trán, mũi, chữ T | `tzone` |
| Hai má hoặc khắp mặt | `cheeks` |
| Hầu như không bị mụn | `no-acne` |

**Q3** — "Da bạn có biểu hiện nào không?"

| Label chip | Signal S3 |
|---|---|
| Không, da khá ổn định | `stable` |
| Đôi khi đỏ ngứa khi dùng sản phẩm mới | `sensitive-mild` |
| Hay kích ứng, rát, đỏ rõ | `sensitive-strong` |
| Đang có sẹo rỗ hoặc thâm mụn | `scar-dark` |

---

## UX Flow

```
Phase "intro"
  Bot bubble: "Cho mình hỏi 3 câu nhanh để phân tích đúng tình trạng da của bạn nhé!"
  Chip: ["Bắt đầu →"]
  User chọn → Phase "chatting", step = 1

Phase "chatting", step 1
  Header counter: "1 / 3"
  Bot bubble: câu Q1
  Chips: 4 options S1
  User chọn chip → lưu s1, chip highlight + disabled, typing indicator 400ms → step 2

Phase "chatting", step 2
  Header counter: "2 / 3"
  Bot bubble: câu Q2
  Chips: 4 options S2
  User chọn → lưu s2, typing indicator 400ms → step 3

Phase "chatting", step 3
  Header counter: "3 / 3"
  Bot bubble: câu Q3
  Chips: 4 options S3
  User chọn → lưu s3, Phase "analyzing"

Phase "analyzing"
  Typing indicator chạy 1000ms với text nhỏ "Đang phân tích..."
  Sau 1000ms: gọi onComplete(result)
```

Không có màn hình kết quả trong chat — payoff xử lý toàn bộ phần đó.

---

## Component Structure

```
SkinScanChatMinigame                 h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)]
  ├── ChatHeader                     sticky top-0, brand + counter
  ├── ChatMessages                   flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3
  │   ├── BotMessage(text)           avatar circle + bubble (bg nhạt, rounded right)
  │   ├── UserMessage(text)          bubble right-aligned (bg accent nhạt)
  │   └── TypingIndicator            3 dots pulse, hiện khi đang "gõ"
  └── ChipRow                        px-4 pb-6 pt-3 flex flex-wrap gap-2
                                     (ẩn khi phase = "analyzing" hoặc không có chips)
```

---

## State

```ts
type Phase = 'intro' | 'chatting' | 'analyzing';

const [phase, setPhase]       = useState<Phase>('intro');
const [step, setStep]         = useState<1 | 2 | 3>(1);        // Q1/Q2/Q3
const [showTyping, setShowTyping] = useState(false);

// Signals — null cho đến khi được chọn
const s1Ref = useRef<S1 | null>(null);
const s2Ref = useRef<S2 | null>(null);
const s3Ref = useRef<S3 | null>(null);

// History để render lại toàn bộ conversation
const [messages, setMessages] = useState<Array<
  | { type: 'bot'; text: string }
  | { type: 'user'; text: string; signal: string }
>>([{ type: 'bot', text: 'Cho mình hỏi 3 câu nhanh để phân tích đúng tình trạng da của bạn nhé!' }]);

// Ref để auto-scroll to bottom
const bottomRef = useRef<HTMLDivElement>(null);
useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, showTyping]);
```

### handleChipSelect(label, signal, signalType)

```ts
function handleChipSelect(label: string, signal: string, signalType: 'start' | 'q1' | 'q2' | 'q3') {
  if (signalType === 'start') {
    // Thêm bot message Q1
    setMessages(m => [...m, { type: 'bot', text: Q1_TEXT }]);
    setPhase('chatting');
    setStep(1);
    return;
  }

  // Thêm user message vào history
  setMessages(m => [...m, { type: 'user', text: label, signal }]);
  setShowTyping(true);

  if (signalType === 'q1') { s1Ref.current = signal as S1; }
  if (signalType === 'q2') { s2Ref.current = signal as S2; }
  if (signalType === 'q3') {
    s3Ref.current = signal as S3;
    // Phase analyzing
    setTimeout(() => {
      setShowTyping(false);
      setPhase('analyzing');
      setTimeout(() => {
        const s1 = s1Ref.current!;
        const s2 = s2Ref.current!;
        const s3 = s3Ref.current!;
        const conditionId = resolveConditionId(s1, s2, s3);
        const condition   = skinConditions[conditionId]!;
        onComplete({
          conditions: [condition],
          condition,
          zoneLabel:   ZONE_LABEL[s2],
          zoneIds:     ZONE_IDS[s2],
          triggerNote: TRIGGER_NOTE[s3],
        });
      }, 1000);
    }, 400);
    return;
  }

  // Q1 hoặc Q2 — sau typing indicator thêm bot message tiếp theo
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
```

---

## ChatHeader

```tsx
function ChatHeader({ step, phase }: { step: 1|2|3; phase: Phase }) {
  const counter = phase === 'intro' ? null : phase === 'analyzing' ? null : `${step} / 3`;
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
      style={{ background: 'var(--lp-bg-hero)', borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)' }}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--lp-primary)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin Analyzer</div>
        <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
          Phân tích vùng da
        </div>
      </div>
      {counter && (
        <div className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          {counter}
        </div>
      )}
    </div>
  );
}
```

---

## BotMessage & UserMessage

```tsx
function BotMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'var(--lp-primary)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed"
        style={{ background: 'color-mix(in srgb, var(--lp-primary) 8%, white)', color: 'var(--lp-primary)' }}>
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[70%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed font-medium"
        style={{ background: 'var(--lp-accent)', color: '#fff' }}>
        {text}
      </div>
    </div>
  );
}
```

---

## TypingIndicator

```tsx
function TypingIndicator({ analyzing }: { analyzing?: boolean }) {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'var(--lp-primary)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2"
        style={{ background: 'color-mix(in srgb, var(--lp-primary) 8%, white)' }}>
        {analyzing && (
          <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
            Đang phân tích...
          </span>
        )}
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full"
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
```

Keyframe cho typing dots (khai báo trong `<style>` tag trong JSX):
```css
@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%            { transform: translateY(-4px); opacity: 1; }
}
```

---

## ChipRow

Chips hiện ứng với state hiện tại:

```tsx
// Chips config
const CHIPS_MAP = {
  intro: [{ label: 'Bắt đầu →', signal: 'start', type: 'start' as const }],
  q1: [
    { label: 'Khô căng, thỉnh thoảng bong tróc', signal: 'dry',        type: 'q1' as const },
    { label: 'Bình thường, không có gì đặc biệt', signal: 'normal',     type: 'q1' as const },
    { label: 'Bóng dầu nhẹ ở vùng T-zone',        signal: 'oily-mild',  type: 'q1' as const },
    { label: 'Rất bóng, đặc biệt trán và mũi',    signal: 'oily-heavy', type: 'q1' as const },
  ],
  q2: [
    { label: 'Cằm và quanh miệng',         signal: 'chin-hormonal', type: 'q2' as const },
    { label: 'Trán, mũi, chữ T',           signal: 'tzone',         type: 'q2' as const },
    { label: 'Hai má hoặc khắp mặt',       signal: 'cheeks',        type: 'q2' as const },
    { label: 'Hầu như không bị mụn',       signal: 'no-acne',       type: 'q2' as const },
  ],
  q3: [
    { label: 'Không, da khá ổn định',                  signal: 'stable',           type: 'q3' as const },
    { label: 'Đôi khi đỏ ngứa khi dùng sản phẩm mới', signal: 'sensitive-mild',   type: 'q3' as const },
    { label: 'Hay kích ứng, rát, đỏ rõ',               signal: 'sensitive-strong', type: 'q3' as const },
    { label: 'Đang có sẹo rỗ hoặc thâm mụn',           signal: 'scar-dark',        type: 'q3' as const },
  ],
} as const;

// Lấy chips hiện tại
const currentChips =
  phase === 'intro'    ? CHIPS_MAP.intro :
  phase === 'analyzing'? [] :
  step === 1           ? CHIPS_MAP.q1 :
  step === 2           ? CHIPS_MAP.q2 :
                         CHIPS_MAP.q3;

// Render chip
<button
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
```

---

## Constraints

- Không import thêm thư viện ngoài (không dùng framer-motion, v.v.)
- Không cho phép user thay đổi câu trả lời đã chọn (chips bị ẩn sau khi chọn, history read-only)
- Không scroll locking — `overflow-y-auto` tự nhiên, auto-scroll to bottom khi message mới xuất hiện
- `'use client'` ở dòng 1 cả 2 file
- TypeScript: không dùng `any`, không dùng `!` assertion ngoài `skinConditions[conditionId]!` (đã biết ID hợp lệ)

## Verify sau khi implement

1. Mở `/v/v24-electric-light-pop`
2. Bấm "Soi da ngay" — phải thấy màn hình chat với message bot đầu tiên và chip "Bắt đầu →"
3. Chọn "Bắt đầu →" — bot hiện Q1 và 4 chips
4. Chọn lần lượt → Q2 → Q3, mỗi lần thấy typing indicator trước khi câu tiếp xuất hiện
5. Sau câu Q3: typing indicator + "Đang phân tích..." → chuyển sang payoff (màn hình kết quả)
6. Test combo `scar-dark` (Q3 cuối) → phải ra condition `da-seo-ro`
7. Test combo `no-acne + normal` (Q2 + Q1) → phải ra `clean-skin` → payoff dùng tone `positive`
