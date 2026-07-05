# Thiết kế: Minigame chăm sóc da 3 pha (Pluck-Pop-Squeeze style)

- **Ngày:** 2026-07-04
- **Trạng thái:** Design — chờ duyệt trước khi viết implementation plan
- **Thay thế:** Toàn bộ gameplay "khoanh mụn 6 nốt" hiện tại (`SkinScanScreen` FindGame + logic `generateSpots`/`findNearestUnfoundSpot`/`resolveConditionByZone`).
- **Phạm vi:** lớp **PhaseContent** (nội dung game) bên trong shell iteration 2 (`BrandCanvas` + `GameFrame`, xem [2026-07-04-minigame-brandcanvas-gameframe-design.md](2026-07-04-minigame-brandcanvas-gameframe-design.md)). Spec này tham chiếu shell chứ không thay thế nó.

## 1. Bối cảnh & lý do

Game "khoanh mụn" cũ bị đánh giá "vô tri, tương tác đơn điệu" (chỉ tap 6 chấm) và quá nhanh (~15-20s). Iteration này thay bằng một chuỗi **3 mini-pha lấy cảm hứng từ game Pluck Pop Squeeze** — mỗi pha một kiểu tương tác khác nhau, mô phỏng đúng các thao tác chăm sóc da thật, kéo dài tổng ~2 phút để đủ giữ chân người chơi.

**Nguyên tắc bất biến (giữ từ các iteration trước):** kết quả cá nhân hoá (profile) đến từ **người dùng tự khai** ở bước cuối, KHÔNG phải máy đoán từ thao tác chơi. Ba pha chơi thuần entertainment (oddly-satisfying), phần chẩn đoán tách riêng ở self-report.

**Rào cản y tế (mới, quan trọng):** o2skin là phòng khám da liễu, chuyên môn khuyến cáo KHÔNG tự nặn mụn tại nhà. Game mô phỏng nặn/hút mụn nên cần disclaimer rõ ràng để không lan truyền thông điệp sai (mục 7).

## 2. Tham chiếu asset (đã có sẵn trong repo)

Người dùng đã tạo thủ công 7 SVG asset trong `public/`, spec này dùng lại nguyên vẹn (KHÔNG tự vẽ lại):

| Pha | Asset | File | Kích thước gốc | Vai trò |
|---|---|---|---|---|
| 1 | Mụn trắng idle | `public/acne_press/normal.svg` | 653×413 | Trạng thái bình thường (dome) |
| 1 | Mụn trắng pressed | `public/acne_press/Pressed.svg` | 732×411 | Đang bị nhấn (dẹt) |
| 1 | Mụn trắng popped | `public/acne_press/Pop.svg` | 750×521 | Đã vỡ + mủ + vết đỏ |
| 2 | Mụn đầu đen | `public/black_acne_pull/black_acne.svg` | 61×74 | Chấm mụn đen nhỏ |
| 2 | Miếng dán | `public/black_acne_pull/sticker.svg` | 512×548 | Miếng dán tím trong mờ |
| 3 | Lông tơ | `public/swipe/hair.svg` | 161×166 | Sợi lông trên da |
| 3 | Máy đốt | `public/swipe/machine.svg` | 1012×1627 | Máy đốt lông (tall) |

Các asset khác cần dựng bằng code (không phải hình vẽ tay): scene nền (trời xanh + da cam), ghost hand (SVG bàn tay demo), mũi tên hint, chùm sáng máy đốt (nếu chưa có trong `machine.svg`), hiệu ứng vỡ/hút.

## 3. Bố cục scene chung (áp cho cả 3 pha)

Mỗi pha render bên trong `GameFrame` (khung bo góc, không edge-to-edge — xem shell spec). Bên trong GameFrame chia:

- **HUD header** (trên cùng, nền trắng): nhãn "PHA N / 3", tiêu đề pha, thanh progress gradient hồng-tím + bộ đếm "x / total".
- **Scene** (phần còn lại): chia dọc theo tỉ lệ **trời : da = 3 : 2** (trời xanh `#7A9EBB` chiếm 60% chiều cao, da cam `#E8A57E` chiếm 40%), ranh giới có đường viền răng cưa trắng (torn-paper). Đây là quyết định đã chốt qua mockup.

