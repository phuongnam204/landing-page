# Spec: Workflow Diversity — 8 Version Workflows

**Date:** 2026-07-19  
**Scope:** v14, v15, v17, v18, v20, v21, v22, v23  
**Goal:** Mỗi version trong 8 version này có một workflow khác biệt về cấu trúc step, không chỉ khác về giao diện. Điều này tạo ra diversity thực sự để leader có thể A/B test cả chiến lược UX lẫn visual.

---

## Tổng quan kiến trúc

Hiện tại tất cả 25 version đều dùng một state machine duy nhất:

```
hook → minigame → payoff → programs? → conversion → socialProof? → done?
```

Spec này thêm 8 workflow mới theo 4 loại thay đổi có chi phí tăng dần:

| Loại | Thay đổi | Chi phí | Áp dụng cho |
|------|----------|---------|-------------|
| A | Variant mới của slot `minigame` | 1 điểm chạm | v21, v22, v23 |
| B | Variant mới của slot `programs` | 1 điểm chạm | v15, v20 |
| C | Slot optional mới (`expertHandoff`) | 4 điểm chạm | v14 |
| D | Slot optional mới + LandingFlow branching | 4+ điểm chạm | v17, v18 |

Nguyên tắc: không thêm slot bắt buộc, không thay đổi MinigameResult contract. Slot `minigame` vẫn bắt buộc trong mọi version ngoại trừ v22 và v23 — hai version này cũng sẽ giữ slot `minigame` nhưng dùng variant không có game engine, chỉ có gesture/animation.

---

## Loại A — Variant mới của slot `minigame`

Không thêm slot, không sửa LandingFlow. Chỉ cần component mới + đăng ký vào `registry.minigame`.

---

### v21 — Electric Classic / Chained Interactions

**Workflow:** `hook → [face-tap] → [skin-chat] → payoff → conversion`

Hai micro-interaction chạy nối tiếp bên trong một component duy nhất. Từ góc nhìn của LandingFlow, đây vẫn là một minigame slot hoàn chỉnh — chỉ là nội bộ nó có 2 phase.

**Component:** `src/landing/variants/minigame/electric/classic-chained.tsx`  
**Registry key:** `'electric-classic-chained'`  
**Slot props:** `MinigameSlotProps` (không đổi — vẫn nhận `onComplete(MinigameResult)`)

**Phase 1 — Face Zone Tap (≤15 giây):**
- Hiện sơ đồ mặt dạng SVG abstract, 5 vùng bấm: trán / mũi / má trái / má phải / cằm.
- User bấm vào vùng có vấn đề (có thể chọn nhiều, tối đa 2). Mỗi vùng highlight khi chọn.
- CTA "Tiếp theo" xuất hiện ngay khi chọn ít nhất 1 vùng.
- Output của phase 1: `zoneIds: string[]` (ví dụ `['nose', 'forehead']`).

**Phase 2 — Skin Chat (≤60 giây):**
- Nhận `zoneIds` từ phase 1 làm seed — câu hỏi đầu tiên đặt đúng về vùng đó.
- Giao diện tái dùng SkinScanChat pattern: 3 câu hỏi sequential (loại mụn → tần suất → tình trạng da), mỗi câu có 2-3 chip lựa chọn.
- Câu hỏi nạp từ một map tĩnh `ZONE_QUESTIONS` trong component, không gọi API.
- Sau câu 3, tổng hợp `MinigameResult` từ `zoneIds` + câu trả lời và gọi `onComplete`.

**Cách tổng hợp MinigameResult:**
- Map zone dominant + câu trả lời sang `SkinCondition[]` bằng lookup table tĩnh (tương tự cách `skincare.tsx` đang làm).
- `condition` = condition có score cao nhất từ câu trả lời.
- `zoneLabel` lấy từ zone được bấm nhiều nhất hoặc zone duy nhất.

