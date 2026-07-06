# Landing UX Review — Fix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa 3 logic bug làm hỏng trải nghiệm (foundCount luôn 0, isSuggested sai, typo), sau đó nâng chất UX ở 2 điểm (trigger personalization, DoneScreen), và rebrand SwipePhase cho đúng nghiệp vụ acne clinic.

**Architecture:** Tất cả thay đổi nằm trong `AppFlow.tsx` (presentation layer), `SkinGame.tsx` (game orchestrator), `gameConstants.ts` (shared constants), và `SwipePhase.tsx` (phase UI). Không có thay đổi data layer hay routing.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Vitest

---

## Files Affected

| File | Thay đổi |
|------|----------|
| `src/components/minigame/gameConstants.ts` | Thêm 2 hằng số item count cho PressPhase và DragPhase |
| `src/components/minigame/SkinGame.tsx` | Dùng hằng số cho `foundCount`; thêm `TRIGGER_NOTE` map; truyền `triggerNote`; cập nhật prop type |
| `src/components/AppFlow.tsx` | Fix `isSuggested`; fix typo; mở rộng `PayoffStatsData`; cập nhật `PayoffStats` + `PayoffView`; cải thiện `DoneScreen` |
| `src/components/minigame/SwipePhase.tsx` | Đổi title và copy từ "cạo lông tơ" sang "làm sạch lỗ chân lông" |

---

## Task 1 (P0): Fix foundCount — chip "đã soi 0 nốt mụn" luôn show 0

**Problem:** `SkinGame.tsx:128` hardcodes `foundCount: 0`. Chip hiển thị "đã soi **0** nốt mụn" — trông như bug với mọi người dùng.

**Fix:** Thêm 2 hằng số vào `gameConstants.ts` cho số items trong PressPhase (5 spots) và DragPhase (7×4 = 28 dots), rồi dùng tổng của chúng làm `foundCount`.

**Files:**
- Modify: `src/components/minigame/gameConstants.ts`
- Modify: `src/components/minigame/SkinGame.tsx`

- [ ] **Step 1: Thêm hằng số vào gameConstants.ts**

Mở `src/components/minigame/gameConstants.ts`. Append vào cuối file:

```ts
/** Số nốt mụn đầu trắng trong PressPhase (5 spots cố định). */
export const PRESS_SPOT_COUNT = 5;
/** Số chấm mụn đầu đen trong DragPhase (7 cột × 4 hàng). */
export const DRAG_DOT_COUNT = 28;
```

- [ ] **Step 2: Dùng hằng số trong SkinGame.tsx**

Trong `src/components/minigame/SkinGame.tsx`, cập nhật import từ `./gameConstants`:

```ts
import { PRESS_SPOT_COUNT, DRAG_DOT_COUNT } from './gameConstants';
```