**Quy tắc bố trí vật thể (đã chốt qua mockup v2):**
- **Vật thể chính** (miếng dán pha 2, máy đốt pha 3) xuất phát ở **vùng trời xanh**, người chơi kéo/vuốt xuống vùng da cam để thao tác.
- **Đối tượng mục tiêu** (mụn trắng / mụn đen / lông tơ) phân bố **cụm sát ranh giới trời-da**, khoảng cách giữa chúng ngắn (dày đặc), KHÔNG rải xuống tận đáy.
- Máy đốt (`machine.svg`) hiển thị ở kích thước **×1.5 so với mockup v2** (tức ~96×155px trên khung mobile) — quyết định chốt ở lượt duyệt cuối.

## 4. Ba pha chơi

### Pha 1 — Nặn mụn đầu trắng (NHẤN GIỮ / press-hold)

- **Mục tiêu:** 5 mụn trắng cụm sát ranh giới da. Nhấn & giữ mỗi mụn ~700ms để nó chuyển trạng thái `normal → pressed → popped`.
- **Asset states:** `normal.svg` (idle) → khi pointer-down đổi sang `Pressed.svg` + bắt đầu đếm giữ → sau ngưỡng giữ đổi sang `Pop.svg` (kèm mủ trắng + vết đỏ đã vẽ sẵn trong asset). Mụn đã pop **để lại nguyên `Pop.svg` tại chỗ** (hậu quả bám lâu, không biến mất).
- **Interaction:** `pointerdown` trên mụn → set trạng thái pressed + start timer; `pointerup`/`pointerleave` trước ngưỡng → revert về normal (nặn hụt); giữ đủ ngưỡng → popped, tăng đếm.
- **Hoàn thành:** pop đủ 5 mụn.

### Pha 2 — Hút mụn đầu đen bằng miếng dán (KÉO THẢ 2 bước / drag-drop)

- **Mục tiêu:** ~28 mụn đen li ti (dày, cụm sát ranh giới). Dùng 1 miếng dán vuông (`sticker.svg`).
- **Luật 2 bước** (theo mô tả người dùng):
  1. Kéo miếng dán từ vùng trời xanh xuống **thả vào vùng có mụn đen** (áp lên da). Miếng dán "dính" tại chỗ khi thả.
  2. Kéo miếng dán lên (lift) lần nữa → tất cả mụn đen NẰM DƯỚI vùng phủ của miếng dán bị "hút" lên theo (biến mất khỏi da, hiện dính trên miếng dán). Da vùng đó sạch.
  3. Lặp lại: đặt lại miếng dán ở cụm mụn còn lại cho đến khi hết.
- **Interaction:** drag (pointerdown trên sticker → pointermove theo con trỏ → pointerup = thả). Detect mụn đen nằm trong bounding-box của sticker khi lift để đánh dấu found.
- **Hoàn thành:** hút hết ~28 mụn đen (miếng dán có thể cần đặt 2-3 lần tuỳ phân bố).

### Pha 3 — Cạo lông tơ bằng máy đốt (VUỐT / swipe)

- **Mục tiêu:** ~40 lông tơ (dày, cụm sát ranh giới). Dùng máy đốt (`machine.svg`, ×1.5 size).
- **Luật:** kéo máy đốt từ vùng trời xanh xuống da, rồi **vuốt qua các lông tơ** — lông tơ đi vào vùng đầu máy (chùm sáng) thì fade dần rồi biến mất.
- **Interaction:** drag máy theo con trỏ (pointerdown → pointermove → pointerup). Mỗi frame di chuyển, detect lông tơ trong bán kính đầu máy → set `fading` → sau ~300ms xoá.
- **Hoàn thành:** đốt hết ~40 lông tơ.

**Điểm chung 3 pha:** đối tượng lưu bằng toạ độ `%` khung scene, detect va chạm bằng khoảng cách/bounding-box theo `%` (giống cơ chế `findNearestUnfoundSpot` cũ, tái dụng ý tưởng). Thao tác dùng Pointer Events (hoạt động cả chuột desktop lẫn touch mobile).

