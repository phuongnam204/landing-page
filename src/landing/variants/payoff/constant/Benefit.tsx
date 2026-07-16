import type { PayoffItem } from '../feature-layouts/types';

export const O2SKIN_BENEFIT = [
  {
    value: 'Thấy kết quả từ buổi 4–6',
    label: 'Không phải đợi hết tháng thứ 3 — da giảm mụn và bớt thâm có thể thấy được từ những buổi điều trị đầu tiên.',
    image: '/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg',
  },
  {
    value: 'Không bị ép gói',
    label: 'Trả tiền từng buổi, toàn quyền quyết định tiếp tục hay dừng — không có hợp đồng ràng buộc nào cả.',
    image: '/benefit/soi-ba-nhon-3n.jpg',
  },
  {
    value: 'Đi làm ngay hôm đó',
    label: 'Không cần nghỉ dưỡng sau điều trị — đỏ da nhẹ tạm thời tự hết trong vài giờ, sinh hoạt bình thường.',
    image: '/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg',
  },
  {
    value: 'Mụn hết từ nguyên nhân',
    label: 'Phác đồ cá nhân hoá nhắm đúng loại mụn của bạn, không chỉ che triệu chứng bên ngoài để mụn không quay lại kiểu cũ.',
    image: '/benefit/soi-ba-nhon-3n.jpg',
  },
];

export const benefitsAsItems: PayoffItem[] = O2SKIN_BENEFIT.map(b => ({
  title: b.value,
  body: b.label,
  image: b.image,
  alt: b.value,
}));
