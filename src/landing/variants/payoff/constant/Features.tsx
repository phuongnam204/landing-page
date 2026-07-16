import type { PayoffItem } from '../feature-layouts/types';

export const O2SKIN_FEATURES = [
  {
    title: 'Cơ Sở Vật Chất Hiện Đại, Đạt Chuẩn Y Tế',
    body: 'Không gian phòng khám thông thoáng và sạch sẽ, thiết kế hiện đại và tiện nghi, mang đến trải nghiệm điều trị thoải mái cho khách hàng.',
    image: '/feature/co-so-vat-chat-hien-dai.jpg',
    alt: 'Cơ sở vật chất hiện đại tại O2Skin',
  },
  {
    title: 'Thiết Bị IPL / Laser Nhập Khẩu Chính Hãng',
    body: 'Nhập khẩu chính ngạch với chứng nhận y tế, phát xung chính xác — kiểm soát an toàn và hiệu quả tối đa.',
    image: '/feature/thiet-bi-laze-nhap-khau.jpg',
    alt: 'Điều trị IPL tại O2Skin',
  },
  {
    title: 'Nhà Thuốc Đạt Chuẩn GPP',
    body: 'Cung cấp dược mỹ phẩm chính hãng của các thương hiệu uy tín hàng đầu thế giới, giúp khách hàng an tâm về chất lượng sản phẩm.',
    image: '/feature/nha-thuoc-2.jpg',
    alt: 'Nhà thuốc đạt chuẩn GPP',
  },
];

export const featuresAsItems: PayoffItem[] = O2SKIN_FEATURES.map(f => ({
  title: f.title,
  body: f.body,
  image: f.image,
  alt: f.alt,
}));
