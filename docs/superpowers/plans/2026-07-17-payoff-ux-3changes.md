# Payoff UX — 3 Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đổi CTA text ở Why section, thêm ClinicIntroSection giữa Why và Benefit, và chỉ hiện sticky "Đặt lịch ngay" từ Benefit trở xuống.

**Architecture:** Tất cả thay đổi tập trung tại `ConfettiCardWhyPayoff.tsx` — shared organism được dùng bởi toàn bộ payoff variants. `ClinicIntroSection` là một function component nội bộ cùng file. Scroll chain mới: Result → Why → Clinic → Benefit → Feature.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Next.js App Router

---

## Task 1: Đổi CTA text trong WhySection

**Files:**
- Modify: `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx:41`

- [ ] **Step 1: Đổi text**

Tìm dòng 41 trong `ConfettiCardWhyPayoff.tsx`, trong hàm `WhySection`:

```tsx
// Trước
Tìm ngay giải pháp cho bạn! &#8595;

// Sau
Tôi phải làm sao? &#8595;
```

Toàn bộ block CtaButton (dòng 35–43) sau khi sửa:

```tsx
<CtaButton
  fullWidth
  onClick={onScrollDown}
  className="md:text-base"
  style={{ animation: 'cta-nudge 1.6s ease-in-out 2.5s 3' }}
>
  Tôi phải làm sao? &#8595;
</CtaButton>
```

