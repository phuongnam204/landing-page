# Design Spec: 14 New CSS Themes

**Date:** 2026-07-13
**Status:** Approved

---

## Mục tiêu

Landing page hiện có 20 version nhưng chỉ có 6 CSS theme class (`blossom`, `ocean`, `sage`, `golden`, `midnight`, `magenta`), khiến nhiều version phải dùng chung theme. Mục tiêu là thêm 14 theme mới để mỗi version có một visual identity riêng biệt.

**Kết quả mong muốn:** 20 theme class cho 20 version — 1 theme per version.

---

## Existing Themes (giữ nguyên, không thay đổi)

| Class | Palette tóm tắt |
|---|---|
| `theme-blossom` | Pink pastel + lavender, accent purple |
| `theme-ocean` | Cool blue, clinical/fresh |
| `theme-sage` | Natural green, organic |
| `theme-golden` | Warm amber/yellow, bold |
| `theme-midnight` | Dark purple/navy, mysterious |
| `theme-magenta` | Deep purple + neon pink, electric |

---

## 14 New Themes

### Group 1: Pastel / Light

#### `theme-coral`
**Coral Peach** — cam đào ấm, GenZ sunset vibes. Khác blossom (pink/purple) và golden (amber-brown) — vùng warm-coral chưa được lấp đầy.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#FFF1EC` |
| `--lp-bg-minigame` | `#FFD9C8` |
| `--lp-bg-payoff` | `#FFBBA8` |
| `--lp-bg-programs` | `#FFD9C8` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#7A2C18` |
| `--lp-accent` | `#FF7A5A` |
| `--lp-border` | `#FFBBA8` |
| `--lp-blob-1` | `#FF9F88` |
| `--lp-blob-2` | `#FF7A5A` |
| `--lp-blob-3` | `#FFCCC0` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#7A2C18` |
| `--lp-band-text` | `#FFCCC0` |
| `--lp-band-accent` | `#FF7A5A` |

---

#### `theme-lilac`
**Lilac Bloom** — lavender-violet thuần, dreamy feminine. Blossom thiên pink, Lilac thiên purple — xu hướng mạnh 2024–25 trong skincare.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#F5F0FF` |
| `--lp-bg-minigame` | `#E2D9FF` |
| `--lp-bg-payoff` | `#C4B5FD` |
| `--lp-bg-programs` | `#E2D9FF` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#3B1A78` |
| `--lp-accent` | `#8B5CF6` |
| `--lp-border` | `#C4B5FD` |
| `--lp-blob-1` | `#C4B5FD` |
| `--lp-blob-2` | `#A78BFA` |
| `--lp-blob-3` | `#DDD6FE` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#3B1A78` |
| `--lp-band-text` | `#EDE9FE` |
| `--lp-band-accent` | `#8B5CF6` |

---

#### `theme-ice`
**Ice Crystal** — ice blue lạnh sắc, ultra clean clinical. Ocean đậm hơn, Ice bright và sterile hơn — phù hợp clinical archetype.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#F0F9FF` |
| `--lp-bg-minigame` | `#DBF0FF` |
| `--lp-bg-payoff` | `#BAE6FD` |
| `--lp-bg-programs` | `#DBF0FF` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#0C2B45` |
| `--lp-accent` | `#0EA5E9` |
| `--lp-border` | `#BAE6FD` |
| `--lp-blob-1` | `#7DD3FC` |
| `--lp-blob-2` | `#38BDF8` |
| `--lp-blob-3` | `#BAE6FD` |
| `--lp-radius-card` | `14px` |
| `--lp-radius-btn` | `14px` |
| `--lp-band-bg` | `#0C2B45` |
| `--lp-band-text` | `#E0F2FE` |
| `--lp-band-accent` | `#0EA5E9` |

---

