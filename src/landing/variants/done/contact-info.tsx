'use client';
import type { DoneSlotProps } from '../../slots';

export function ContactInfoDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-6 md:p-10 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <div className="font-extrabold text-xl md:text-2xl text-cta mb-2">Đã nhận thông tin của bạn!</div>
          <p className="text-sm md:text-base text-cta/70 leading-relaxed">
            Chuyên viên o2skin sẽ liên hệ trong vòng <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>
        <div className="border-t border-cta/10 pt-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest">Trong khi chờ đợi</p>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📍</span>
            <div>
              <p className="text-sm font-bold text-cta">Địa chỉ phòng khám</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">Liên hệ hotline để biết chi nhánh gần nhất.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📞</span>
            <div>
              <p className="text-sm font-bold text-cta">Hotline</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">Gọi hotline để đặt lịch trực tiếp nếu cần tư vấn gấp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