**Transition giữa phase:**
- Phase 1 → Phase 2: slide lên (phase 1 slide off, phase 2 slide in).
- Progress indicator nhỏ ở trên: 2 dot, dot 1 filled khi chuyển sang phase 2.
- Không có back button — flow một chiều.

**Recipe thay đổi:**
```ts
// v21-electric-classic.ts
slots: {
  hook:       'electric-classic',
  minigame:   'electric-classic-chained',  // thay đổi duy nhất
  payoff:     'electric-classic',
  programs:   'electric-classic',
  conversion: 'electric-classic',
  done:       'electric-classic',
}
```

---

### v22 — Electric Glow Heavy / Scratch Card

**Workflow:** `hook → [scratch-reveal] → payoff → conversion`

Thay thế game engine bằng scratch-to-reveal mechanic. Vẫn là slot `minigame` — chỉ khác mechanic.

**Component:** `src/landing/variants/minigame/electric/glow-scratch.tsx`  
**Registry key:** `'electric-glow-scratch'`  
**Slot props:** `MinigameSlotProps`

**Phase 1 — Câu hỏi đơn:**
- Một câu hỏi: "Da bạn thường gặp vấn đề gì nhất?"
- 3 lựa chọn dạng full-width card: Mụn / Thâm sẹo / Da nhờn kích ứng.
- User chọn 1. Card chọn highlight. CTA "Cào để khám phá" xuất hiện.

**Phase 2 — Scratch Reveal:**
- Một thẻ dạng "phong bì" kích thước ~280×180px (chiếm ~70% màn hình trên mobile).
- Overlay màu đặc (crimson theme primary) phủ lên result card bên dưới.
- Scratch effect: dùng CSS `clip-path` polygon animation kết hợp pointer events, không cần canvas.
  - Khi touch/mouse move trên overlay: update clip-path để "mài mòn" dần overlay.
  - Sử dụng một mảng điểm đã reveal, rebuild clip-path dạng nhiều hình tròn cắt nhau.
  - Khi reveal đạt ≥60%: tự động complete (overlay fade out hoàn toàn).
- Bên dưới overlay là result card hiện `condition.label + condition.headline` (hard-coded theo câu trả lời phase 1).

**Cách tổng hợp MinigameResult:**
- Map câu trả lời phase 1 sang `SkinCondition`:
  - "Mụn" → condition `acne-mild` hoặc `acne-severe` (mặc định `acne-mild`)
  - "Thâm sẹo" → condition `dark-spots`
  - "Da nhờn kích ứng" → condition `oily-sensitive`
- `zoneIds: []` (không có zone data từ mechanic này).
- `zoneLabel`: "Toàn mặt".
- Gọi `onComplete(result)` khi scratch đạt ≥60%.

**Fallback:** Nếu user không cào trong 8 giây, nút "Xem kết quả" xuất hiện để tap thay scratch.

**Recipe thay đổi:**
```ts
// v22-electric-glow-heavy.ts
slots: {
  hook:       'electric-glow-heavy',
  minigame:   'electric-glow-scratch',   // thay đổi
  payoff:     'electric-glow-heavy',
  conversion: 'electric-glow-heavy',
  done:       'electric-glow-heavy',
  // programs bỏ — flow ngắn hơn
}
```

---

### v23 — Electric Soft Dark / Swipe Card Quiz

**Workflow:** `hook → [swipe-quiz] → payoff → conversion`

TikTok-native gesture: vuốt qua từng thẻ skin concern.

**Component:** `src/landing/variants/minigame/electric/soft-swipe.tsx`  
**Registry key:** `'electric-soft-swipe'`  
**Slot props:** `MinigameSlotProps`

**Deck:**
- 5 thẻ, mỗi thẻ là một skin concern statement dạng first-person:
  1. "Mình hay bị mụn ở vùng trán và mũi"
  2. "Da mình nhờn bóng, lỗ chân lông to"
  3. "Mình có nhiều thâm sẹo sau khi mụn lặn"
  4. "Da mình nhạy cảm, dễ đỏ và kích ứng"
  5. "Mình bị mụn đầu đen nhiều ở vùng cằm"