#### `theme-dusty-rose`
**Dusty Rose** — rose desaturated + mauve, soft luxury vintage. Khác blossom (pastel sáng) — tone này già dặn hơn, premium skincare.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#FDF4F5` |
| `--lp-bg-minigame` | `#F9DADE` |
| `--lp-bg-payoff` | `#F0B8C0` |
| `--lp-bg-programs` | `#F9DADE` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#5E1A26` |
| `--lp-accent` | `#D4687A` |
| `--lp-border` | `#F0B8C0` |
| `--lp-blob-1` | `#F0B8C0` |
| `--lp-blob-2` | `#E88A97` |
| `--lp-blob-3` | `#FAD0D6` |
| `--lp-radius-card` | `24px` |
| `--lp-radius-btn` | `24px` |
| `--lp-band-bg` | `#5E1A26` |
| `--lp-band-text` | `#FDF4F5` |
| `--lp-band-accent` | `#D4687A` |

---

#### `theme-matcha`
**Matcha Latte** — xanh lá vàng earthy, wellness cafe aesthetic. Sage là green thuần, Matcha thêm vị yellow-lime earthy.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#F6FAF0` |
| `--lp-bg-minigame` | `#E5F0D8` |
| `--lp-bg-payoff` | `#D1E8B4` |
| `--lp-bg-programs` | `#E5F0D8` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#1E3A08` |
| `--lp-accent` | `#65A30D` |
| `--lp-border` | `#BEF264` |
| `--lp-blob-1` | `#BEF264` |
| `--lp-blob-2` | `#A3E635` |
| `--lp-blob-3` | `#D9F99D` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#1E3A08` |
| `--lp-band-text` | `#F7FEE7` |
| `--lp-band-accent` | `#65A30D` |

---

### Group 2: Vivid / Saturated

#### `theme-tropical`
**Tropical Reef** — teal-turquoise nhiệt đới, saturated. Ocean là xanh dương, Tropical là xanh ngọc — sắc sảo và sống động hơn.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#F0FDFA` |
| `--lp-bg-minigame` | `#CCFBF1` |
| `--lp-bg-payoff` | `#99F6E4` |
| `--lp-bg-programs` | `#CCFBF1` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#042F2E` |
| `--lp-accent` | `#0D9488` |
| `--lp-border` | `#5EEAD4` |
| `--lp-blob-1` | `#5EEAD4` |
| `--lp-blob-2` | `#2DD4BF` |
| `--lp-blob-3` | `#99F6E4` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#042F2E` |
| `--lp-band-text` | `#CCFBF1` |
| `--lp-band-accent` | `#0D9488` |

---

#### `theme-berry`
**Berry Bliss** — fuchsia + plum, vivid nhưng vẫn ban ngày. Magenta là neon-dark, Berry là pastel-vivid — đậm nhưng playful.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#FDF4FF` |
| `--lp-bg-minigame` | `#F5D0FE` |
| `--lp-bg-payoff` | `#E879F9` |
| `--lp-bg-programs` | `#F5D0FE` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#4A044E` |
| `--lp-accent` | `#A21CAF` |
| `--lp-border` | `#E879F9` |
| `--lp-blob-1` | `#E879F9` |
| `--lp-blob-2` | `#D946EF` |
| `--lp-blob-3` | `#F0ABFC` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#4A044E` |
| `--lp-band-text` | `#FDF4FF` |
| `--lp-band-accent` | `#A21CAF` |

---

#### `theme-periwinkle`
**Periwinkle** — xanh-tím nhạt (blue-violet), dreamy. Vùng blue-violet chưa có trong bộ gốc — rất phổ biến 2024–25.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#EEF2FF` |
| `--lp-bg-minigame` | `#E0E7FF` |
| `--lp-bg-payoff` | `#C7D2FE` |
| `--lp-bg-programs` | `#E0E7FF` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#1E1B4B` |
| `--lp-accent` | `#4F46E5` |
| `--lp-border` | `#A5B4FC` |
| `--lp-blob-1` | `#A5B4FC` |
| `--lp-blob-2` | `#818CF8` |
| `--lp-blob-3` | `#C7D2FE` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#1E1B4B` |
| `--lp-band-text` | `#EEF2FF` |
| `--lp-band-accent` | `#4F46E5` |

---

