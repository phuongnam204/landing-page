'use client';
import type { HookSlotProps } from '../../slots';

export function TwoColumnHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] relative flex items-center overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none bg-cover bg-center hero-texture"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?w=1920&q=40&fit=crop&fm=jpg)' }} />
      <div className="max-w-6xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center relative z-10">
        <div className="relative h-72 md:h-[500px] mb-6 md:mb-0">
          <img src="https://images.unsplash.com/photo-1728727217834-b190862837a3?w=400&q=85&fit=crop&crop=face"
            alt="Cô gái chăm sóc da"
            className="absolute left-0 top-0 w-48 h-64 md:w-80 md:h-[460px] rounded-3xl object-cover object-top shadow-xl z-10" />
          <img src="https://blog.farmacianovadamaia.pt/wp-content/uploads/2023/02/134_skin-care-homem.jpg"
            alt="Chàng trai chăm sóc da"
            className="absolute right-0 bottom-0 w-48 h-64 md:w-80 md:h-[460px] rounded-3xl object-cover object-top shadow-2xl z-20 rotate-2" />
        </div>
        <div className="text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-5xl md:text-6xl text-cta leading-tight">
            Da bạn đang{' '}
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">giấu</span>{' '}
            điều gì?
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-5">
            Có những "bạn nhỏ" đang ẩn náu trên làn da của bạn. Tìm chúng — và khám phá điều da bạn thực sự cần.
          </p>
          <button onClick={onStart}
            className="mt-7 bg-cta text-white font-bold rounded-soft px-12 py-4 text-base md:text-lg hover:opacity-90 transition-colors duration-300">
            Soi da ngay →
          </button>
          <p className="text-sm md:text-base text-cta/50 mt-4">Cùng thực hiện một cuộc khám phá làn da nhé!</p>
        </div>
      </div>
    </div>
  );
}