## 5. Hệ thống gợi ý (hint) + safety net

**Bối cảnh:** landing page thu lead — không để ai do dự hay kẹt rồi bỏ. Mỗi pha có 2 lớp hint hiển thị ngay khi pha mở, tự tắt khi người chơi tương tác lần đầu:

- **Micro-copy top** (5-8 chữ, trắng có drop-shadow, đặt ở vùng trời): pha 1 "Nhấn giữ để nặn mụn 👇", pha 2 "Kéo miếng dán vào vùng mụn 👇", pha 3 "Vuốt máy qua lông tơ 👇". Kèm mũi tên trắng bounce chỉ xuống.
- **Ghost hand** (SVG bàn tay ma opacity ~0.92): demo đúng thao tác của pha, loop ~2.5-3.5s cho đến khi user chạm màn lần đầu.

**Escalating hint + safety net** (kế thừa từ iteration 1):
- Nếu >20s chưa hoàn thành pha → kích hoạt lại hint (glow/highlight đối tượng cần thao tác).
- Nếu >35s vẫn kẹt → **tự động hoàn thành pha** (auto-clear đối tượng còn lại) và chuyển tiếp. Không ai bị mắc kẹt dù mạng chậm/mất tập trung.

Tất cả hint tôn trọng `prefers-reduced-motion` (tắt animation, vẫn hiện tĩnh).

## 6. Bước tự khai (3 câu) + ánh xạ profile

Sau 3 pha chơi, hiện **3 câu hỏi single-choice liên tiếp** (không xen kẽ với chơi — đã chốt phương án (i)). Mỗi câu 4 lựa chọn tap, tổng ~30s.

| Câu | Nội dung | 4 lựa chọn (id) |
|---|---|---|
| Q1 | "Da bạn hay nổi loạn ở đâu?" | `cam-quai-ham` / `chu-t` / `hai-ma` / `khong-bi` |
| Q2 | "Cảm giác da chủ đạo?" | `dau` / `kho` / `nhay-cam` / `on-dinh` |
| Q3 | "Da bạn 'nổi loạn' khi nào?" | `ky-kinh` / `nang` / `stress` / `thuc-khuya` |

**Waterfall ánh xạ → profile** (deterministic, dùng lại 6 profile có sẵn trong `content/quiz.ts`, KHÔNG thêm profile mới):

```
resolveProfile(q1_zone, q2_feel, q3_trigger):
  1. q1 = cam-quai-ham                    → mun-noi-tiet
  2. q1 = chu-t   AND q2 = dau            → da-nhon-mun-viem
  3. q1 = chu-t   AND q2 ≠ dau            → lo-chan-long
  4. q1 = hai-ma                          → da-nhay-cam
  5. q1 = khong-bi AND q2 = on-dinh       → clean-skin
  6. q1 = khong-bi AND q2 ≠ on-dinh       → da-moi-bat-dau
```

**Vai trò từng câu:**
- **Q1 (zone)** là driver chính theo nguyên lý face mapping (vùng cằm→nội tiết, chữ T→dầu/lỗ chân lông, má→nhạy cảm).
- **Q2 (feel)** tinh chỉnh nhánh `chu-t` (dầu→mụn viêm, không dầu→lỗ chân lông) và nhánh `khong-bi` (ổn định→clean, khác→chưa rõ).
- **Q3 (trigger)** KHÔNG đổi bucket profile — chỉ **cá nhân hoá copy** ở màn reveal (ví dụ "xuất hiện theo <b>kỳ kinh</b>"). Đây là quyết định trung thực: không giả vờ chính xác hơn dữ liệu cho phép. Ghi rõ để không ai tưởng Q3 vô dụng — nó làm reveal "nói đúng về bạn" hơn.

## 7. Copy disclaimer y tế (slot, marketing chốt sau)