- Mỗi thẻ: văn bản ở giữa card, hai icon gợi ý ở dưới: checkmark phải (có) / X trái (không).

**Gesture handling:**
- Track `touchstart` / `touchmove` / `touchend`.
- Phân biệt swipe vs scroll bằng góc: nếu `|dx| > |dy| * 1.2` thì là swipe ngang, không can thiệp scroll.
- Ngưỡng confirm swipe: `|dx| > 80px` hoặc velocity `|dx/dt| > 0.4px/ms`.
- Trong khi drag: card rotate `dx * 0.08 deg` + translate X. Màu overlay hint: xanh (phải) / đỏ (trái).
- Snap back nếu không đủ ngưỡng.
- Cũng có 2 button "Không" / "Có" bên dưới card cho desktop và để tránh scroll conflict.

**Cách tổng hợp MinigameResult:**
- Thu thập index của các thẻ được swipe phải (answered "có").
- Map sang `SkinCondition[]` bằng lookup tĩnh (card 1 = acne, card 2 = oily, card 3 = dark-spots...).
- `condition` = condition từ thẻ đầu tiên được swipe phải. Nếu không có = default `acne-mild`.
- Sau thẻ thứ 5 (hoặc khi swipe hết deck), gọi `onComplete(result)`.

**Hiệu ứng transition:**
- Thẻ kế tiếp scale 0.95 → 1 khi thẻ hiện tại rời đi.
- Stagger nhẹ để thấy deck có chiều sâu.
- Progress dots ở trên: 5 dots, filled tương ứng.

**Recipe thay đổi:**
```ts
// v23-electric-soft-dark.ts
slots: {
  hook:       'electric-soft-dark',
  minigame:   'electric-soft-swipe',   // thay đổi
  payoff:     'electric-soft-dark',
  conversion: 'electric-soft-dark',
  done:       'electric-soft-dark',
  // programs bỏ
}
```

---

## Loại B — Variant mới của slot `programs`

Slot `programs` nhận `ProgramsSlotProps` và gọi `onContinue(programId)`. Hai variant mới này tái dùng props contract đó nhưng thay đổi hoàn toàn UX của step.

---

### v15 — Natural Editorial / Treatment Journey

**Workflow:** `hook → minigame → payoff → [treatment-journey] → conversion`

Slot `programs` nhưng hiện timeline thay vì program cards.

**Component:** `src/landing/variants/programs/natural/editorial-journey.tsx`  
**Registry key:** `'natural-editorial-journey'` (trong `registry.programs`)  
**Slot props:** `ProgramsSlotProps` (không đổi)

**Layout:**
- Desktop: horizontal scroll timeline với 4 milestone card.
- Mobile: vertical stacked timeline với connector line.
- Không có "chọn program" rõ ràng — chỉ có một program được recommend (`suggestedPrograms[0]`) và được trình bày ngầm.
- CTA ở cuối timeline: "Bắt đầu hành trình của bạn" → gọi `onContinue(suggestedPrograms[0].program.id)`.

**Nội dung 4 milestone:**
- Tuần 1–2: Thăm khám và làm sạch nền
- Tuần 3–4: Liệu trình điều trị cá nhân
- Tháng 2: Những thay đổi đầu tiên
- Tháng 3+: Da ổn định và đẹp hơn

**Nội dung mỗi milestone card:**
- Icon đơn giản (Lucide/Tabler inline SVG)
- Tiêu đề milestone (bold, 16px)
- Mô tả ngắn 1-2 câu (muted, 13px)
- Số tuần / tháng (accent color, 11px uppercase)

**Aesthetic:** editorial clean — không dùng gradient, không bo tròn nhiều. Cherry-jp theme: màu cherry muted, typography rõ ràng, nhiều whitespace.

**Recipe thay đổi:**
```ts
// v15-natural-editorial.ts
slots: {
  hook:       'natural-editorial',
  minigame:   'natural-editorial',
  payoff:     'natural-editorial',
  programs:   'natural-editorial-journey',   // thay đổi
  conversion: 'natural-editorial',
  done:       'natural-editorial',
}
```

