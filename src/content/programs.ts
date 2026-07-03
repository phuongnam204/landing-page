import type { ConditionId } from './quiz';

export type ProgramId = string;

export interface Program {
  id: ProgramId;
  name: string;
  description: string;
  isVip?: boolean;
  treatsConditions: ConditionId[];
  sessions?: number;
  o2skinComboRef?: string;
}

export const programs: Program[] = [
  {
    id: 'combo-peel-acne',
    name: 'Combo Peel trị mụn',
    description: 'Peel điều trị mụn kết hợp trị thâm, giảm nhờn — liệu trình phù hợp mụn viêm nhẹ đến trung bình, kiểm soát bã nhờn và làm dịu da.',
    treatsConditions: ['da-nhon-mun-viem', 'lo-chan-long'],
    sessions: 4,
    o2skinComboRef: 'o2skin Combo Peel thật (đối chiếu)',
  },
  {
    id: 'ipl-oil-control',
    name: 'IPL kiểm soát nhờn & mụn',
    description: 'Công nghệ IPL điều trị mụn và kiểm soát nhờn, giảm hồng ban do mụn — phù hợp da nhờn có mụn viêm lan toả.',
    isVip: true,
    treatsConditions: ['da-nhon-mun-viem', 'lo-chan-long'],
    sessions: 6,
    o2skinComboRef: 'o2skin Combo IPL thật (đối chiếu)',
  },
  {
    id: 'laser-scar-treatment',
    name: 'Laser trị sẹo rỗ & tái tạo da',
    description: 'LASER trẻ hóa da, hỗ trợ thu nhỏ lỗ chân lông và trị sẹo rỗ — dành cho da có sẹo mụn cũ, lỗ chân lông to, da không đều màu.',
    isVip: true,
    treatsConditions: ['lo-chan-long', 'da-nhay-cam'],
    sessions: 7,
    o2skinComboRef: 'o2skin Combo Laser thật (đối chiếu)',
  },
  {
    id: 'microneedling-repair',
    name: 'Lăn kim phục hồi & cấp ẩm',
    description: 'Lăn kim nông trắng sáng da, se khít lỗ chân lông và cấp ẩm tái tạo — phù hợp da nhạy cảm, yếu, cần phục hồi hàng rào bảo vệ.',
    treatsConditions: ['lo-chan-long', 'da-nhay-cam'],
    sessions: 5,
    o2skinComboRef: 'o2skin Combo Lăn kim thật (đối chiếu)',
  },
  {
    id: 'hormonal-acne-plan',
    name: 'Phác đồ mụn nội tiết',
    description: 'Kết hợp Peel + IPL + tư vấn chuyên sâu cho mụn nội tiết vùng cằm, quai hàm — tập trung vào nguyên nhân gốc rễ và duy trì dài hạn.',
    isVip: true,
    treatsConditions: ['mun-noi-tiet', 'da-nhon-mun-viem'],
    sessions: 8,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
  },
  {
    id: 'maintenance-skin-health',
    name: 'Duy trì & chống lão hóa',
    description: 'Chu trình chăm sóc da duy trì kết quả sau điều trị — giữ da ổn định, khỏe mạnh và phòng ngừa tái phát.',
    treatsConditions: ['clean-skin', 'da-moi-bat-dau'],
    sessions: 3,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
  },
];