- **Đầu game** (trước pha 1): 1 dòng nhẹ ~2s "Mô phỏng vui thôi nhé 💛 — da thật cần chuyên gia chăm" rồi mờ đi.
- **Màn reveal cuối** (trước CTA): 1 dòng "Bác sĩ o2skin xử lý chuẩn hơn tự làm nhé" + dòng nhỏ "kết quả dựa trên bạn tự khai, không phải máy đoán".
- Copy cụ thể là placeholder, marketing duyệt sau. Spec chỉ đặt slot + tinh thần.

## 8. Luồng & tích hợp

```
hero → minigame[ pha1 → pha2 → pha3 → self-report(3 câu) ] → payoff(reveal) → programs → conversion → done
```

- Toàn bộ minigame là 1 component orchestrator (thay `SkinScanScreen`), chạy trong shell `BrandCanvas`+`GameFrame`. `onComplete(result, stats)` vẫn là điểm thoát duy nhất trả về `AppFlow` — giữ chữ ký tương thích (`result: SkinCondition`, `stats` mang dữ liệu để `PayoffStats` render).
- `PayoffStats` (2 chip) đổi nguồn: thay vì "số nốt đã soi + vùng", giờ có thể là "số mụn/lông đã xử lý + nhãn vùng tự khai". Chi tiết chip chốt ở plan.
- Chuyển pha trong minigame dùng animation transition của shell (fade-up out → gap → bouncy-in).

## 9. Component & file (phác thảo, chi tiết ở plan)

- **Mới** `src/components/MinigameCore/skinProfileLogic.ts`: types cho 3 câu (`SkinZone`, `SkinFeel`, `SkinTrigger`), `resolveProfile()` waterfall (mục 6), + unit test. Thay vai trò `resolveConditionByZone` cũ.
- **Mới** `src/components/MinigameCore/collisionUtils.ts`: helper detect va chạm theo `%` (point-in-radius, point-in-box) — tái dụng ý tưởng `findNearestUnfoundSpot`, dùng chung 3 pha.
- **Mới** các component pha: `PressPhase`, `DragPhase`, `SwipePhase`, `SelfReportStep`, orchestrator `SkinGame` (tên cuối chốt ở plan), + shared `GamePhaseChrome` (HUD+hint), `GhostHand`, hook `useAdvancingHint` (escalating + safety net).
- **Sửa** `AppFlow.tsx`: swap `SkinScanScreen` → orchestrator mới.
- **Bỏ/deprecate** `skinScanLogic.ts` cũ (spots/zone) + test — superseded. Giữ `content/quiz.ts` nguyên (6 profile đã đủ).
- **Shell** `BrandCanvas`/`GameFrame` từ spec iteration 2 (dựng chung hoặc reuse — quyết định thứ tự ở plan).

## 10. Kiểm thử

- **Unit** (`skinProfileLogic.test.ts`): waterfall `resolveProfile` đúng cho mọi tổ hợp Q1×Q2 quan trọng; fallback an toàn khi input lạ. `collisionUtils.test.ts`: point-in-radius / point-in-box đúng biên.
- **Thủ công qua preview:** cả 3 pha thao tác đúng (press-hold, drag-drop 2 bước, swipe), hint + safety-net kích hoạt đúng thời điểm, 3 câu → reveal đúng profile theo waterfall, disclaimer hiện đúng slot; kiểm light/dark + desktop/mobile; asset SVG load đúng từ `public/`.
- `tsc --noEmit` sạch.

## 11. Ngoài phạm vi

- 4 chế độ chơi còn lại của game gốc (se lỗ chân lông, cạo râu, laser, gỡ gai) — không làm.
- Level select + skin-color picker của game gốc — bỏ hẳn (landing page vào chơi thẳng, không cho chọn).
- Ảnh render 3D / Blender — dùng SVG flat vẽ tay của người dùng, không nâng cấp.
- Copy marketing cuối, analytics thật, backend — ngoài phạm vi.

## 12. Quyết định còn mở

Không có quyết định thiết kế mở. Chi tiết cần chốt khi viết plan (không phải quyết định thiết kế): tên component orchestrator cuối, nội dung 2 chip PayoffStats, thứ tự dựng shell vs game, số lượng chính xác mụn đen/lông tơ (~28 / ~40 — điều chỉnh khi test mật độ thực tế).