---

### v20 — Bold Typographic / Commitment Level

**Workflow:** `hook → minigame → payoff → [commitment-level] → conversion`

Slot `programs` nhưng user chọn intensity thay vì chọn program.

**Component:** `src/landing/variants/programs/bold/typographic-commitment.tsx`  
**Registry key:** `'bold-typographic-commitment'` (trong `registry.programs`)  
**Slot props:** `ProgramsSlotProps`

**Layout:**
- 3 lựa chọn xếp dọc (stack), full-width, tap to select.
- Mỗi lựa chọn: heading lớn (24px bold) + subtext (14px muted). Không có icon.
- Lựa chọn đang chọn: border accent + background nhẹ. Các lựa chọn còn lại mờ đi.
- CTA "Tiếp tục" xuất hiện sau khi chọn.

**3 lựa chọn:**
1. **Nhẹ nhàng** — "Cải thiện dần, phù hợp với lịch trình bận rộn" → map sang program tier nhẹ nhất trong `suggestedPrograms`.
2. **Đều đặn** — "Kết quả rõ ràng sau 4–6 tuần" → map sang `suggestedPrograms[0]` (recommended).
3. **Chuyên sâu** — "Tập trung điều trị triệt để trong thời gian ngắn" → map sang program tier cao nhất.

**Cách map sang programId:**
- Sắp xếp `suggestedPrograms` theo `score` (đã có sẵn từ `recommendPrograms()`).
- Nhẹ → index cuối (score thấp nhất nhưng vẫn relevant).
- Đều đặn → index 0 (highest score = top recommendation).
- Chuyên sâu → tìm program có intensity cao nhất theo metadata, fallback về index 0.
- Nếu chỉ có 1 program: cả 3 lựa chọn đều gọi `onContinue` với cùng programId nhưng user vẫn "chọn" được commitment vibe.

**Aesthetic:** Bold typographic — font lớn, nhiều khoảng trống, lilac theme. Không có card border (chỉ highlight khi chọn).

**Recipe thay đổi:**
```ts
// v20-bold-typographic.ts
slots: {
  hook:       'bold-typographic',
  minigame:   'bold-typographic',
  payoff:     'bold-typographic',
  programs:   'bold-typographic-commitment',   // thay đổi
  conversion: 'bold-typographic',
  done:       'bold-typographic',
}
```

---

## Loại C — Slot optional mới: `expertHandoff`

4 điểm chạm: `slots.ts` + `validateRecipe.ts` + `registry.ts` + `LandingFlow.tsx`.

---

### v14 — Natural Spa / Expert Handoff

**Workflow:** `hook → minigame → payoff → [expert-handoff] → conversion`

**Slot mới: `expertHandoff`**

```ts
// slots.ts — thêm vào
export type ExpertHandoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;
};
```

```ts
// validateRecipe.ts — thêm vào OPTIONAL array
const OPTIONAL = ['programs', 'expertHandoff', 'socialProof', 'done'] as const;
// Thêm expertHandoff?: string vào RecipeSlots
```

```ts
// registry.ts — thêm nhánh mới
expertHandoff: {
  'natural-spa': NaturalSpaExpertHandoff,
} as Record<string, ComponentType<ExpertHandoffSlotProps>>,
```

```ts
// LandingFlow.tsx — sau step payoff
function nextAfterPayoff() {
  if (recipe.slots.expertHandoff) return transitionTo('expertHandoff');  // mới
  if (recipe.slots.programs) return transitionTo('programs');
  return transitionTo('conversion');
}
// Thêm step render:
{step === 'expertHandoff' && ExpertHandoff && minigameResult && (
  <ExpertHandoff result={minigameResult} onContinue={() => {
    if (recipe.slots.programs) transitionTo('programs');
    else transitionTo('conversion');
  }} />
)}
```

