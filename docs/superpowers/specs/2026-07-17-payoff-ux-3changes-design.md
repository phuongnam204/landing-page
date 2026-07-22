# Spec: Payoff UX — 3 thay đổi

**Ngày:** 2026-07-17
**Phạm vi:** `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx` + `bold/typographic.tsx`

---

## 1. CTA text: "Tìm ngay giải pháp cho bạn" → "Tôi phải làm sao?"

**File:** `ConfettiCardWhyPayoff.tsx`, hàm `WhySection`, dòng 41.

**Thay đổi:**
```diff
- Tìm ngay giải pháp cho bạn! &#8595;
+ Tôi phải làm sao? &#8595;
```

Không có thay đổi logic. Chỉ là text.

---

## 2. Section mới: Clinic Intro (giữa Why và Benefit)

### Vị trí trong render
```
Section 1: ResultComp          (resultSectRef)
Section 2: WhySection          (whyRef)
Section 2.5: ClinicIntroSection  ← MỚI  (clinicRef)
Section 3: BenefitComp         (statsRef)
Section 4: FeatureComp         (featureRef)
```

### Scroll chain sau thay đổi
- ResultComp.onScrollDown → `whyRef`
- WhySection.onScrollDown → `clinicRef` ← đổi từ `statsRef`
- ClinicIntroSection.onScrollDown → `statsRef`
- BenefitComp.onContinue → `featureRef` (giữ nguyên)
- FeatureComp.onContinue → `onContinue()` (giữ nguyên)

### Nội dung section
- **Eyebrow (tiny label):** "Hãy đến O2skin"
- **Headline:** "Tình trạng như của bạn, chúng tôi đã có giải pháp."
- **Subtext:** "Tại đây chúng tôi có giải pháp toàn diện cho làn da của bạn!"
- **CTA scroll:** "Cùng tham quan một chút nhé! ↓" — anchor scroll đến statsRef, **không phải navigation**

### Visual
- Background: `--lp-bg-payoff` (lấy từ CSS var của version hiện tại)
- Hình ảnh nền: absolute div với `background-image: url('/clinic/o2skin-intro.jpg')`, `opacity: 0.18`, `background-size: cover`
- Color overlay: thêm một lớp `bg-[var(--lp-bg-payoff)]` với `opacity: 0.55` chồng lên image → image chìm vào màu nền của version
- Graceful degradation: nếu `/clinic/o2skin-intro.jpg` chưa có, section vẫn render bình thường bằng background color thuần — không crash
- Chiều cao: `min-h-[60dvh]` (không chiếm full screen như các section khác)
- Layout: `flex flex-col items-center justify-center`, content căn giữa

### Ref mới
```ts
const clinicRef = useRef<HTMLDivElement>(null);
```

### Topbar IntersectionObserver (cập nhật)
- Thêm `clinicRef` vào danh sách refs được observe
- Map `clinicRef.current` → activeSection `'clinic'`
- `activeSection` type: mở rộng từ `'result' | 'why' | 'benefit'` thành `'result' | 'why' | 'clinic' | 'benefit'`

### TopbarConfig type (cập nhật)
```ts
export type TopbarConfig = {
  labels: {
    result: string;
    why: string;
    clinic?: string;   // optional — backward compat
    benefit: string;
  };
  style?: React.CSSProperties;
  className?: string;
};
```

Khi render topbar label: dùng `topbarConfig.labels[activeSection] ?? topbarConfig.labels.benefit` để fallback nếu `clinic` không được khai báo.

---

## 3. Sticky CTA "Đặt lịch ngay" — chỉ từ Section 3 (Benefit) trở xuống

### Hiện trạng
`showSkipCta` = true khi `scrollTop > resultSectRef.offsetHeight - 80`
→ CTA xuất hiện từ Section 2 (Why) trở xuống.

### Thay đổi
Trigger dựa trên `statsRef` (Benefit) thay vì `resultSectRef` (Result):

```ts
function onScroll() {
  const benefitTop = statsRef.current?.offsetTop ?? Infinity;
  setShowSkipCta(container!.scrollTop >= benefitTop - 100);
}
```

Ý nghĩa: CTA xuất hiện khi top của Benefit section cách đỉnh container ≤ 100px, tức là user đang bắt đầu thấy Section 3.

---

## 4. Cập nhật bold/typographic.tsx

File duy nhất dùng `topbarConfig`. Cần thêm label `clinic`:

```ts
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

`benefit` label đổi từ 'Hãy đến O2skin!' thành 'Lợi ích & dịch vụ' vì 'Hãy đến O2skin!' nay thuộc clinic section.

---

## 5. Placeholder ảnh

Tạo thư mục `/public/clinic/`. Image path: `/clinic/o2skin-intro.jpg`.
User tự chọn ảnh và đặt vào đây. Section render gracefully khi ảnh chưa có.

---

## Files bị ảnh hưởng

| File | Loại thay đổi |
|------|--------------|
| `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx` | Chính — tất cả logic |
| `src/landing/variants/payoff/bold/typographic.tsx` | Thêm label `clinic` vào topbarConfig |
| `public/clinic/` | Tạo thư mục (placeholder) |