#### `theme-cherry-jp`
**Cherry Blossom JP** — hồng anh đào + dark green accent, J-beauty skincare aesthetic. Contrast đẹp và độc đáo — pink pastel kết với dark green.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#FFF5F7` |
| `--lp-bg-minigame` | `#FECDD3` |
| `--lp-bg-payoff` | `#FDA4AF` |
| `--lp-bg-programs` | `#FECDD3` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#1E3A2F` |
| `--lp-accent` | `#1E3A2F` |
| `--lp-border` | `#FDA4AF` |
| `--lp-blob-1` | `#FDA4AF` |
| `--lp-blob-2` | `#FB7185` |
| `--lp-blob-3` | `#FECDD3` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#1E3A2F` |
| `--lp-band-text` | `#FECDD3` |
| `--lp-band-accent` | `#FB7185` |

---

### Group 3: Dark / Electric

#### `theme-charcoal`
**Charcoal Frost** — xám đá + ice blue accent, clinical dark mode. Midnight là purple-dark, Charcoal là grey-dark lạnh — minimal và professional.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#111827` |
| `--lp-bg-minigame` | `#1F2937` |
| `--lp-bg-payoff` | `#374151` |
| `--lp-bg-programs` | `#1F2937` |
| `--lp-bg-card` | `#1F2937` |
| `--lp-primary` | `#E2E8F0` |
| `--lp-accent` | `#60A5FA` |
| `--lp-border` | `#374151` |
| `--lp-blob-1` | `#1D4ED8` |
| `--lp-blob-2` | `#2563EB` |
| `--lp-blob-3` | `#1E3A8A` |
| `--lp-radius-card` | `14px` |
| `--lp-radius-btn` | `14px` |
| `--lp-band-bg` | `#111827` |
| `--lp-band-text` | `#E2E8F0` |
| `--lp-band-accent` | `#60A5FA` |

---

#### `theme-forest`
**Forest Night** — deep forest green dark, natural archetype phiên bản tối. Navy+Mint là navy+mint, Forest là deep green sẫm hơn.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#052E16` |
| `--lp-bg-minigame` | `#14532D` |
| `--lp-bg-payoff` | `#166534` |
| `--lp-bg-programs` | `#14532D` |
| `--lp-bg-card` | `#0F3D20` |
| `--lp-primary` | `#F0FDF4` |
| `--lp-accent` | `#4ADE80` |
| `--lp-border` | `#166534` |
| `--lp-blob-1` | `#16A34A` |
| `--lp-blob-2` | `#15803D` |
| `--lp-blob-3` | `#166534` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#052E16` |
| `--lp-band-text` | `#DCFCE7` |
| `--lp-band-accent` | `#4ADE80` |

---

#### `theme-crimson`
**Crimson Night** — đỏ crimson neon trên nền đen sẫm, dramatic. Dark mode mạnh nhất trong bộ — bold và powerful.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#0F0005` |
| `--lp-bg-minigame` | `#1F0010` |
| `--lp-bg-payoff` | `#300018` |
| `--lp-bg-programs` | `#1F0010` |
| `--lp-bg-card` | `#1A000D` |
| `--lp-primary` | `#FFE4E6` |
| `--lp-accent` | `#E11D48` |
| `--lp-border` | `#4C0519` |
| `--lp-blob-1` | `#9F1239` |
| `--lp-blob-2` | `#BE123C` |
| `--lp-blob-3` | `#881337` |
| `--lp-radius-card` | `20px` |
| `--lp-radius-btn` | `20px` |
| `--lp-band-bg` | `#0F0005` |
| `--lp-band-text` | `#FFE4E6` |
| `--lp-band-accent` | `#E11D48` |

---

### Group 4: Special / Dual-tone