**Component:** `src/landing/variants/expertHandoff/natural/spa.tsx`  
**Registry key:** `'natural-spa'` (trong `registry.expertHandoff`)

**UX — chat bubble sequence:**
- Background: theme bg nhẹ + subtle texture (hoặc chỉ màu).
- Avatar nhỏ góc trái: tên "Chuyên viên Lan" + avatar placeholder hình tròn.
- 3 bubble text xuất hiện tuần tự (delay 600ms mỗi bubble, typewriter effect nhẹ hoặc chỉ fade in):
  1. "Mình đã xem qua kết quả phân tích của bạn rồi ..."
  2. Bubble 2: message cá nhân hóa theo `result.condition.id`:
     - acne: "Da bạn đang trong giai đoạn cần được chăm sóc đặc biệt. Mình thấy phù hợp nhất với liệu trình điều trị mụn chuyên sâu."
     - dark-spots: "Tình trạng thâm sẹo của bạn hoàn toàn có thể cải thiện được. Bên mình có protocol riêng cho da bạn."
     - (các condition khác tương tự)
  3. "Bạn muốn đặt lịch tư vấn để mình hướng dẫn chi tiết hơn không?"
- CTA button xuất hiện sau bubble 3: "Đặt lịch ngay" → `onContinue()`.

**Data:** Lookup table tĩnh `HANDOFF_MESSAGES` map `condition.id` → string trong component.

**Recipe thay đổi:**
```ts
// v14-natural-spa.ts
slots: {
  hook:          'natural-spa',
  minigame:      'natural-spa',
  payoff:        'natural-spa',
  expertHandoff: 'natural-spa',   // mới
  conversion:    'natural-spa',
  done:          'natural-spa',
}
```

---

## Loại D — Slot optional mới + LandingFlow branching

---

### v17 — Bold Classic / Teaser Payoff Trước

**Workflow:** `hook → [teaser-payoff] → minigame → payoff → conversion`

Thêm slot `teaserPayoff` optional trước minigame.

**Slot mới: `teaserPayoff`**

```ts
// slots.ts
export type TeaserPayoffSlotProps = { onContinue: () => void };
```

```ts
// validateRecipe.ts — thêm vào OPTIONAL
const OPTIONAL = ['teaserPayoff', 'programs', 'expertHandoff', 'socialProof', 'done'] as const;
// RecipeSlots: teaserPayoff?: string
```

```ts
// registry.ts
teaserPayoff: {
  'bold-classic': BoldClassicTeaserPayoff,
} as Record<string, ComponentType<TeaserPayoffSlotProps>>,
```

```ts
// LandingFlow.tsx — sau step hook
function nextAfterHook() {
  if (recipe.slots.teaserPayoff) return transitionTo('teaserPayoff');
  return transitionTo('minigame');
}
// hook onStart gọi nextAfterHook() thay vì transitionTo('minigame') trực tiếp

// Thêm step render:
{step === 'teaserPayoff' && TeaserPayoff && (
  <TeaserPayoff onContinue={() => transitionTo('minigame')} />
)}
```

**Component:** `src/landing/variants/teaserPayoff/bold/classic.tsx`

**UX:**
- Full screen, centered.
- Phía trên: tiêu đề "Kết quả phân tích da của bạn" (lớn, bold).
- Phía dưới: blurred result preview card — 3 fake result item với blur filter 8px, nhìn thấy hình dáng nhưng không đọc được nội dung. Trên card có overlay text: "Cá nhân hóa cho bạn sau khi phân tích".
- CTA: "Phân tích da của bạn" → `onContinue()` → tiếp tục vào minigame.
- Animation: card blur pulse (keyframe breathing), tạo cảm giác đang chờ reveal.
- Thời gian tối thiểu trên màn này: không có, user có thể click ngay. Không nên giữ lại bắt buộc.

**Recipe thay đổi:**
```ts
// v17-bold-classic.ts
slots: {
  hook:         'bold-classic',
  teaserPayoff: 'bold-classic',   // mới
  minigame:     'bold-classic',
  payoff:       'bold-classic',
  programs:     'bold-classic',
  conversion:   'bold-classic',
  done:         'bold-classic',
}
```

