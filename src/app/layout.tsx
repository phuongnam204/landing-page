import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: 'Tìm giải pháp cho làn da của bạn',
  description: 'Khám phá vấn đề da của bạn qua một minigame ngắn để tìm ra giải pháp chăm sóc da phù hợp.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
