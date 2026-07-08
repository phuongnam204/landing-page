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
    description: 'Mụn viêm xẹp nhanh, thâm mờ dần — kiểm soát nhờn và làm dịu da hiệu quả sau 4 buổi.',
    treatsConditions: ['da-nhon-mun-viem', 'lo-chan-long'],
    sessions: 4,
    o2skinComboRef: 'o2skin Combo Peel thật (đối chiếu)',
  },
  {
    id: 'ipl-oil-control',
    name: 'IPL kiểm soát nhờn & mụn',
    description: 'Da hết nhờn, mụn viêm giảm rõ sau 6 buổi — phù hợp mụn lan rộng vùng chữ T và má.',
    isVip: true,
    treatsConditions: ['da-nhon-mun-viem', 'lo-chan-long'],
    sessions: 6,
    o2skinComboRef: 'o2skin Combo IPL thật (đối chiếu)',
  },
  {
    id: 'laser-scar-treatment',
    name: 'Laser trị sẹo rỗ & tái tạo da',
    description: 'Sẹo rỗ mờ dần, lỗ chân lông se khít sau 7 buổi — da đều màu và sáng hơn nhìn thấy rõ.',
    isVip: true,
    treatsConditions: ['lo-chan-long', 'da-nhay-cam'],
    sessions: 7,
    o2skinComboRef: 'o2skin Combo Laser thật (đối chiếu)',
  },
  {
    id: 'microneedling-repair',
    name: 'Lăn kim phục hồi & cấp ẩm',
    description: 'Da nhạy cảm dày khoẻ hơn, ít kích ứng và sáng dần sau 5 buổi — phục hồi hàng rào bảo vệ tự nhiên.',
    treatsConditions: ['lo-chan-long', 'da-nhay-cam'],
    sessions: 5,
    o2skinComboRef: 'o2skin Combo Lăn kim thật (đối chiếu)',
  },
  {
    id: 'hormonal-acne-plan',
    name: 'Phác đồ mụn nội tiết',
    description: 'Mụn cằm và quai hàm không tái phát sau 8 buổi — phác đồ tập trung vào nguyên nhân nội tiết gốc rễ.',
    isVip: true,
    treatsConditions: ['mun-noi-tiet', 'da-nhon-mun-viem'],
    sessions: 8,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
  },
  {
    id: 'maintenance-skin-health',
    name: 'Duy trì & chống lão hóa',
    description: 'Giữ da sạch và ổn định lâu dài sau điều trị — ngăn tái phát với chu trình 3 buổi nhẹ nhàng.',
    treatsConditions: ['clean-skin', 'da-moi-bat-dau'],
    sessions: 3,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
  },
];