---

### v18 — Bold Stacked / Pick Your Path

**Workflow (branching):**
- Path A (fast track): `hook → [path-chooser] → conversion`
- Path B (full flow): `hook → [path-chooser] → minigame → payoff → conversion`

**Slot mới: `pathChooser`**

```ts
// slots.ts
export type PathChooserSlotProps = {
  onFastTrack: () => void;
  onFullFlow:  () => void;
};
```

```ts
// validateRecipe.ts — thêm vào OPTIONAL
const OPTIONAL = ['teaserPayoff', 'pathChooser', 'programs', 'expertHandoff', 'socialProof', 'done'] as const;
// RecipeSlots: pathChooser?: string
```

```ts
// registry.ts
pathChooser: {
  'bold-stacked': BoldStackedPathChooser,
} as Record<string, ComponentType<PathChooserSlotProps>>,
```

```ts
// LandingFlow.tsx — thêm state + branching
const [isFastTrack, setIsFastTrack] = useState(false);

// sau hook:
function nextAfterHook() {
  if (recipe.slots.teaserPayoff) return transitionTo('teaserPayoff');
  if (recipe.slots.pathChooser)  return transitionTo('pathChooser');
  return transitionTo('minigame');
}

// pathChooser render:
{step === 'pathChooser' && PathChooser && (
  <PathChooser
    onFastTrack={() => {
      setIsFastTrack(true);
      trackEvent('path_chooser', { path: 'fast_track' });
      transitionTo('conversion');
    }}
    onFullFlow={() => {
      setIsFastTrack(false);
      trackEvent('path_chooser', { path: 'full_flow' });
      transitionTo('minigame');
    }}
  />
)}

// conversion: ConversionSlotProps đã có minigameResult: MinigameResult | null
// fast track → minigameResult null → conversion variant cần handle null gracefully
// (Bold Stacked Conversion hiện tại đã nhận null, không cần sửa nếu nó render OK)
```

**Component:** `src/landing/variants/pathChooser/bold/stacked.tsx`

**UX:**
- Full screen, 2 path card xếp dọc (full-width mỗi cái).
- Card A (trên): "Tôi biết da mình cần gì" — subtext "Đặt lịch tư vấn nhanh" — icon mũi tên phải. → `onFastTrack()`.
- Card B (dưới): "Hãy phân tích da giúp mình" — subtext "Nhận kết quả cá nhân hóa" — icon sparkle/scan. → `onFullFlow()`.
- Mỗi card cao 40% màn hình trên mobile. Không có CTA riêng — tap vào card = chọn.
- Animation: hover/press scale(0.98). Không có animation phức tạp.
- Không có tiêu đề header riêng — trang đơn giản nhất có thể, chỉ 2 lựa chọn.

**Lưu ý về conversion khi fast track:**
- `minigameResult = null`, `selectedProgramId = null`.
- `BoldStackedConversion` cần render được khi cả 2 đều null — thêm copy mặc định thay vì reference `result.condition.label`.
- Nếu conversion variant hiện tại crash khi null → fix trong conversion component của v18, không sửa contract global.

**Recipe thay đổi:**
```ts
// v18-bold-stacked.ts
slots: {
  hook:        'bold-stacked',
  pathChooser: 'bold-stacked',   // mới
  minigame:    'bold-stacked',
  payoff:      'bold-stacked',
  programs:    'bold-stacked',
  conversion:  'bold-stacked',
  done:        'bold-stacked',
}
```

---

## Tổng hợp các thay đổi infrastructure

### `src/landing/slots.ts`

Thêm 3 type mới:

```ts
export type ExpertHandoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;
};

export type TeaserPayoffSlotProps = {
  onContinue: () => void;
};

export type PathChooserSlotProps = {
  onFastTrack: () => void;
  onFullFlow:  () => void;
};
```

### `src/landing/validateRecipe.ts`

