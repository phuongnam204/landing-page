# Thiết kế: Minigame "Khoanh vùng mụn" thay cho game soi da

- **Ngày:** 2026-07-02
- **Trạng thái:** Design — chờ duyệt trước khi viết implementation plan
- **Thay thế:** Game hidden-object "soi da" hiện tại (`SkinScanScreen` + `skinScanLogic`)

## 1. Bối cảnh & lý do

Landing page o2skin nhắm traffic GenZ từ TikTok, dùng một minigame làm bước tương tác trước khi dẫn tới payoff và form thu lead. Minigame "soi da" hiện tại cho người dùng kéo kính lúp rà khắp một vùng da trừu tượng để tìm 8 mascot ẩn, rồi suy ra profile từ loại mascot trội trên bàn chơi.

Leader đánh giá game soi da **không qua được kiểm duyệt** vì đây là lĩnh vực y tế/chăm sóc da: game giả vờ "phát hiện" tình trạng da từ thao tác rà ngẫu nhiên, trong khi nó không hề biết gì về làn da thật của người dùng. Đây vừa là vấn đề thiếu tính thực tế, vừa tiềm ẩn rủi ro vì đưa ra thứ giống "kết quả soi da" mà không có cơ sở.

**Nguyên tắc thiết kế rút ra:** kết quả cá nhân hóa phải đến từ **thông tin người dùng tự khai báo về da của chính họ**, cộng với một nguyên lý da liễu có căn cứ (face mapping), chứ không phải từ việc game "tự đoán". Nhờ đó mọi kết quả đều trung thực và không bị coi là chẩn đoán bừa.

## 2. Mục tiêu & phạm vi

**Mục tiêu:**
- Thay game soi da bằng một minigame mới **thật sự có cảm giác chơi**, hợp gu nhanh của GenZ, nhưng đủ đáng tin để qua kiểm duyệt y tế.
- Giữ nguyên vai trò của minigame trong luồng: tạo tương tác → sinh ra một profile trong `quizResults` → dẫn vào `PayoffView` sẵn có.
- Tách bạch rõ ràng giữa **phần chơi** (tìm mụn, chỉ để giải trí) và **phần chẩn đoán** (người dùng tự khai, có căn cứ face mapping).

**Ngoài phạm vi (non-goals):**
- Không làm AI nhận diện da qua ảnh/camera.
- Không viết lại `PayoffView`, `ProgramsScreen`, `ConversionForm`, `HeroScreen` — chỉ chỉnh nguồn dữ liệu mà `PayoffView` nhận.
- Không xử lý copy marketing cuối cùng (vẫn placeholder).

## 3. Luồng người dùng

Luồng tổng thể trong `AppFlow.tsx` gần như giữ nguyên, chỉ chèn thêm một bước tự khai giữa minigame và payoff:

```
hero → minigame (tìm & khoanh mụn) → self-report (khai vùng da) → payoff → programs → conversion → done
```

Bước `self-report` có thể là một `Step` mới trong máy trạng thái, hoặc là màn thứ hai nội bộ ngay trong component minigame trước khi gọi `onComplete`. **Quyết định đề xuất:** giữ nó là một sub-screen nội bộ của minigame, để `onComplete` vẫn là một điểm thoát duy nhất trả về `(result, meta)` cho `AppFlow` — ít thay đổi máy trạng thái nhất.

## 4. Cơ chế phần chơi — "Tìm & khoanh mụn"

Người dùng thấy **ảnh khuôn mặt thật của một người mẫu** (không phải mặt họ). Trên mặt có một số nốt mụn nhỏ; nhiệm vụ là chạm để khoanh cho hết.

- **Nốt mụn:** là các chấm đỏ nhỏ được **vẽ chồng (synthetic overlay)** lên ảnh chân dung da sạch, tại các toạ độ được tác giả định sẵn. Cách này cho phép kiểm soát chính xác vị trí, tránh rơi vào mắt/môi, và không phụ thuộc vào việc tìm được ảnh có mụn thật kèm license. Vì phần chơi công khai chỉ là "tìm các chấm tụi mình đặt sẵn" nên nó không hề claim chẩn đoán — tính trung thực nằm ở bước tự khai phía sau.
- **Số nốt:** hiển thị cố định 6 nốt mỗi lượt (chọn từ một tập ~8–10 toạ độ ứng viên để tạo sự khác biệt khi chơi lại).
- **Tương tác:** chạm một phát trong bán kính bắt (catch radius) của một nốt là "khoanh" được nó — hiện vòng tròn hồng + dấu tick, và tăng bộ đếm. Không bắt người dùng vẽ vòng bằng tay (giảm friction trên mobile). Tái dụng ý tưởng `findNearestUnfound` + `CATCH_RADIUS` của code hiện tại.
- **Tiến độ:** thanh progress gradient hồng–tím + bộ đếm "N / 6 nốt" ở đầu màn.
- **Kết thúc:** khi khoanh đủ tất cả các nốt, chuyển sang bước tự khai.