#### `theme-cotton-candy`
**Cotton Candy** — pink + sky blue bicolor pastel, dual-tone. Kỹ thuật dùng 2 hue chủ đạo — rất GenZ/TikTok, độc đáo nhất trong bộ.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#FDF4FF` |
| `--lp-bg-minigame` | `#F5D0FE` |
| `--lp-bg-payoff` | `#BAE6FD` |
| `--lp-bg-programs` | `#E0F2FE` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#1E1B4B` |
| `--lp-accent` | `#EC4899` |
| `--lp-border` | `#A5F3FC` |
| `--lp-blob-1` | `#F9A8D4` |
| `--lp-blob-2` | `#7DD3FC` |
| `--lp-blob-3` | `#F0ABFC` |
| `--lp-radius-card` | `24px` |
| `--lp-radius-btn` | `24px` |
| `--lp-band-bg` | `#1E1B4B` |
| `--lp-band-text` | `#FDF4FF` |
| `--lp-band-accent` | `#EC4899` |

---

#### `theme-opal`
**Opal** — trắng ngọc trai ánh tím-hồng iridescent, premium spa feel. Dual-tone tinh tế hơn Cotton Candy — high-end luxury skincare.

| Token | Value |
|---|---|
| `--lp-bg-hero` | `#F8FAFF` |
| `--lp-bg-minigame` | `#EEF2FF` |
| `--lp-bg-payoff` | `#FDF4FF` |
| `--lp-bg-programs` | `#F5F3FF` |
| `--lp-bg-card` | `#ffffff` |
| `--lp-primary` | `#312E81` |
| `--lp-accent` | `#818CF8` |
| `--lp-border` | `#C4B5FD` |
| `--lp-blob-1` | `#A5B4FC` |
| `--lp-blob-2` | `#E879F9` |
| `--lp-blob-3` | `#DDD6FE` |
| `--lp-radius-card` | `24px` |
| `--lp-radius-btn` | `24px` |
| `--lp-band-bg` | `#312E81` |
| `--lp-band-text` | `#F8FAFF` |
| `--lp-band-accent` | `#818CF8` |

---

## Token Pattern

Mỗi theme tuân theo cấu trúc token đã có trong `src/landing/themes.css`:

```css
.theme-{name} {
  --lp-bg-hero, --lp-bg-minigame, --lp-bg-payoff, --lp-bg-programs
  --lp-bg-card
  --lp-primary, --lp-accent, --lp-border
  --lp-blob-1, --lp-blob-2, --lp-blob-3
  --lp-radius-card, --lp-radius-btn
  --lp-pastel-pink, --lp-pastel-lavender, --lp-pastel-mint
  --lp-border-pink, --lp-border-mint, --lp-border-lavender
  --lp-label-purple
  --lp-band-bg, --lp-band-text, --lp-band-accent
}
```

Các token `--lp-pastel-*`, `--lp-border-*`, `--lp-label-purple` được derive theo quy tắc sau:

| Token | Quy tắc derive |
|---|---|
| `--lp-pastel-pink` | = `--lp-bg-hero` (hoặc tông nhẹ nhất của hue chính) |
| `--lp-pastel-lavender` | = `--lp-bg-programs` |
| `--lp-pastel-mint` | = `--lp-bg-payoff` |
| `--lp-border-pink` | = `--lp-blob-1` (mid-tone của hue chính) |
| `--lp-border-mint` | = `--lp-blob-2` |
| `--lp-border-lavender` | = `--lp-border` |
| `--lp-label-purple` | = `--lp-accent` |

Các token này mang tên `pink/lavender/mint` theo convention của theme blossom gốc, nhưng trong các theme khác chúng chỉ đóng vai trò là "light tint 1/2/3" và "border light/mid/dark" của palette đó — không phải màu cố định.

---

## Ghi chú về Radius

| Theme | Radius | Lý do |
|---|---|---|
| `ice`, `charcoal` | `14px` | Clinical — góc vuông hơn, professional |
| `dusty-rose`, `matcha`, `cotton-candy`, `opal` | `24px` | Soft/luxury — góc tròn nhiều hơn |
| Còn lại | `20px` | Default playful/vivid |

---

## Không nằm trong scope

- Tạo variant mới cho các slots (hook, minigame, payoff, programs, conversion, done)
- Mapping theme → version cụ thể (làm riêng sau)
- Thay đổi CSS token structure hiện có
