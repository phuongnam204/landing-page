# o2skin Data Model + ProgramsScreen Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tái cấu trúc dữ liệu landing page theo mô hình o2skin (SkinCondition + Program tĩnh sau seam helper), và dựng lại ProgramsScreen theo card hướng B + 2 nurse chibi + entrance animation.

**Architecture:** Dữ liệu tĩnh trong `content/`, component chỉ chạm qua helper (`catalog.ts`). Minigame ra 1 `SkinCondition`; mỗi `Program` khai `treatsConditions`; gói gợi ý = tra cứu. KHÔNG đụng cơ chế chơi/logic minigame — chỉ đổi tên type/hàm + dữ liệu + UI ProgramsScreen.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v3, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-03-o2skin-aligned-data-model-design.md`

**Lưu ý chung:** Windows, chạy `npx ...`. `tsc` toàn dự án chỉ xanh hoàn toàn sau Task 6 (các task giữa cố ý còn lỗi ở consumer chưa sửa — nêu rõ mỗi task). Ảnh nhân vật đã có tại `public/mascots/nurse-cheer.png`, `public/mascots/nurse-review.png` (commit ở Task 6). KHÔNG dùng base64 (Next serve `/mascots/...` từ `public/`).

---

## Task 1: `content/quiz.ts` → SkinCondition

**Files:** Modify: `src/content/quiz.ts`

- [ ] **Step 1: Thay TOÀN BỘ `src/content/quiz.ts` bằng:**

```ts
export type Tone = 'positive' | 'concern';

export type ConditionId =
  | 'mun-noi-tiet'
  | 'da-nhon-mun-viem'
  | 'da-nhay-cam'
  | 'lo-chan-long'
  | 'clean-skin'
  | 'da-moi-bat-dau';

export interface SkinCondition {
  id: ConditionId;
  label: string;
  tone: Tone;
  body: string;
  color: string;
  // Ghi chú đối chiếu sang category thật của o2skin (AcneType/SkinType/pathology). Placeholder.
  o2skinRef?: string;
}