**Điểm mấu chốt về kiến trúc:** các nốt mụn trong phần chơi **không còn mang "kind"** và **không quyết định profile** nữa. Profile đến hoàn toàn từ bước tự khai. Nhờ vậy logic sinh bàn chơi được đơn giản hóa mạnh: chỉ còn là một tập toạ độ để tìm, bỏ toàn bộ logic dominance/weight trong `skinScanLogic` hiện tại.

## 5. Cơ chế gợi ý (đã duyệt)

Vì đây là trang thu lead chứ không phải thử thách kỹ năng, mục tiêu là **không để ai bị kẹt rồi bỏ cuộc trước payoff**. Gợi ý tăng dần theo **thời gian kể từ lần khoanh trúng gần nhất** (không phải thời gian đứng yên tuyệt đối, vì người chơi có thể đang chạm loạn mà vẫn chưa trúng):

- **Cấp 1 — "sáng vùng":** sau ~4–5 giây không có tiến triển, một quầng sáng vàng ấm lan tỏa phủ lên *vùng chung* quanh một nốt chưa tìm, nhấp nháy nhẹ. Người chơi vẫn phải tự chạm trúng.
- **Cấp 2 — "khoanh sát":** nếu vẫn kẹt thêm vài giây, hiện một vòng nét đứt vàng nhấp nháy sát nốt đó.
- **Lưới an toàn:** sau tổng ~20–25 giây mà vẫn còn nốt chưa tìm, game tự động khoanh nốt cuối và cho qua. Đảm bảo không ai mắc kẹt dù mạng chậm hay mất tập trung.
- **Màu:** gợi ý dùng **tông vàng ấm** để tách bạch với hồng (nốt đã tìm) và hồng–tím (thanh tiến độ).

## 6. Bước tự khai ngắn & ánh xạ face mapping

Sau khi khoanh đủ mụn, hiện một màn hỏi **một câu duy nhất** để kết quả nói về da của *chính người dùng*:

> "Còn da của **bạn** thì hay 'nổi loạn' nhất ở đâu?"

Bốn lựa chọn vùng, mỗi vùng ánh xạ sang một profile theo nguyên lý face mapping:

| Lựa chọn vùng | Ánh xạ profile | Ghi chú face mapping |
|---|---|---|
| Cằm & quai hàm | `mun-noi-tiet` | Mụn vùng cằm/quai hàm thường liên quan nội tiết |
| Vùng chữ T (trán, mũi) | `da-nhon-mun-viem` | Vùng chữ T tiết dầu mạnh, dễ mụn viêm |
| Hai má | `da-nhay-cam` | Má hay ửng đỏ, phản ứng môi trường |
| Gần như không bị | `clean-skin` | Da ổn định |

Chú thích ánh xạ chỉ để nội bộ duyệt logic; bản chạy thật ẩn đi cho gọn.

**Phần payoff sẽ hiển thị chẩn đoán này một cách trung thực** — kết quả đến từ khai báo của người dùng cộng nguyên lý da liễu, không phải máy đoán. Đây chính là chỗ tạo ra tính "y tế" mà leader cần.

## 7. Profile & dữ liệu

Bốn lựa chọn trên map tới các key trong `quizResults` (`content/quiz.ts`). Ba trong bốn key đã tồn tại (`da-nhon-mun-viem`, `da-nhay-cam`, `clean-skin`).

**Quyết định cần chốt:** `mun-noi-tiet` **hiện KHÔNG còn** trong `quizResults` (file chỉ còn 5 profile: `clean-skin`, `da-nhay-cam`, `da-nhon-mun-viem`, `lo-chan-long`, `da-moi-bat-dau`). Vì mụn nội tiết ở cằm/quai hàm là một lựa chọn có giá trị bán hàng và độ tin cậy cao, spec này đề xuất **thêm lại profile `mun-noi-tiet`** (tone `concern`, `suggestedProgram` phù hợp — dự kiến `chuyen-sau`) với `body`/`solution` placeholder. Profile `lo-chan-long` và `da-moi-bat-dau` không nằm trong 4 lựa chọn face mapping; giữ lại trong data nhưng minigame mới không sinh ra chúng (không cần xóa).

## 8. Tích hợp Payoff & PayoffStats