```ts
export type RecipeSlots = {
  hook:          string;
  minigame:      string;
  payoff:        string;
  teaserPayoff?: string;   // mới
  pathChooser?:  string;   // mới
  expertHandoff?: string;  // mới
  programs?:     string;
  conversion:    string;
  socialProof?:  string;
  done?:         string;
};

const OPTIONAL = [
  'teaserPayoff', 'pathChooser', 'programs', 'expertHandoff', 'socialProof', 'done'
] as const;
```

### `src/landing/registry.ts`

Thêm 3 nhánh mới vào object `registry`:

```ts
import { NaturalSpaExpertHandoff }   from './variants/expertHandoff/natural/spa';
import { BoldClassicTeaserPayoff }   from './variants/teaserPayoff/bold/classic';
import { BoldStackedPathChooser }    from './variants/pathChooser/bold/stacked';

export const registry = {
  // ... existing slots ...
  expertHandoff: { 'natural-spa': NaturalSpaExpertHandoff } as Record<string, ComponentType<ExpertHandoffSlotProps>>,
  teaserPayoff:  { 'bold-classic': BoldClassicTeaserPayoff } as Record<string, ComponentType<TeaserPayoffSlotProps>>,
  pathChooser:   { 'bold-stacked': BoldStackedPathChooser } as Record<string, ComponentType<PathChooserSlotProps>>,
};
```

### `src/landing/LandingFlow.tsx`

```ts
// State thêm
type Step = 'hook' | 'teaserPayoff' | 'pathChooser' | 'minigame' | 'payoff'
          | 'expertHandoff' | 'programs' | 'conversion' | 'socialProof' | 'done';

const [isFastTrack, setIsFastTrack] = useState(false);

// Sửa nextAfterHook (tách ra từ onStart inline)
function nextAfterHook() {
  if (recipe.slots.teaserPayoff) return transitionTo('teaserPayoff');
  if (recipe.slots.pathChooser)  return transitionTo('pathChooser');
  return transitionTo('minigame');
}

// Sửa nextAfterPayoff
function nextAfterPayoff() {
  if (recipe.slots.expertHandoff) return transitionTo('expertHandoff');
  if (recipe.slots.programs)       return transitionTo('programs');
  return transitionTo('conversion');
}

// Lookup variants
const TeaserPayoff  = recipe.slots.teaserPayoff  ? registry.teaserPayoff?.[recipe.slots.teaserPayoff]   : null;
const PathChooser   = recipe.slots.pathChooser   ? registry.pathChooser?.[recipe.slots.pathChooser]     : null;
const ExpertHandoff = recipe.slots.expertHandoff ? registry.expertHandoff?.[recipe.slots.expertHandoff] : null;
```

---

## Thứ tự implement đề xuất

Đi từ ít rủi ro đến nhiều rủi ro:

1. **Loại A** (v21, v22, v23) trước — chỉ thêm component, không đụng infrastructure. Có thể implement song song 3 version.
2. **Loại B** (v15, v20) tiếp — thêm 2 programs variant, cũng không đụng infrastructure.
3. **Loại C** (v14) — thêm `expertHandoff` slot. Sửa 4 file, test bằng recipe v14.
4. **Loại D** (v17) — thêm `teaserPayoff` slot. Đơn giản hơn v18 vì không có branching.
5. **Loại D** (v18) — thêm `pathChooser` + branching state. Phức tạp nhất, để cuối.

---

## Ràng buộc cứng

- `MinigameResult` contract không thay đổi — mọi variant minigame mới (v21, v22, v23) đều phải emit đúng shape này.
- Slot `minigame` vẫn là REQUIRED trong `validateRecipe` — không bỏ.
- Các version không trong danh sách (v01-v13, v16, v19, v24, v25) không bị ảnh hưởng.
- Mỗi slot mới phải là optional — không được làm vỡ validation của 25 version hiện có.
- `isFastTrack` state ở v18 là local LandingFlow state — không cần persist, không ảnh hưởng tracking global.
