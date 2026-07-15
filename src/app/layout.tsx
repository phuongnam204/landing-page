import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

const lora = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'Tìm giải pháp cho làn da của bạn',
  description: 'Khám phá vấn đề da của bạn qua một minigame ngắn để tìm ra giải pháp chăm sóc da phù hợp.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${lora.variable}`}>
      <body className="overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