Tại dòng 128 (trong `SelfReportStep`'s `onComplete` callback), đổi:

```ts
onComplete(result, { foundCount: 0, zoneLabel: ZONE_LABEL[answers.zone] });
```

thành:

```ts
onComplete(result, {
  foundCount: PRESS_SPOT_COUNT + DRAG_DOT_COUNT,
  zoneLabel: ZONE_LABEL[answers.zone],
});
```

> `triggerNote` chưa có ở bước này — sẽ được thêm trong Task 4 cùng với type update.

- [ ] **Step 3: Chạy tests**

```bash
npm test
```

Expected: tất cả tests pass, 0 failure.

- [ ] **Step 4: Commit**

```bash
git add src/components/minigame/gameConstants.ts src/components/minigame/SkinGame.tsx
git commit -m "fix(minigame): foundCount reflects press+drag total (was hardcoded 0)"
```

---

## Task 2 (P0): Fix isSuggested — badge "được gợi ý" không theo kết quả quiz

**Problem:** `AppFlow.tsx:417` dùng `allPrograms[0].id` thay vì `initialSelected`. Badge gợi ý luôn trỏ về card đầu tiên trong danh sách, bất kể kết quả chẩn đoán.

**Files:**
- Modify: `src/components/AppFlow.tsx` (hàm `ProgramsScreen`)

- [ ] **Step 1: Sửa suggestedId**

Trong `ProgramsScreen`, tìm dòng:

```ts
const suggestedId = allPrograms.length > 0 ? allPrograms[0].id : '';
```

Đổi thành:

```ts
const suggestedId = initialSelected;
```

- [ ] **Step 2: Chạy tests**

```bash
npm test
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "fix(programs): isSuggested badge now follows quiz result, not array position"
```

---

## Task 3 (P0): Fix typo "Kham khảo" → "Khám phá chương trình dành cho bạn"

**Problem:** `AppFlow.tsx:293` — nút CTA trong `PayoffView` hiển thị "Kham khảo" (sai chính tả, không tự nhiên).

**Files:**
- Modify: `src/components/AppFlow.tsx` (nút trong `PayoffView`)

- [ ] **Step 1: Sửa text nút**

Tìm dòng:

```tsx
Kham khảo chương trình của chúng tôi →
```

Đổi thành:

```tsx
Khám phá chương trình dành cho bạn →
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "fix(payoff): correct typo and reword CTA button text"
```

---

## Task 4 (P1): Dùng trigger để cá nhân hoá PayoffView

**Problem:** Câu hỏi trigger ("Da nổi loạn khi nào?") được thu thập nhưng không ảnh hưởng gì đến màn hình kết quả — đây là dead input. Người dùng điền xong mà không thấy nó được dùng đến.

**Fix:** Hiển thị một dòng insight ngắn ngay dưới các chip thống kê, căn cứ vào trigger answer. Điều này yêu cầu mở rộng `PayoffStatsData`, truyền `triggerNote` từ `SkinGame` qua, và cập nhật `PayoffStats`.

**Files:**
- Modify: `src/components/minigame/SkinGame.tsx`
- Modify: `src/components/AppFlow.tsx`

- [ ] **Step 1: Cập nhật PayoffStatsData type trong AppFlow.tsx**

Ở đầu file `src/components/AppFlow.tsx`, đổi:

```ts
type PayoffStatsData = { foundCount: number; zoneLabel: string };
```

thành:

```ts
type PayoffStatsData = { foundCount: number; zoneLabel: string; triggerNote: string };
```

- [ ] **Step 2: Cập nhật PayoffView prop type**

Trong `PayoffView`, tìm `stats: { foundCount: number; zoneLabel: string } | null` và đổi thành:

```tsx
function PayoffView({
  result,
  stats,
  onContinue,
}: {
  result: SkinCondition;
  stats: PayoffStatsData | null;
  onContinue: () => void;
}) {
```

- [ ] **Step 3: Thêm trigger insight vào PayoffStats**

Thay thế toàn bộ hàm `PayoffStats`:

```tsx
function PayoffStats({ stats }: { stats: PayoffStatsData }) {
  const chips: { key: string; color: string; content: React.ReactNode }[] = [
    {
      key: 'found',
      color: '#FF5C9E',
      content: <span>đã soi <b>{stats.foundCount}</b> nốt mụn</span>,
    },
    {
      key: 'zone',
      color: '#B39DFF',
      content: <span>da bạn hay bị ở <b>{stats.zoneLabel}</b></span>,
    },
  ];
  return (
    <div className="mb-4">
      <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {chips.map((chip, index) => (
          <span
            key={chip.key}
            className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm md:text-base font-semibold text-cta"
            style={{ animationDelay: `${0.5 + index * 0.18}s` }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: chip.color }}
            />
            {chip.content}
          </span>
        ))}
      </div>
      {stats.triggerNote && (
        <p
          className="payoff-stat-chip text-xs md:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed"
          style={{ animationDelay: '0.86s' }}
        >
          {stats.triggerNote}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Thêm TRIGGER_NOTE map và cập nhật prop type trong SkinGame.tsx**

Trong `src/components/minigame/SkinGame.tsx`:

1. Thêm `TRIGGER_NOTE` ngay sau `ZONE_LABEL` (dòng ~88):

```ts
const TRIGGER_NOTE: Record<SelfReportAnswers['trigger'], string> = {
  'ky-kinh':    'Da hay nổi loạn trước kỳ kinh — nội tiết tố là nguyên nhân thường gặp.',
  'nang':       'Nắng nóng kích thích tuyến nhờn hoạt động mạnh, dễ gây tắc lỗ chân lông.',
  'stress':     'Stress làm tăng cortisol, khiến da dễ viêm và nổi mụn hơn.',
  'thuc-khuya': 'Thức khuya làm mất thời gian da tự phục hồi trong giấc ngủ sâu.',
};
```

2. Cập nhật prop type của `SkinGame` để bao gồm `triggerNote`:

```ts
export function SkinGame({
  onComplete,
}: {
  onComplete: (result: SkinCondition, stats: { foundCount: number; zoneLabel: string; triggerNote: string }) => void;
}) {
```

3. Cập nhật `onComplete` call trong `SelfReportStep`'s callback (dòng ~127):

```ts
onComplete={(answers) => {
  const result = resolveProfile(answers.zone, answers.feel, answers.trigger);
  onComplete(result, {
    foundCount: PRESS_SPOT_COUNT + DRAG_DOT_COUNT,
    zoneLabel: ZONE_LABEL[answers.zone],
    triggerNote: TRIGGER_NOTE[answers.trigger],
  });
}}
```

- [ ] **Step 5: Chạy tests**

```bash
npm test
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/minigame/SkinGame.tsx src/components/AppFlow.tsx
git commit -m "feat(payoff): add personalized trigger insight chip to PayoffStats"
```

---

## Task 5 (P1): Cải thiện DoneScreen — thêm next steps

**Problem:** Sau khi submit form, `DoneScreen` chỉ hiện một câu ngắn — không có số điện thoại, địa chỉ, hay thông tin về bước tiếp theo. Người dùng không biết phải làm gì tiếp.

**Files:**
- Modify: `src/components/AppFlow.tsx` (hàm `DoneScreen`)

- [ ] **Step 1: Thay thế DoneScreen**

Thay thế toàn bộ hàm `DoneScreen`:

```tsx
function DoneScreen() {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-6 md:p-10 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <div className="font-extrabold text-xl md:text-2xl text-cta mb-2">Đã nhận thông tin của bạn!</div>
          <p className="text-sm md:text-base text-cta/70 leading-relaxed">
            Chuyên viên o2skin sẽ liên hệ trong vòng <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>

        <div className="border-t border-cta/10 pt-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest">Trong khi chờ đợi</p>

          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📍</span>
            <div>
              <p className="text-sm font-bold text-cta">Địa chỉ phòng khám</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">
                {/* TODO: điền địa chỉ thật của o2skin */}
                Liên hệ hotline để biết chi nhánh gần nhất.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📞</span>
            <div>
              <p className="text-sm font-bold text-cta">Hotline</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">
                {/* TODO: điền hotline thật của o2skin */}
                Gọi hotline để đặt lịch trực tiếp nếu cần tư vấn gấp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

> **Lưu ý cho developer:** Địa chỉ và hotline thật của o2skin cần được điền vào 2 chỗ comment `TODO` trước khi go-live.

- [ ] **Step 2: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "feat(done): add next-steps section with contact info placeholders to DoneScreen"
```

---

## Task 6 (P2): Rebrand SwipePhase — "cạo lông tơ" → "làm sạch lỗ chân lông"

**Problem:** Title "Cạo lông tơ" và hint "máy đốt lông tơ" không liên quan đến acne treatment. Người dùng có thể hiểu nhầm o2skin là dịch vụ triệt lông.

**Fix:** Đổi title, hint text, và alt text sang ngữ cảnh "làm sạch lỗ chân lông". Mechanic giữ nguyên — chỉ đổi framing và copy.

> **Lưu ý:** `machine.svg` và `hair.svg` là assets hiện có. Để thay đổi visuals hoàn toàn (ví dụ: dùng spatula thay máy laser), cần tạo SVG mới — nằm ngoài scope plan này.

**Files:**
- Modify: `src/components/minigame/SwipePhase.tsx`

- [ ] **Step 1: Cập nhật SwipePhase.tsx**

Áp dụng các thay đổi sau trong `SwipePhase.tsx`:

1. Trong `GameScene`, đổi `title`:
   ```tsx
   title="Làm sạch lỗ chân lông"
   ```

2. Hint label khi chưa tương tác:
   ```tsx
   <div style={hintLabel}>Chạm vào đầu làm sạch</div>
   ```

3. Alt text của machine image:
   ```tsx
   alt="thiết bị làm sạch da"
   ```

4. Alt text của hair/dirt items:
   ```tsx
   alt="cặn bẩn lỗ chân lông"
   ```

5. Đổi tên biến type và các comment nội bộ (không ảnh hưởng runtime):
   - `type Hair` → `type DirtDot`
   - `makeHairs` → `makeDirtDots`
   - `hairs` / `hairsRef` / `setHairsSync` / `initial` (kiểu Hair[]) → `dots` / `dotsRef` / `setDotsSync` / `initial` (kiểu DirtDot[])
   - `cleared` → giữ nguyên (tên trung tính)

   > Nếu việc rename gây diff quá lớn, có thể bỏ qua bước rename biến nội bộ và chỉ đổi title + hint text + alt text ở bước 1–4.

- [ ] **Step 2: Chạy tests**

```bash
npm test
```

Expected: pass (SwipePhase không có unit test, chỉ verify build không lỗi).

- [ ] **Step 3: Commit**

```bash
git add src/components/minigame/SwipePhase.tsx
git commit -m "refactor(swipe): rebrand from hair removal to pore-cleansing framing"
```

---

## Tổng kết thứ tự thực hiện

| # | Task | Priority | Files chính |
|---|------|----------|-------------|
| 1 | Fix foundCount luôn 0 | P0 | `gameConstants.ts`, `SkinGame.tsx` |
| 2 | Fix isSuggested badge | P0 | `AppFlow.tsx` |
| 3 | Fix typo CTA button | P0 | `AppFlow.tsx` |
| 4 | Trigger personalization | P1 | `SkinGame.tsx`, `AppFlow.tsx` |
| 5 | DoneScreen next steps | P1 | `AppFlow.tsx` |
| 6 | SwipePhase rebrand | P2 | `SwipePhase.tsx` |
