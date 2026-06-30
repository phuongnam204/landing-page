# Visual Style

Visual style đã được chốt qua quá trình brainstorm trực quan (xem mockup tại
`.superpowers/brainstorm/266-1782830805/content/combined-mockup-v3.html`). File này là nguồn sự
thật cho design token — khi code, đặt các giá trị dưới đây vào một nơi tập trung (Tailwind config
hoặc CSS variables), không hard-code rải rác trong component.

## Vì sao tách riêng thành file này

`01-product-ux-spec.md` đặc tả hành vi/luồng UX (cấu trúc trang, cách section phản hồi), không nói
tới màu sắc/typography/style cụ thể. Visual style là một lớp quyết định khác — có thể thay đổi độc
lập với hành vi UX (đổi màu/font không ảnh hưởng tới luồng hook → interactive core → payoff →
conversion). Tách riêng để khi cập nhật visual style không phải sửa vào file đặc tả hành vi, và
ngược lại.

## Visual tone

**Playful Pastel.** Cảm giác trẻ trung, thân thiện, dễ chịu — phù hợp đối tượng Gen Z lướt TikTok
hơn các hướng "vibrant rực rỡ" hoặc "dark neon" đã cân nhắc và loại trong quá trình brainstorm
(xem [00-overview.md](00-overview.md) về persona).

Lưu ý: tham khảo ban đầu tới landing page Google Ads trong tài liệu này chỉ ở khía cạnh **luồng
CTA/friction** (xem [04-friction-research-and-examples.md](04-friction-research-and-examples.md)),
không liên quan tới visual tone — Google Ads là trang B2B, tông giọng khác hẳn Playful Pastel.

## Color palette

- **Nền chính:** gradient pastel nhẹ giữa hồng nhạt, lavender, mint — ví dụ `#FFD3E0 → #C7CEEA →
  #A8E6CF`. Dùng cho background hook section và interactive core.
- **CTA / màu nhấn hành động chính:** tối đậm (navy/charcoal) — ví dụ `#2D2640`, chữ trắng. Nổi bật
  bằng tương phản sáng/tối với nền pastel, không thêm một màu mới vào palette (giữ palette gọn).
- **Card/khối nội dung:** nền trắng `#fff`, để tách khỏi nền gradient và đảm bảo tương phản chữ tốt.
- **Viền phân biệt theo lựa chọn** (ví dụ từng đáp án quiz): màu pastel nhạt theo từng item, viền
  2px — ví dụ `#FFB8CE`, `#9FE6BD`, `#B6BCEE`. Không dùng màu nền đậm cho ô đáp án vì dễ làm chữ bị
  chìm — đã phát hiện và sửa lỗi này trong quá trình brainstorm (v1 dùng nền pastel đậm cho ô đáp
  án, chữ tối bị chìm vào nền; v2 sửa bằng cách chuyển nền ô đáp án sang trắng + viền màu nhạt).
- **Progress bar:** track màu trắng bán trong suốt trên nền gradient (`rgba(255,255,255,0.6)`), fill
  dùng màu CTA (navy/charcoal) để đồng bộ với điểm nhấn hành động.

## Typography

**Modern Geometric Sans** — ví dụ Poppins hoặc Inter (load qua Google Fonts hoặc self-host nhẹ,
khớp ràng buộc tải nhanh ở [00-overview.md](00-overview.md)). Đã loại hướng "Rounded Friendly"
(Baloo 2/Fredoka — quá trẻ con khi dùng cho khối text dài hơn) và "Bold Display + Sans" (2 font
phối hợp — không cần thiết vì 1 font geometric sans đã đủ phân cấp rõ qua font-weight).

- Heading/hook: font-weight 800, size lớn (~24-28px ở mobile).
- Label phụ (ví dụ "Câu 2/4"): font-weight 700, size nhỏ (~12px), uppercase, màu tím nhạt
  (`#9b8fc4`) để phân cấp rõ với heading.
- Câu hỏi quiz: font-weight 700, ~17px.
- Đáp án/lựa chọn: font-weight 700, **15px** (đã tăng từ 13px sau khi review mockup — đáp án là nơi
  người dùng tương tác trực tiếp nên cần dễ đọc hơn text phụ).
- CTA button: font-weight 700, ~15px, chữ trắng trên nền tối.

## Shape / component style

**Soft Rounded.** Bo góc lớn (16-20px) cho card và CTA, progress bar dạng pill bo tròn hoàn toàn,
shadow nhẹ tạo độ nổi (`box-shadow: 0 8px 20px rgba(45,38,64,0.12)` cho card, `0 4px 0
rgba(0,0,0,0.15)` cho CTA — shadow "flat-drop" tạo cảm giác nút có thể bấm). Đã loại hướng "Medium
Rounded" (gọn nhưng kém playful) và "Sharp Flat" (viền vuông — giảm tinh thần playful đã chọn ở
visual tone).

## Emoji — dùng có kiểm soát

Emoji chỉ dùng ở câu hỏi/heading để tạo cảm giác quan tâm, chăm sóc khách hàng (ví dụ một emoji nhẹ
ở cuối câu hỏi quiz) — **không** lạm dụng bằng cách gắn emoji vào từng đáp án/lựa chọn, vì sẽ làm
loãng trọng tâm và không thêm giá trị thông tin. Quy tắc: tối đa 1 emoji mỗi khối nội dung
(heading/câu hỏi), không lặp emoji nhiều nơi trên cùng một màn hình.

## Cách dùng cho agent thực thi

Toàn bộ giá trị màu/font-size/border-radius ở trên là design token — đặt tập trung (Tailwind config
hoặc CSS variables) khi code, không hard-code rải rác trong component, để sau này điều chỉnh chỉ cần
đổi token một nơi.