export const skinConditions: Record<ConditionId, SkinCondition> = {
  'mun-noi-tiet': {
    id: 'mun-noi-tiet',
    label: 'Mụn nội tiết',
    tone: 'concern',
    color: '#FF5C9E',
    body: 'Da bạn có dấu hiệu <b>mụn nội tiết</b> — mụn tập trung ở vùng cằm và quai hàm, thường nặng hơn theo chu kỳ. Đây là kiểu mụn liên quan đến thay đổi nội tiết bên trong.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-nhon-mun-viem': {
    id: 'da-nhon-mun-viem',
    label: 'Da nhờn + mụn viêm',
    tone: 'concern',
    color: '#FFCD78',
    body: 'Da bạn <b>nhờn + mụn viêm</b> — tuyến bã nhờn hoạt động mạnh, lỗ chân lông dễ tắc, mụn viêm liên tục đặc biệt vùng chữ T.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-nhay-cam': {
    id: 'da-nhay-cam',
    label: 'Da nhạy cảm',
    tone: 'concern',
    color: '#7DD9C0',
    body: 'Da bạn <b>nhạy cảm, dễ kích ứng</b> — dễ nổi mẩn đỏ, ửng đỏ từng mảng khi thay đổi thời tiết hoặc dùng sản phẩm không phù hợp.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'lo-chan-long': {
    id: 'lo-chan-long',
    label: 'Lỗ chân lông to',
    tone: 'concern',
    color: '#8B6BFF',
    body: 'Da bạn có <b>lỗ chân lông to + mụn đầu đen</b> — không có mụn viêm nhưng lỗ chân lông rõ và mụn đầu đen xuất hiện ở mũi, trán, cằm.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'clean-skin': {
    id: 'clean-skin',
    label: 'Da ổn định',
    tone: 'positive',
    color: '#B39DFF',
    body: 'Da bạn <b>đang ổn định</b> — chưa có dấu hiệu mụn viêm hay lỗ chân lông to rõ ràng. Đây là nền tảng tốt để xây dựng thói quen chăm sóc da bền vững.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-moi-bat-dau': {
    id: 'da-moi-bat-dau',
    label: 'Chưa có routine',
    tone: 'positive',
    color: '#A0AEC0',
    body: 'Da bạn <b>chưa có routine rõ ràng</b> — chưa có dấu hiệu cụ thể hoặc da tương đối ổn định. Chưa xác định được vấn đề cụ thể.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
};
```

- [ ] **Step 2:** Run `npx tsc --noEmit`. Expected: lỗi ở `skinScanLogic.ts`, `SkinScanScreen.tsx`, `AppFlow.tsx` (còn dùng `QuizResult`/`quizResults`/`ProgramId`/`solution`/`suggestedProgram`) — CỐ Ý, sửa ở các task sau. Không được có lỗi cú pháp trong chính `quiz.ts`.
- [ ] **Step 3: Commit**
```bash
git add src/content/quiz.ts
git commit -m "refactor: reshape quiz.ts into SkinCondition taxonomy"
```

---

## Task 2: `content/programs.ts` (mới)

**Files:** Create: `src/content/programs.ts`

- [ ] **Step 1: Tạo `src/content/programs.ts`:**

```ts
import type { ConditionId } from './quiz';

// id chuỗi tự do — combo thật của o2skin thay sau; số lượng gói tùy ý.
export type ProgramId = string;

export interface Program {
  id: ProgramId;
  name: string; // ← o2skin mobileName
  description: string; // ← o2skin description
  isVip?: boolean; // ← o2skin isVip
  // Các tình trạng gói này trị; phần tử [0] = tình trạng chính (dùng tint header card).
  treatsConditions: ConditionId[];
  // ← combo quantity: GIỮ cho khớp dữ liệu thật nhưng KHÔNG hiển thị trên card.
  sessions?: number;
  o2skinComboRef?: string; // seam đối chiếu combo thật
}

// Placeholder — đổ combo thật (mobileName/description/isVip) vào sau. Phủ đủ 6 ConditionId.
export const programs: Program[] = [
  {
    id: 'chuyen-sau-noi-tiet',
    name: 'Chuyên sâu mụn nội tiết',
    description: 'Phác đồ kết hợp cho mụn viêm nặng theo chu kỳ nội tiết.',
    isVip: true,
    treatsConditions: ['mun-noi-tiet', 'da-nhon-mun-viem'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'khoi-dau-lam-sach',
    name: 'Khởi đầu làm sạch',
    description: 'Liệu trình cơ bản làm sạch da, kiểm soát dầu cho người mới bắt đầu.',
    treatsConditions: ['da-moi-bat-dau', 'lo-chan-long'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'toan-dien-mun-nang',
    name: 'Toàn diện mụn nặng',
    description: 'Cho mụn nặng, tái phát; kết hợp điều trị và phục hồi da.',
    isVip: true,
    treatsConditions: ['mun-noi-tiet', 'da-nhay-cam'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'phuc-hoi-nhay-cam',
    name: 'Phục hồi da nhạy cảm',
    description: 'Làm dịu, phục hồi hàng rào da dễ kích ứng, ửng đỏ.',
    treatsConditions: ['da-nhay-cam'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'se-khit-lo-chan-long',
    name: 'Se khít lỗ chân lông',
    description: 'Giảm mụn đầu đen, se khít lỗ chân lông vùng chữ T.',
    treatsConditions: ['lo-chan-long'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'duy-tri-da-khoe',
    name: 'Duy trì da khỏe',
    description: 'Duy trì làn da ổn định, phòng ngừa mụn quay lại.',
    treatsConditions: ['clean-skin', 'da-moi-bat-dau'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
];
```

- [ ] **Step 2:** Run `npx tsc --noEmit`. Expected: như Task 1 (lỗi consumer cũ), không lỗi trong `programs.ts`.
- [ ] **Step 3: Commit**
```bash
git add src/content/programs.ts
git commit -m "feat: add Program data model and placeholder programs list"
```

---

## Task 3: `content/catalog.ts` (helper seam) — TDD

**Files:** Create: `src/content/catalog.ts`, `src/content/catalog.test.ts`

- [ ] **Step 1: Viết test trước — `src/content/catalog.test.ts`:**

```ts
import { describe, it, expect } from 'vitest';
import { getConditionById, getPrograms, getProgramsTreating, getSuggestedProgram } from './catalog';
import type { ConditionId } from './quiz';

const ALL: ConditionId[] = ['mun-noi-tiet', 'da-nhon-mun-viem', 'da-nhay-cam', 'lo-chan-long', 'clean-skin', 'da-moi-bat-dau'];

describe('getConditionById', () => {
  it('returns a condition for a known id', () => {
    expect(getConditionById('mun-noi-tiet')?.label).toBe('Mụn nội tiết');
  });
  it('returns undefined for an unknown id', () => {
    expect(getConditionById('nope' as ConditionId)).toBeUndefined();
  });
});

describe('getProgramsTreating', () => {
  it('returns only programs whose treatsConditions includes the id', () => {
    const result = getProgramsTreating('da-nhay-cam');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.treatsConditions.includes('da-nhay-cam'))).toBe(true);
  });
});

describe('getSuggestedProgram', () => {
  it('every condition resolves to a program that actually treats it', () => {
    for (const id of ALL) {
      const p = getSuggestedProgram(id);
      expect(p).toBeDefined();
      expect(p!.treatsConditions.includes(id)).toBe(true);
    }
  });
});

describe('getPrograms', () => {
  it('returns the full non-empty programs list', () => {
    expect(getPrograms().length).toBeGreaterThanOrEqual(5);
  });
});
```

- [ ] **Step 2:** Run `npx vitest run src/content/catalog.test.ts`. Expected: FAIL (module chưa có).
- [ ] **Step 3: Tạo `src/content/catalog.ts`:**

```ts
import { skinConditions, type ConditionId, type SkinCondition } from './quiz';
import { programs, type Program } from './programs';

export function getConditionById(id: ConditionId): SkinCondition | undefined {
  return skinConditions[id];
}

export function getPrograms(): Program[] {
  return programs;
}

export function getProgramsTreating(conditionId: ConditionId): Program[] {
  return programs.filter((p) => p.treatsConditions.includes(conditionId));
}

export function getSuggestedProgram(conditionId: ConditionId): Program | undefined {
  return getProgramsTreating(conditionId)[0] ?? programs[0];
}
```

- [ ] **Step 4:** Run `npx vitest run src/content/catalog.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/content/catalog.ts src/content/catalog.test.ts
git commit -m "feat: add catalog helpers linking conditions and programs (TDD)"
```

---

## Task 4: `skinScanLogic.ts` — zone→condition

**Files:** Modify: `src/components/MinigameCore/skinScanLogic.ts`, `src/components/MinigameCore/skinScanLogic.test.ts`

- [ ] **Step 1: Sửa import + ZONE_META + hàm resolve trong `skinScanLogic.ts`.**

Thay dòng import:
```ts
import { quizResults, type QuizResult } from '../../content/quiz';
```
bằng:
```ts
import { skinConditions, type ConditionId, type SkinCondition } from '../../content/quiz';
```

Thay khối `ZONE_META` (đổi `profileId`→`conditionId`, kiểu, thêm `o2skinLocationRef`):
```ts
export const ZONE_META: Record<SkinZone, { label: string; conditionId: ConditionId; color: string; o2skinLocationRef?: string }> = {
  'cam-quai-ham': { label: 'cằm & quai hàm', conditionId: 'mun-noi-tiet', color: '#FF5C9E', o2skinLocationRef: 'o2skin AcneLocation (đối chiếu)' },
  'chu-t': { label: 'vùng chữ T', conditionId: 'da-nhon-mun-viem', color: '#FFCD78', o2skinLocationRef: 'o2skin AcneLocation (đối chiếu)' },
  'hai-ma': { label: 'hai má', conditionId: 'da-nhay-cam', color: '#7DD9C0', o2skinLocationRef: 'o2skin AcneLocation (đối chiếu)' },
  'khong-bi': { label: 'gần như không bị', conditionId: 'clean-skin', color: '#B39DFF', o2skinLocationRef: 'o2skin AcneLocation (đối chiếu)' },
};
```

Thay hàm `resolveProfileByZone`:
```ts
export function resolveConditionByZone(zone: SkinZone): SkinCondition {
  const meta = ZONE_META[zone];
  if (!meta) return skinConditions['da-moi-bat-dau'];
  return skinConditions[meta.conditionId] ?? skinConditions['da-moi-bat-dau'];
}
```

- [ ] **Step 2: Cập nhật `skinScanLogic.test.ts`** — thay mọi `resolveProfileByZone` bằng `resolveConditionByZone`. Nếu test cũ assert `.id`, giữ nguyên (SkinCondition vẫn có `.id`). Đảm bảo 4 case mapping: cam-quai-ham→mun-noi-tiet, chu-t→da-nhon-mun-viem, hai-ma→da-nhay-cam, khong-bi→clean-skin; fallback zone lạ → da-moi-bat-dau.

- [ ] **Step 3:** Run `npx vitest run src/components/MinigameCore/skinScanLogic.test.ts`. Expected: PASS. Run `npx tsc --noEmit` → còn lỗi ở `SkinScanScreen.tsx`/`AppFlow.tsx` (Task 5/6 sửa).
- [ ] **Step 4: Commit**
```bash
git add src/components/MinigameCore/skinScanLogic.ts src/components/MinigameCore/skinScanLogic.test.ts
git commit -m "refactor: skinScanLogic maps zones to conditions (resolveConditionByZone)"
```

---

## Task 5: `SkinScanScreen.tsx` — dùng SkinCondition

**Files:** Modify: `src/components/SkinScanScreen.tsx`

- [ ] **Step 1:** Trong `SkinScanScreen.tsx`:
  - Đổi import `type { QuizResult } from '../content/quiz'` → `type { SkinCondition } from '../content/quiz'`.
  - Đổi import `resolveProfileByZone` → `resolveConditionByZone` (từ `./MinigameCore/skinScanLogic`).
  - Thay MỌI dùng `resolveProfileByZone(` → `resolveConditionByZone(`.
  - Trong kiểu `onComplete`, đổi `result: QuizResult` → `result: SkinCondition` (giữ nguyên phần `stats: { foundCount: number; zoneLabel: string }`).
  - KHÔNG đụng logic game (spots, timer gợi ý, ScanBoard, findNearestUnfoundSpot, ZONE_META usage).

- [ ] **Step 2:** Run `npx tsc --noEmit`. Expected: chỉ còn lỗi ở `AppFlow.tsx`. Không lỗi ở `SkinScanScreen.tsx`.
- [ ] **Step 3: Commit**
```bash
git add src/components/SkinScanScreen.tsx
git commit -m "refactor: SkinScanScreen emits SkinCondition"
```

---

## Task 6: `AppFlow.tsx` + `globals.css` — ProgramsScreen dựng lại + animation + commit assets

**Files:** Modify: `src/components/AppFlow.tsx`, `src/app/globals.css`; Add: `public/mascots/*.png` (đã tồn tại)

- [ ] **Step 1: Thêm CSS entrance vào cuối `src/app/globals.css`:**

```css
@keyframes psFadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
@keyframes psCardUp { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes psPopIn { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }
@keyframes psPopCheer { 0% { opacity: 0; transform: scale(.4) rotate(-8deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes psFloaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.ps-title { animation: psFadeDown .5s ease both; }
.ps-card { animation: psCardUp .5s ease both; }
.ps-mascot { filter: drop-shadow(0 8px 12px rgba(45,38,64,.16)); }
.ps-m1 { animation: psPopCheer .6s cubic-bezier(.34,1.56,.64,1) .15s both, psFloaty 3s ease-in-out 1s infinite; }
.ps-m2 { animation: psPopIn .6s cubic-bezier(.34,1.56,.64,1) .45s both, psFloaty 3.4s ease-in-out 1.2s infinite; }
@media (prefers-reduced-motion: reduce) {
  .ps-title, .ps-card, .ps-m1, .ps-m2 { animation: none !important; }
}
```

- [ ] **Step 2: Sửa imports đầu `AppFlow.tsx`.** Thay:
```ts
import type { QuizResult, ProgramId } from '../content/quiz';
```
bằng:
```ts
import type { SkinCondition } from '../content/quiz';
import type { ProgramId, Program } from '../content/programs';
import { getPrograms, getSuggestedProgram, getConditionById } from '../content/catalog';
```

- [ ] **Step 3: Sửa state + onComplete.**
  - `const [quizResult, setQuizResult] = useState<QuizResult | null>(null);` → `useState<SkinCondition | null>(null);`
  - Trong handler `onComplete` của `SkinScanScreen`, thay `setSelectedProgram(result.suggestedProgram);` bằng:
```ts
            setSelectedProgram(getSuggestedProgram(result.id)?.id ?? null);
```
  - Trong `PayoffView` signature, đổi prop `result: QuizResult` → `result: SkinCondition`. (Các field payoff dùng: `result.tone`, `result.body` — không đổi.)

- [ ] **Step 4: Xóa `const PROGRAMS ...` inline và thay TOÀN BỘ `ProgramsScreen` + `ProgramCard` bằng:**

```tsx
function ProgramsScreen({
  initialSelected,
  onContinue,
}: {
  initialSelected: ProgramId;
  onContinue: (programId: ProgramId) => void;
}) {
  const [selected, setSelected] = useState<ProgramId>(initialSelected);
  const programs = getPrograms();
  const selectedName = programs.find((p) => p.id === selected)?.name ?? '';

  return (
    <div
      className="h-[100dvh] w-full overflow-y-auto"
      style={{ background: 'linear-gradient(135deg,#FDE7F1 0%,#EDE9FF 55%,#E4FBF1 100%)' }}
    >
      <div className="min-h-full max-w-5xl mx-auto px-4 py-6 flex flex-col">
        <div className="flex items-end justify-center gap-3 md:gap-5">
          <img src="/mascots/nurse-cheer.png" alt="" className="ps-mascot ps-m1 h-16 md:h-28 select-none pointer-events-none" />
          <h2 className="ps-title text-center font-black text-xl md:text-2xl text-cta pb-3">
            Chương trình phù hợp cho bạn ✨
          </h2>
          <img src="/mascots/nurse-review.png" alt="" className="ps-mascot ps-m2 h-14 md:h-24 select-none pointer-events-none" />
        </div>

        <div className="grid gap-3 mt-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))' }}>
          {programs.map((program, index) => (
            <ProgramCard
              key={program.id}
              program={program}
              selected={selected === program.id}
              index={index}
              onSelect={() => setSelected(program.id)}
            />
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => onContinue(selected)}
            className="bg-violet-600 text-white font-bold text-sm py-3.5 px-9 rounded-soft hover:bg-violet-700 transition-colors duration-200"
          >
            {`Đăng ký chương trình ${selectedName} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Card hướng B: dải header tint theo tình trạng chính + badge loại bệnh + VIP. Không giá/số buổi.
function ProgramCard({
  program,
  selected,
  index,
  onSelect,
}: {
  program: Program;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const primary = getConditionById(program.treatsConditions[0]);
  const headerBg = (primary?.color ?? '#B39DFF') + '2E'; // tint nhạt (~18% alpha)

  return (
    <button
      onClick={onSelect}
      className={[
        'ps-card text-left rounded-soft overflow-hidden bg-white shadow-md shadow-cta/10',
        'border-2 transition-colors duration-[160ms]',
        selected ? 'border-violet-600' : 'border-transparent hover:border-violet-400',
      ].join(' ')}
      style={{ animationDelay: `${0.15 + index * 0.08}s` }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 font-bold text-sm text-cta" style={{ background: headerBg }}>
        <span>{program.name}</span>
        {selected && <span className="text-violet-700">✓</span>}
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">
        <p className="text-xs text-cta/70 leading-relaxed">{program.description}</p>
        {program.isVip && (
          <span className="self-start text-[9px] font-black text-[#8A6D00] bg-[#FFE08A] rounded px-1.5 py-0.5 tracking-wide">
            VIP
          </span>
        )}
        <div className="flex flex-wrap gap-1.5">
          {program.treatsConditions.map((cid) => {
            const c = getConditionById(cid);
            if (!c) return null;
            return (
              <span key={cid} className="inline-flex items-center gap-1 text-[10px] font-bold text-cta bg-cta/5 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                {c.label}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 5:** Run `npx tsc --noEmit`. Expected: PASS, 0 lỗi toàn dự án. (Nếu còn tham chiếu `QuizResult`/`quizResults`/`suggestedProgram`/`PROGRAMS` — tìm và sửa hết.)
- [ ] **Step 6:** Run `npx vitest run`. Expected: tất cả PASS (skinScanLogic + catalog + các test cũ).
- [ ] **Step 7: Commit (kèm assets nhân vật):**
```bash
git add src/components/AppFlow.tsx src/app/globals.css public/mascots/nurse-cheer.png public/mascots/nurse-review.png
git commit -m "feat: rebuild ProgramsScreen (card B + nurse chibi + entrance animation)"
```

---

## Task 7: Xác minh end-to-end

**Files:** không sửa.

- [ ] **Step 1:** `npx vitest run` → tất cả PASS. `npx tsc --noEmit` → sạch.
- [ ] **Step 2: Preview.** Next.js 16 khóa 1 dev server/thư mục — nếu đã có server chạy cùng thư mục thì verify trên server đó (hoặc dừng nó trước).
  - Desktop: Hero → minigame → (chờ safety-net ~22s hoặc khoanh hết) → chọn vùng → payoff đúng tình trạng → ProgramsScreen: 2 nhân vật ở header (không bị card che), lưới card tự xuống dòng, card B có badge loại bệnh + VIP, KHÔNG số buổi/giá/"Phù hợp với bạn", gói gợi ý viền tím + ✓, entrance animation chạy.
  - Chọn "Cằm & quai hàm" → payoff `Mụn nội tiết` → gói gợi ý = "Chuyên sâu mụn nội tiết".
  - Mobile (`preview_resize` mobile): nhân vật thu nhỏ vẫn hiện, card 1 cột, không lỗi.
  - Kiểm `prefers-reduced-motion`: animation tắt.
- [ ] **Step 3: Commit (nếu có chỉnh nhỏ khi verify), nếu không thì bỏ qua.**

---

## Ghi chú
- KHÔNG đổi cơ chế/logic minigame. KHÔNG thêm chấm điểm/AcneLevel. KHÔNG hiện giá/số tuần/"Phù hợp với bạn".
- Mọi giá trị là placeholder có `o2skinRef`/`o2skinComboRef`/`o2skinLocationRef` để đổ dữ liệu thật sau.
- Branch: nên làm trên `feature/o2skin-data-model`, GIỮ branch sau merge (quy ước team o2skin).
