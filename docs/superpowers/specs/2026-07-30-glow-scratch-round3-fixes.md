# Spec: Glow-Scratch — Round 3 Visual Fixes

**File:** `src/landing/variants/minigame/electric/glow-scratch.tsx`
**Date:** 2026-07-30
**Status:** Pending opencode implementation
**Tiền đề:** `docs/superpowers/specs/2026-07-29-glow-scratch-revision-design.md`

---

## Tổng quan

5 fix sau khi review Round 2. Không thay đổi logic game (coverage, mask, flow routing).

| # | Vấn đề | Loại |
|---|--------|------|
| 1 | Desktop draw mode container bị cắt (không scroll) | Layout fix |
| 2 | Scratch coat thiếu visual — chỉ là ellipse mờ | Visual redesign |
| 3 | Zone ellipses hiện trong scratch phase → ẩn, thay bằng dot row | UX change |
| 4 | Screen 1 Confirm: mặt vẫn ở opacity 8% → đổi thành full opacity | Visual fix |
| 5 | `--lp-bg-card` fallback sai + body text render HTML tags literal | Bug fix |

---

## 1. Container Overflow Fix (desktop draw mode)

**Vấn đề:** SVG ở desktop `max-w-[520px]` cao ~709px (ratio 240/176 × 520). Cộng header 56px + hint + button → tràn viewport, bị `overflow-hidden` của root cắt. Fix trước (chỉ thêm `overflow-y-auto`) không đủ vì root vẫn block scroll.

**Fix A — draw mode container (line ~494):**

```tsx
// BEFORE:
<div className="flex-1 flex flex-col items-center justify-center p-4"
  style={{ animation: 'fade-in 300ms ease-out both' }}>

// AFTER:
<div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto md:justify-start md:pt-10"
  style={{ animation: 'fade-in 300ms ease-out both' }}>
```

**Fix B — thêm `maxHeight` inline vào SVG element** (cùng vị trí với `className="w-full ..."` của scratch SVG):

```tsx
// Tìm <svg viewBox="0 0 176 240" className="w-full ..." (scratch phase SVG)
// Thêm style prop:
style={{ maxHeight: 'calc(100dvh - 140px)' }}
```

Khi `maxHeight` được set, browser scale SVG xuống proportionally khi chiều cao vượt ngưỡng — SVG width tự co theo tỷ lệ 176:240. Không cần đổi `max-w-[520px]`.

---

## 2. Scratch Coat Visual Redesign — FULL GIRL COAT (CRITICAL CONCEPT CHANGE)

**Vấn đề gốc rễ:** Coat cũ bao phủ từng zone ellipse nhỏ riêng lẻ (như dán sticker). Đây sai hoàn toàn concept. Coat phải bao phủ **toàn bộ hình ảnh cô gái** giống thẻ cào thật — một tấm bạc phủ cả khuôn mặt, người chơi cào đâu thì lộ chỗ đó.

**Concept đúng:**
- **Coat** = 1 ellipse lớn bao phủ silhouette cô gái trong ảnh (cx=88, cy=140, rx=80, ry=108)
- **Cào** = mask path tích lũy xóa coat ở bất cứ đâu user quét
- **Zone detection** = logic JavaScript kiểm tra coverage trên từng zone ellipse — độc lập với hình dạng coat, KHÔNG ĐỔI gì cả
- **Dots** = progress indicator hiện lên trên coat khi zone được phát hiện

**Bước 1 — Thêm `<pattern>` vào `<defs>` (đặt cùng chỗ với `<mask id="scratch-coat-mask">`):**

```tsx
<pattern id="scratch-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8"/>
</pattern>
```

**Bước 2 — Replace TOÀN BỘ Layer 3 coat rendering bằng 1 ellipse duy nhất:**

```tsx
// BEFORE (sai — coat theo từng zone):
<g mask="url(#scratch-coat-mask)">
  {REVEAL_ZONES.filter(z => activeZoneIds.includes(z.id) && !revealed.has(z.id)).map(zone => (
    <g key={`coat-${zone.id}`} style={{ pointerEvents: 'none' }}>
      <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx + 2} ry={zone.ry + 2} fill="var(--lp-accent)" />
      <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx + 2} ry={zone.ry + 2} fill="url(#scratch-hatch)" />
      <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx + 2} ry={zone.ry + 2}
        fill="none" stroke="color-mix(in srgb, var(--lp-accent) 55%, #000)"
        strokeWidth="1.5" strokeDasharray="5 3"
        style={{ animation: 'coat-shimmer 2s ease-in-out infinite' }} />
    </g>
  ))}
</g>

// AFTER (đúng — 1 ellipse bao phủ cô gái):
<g mask="url(#scratch-coat-mask)" style={{ pointerEvents: 'none' }}>
  <ellipse cx={88} cy={140} rx={80} ry={108} fill="var(--lp-accent)" />
  <ellipse cx={88} cy={140} rx={80} ry={108} fill="url(#scratch-hatch)" />
  <ellipse cx={88} cy={140} rx={80} ry={108}
    fill="none"
    stroke="color-mix(in srgb, var(--lp-accent) 55%, #000)"
    strokeWidth="2"
    strokeDasharray="6 3"
    style={{ animation: 'coat-shimmer 2s ease-in-out infinite' }} />
</g>
```