- [ ] **Step 2: TypeCheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx
git commit -m "fix(payoff): đổi CTA Why section sang 'Tôi phải làm sao?'"
```

---

## Task 2: Thêm ClinicIntroSection + cập nhật TopbarConfig type + activeSection type

**Files:**
- Modify: `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx`

### 2A — Cập nhật `TopbarConfig` type

Tìm `TopbarConfig` (khoảng dòng 50–58) và thêm trường `clinic?`:

```tsx
export type TopbarConfig = {
  labels: {
    result: string;
    why: string;
    clinic?: string;
    benefit: string;
  };
  style?: React.CSSProperties;
  className?: string;
};
```

### 2B — Thêm hàm `ClinicIntroSection`

Chèn hàm mới sau khi kết thúc `WhySection` (trước export `ConfettiCardWhyPayoff`). Đây là toàn bộ component:

```tsx
function ClinicIntroSection({ onScrollDown }: { onScrollDown: () => void }) {
  return (
    <div className="relative min-h-[60dvh] flex flex-col items-center justify-center overflow-hidden px-6 py-16 bg-[var(--lp-bg-payoff)]">
      {/* Ảnh nền — user đặt ảnh vào /public/clinic/o2skin-intro.jpg */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/clinic/o2skin-intro.jpg')", opacity: 0.18 }}
        aria-hidden="true"
      />
      {/* Lớp màu phủ — blend ảnh vào màu nền của version */}
      <div
        className="absolute inset-0 bg-[var(--lp-bg-payoff)]"
        style={{ opacity: 0.55 }}
        aria-hidden="true"
      />
      <div className="relative z-10 text-center max-w-lg mx-auto flex flex-col items-center gap-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lp-accent)]">
          Hãy đến O2skin
        </p>
        <h2 className="font-extrabold text-2xl md:text-3xl text-cta leading-snug">
          Tình trạng như của bạn,<br className="hidden sm:block" />
          chúng tôi đã có giải pháp.
        </h2>
        <p className="text-sm md:text-base text-cta/75 leading-relaxed">
          Tại đây chúng tôi có giải pháp toàn diện cho làn da của bạn!
        </p>
        <button
          onClick={onScrollDown}
          className="mt-3 text-sm font-semibold text-[var(--lp-accent)] hover:text-cta transition-colors flex items-center gap-1.5"
          style={{ animation: 'cta-nudge 1.6s ease-in-out 2s 3' }}
        >
          Cùng tham quan một chút nhé! &#8595;
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 1: Cập nhật `TopbarConfig` type** (xem 2A)

- [ ] **Step 2: Thêm `ClinicIntroSection`** (xem 2B, đặt sau `WhySection`, trước `ConfettiCardWhyPayoff`)

- [ ] **Step 3: TypeCheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx
git commit -m "feat(payoff): thêm ClinicIntroSection + mở rộng TopbarConfig type"
```

---

## Task 3: Cập nhật refs, scroll chain, IntersectionObserver, và sticky CTA trigger

**Files:**
- Modify: `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx`

Đây là phần thay đổi logic trong hàm `ConfettiCardWhyPayoff`.

### 3A — Thêm `clinicRef` và mở rộng `activeSection` type

Tìm phần khai báo refs (khoảng dòng 73–79). Thêm `clinicRef` và đổi type của `activeSection`:

```tsx
const whyRef             = useRef<HTMLDivElement>(null);
const clinicRef          = useRef<HTMLDivElement>(null);   // ← THÊM
const statsRef           = useRef<HTMLDivElement>(null);
const featureRef         = useRef<HTMLDivElement>(null);
const resultSectRef      = useRef<HTMLDivElement>(null);
const scrollContainerRef = useRef<HTMLDivElement>(null);
const [showSkipCta, setShowSkipCta] = useState(false);
const [activeSection, setActiveSection] = useState<'result' | 'why' | 'clinic' | 'benefit'>('result');
const prevSectionRef = useRef<string>('result');
```

### 3B — Cập nhật `showSkipCta` useEffect

Tìm useEffect đầu tiên (dùng `resultSectRef` để track scroll). Thay đổi trigger từ `resultSectRef.offsetHeight` sang `statsRef.offsetTop`:

```tsx
useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;
  function onScroll() {
    const benefitTop = statsRef.current?.offsetTop ?? Infinity;
    setShowSkipCta(container!.scrollTop >= benefitTop - 100);
  }
  container.addEventListener('scroll', onScroll, { passive: true });
  return () => container.removeEventListener('scroll', onScroll);
}, []);
```

Lưu ý: bỏ biến `el` (trước đây là `resultSectRef.current`) vì không còn dùng nữa.

### 3C — Cập nhật IntersectionObserver useEffect

Tìm useEffect thứ hai (có `if (!topbarConfig) return`). Cập nhật để:
1. Map `clinicRef` → `'clinic'`
2. Observe thêm `clinicRef`

```tsx
useEffect(() => {
  if (!topbarConfig) return;
  const root = scrollContainerRef.current;
  if (!root) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        let next: 'result' | 'why' | 'clinic' | 'benefit' = 'result';
        if (entry.target === resultSectRef.current) next = 'result';
        else if (entry.target === whyRef.current) next = 'why';
        else if (entry.target === clinicRef.current) next = 'clinic';
        else next = 'benefit';
        if (next !== prevSectionRef.current) {
          prevSectionRef.current = next;
          setActiveSection(next);
        }
      }
    },
    { root, threshold: 0.4 },
  );
  [resultSectRef, whyRef, clinicRef, statsRef, featureRef].forEach((r) => {
    if (r.current) observer.observe(r.current);
  });
  return () => observer.disconnect();
}, [topbarConfig]);
```

### 3D — Cập nhật topbar label rendering

Tìm dòng render topbar label (khoảng dòng 128). Thêm fallback khi `clinic` chưa được khai báo trong labels:

```tsx
{topbarConfig.labels[activeSection] ?? topbarConfig.labels.benefit}
```

### 3E — Cập nhật render: scroll chain + thêm ClinicIntroSection

Thay thế toàn bộ phần JSX từ "Section 2: Why" trở xuống:

```tsx
{/* Section 1: Kết quả (above fold) */}
<ResultComp
  containerRef={resultSectRef}
  result={result}
  onScrollDown={() => whyRef.current?.scrollIntoView({ behavior: 'smooth' })}
/>

{/* Section 2: Why */}
<div ref={whyRef} className="bg-[var(--lp-bg-payoff)]">
  <WhySection
    conditionId={result.condition.id as ConditionId}
    onScrollDown={() => clinicRef.current?.scrollIntoView({ behavior: 'smooth' })}
  />
