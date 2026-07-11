export type Branch = { code: string; name: string; address: string; mapsUrl?: string };

export const branches: Branch[] = [
  {
    code: 'o2skin.quan3',
    name: 'Chi nhánh Quận 3',
    address: '292/15 Cách Mạng Tháng 8, P.10, Q.3, TP. HCM',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=292%2F15+C%C3%A1ch+M%E1%BA%A1ng+Th%C3%A1ng+8+P.10+Q.3+TP.HCM',
  },
  {
    code: 'o2skin.binhthanh',
    name: 'Chi nhánh Bình Thạnh',
    address: '31/3 Điện Biên Phủ, P.15, Q. Bình Thạnh, TP. HCM',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=31%2F3+%C4%90i%E1%BB%87n+Bi%C3%AAn+Ph%E1%BB%A7+P.15+Q.+B%C3%ACnh+Th%E1%BA%A1nh+TP.HCM',
  },
  {
    code: 'o2skin.thuduc',
    name: 'Chi nhánh Thủ Đức',
    address: '13A – 13B Thống Nhất, P. Bình Thọ, TP. Thủ Đức',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=13A+13B+Th%E1%BB%91ng+Nh%E1%BA%A5t+P.+B%C3%ACnh+Th%E1%BB%8D+TP.+Th%E1%BB%A7+%C4%90%E1%BB%A9c',
  },
  {
    code: 'o2skin.govap',
    name: 'Chi nhánh Gò Vấp',
    address: '36 đường số 8, Cityland Park Hills, Q. Gò Vấp, TP. HCM',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=36+%C4%91%C6%B0%E1%BB%9Dng+s%E1%BB%91+8+Cityland+Park+Hills+Q.+G%C3%B2+V%E1%BA%A5p+TP.HCM',
  },
  {
    code: 'o2skin.cantho',
    name: 'Chi nhánh Cần Thơ',
    address: 'MG1-12 Vincom Shophouse, Xuân Khánh, Q. Ninh Kiều, Cần Thơ',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MG1-12+Vincom+Shophouse+Xu%C3%A2n+Kh%C3%A1nh+Q.+Ninh+Ki%E1%BB%81u+C%E1%BA%A7n+Th%C6%A1',
  },
];

export const BRANCH_CODES = branches.map(b => b.code);