> **Quan trọng:** Không có `.filter().map()` nào cả. Coat là static — luôn hiển thị từ lúc phase='scratch' cho đến khi hết tất cả zones. Mask path tự lo việc xóa coat.

> **Không đổi:** `<mask id="scratch-coat-mask">` trong `<defs>` — mask đã có `<rect x="0" y="0" width="176" height="240" fill="white"/>` phủ full viewBox, đủ để cover coat ellipse này.

---

## 3. Zone Visibility During Scratch — Ẩn Ellipses, Thêm Dot Row

**Vấn đề:** Zone ellipses + label + checkmark animation xuất hiện trên mặt trong scratch phase. User yêu cầu ẩn hết, thay bằng dot progress row ở dưới cùng SVG.

### 3a. Xóa Layer 2 khỏi scratch SVG

Xóa toàn bộ block "Layer 2: Active zone content" (lines ~522–552):

```tsx
// XÓA HOÀN TOÀN block này:
{/* Layer 2: Active zone content — revealed + checkmark */}
{REVEAL_ZONES.filter(z => activeZoneIds.includes(z.id)).map(zone => {
  const isRev = revealed.has(zone.id);
  const isAnimating = revealedAnimating.has(zone.id);
  const condColor = scratchedConditionColor;
  return (
    <g key={zone.id}>
      {isRev && (
        <>
          <ellipse ... />
          <ellipse ... />
          <text ...>{zone.label}</text>
        </>
      )}
      {isAnimating && (
        <g ...>  {/* checkmark circle animation */}
          <circle ... />
          <path ... />
        </g>
      )}
    </g>
  );
})}
```

Cũng xóa keyframe `zone-reveal` khỏi `<style>` block.

### 3b. Thêm `useMemo` vào React import

```tsx
// BEFORE:
import { useState, useEffect, useRef, useCallback } from 'react';

// AFTER:
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
```

### 3c. Thêm `dotGroups` useMemo vào component

Đặt sau `const relocatingCondition = ...` (line ~164):

```tsx
// Dot groups: cheeks pair → 1 dot; mỗi zone khác → 1 dot
const dotGroups = useMemo(() => {
  const groups: Array<{ key: string; zoneIds: string[] }> = [];
  let cheeksDone = false;
  for (const id of activeZoneIds) {
    if (id === 'left-cheek' || id === 'right-cheek') {
      if (!cheeksDone) {
        groups.push({
          key: 'cheeks',
          zoneIds: activeZoneIds.filter(z => z === 'left-cheek' || z === 'right-cheek'),
        });
        cheeksDone = true;
      }
    } else {
      groups.push({ key: id, zoneIds: [id] });
    }
  }
  return groups;
}, [activeZoneIds]);
```

### 3d. Thêm dot row vào scratch SVG (sau Layer 3, trước closing `</svg>`)

```tsx
{/* Progress dots — N dots centered at x=88, y=222 */}
{dotGroups.length > 0 && (() => {
  const n = dotGroups.length;
  return (
    <g>
      {dotGroups.map((group, i) => {
        const cx = 88 + (i - (n - 1) / 2) * 16;
        const cy = 222;
        const done = group.zoneIds.every(id => revealed.has(id));
        const isAnimating = done && group.zoneIds.some(id => revealedAnimating.has(id));
        return (
          <g key={group.key}>
            {isAnimating && (
              <circle cx={cx} cy={cy} r={14} fill="none"
                stroke={scratchedConditionColor} strokeWidth="2.5"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  animation: 'dot-ring 0.55s ease-out forwards',
                }} />
            )}
            <circle cx={cx} cy={cy} r={9}
              fill={done ? scratchedConditionColor : 'rgba(255,255,255,0.88)'}
              stroke={done ? 'none' : 'rgba(0,0,0,0.18)'}
              strokeWidth="1" />
            {done && (
              <path
                d={`M${cx - 4} ${cy + 0.5} l3.5 3.5 l5.5-5.5`}
                stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"
                style={{ animation: 'dot-check 0.2s ease-out' }} />
            )}
          </g>
        );
      })}
    </g>
  );
})()}
```

> **Lưu ý vị trí dot:** `cx = 88 + (i - (n-1)/2) * 16`, `cy = 222`. Với n=1: [88]. n=2: [80, 96]. n=3: [74, 88, 102]. n=4: [66, 82, 98, 114]. n=5: [58, 74, 88, 102, 116]. Tất cả đều nằm trong viewBox 176×240.

### 3e. Thêm keyframes mới vào `<style>` block

```css
@keyframes dot-ring {
  0%   { transform: scale(0.7); opacity: 0.8; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes dot-check {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
```

