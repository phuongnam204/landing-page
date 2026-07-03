import type { ConditionId } from './quiz';

// id chuỗi tự do — combo thật của o2skin thay sau; số lượng gói tùy ý.
export type ProgramId = string;

export interface Program {
  id: ProgramId;
  name: string; // ← o2skin mobileName
  description: string; // ← o2skin description
  isVip?: boolean; // ← o2skin isVip
  // Các tình trạng gói này trị; phần tử [0] = tình trạng chính (dùng tint header card).
  treatsConditions: ConditionId[];
  // ← combo quantity: GIỮ cho khớp dữ liệu thật nhưng KHÔNG hiển thị trên card.
  sessions?: number;
  o2skinComboRef?: string; // seam đối chiếu combo thật
}

// Placeholder — đổ combo thật (mobileName/description/isVip) vào sau. Phủ đủ 6 ConditionId.
export const programs: Program[] = [
  {
    id: 'chuyen-sau-noi-tiet',
    name: 'Chuyên sâu mụn nội tiết',
    description: 'Phác đồ kết hợp cho mụn viêm nặng theo chu kỳ nội tiết.',
    isVip: true,
    treatsConditions: ['mun-noi-tiet', 'da-nhon-mun-viem'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'khoi-dau-lam-sach',
    name: 'Khởi đầu làm sạch',
    description: 'Liệu trình cơ bản làm sạch da, kiểm soát dầu cho người mới bắt đầu.',
    treatsConditions: ['da-moi-bat-dau', 'lo-chan-long'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'toan-dien-mun-nang',
    name: 'Toàn diện mụn nặng',
    description: 'Cho mụn nặng, tái phát; kết hợp điều trị và phục hồi da.',
    isVip: true,
    treatsConditions: ['mun-noi-tiet', 'da-nhay-cam'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'phuc-hoi-nhay-cam',
    name: 'Phục hồi da nhạy cảm',
    description: 'Làm dịu, phục hồi hàng rào da dễ kích ứng, ửng đỏ.',
    treatsConditions: ['da-nhay-cam'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'se-khit-lo-chan-long',
    name: 'Se khít lỗ chân lông',
    description: 'Giảm mụn đầu đen, se khít lỗ chân lông vùng chữ T.',
    treatsConditions: ['lo-chan-long'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
  {
    id: 'duy-tri-da-khoe',
    name: 'Duy trì da khỏe',
    description: 'Duy trì làn da ổn định, phòng ngừa mụn quay lại.',
    treatsConditions: ['clean-skin', 'da-moi-bat-dau'],
    o2skinComboRef: 'o2skin combo (đối chiếu)',
  },
];
