export type Branch = { code: string; name: string; address: string };

export const branches: Branch[] = [
  { code: 'o2skin.quan3',     name: 'Chi nhánh Quận 3',     address: '292/15 Cách Mạng Tháng 8, P.10, Q.3, TP. HCM' },
  { code: 'o2skin.binhthanh', name: 'Chi nhánh Bình Thạnh', address: '31/3 Điện Biên Phủ, P.15, Q. Bình Thạnh, TP. HCM' },
  { code: 'o2skin.thuduc',    name: 'Chi nhánh Thủ Đức',    address: '13A – 13B Thống Nhất, P. Bình Thọ, TP. Thủ Đức' },
  { code: 'o2skin.govap',     name: 'Chi nhánh Gò Vấp',     address: '36 đường số 8, Cityland Park Hills, Q. Gò Vấp, TP. HCM' },
  { code: 'o2skin.cantho',    name: 'Chi nhánh Cần Thơ',    address: 'MG1-12 Vincom Shophouse, Xuân Khánh, Q. Ninh Kiều, Cần Thơ' },
];

export const BRANCH_CODES = branches.map(b => b.code);