`PayoffView` hiện nhận `result: QuizResult` và `counts: KindCounts | null`, trong đó `PayoffStats` render chip theo **số lượng từng "kind"** mascot tìm được. Vì game mới bỏ khái niệm "kind", nguồn dữ liệu này thay đổi.

**Đề xuất:** giữ nguyên component `PayoffStats` về mặt hình ảnh (hiệu ứng `statPopIn` stagger mà bạn đã dựng), nhưng đổi dữ liệu đầu vào thành:
- Một chip "đã soi ra 6/6 nốt mụn" (thành tích phần chơi, mang tính ăn mừng).
- Một chip nhãn vùng da người dùng vừa khai (ví dụ "vùng cằm & quai hàm").

Điều này giữ được khoảnh khắc "reveal thống kê" mà không cần dữ liệu kind. `onComplete` của minigame sẽ trả về `{ result, foundCount, zoneLabel }` thay cho `KindCounts`; `AppFlow` lưu và truyền xuống `PayoffView`. Cần cập nhật type `KIND_STAT_META`/`PayoffStats` tương ứng.

**Giới tính:** `PayoffView` hiện **không** dùng giới tính (khác với ghi chú cũ về `PAYOFF_HEADERS[tone][gender]`). Vì vậy spec này **không thêm câu hỏi giới tính** vào bước tự khai, để giữ friction thấp nhất. Nếu sau này muốn copy phân biệt nam/nữ thì mới bổ sung — ghi nhận là enhancement tương lai, ngoài phạm vi.

## 9. Thiết kế hình ảnh

- **Khung dark mode tái sử dụng:** khung navy `#2D2640` với thanh tiến độ gradient hồng–tím (đã dựng trong mockup) trùng với màu CTA của brand, nên được giữ lại làm nền tảng giao diện cho màn chơi ở chế độ tối. Ghi lại để không thiết kế lại từ đầu.
- **Ảnh:** ảnh chân dung thật, da sạch, khớp Unsplash license thương mại (thay ảnh mockup tạm trước khi go-live).
- **Palette:** hồng `#FF5C9E` cho nốt đã khoanh, vàng ấm `#FFCD78` cho gợi ý, gradient hồng–tím cho tiến độ.
- **Mobile-first:** bố cục khung điện thoại dọc như mockup.

## 10. Component & file bị ảnh hưởng

- `src/components/MinigameCore/skinScanLogic.ts` — viết lại: bỏ kind/dominance; còn lại tập toạ độ nốt (`generateSpots()`), catch-radius detection, và ánh xạ zone→profile (`resolveProfileByZone(zone)`), type mới cho zone. Cập nhật/viết lại `skinScanLogic.test.ts`.
- `src/components/SkinScanScreen.tsx` — viết lại phần chơi (ảnh thật + overlay nốt + gợi ý tăng dần) và thêm sub-screen tự khai; `onComplete` đổi chữ ký. (Giữ tên file để giảm churn import; nội bộ được viết lại.)
- `src/content/quiz.ts` — thêm lại profile `mun-noi-tiet`.
- `src/components/AppFlow.tsx` — cập nhật `onComplete` handler, state (`foundCounts` → dữ liệu mới), props truyền vào `PayoffView`; `PayoffStats`/`KIND_STAT_META` đổi theo nguồn dữ liệu mới.
- `src/lib/trackEvent.ts` — giữ mốc `minigame_complete`; cân nhắc thêm payload `zone`.

## 11. Kiểm thử

- **Unit (`skinScanLogic.test.ts`):** `generateSpots()` trả đúng số nốt và toạ độ hợp lệ; `resolveProfileByZone()` map đúng 4 vùng sang 4 profile; vùng không hợp lệ có fallback an toàn.
- **Thủ công qua preview:** khoanh đủ nốt → hiện màn tự khai → chọn vùng → payoff hiển thị đúng profile; gợi ý cấp 1/cấp 2/lưới an toàn kích hoạt đúng thời điểm; kiểm tra dark mode.
- Chạy `tsc --noEmit` sạch.

## 12. Quyết định còn mở

1. **Thêm lại `mun-noi-tiet`** (mục 7) — đề xuất: có. Cần xác nhận `suggestedProgram`.
2. **Nguồn dữ liệu PayoffStats mới** (mục 8) — đề xuất: found-count + zone label.
3. **Ảnh chân dung có license thương mại** — cần chọn ảnh thật trước go-live (rủi ro license đã ghi trong nhật ký dự án).
4. **Bỏ câu hỏi giới tính** — đề xuất: có, để friction thấp; xem lại nếu cần copy theo giới tính.