</div>

{/* Section 2.5: Clinic Intro */}
<div ref={clinicRef}>
  <ClinicIntroSection
    onScrollDown={() => statsRef.current?.scrollIntoView({ behavior: 'smooth' })}
  />
</div>

{/* Section 3: Benefit */}
<div ref={statsRef}>
  <BenefitComp onContinue={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })} />
</div>

{/* Section 4: Feature + final CTA */}
<div ref={featureRef}>
  <FeatureComp onContinue={onContinue} />
</div>
```

- [ ] **Step 1: Thêm `clinicRef` + mở rộng `activeSection` type** (xem 3A)

- [ ] **Step 2: Cập nhật `showSkipCta` useEffect** (xem 3B)

- [ ] **Step 3: Cập nhật IntersectionObserver useEffect** (xem 3C)

- [ ] **Step 4: Cập nhật topbar label rendering** (xem 3D)

- [ ] **Step 5: Cập nhật render JSX** (xem 3E)

- [ ] **Step 6: TypeCheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx
git commit -m "feat(payoff): thêm clinicRef, cập nhật scroll chain + observer + sticky CTA trigger"
```

---

## Task 4: Cập nhật bold/typographic.tsx topbarConfig

**Files:**
- Modify: `src/landing/variants/payoff/bold/typographic.tsx`

Tìm `topbarConfig` prop (dòng 11–17). Thêm `clinic` label và đổi `benefit` label:

```tsx
topbarConfig={{
  labels: {
    result:  'Kết quả phân tích',
    why:     'Tìm hiểu nguyên nhân',
    clinic:  'Hãy đến O2skin!',
    benefit: 'Lợi ích & dịch vụ',
  },
  style: { background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' },
}}
```

- [ ] **Step 1: Cập nhật topbarConfig** (xem trên)

- [ ] **Step 2: TypeCheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/payoff/bold/typographic.tsx
git commit -m "fix(payoff/bold-typographic): thêm clinic label cho topbar"
```

---

## Task 5: Tạo thư mục placeholder cho ảnh clinic

**Files:**
- Create: `public/clinic/.gitkeep`

- [ ] **Step 1: Tạo thư mục**

```bash
mkdir -p public/clinic
touch public/clinic/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add public/clinic/.gitkeep
git commit -m "chore: tạo public/clinic/ placeholder cho ảnh ClinicIntroSection"
```

---

## Task 6: Visual verification trong browser

**Files:** Không thay đổi — chỉ verify.

- [ ] **Step 1: Chạy dev server**

```bash
npm run dev
```

- [ ] **Step 2: Mở landing page trong browser**, chọn một version bất kỳ (ví dụ v01 hoặc v19).

- [ ] **Step 3: Hoàn thành minigame** để vào payoff. Verify:
  - Section 2 (Why): CTA đọc "Tôi phải làm sao? ↓" (không còn "Tìm ngay giải pháp")
  - Click CTA → scroll đến ClinicIntroSection (không nhảy thẳng xuống Benefit)
  - ClinicIntroSection hiển thị: eyebrow "Hãy đến O2skin", headline, subtext, CTA "Cùng tham quan một chút nhé! ↓"
  - Click CTA clinic → scroll đến Benefit section
  - Sticky "Đặt lịch ngay" **không** xuất hiện ở Section 1 và Section 2 (Why)
  - Sticky "Đặt lịch ngay" **xuất hiện** khi scroll đến đầu Benefit section

- [ ] **Step 4: Kiểm tra version `bold/typographic`** (nếu có):
  - Topbar label chuyển đúng: "Kết quả phân tích" → "Tìm hiểu nguyên nhân" → "Hãy đến O2skin!" → "Lợi ích & dịch vụ"

- [ ] **Step 5: Kiểm tra graceful degradation**:
  - ClinicIntroSection hiển thị tốt dù `/clinic/o2skin-intro.jpg` chưa có (chỉ có background color)

- [ ] **Step 6: Screenshot và báo cáo** — chụp màn hình 3 trạng thái: Why section, Clinic section, Benefit section.