---

## 4. Screen 1 Confirm — Full Face Opacity

**Vấn đề:** `ConfirmFaceMini` và desktop confirm SVG đều dùng `opacity={GHOST_FACE_OPACITY}` (0.08) cho face image. Ở màn confirm, người chơi đã cào xong — mặt phải hiện đầy đủ.

**Fix 1 — `ConfirmFaceMini` component (line ~114):**

```tsx
// BEFORE:
<image href="/face-map-minigame.svg" x={FACE_OFFSET_X} y="0"
  width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
  preserveAspectRatio="xMidYMin meet" />

// Không có thay đổi ở đây — ConfirmFaceMini đã không có opacity. Kiểm tra lại xem có dòng opacity nào không rồi mới xóa.
```

**Fix 2 — Desktop confirm SVG (line ~716–719):**

```tsx
// BEFORE:
<image href="/face-map-minigame.svg" x={FACE_OFFSET_X} y="0"
  width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
  preserveAspectRatio="xMidYMin meet" opacity={GHOST_FACE_OPACITY} />

// AFTER (xóa attribute opacity):
<image href="/face-map-minigame.svg" x={FACE_OFFSET_X} y="0"
  width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
  preserveAspectRatio="xMidYMin meet" />
```

> **Lưu ý:** Search toàn file cho `opacity={GHOST_FACE_OPACITY}` — xóa ở bất kỳ chỗ nào nó xuất hiện trong `phase === 'confirm'` context.

---

## 5. Theme Color + Body Text Bug Fixes

### 5a. Desktop confirm right panel background

```tsx
// BEFORE (line ~731):
style={{ width: '40%', background: 'var(--lp-bg-card, white)' }}

// AFTER:
style={{ width: '40%', background: 'var(--lp-bg-card, var(--lp-bg-hero))' }}
```

### 5b. Body text HTML rendering bug

`scratchedCondition.body` và `scratchedCondition.bridge` chứa HTML markup (`<b>` tags) nhưng đang render bằng `{...}` → hiển thị literal tags. Fix cả desktop confirm panel:

```tsx
// BEFORE:
{activeConditionId !== 'da-seo-ro' && scratchedCondition.body && (
  <p style={{ fontSize: '12px', lineHeight: 1.55, color: 'color-mix(in srgb, var(--lp-primary) 70%, transparent)' }}>
    {scratchedCondition.body}
  </p>
)}
{activeConditionId !== 'da-seo-ro' && scratchedCondition.bridge && (
  <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
    {scratchedCondition.bridge}
  </p>
)}

// AFTER:
{activeConditionId !== 'da-seo-ro' && scratchedCondition.body && (
  <p style={{ fontSize: '12px', lineHeight: 1.55, color: 'color-mix(in srgb, var(--lp-primary) 70%, transparent)' }}
    dangerouslySetInnerHTML={{ __html: scratchedCondition.body }} />
)}
{activeConditionId !== 'da-seo-ro' && scratchedCondition.bridge && (
  <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}
    dangerouslySetInnerHTML={{ __html: scratchedCondition.bridge }} />
)}
```

> `skinConditions` là static app content, không phải user input — `dangerouslySetInnerHTML` an toàn ở đây.

---

## 6. Không Thay Đổi

- Scratch mechanic (coverage threshold, mask path accumulation) — giữ nguyên
- Manual mode — giữ nguyên
- `revealedAnimating` state — **giữ nguyên** (được tái sử dụng cho dot ring animation)
- Screen 2a, Screen 2b — giữ nguyên
- Toàn bộ screen flow/routing — giữ nguyên
- Security guard `activeConditionId !== 'da-seo-ro'` — giữ nguyên

---

## Checklist for opencode

- [ ] 1a. Thêm `overflow-y-auto md:justify-start md:pt-10` vào draw mode container
- [ ] 1b. Thêm `style={{ maxHeight: 'calc(100dvh - 140px)' }}` vào scratch SVG element
- [ ] 2. Thêm `<pattern id="scratch-hatch">` vào `<defs>`
- [ ] 3. Replace coat rendering: xóa `.filter().map()`, thay bằng 1 ellipse tĩnh (cx=88 cy=140 rx=80 ry=108)
- [ ] 4. Xóa Layer 2 block + `zone-reveal` keyframe
- [ ] 5. Thêm `useMemo` vào React import
- [ ] 6. Thêm `dotGroups` useMemo (sau `relocatingCondition`)
- [ ] 7. Thêm dot row SVG vào scratch phase (sau Layer 3); empty dot fill = `rgba(255,255,255,0.88)` stroke `rgba(0,0,0,0.18)`
- [ ] 8. Thêm `dot-ring` + `dot-check` keyframes
- [ ] 9. Xóa `opacity={GHOST_FACE_OPACITY}` khỏi desktop confirm `<image>`
- [ ] 10. Fix `--lp-bg-card` fallback
- [ ] 11. Fix `dangerouslySetInnerHTML` cho body + bridge text
