export type Branch = { code: string; name: string };

export const branches: Branch[] = [
  { code: 'o2skin.quan3',     name: 'Chi nhánh Quận 3' },
  { code: 'o2skin.thuduc',    name: 'Chi nhánh Thủ Đức' },
  { code: 'o2skin.cantho',    name: 'Chi nhánh Cần Thơ' },
  { code: 'o2skin.binhthanh', name: 'Chi nhánh Bình Thạnh' },
  { code: 'o2skin.govap',     name: 'Chi nhánh Gò Vấp' },
];

export const BRANCH_CODES = branches.map(b => b.code);
