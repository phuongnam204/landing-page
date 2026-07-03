# Minigame Desktop Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho màn desktop của minigame (`FindGame` + `ReportStep`) một bố cục hai cột sinh động chất GenZ (board/card + panel/face-map + nền pastel có blob trôi nhẹ), trong khi mobile giữ nguyên board/card gọn qua progressive enhancement.

**Architecture:** Thuần trình bày — bọc `FindGame`/`ReportStep` trong một `PlayfulBackdrop` chung (gradient pastel + blob animated), rồi ở breakpoint `md:` thêm cột phụ (`PlayfulPanel` cho FindGame, `FaceMap` SVG cho ReportStep). Toàn bộ hooks/logic (`generateSpots`, timer gợi ý, `commit`, `handlePointer`, `resolveProfileByZone`, `onComplete`, `ScanBoard`) GIỮ NGUYÊN, không đụng.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v3, CSS animations.

**Spec:** `docs/superpowers/specs/2026-07-03-minigame-desktop-layout-design.md`

---

## File Structure

- `src/app/globals.css` — **Modify:** thêm keyframe + class blob (`mgBlobFloat`, `.mg-blob`) + nhánh `prefers-reduced-motion`.
- `src/components/SkinScanScreen.tsx` — **Modify:** thêm import `ReactNode`; thêm components `PlayfulBackdrop`, `Mascot`, `PlayfulPanel`, `FaceMap`; đổi layout ngoài của `FindGame` (Task 2) và `ReportStep` (Task 3). Không đụng `ScanBoard`, hooks, `frameStyle`, `zoneChipStyle`, `ZONE_LABELS`, `tickStyle`.

Không file nào khác. Không thêm unit test (logic không đổi; 18 test hiện có của `skinScanLogic` phải vẫn pass).

---

## Task 1: CSS blob trôi nhẹ

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Thêm CSS vào cuối `src/app/globals.css`**

```css

@keyframes mgBlobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(0, -16px) scale(1.06); }
}
.mg-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(30px);
  opacity: 0.5;
  pointer-events: none;
  animation: mgBlobFloat 9s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .mg-blob { animation: none; }
}
```

- [ ] **Step 2: Kiểm tra không hỏng build CSS**

Run: `npx tsc --noEmit`
Expected: PASS (CSS không ảnh hưởng tsc; đây chỉ là kiểm tra nhanh dự án vẫn sạch type).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add animated pastel blob styles for minigame backdrop"
```

---

## Task 2: FindGame desktop — hai cột cockpit

**Files:**
- Modify: `src/components/SkinScanScreen.tsx`

- [ ] **Step 1: Thêm `type ReactNode` vào import react**

Thay dòng:

```ts
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
```

bằng:

```ts
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
```

- [ ] **Step 2: Thêm `PlayfulBackdrop`, `Mascot`, `PlayfulPanel` NGAY SAU component `ScanBoard`**

Chèn khối sau vào ngay trước dòng `function ReportStep({ onPick }` (tức sau khi kết thúc `ScanBoard`):

```tsx
// Nền pastel dùng chung cho cả hai màn: gradient + blob trôi nhẹ (reduced-motion tắt animation).
function PlayfulBackdrop({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-screen w-full relative flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg,#FDE7F1 0%,#EDE9FF 55%,#E4FBF1 100%)' }}
    >
      <span className="mg-blob" style={{ width: 220, height: 220, background: '#FFB8D4', left: -40, top: -30 }} />
      <span className="mg-blob" style={{ width: 180, height: 180, background: '#B39DFF', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob" style={{ width: 140, height: 140, background: '#8FE3BC', left: '12%', bottom: -30, animationDelay: '4s' }} />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  );
}

// Mascot "bạn nhỏ" SVG vẽ tay, dùng ở panel phải của FindGame trên desktop.
function Mascot() {
  return (
    <svg width="116" height="116" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="108" rx="30" ry="6" fill="#2D2640" opacity="0.06" />
      <path d="M32 60 Q32 26 60 26 Q88 26 88 60 L88 82 Q88 100 60 100 Q32 100 32 82 Z" fill="#B39DFF" />
      <circle cx="50" cy="62" r="6" fill="#2D2640" />
      <circle cx="72" cy="62" r="6" fill="#2D2640" />
      <circle cx="52" cy="60" r="2" fill="#fff" />
      <circle cx="74" cy="60" r="2" fill="#fff" />
      <path d="M52 76 Q60 84 68 76" stroke="#2D2640" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="74" r="5" fill="#FF9BC0" opacity="0.6" />
      <circle cx="80" cy="74" r="5" fill="#FF9BC0" opacity="0.6" />
      <path d="M60 16 l3.2 7.6 7.6 3.2 -7.6 3.2 -3.2 7.6 -3.2 -7.6 -7.6 -3.2 7.6 -3.2 z" fill="#FFCD78" />
    </svg>
  );
}

// Panel phải của FindGame — chỉ hiện từ breakpoint md trở lên.
function PlayfulPanel({ foundCount }: { foundCount: number }) {
  const remaining = SPOT_COUNT - foundCount;
  return (
    <div className="hidden md:flex flex-col gap-4 max-w-xs">
      <h2 className="text-3xl font-black text-cta leading-tight">
        Tìm hết các “bạn nhỏ” đang trốn nhé! 👀
      </h2>
      <p className="text-base text-cta/70">
        Chạm vào từng nốt trên mặt để khoanh chúng lại. Rê tay khắp vùng da nhé!
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-cta shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5C9E' }} />
          {foundCount} đã soi
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-sm font-bold text-cta/70 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-cta/30" />
          còn {remaining}
        </span>
      </div>
      <div className="mt-1"><Mascot /></div>
    </div>
  );
}
```

- [ ] **Step 3: Đổi wrapper MỞ của `FindGame`**

Thay:

```tsx
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-4 overflow-hidden">
      <div style={frameStyle}>
```

bằng:

```tsx
  return (
    <PlayfulBackdrop>
      <div className="flex flex-col items-center md:flex-row md:items-center md:gap-10">
        <div style={frameStyle}>
```

- [ ] **Step 4: Đổi wrapper ĐÓNG của `FindGame` (thêm panel phải)**

Thay:

```tsx
        <div style={{ padding: '12px 18px 16px', color: 'rgba(255,255,255,.7)', fontSize: 12, textAlign: 'center' }}>
          Đừng lo — nếu bí, tụi mình sẽ hé lộ giúp bạn 💡
        </div>
      </div>
    </div>
  );
}
```

bằng:

```tsx
        <div style={{ padding: '12px 18px 16px', color: 'rgba(255,255,255,.7)', fontSize: 12, textAlign: 'center' }}>
          Đừng lo — nếu bí, tụi mình sẽ hé lộ giúp bạn 💡
        </div>
        </div>
        <PlayfulPanel foundCount={foundCount} />
      </div>
    </PlayfulBackdrop>
  );
}
```

- [ ] **Step 5: Kiểm tra type**

Run: `npx tsc --noEmit`
Expected: PASS, 0 lỗi.

- [ ] **Step 6: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "feat: two-column desktop cockpit layout for FindGame"
```

---

## Task 3: ReportStep desktop — hai cột face-map

**Files:**
- Modify: `src/components/SkinScanScreen.tsx`

- [ ] **Step 1: Thêm component `FaceMap` NGAY TRƯỚC `function ReportStep`**

Chèn:

```tsx
// Bản đồ khuôn mặt với 4 vùng tô màu theo ZONE_META — cột trái của ReportStep trên desktop.
function FaceMap({ className = '' }: { className?: string }) {
  const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
  return (
    <div className={`${className} flex-col items-center gap-3`}>
      <svg width="200" height="230" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bản đồ vùng da trên khuôn mặt">
        <path d="M46 100 Q46 46 100 46 Q154 46 154 100 Q154 172 100 196 Q46 172 46 100 Z" fill="#FBFDFF" stroke="#2D2640" strokeWidth="2.2" />
        <rect x="64" y="66" width="72" height="22" rx="11" fill="#FFCD78" opacity="0.5" />
        <rect x="92" y="88" width="16" height="40" rx="8" fill="#FFCD78" opacity="0.5" />
        <ellipse cx="70" cy="120" rx="15" ry="19" fill="#7DD9C0" opacity="0.5" />
        <ellipse cx="130" cy="120" rx="15" ry="19" fill="#7DD9C0" opacity="0.5" />
        <path d="M78 158 Q100 176 122 158 Q118 190 100 194 Q82 190 78 158 Z" fill="#FF5C9E" opacity="0.5" />
        <circle cx="82" cy="104" r="3" fill="#2D2640" />
        <circle cx="118" cy="104" r="3" fill="#2D2640" />
        <path d="M88 150 Q100 158 112 150" stroke="#2D2640" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <div className="flex flex-col gap-1.5 text-sm text-cta/80">
        {zones.map((z) => (
          <div key={z} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ZONE_META[z].color }} />
            <span>{ZONE_LABELS[z]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Thay TOÀN BỘ `function ReportStep`**

Thay:

```tsx
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
```

bằng:

```tsx
function ReportStep({ onPick }: { onPick: (zone: SkinZone) => void }) {
  const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
  return (
    <PlayfulBackdrop>
      <div className="flex flex-col items-center md:flex-row md:items-center md:gap-10">
        <FaceMap className="hidden md:flex" />
        <div className="w-[330px] md:w-[440px] rounded-[28px] bg-[#2D2640] shadow-[0_18px_50px_rgba(45,38,64,0.35)] p-5 md:p-7">
          <div className="text-center text-white mb-4">
            <div className="text-[13px] font-bold tracking-wide" style={{ color: '#FFB8D4' }}>
              SOI XONG RỒI 🎉
            </div>
            <div className="text-lg md:text-xl font-extrabold leading-snug mt-1.5">
              Còn da của <u>bạn</u> thì hay “nổi loạn” nhất ở đâu?
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
    </PlayfulBackdrop>
  );
}
```

- [ ] **Step 3: Kiểm tra type**

Run: `npx tsc --noEmit`
Expected: PASS, 0 lỗi.

- [ ] **Step 4: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "feat: two-column desktop face-map layout for ReportStep"
```

---

## Task 4: Xác minh toàn bộ (test + preview desktop/mobile)

**Files:** không sửa; chỉ chạy kiểm tra.

- [ ] **Step 1: Unit test + type-check**

Run: `npx vitest run` → Expected: 18 passed.
Run: `npx tsc --noEmit` → Expected: PASS.

- [ ] **Step 2: Preview desktop**

Dùng preview server (Next dev). Ở viewport desktop (`preview_resize` preset `desktop`), đi Hero → bấm "Soi da ngay":
- FindGame hiện **hai cột**: board navy bên trái, panel phải có tiêu đề "Tìm hết các 'bạn nhỏ'...", chip "N đã soi / còn M", và mascot SVG. Nền pastel gradient có blob mờ.
- Chờ ~22s (lưới an toàn) hoặc chạm hết nốt → sang ReportStep: hiện **hai cột** — FaceMap SVG (mặt + 4 vùng màu + legend) bên trái, card câu hỏi với 4 nút xếp **2×2** bên phải.

- [ ] **Step 3: Preview mobile**

Ở viewport mobile (`preview_resize` preset `mobile`):
- FindGame: chỉ còn board gọn (panel phải ẩn), nền pastel nhẹ.
- ReportStep: FaceMap ẩn, 4 nút xếp **dọc 1 cột**, card gọn.
- Xác nhận vẫn chạm khoanh nốt được và chọn vùng ra payoff đúng.

- [ ] **Step 4: Chụp bằng chứng**

`preview_screenshot` ở cả desktop và mobile cho FindGame và ReportStep.

- [ ] **Step 5: Commit (nếu có chỉnh nhỏ khi verify)**

```bash
git add -A
git commit -m "chore: verify minigame desktop layout end-to-end"
```

(Bỏ qua nếu không có thay đổi.)

---

## Ghi chú triển khai

- **Logic không đổi:** không đụng hooks, timer gợi ý, `ScanBoard`, `resolveProfileByZone`, `onComplete`. Nếu thấy mình sửa các phần đó → dừng lại, sai phạm vi.
- **Ràng buộc preview:** Next.js 16 khóa một dev server mỗi thư mục. Nếu đã có dev server khác đang chạy cùng thư mục, `preview_start` sẽ báo lỗi — khi đó cần dừng server kia trước, hoặc verify trên server đang chạy.
- `frameStyle` (width 330 cố định) vẫn dùng cho board của FindGame (mobile-first, desktop đặt cạnh panel). Riêng ReportStep đổi sang card bằng Tailwind (`w-[330px] md:w-[440px]`) để lưới 2×2 đủ rộng chứa nhãn dài trên desktop.
