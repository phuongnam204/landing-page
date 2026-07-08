'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { PayoffSlotProps } from '../../slots';
import type { ConditionId } from '../../../content/quiz';
import { getPrograms, getSuggestedProgram } from '../../../content/catalog';
import { ProgramCard, DotsNav } from '../programs/carousel';
import type { Program } from '../../../content/programs';

// ─── Canvas animations (giữ nguyên từ file cũ) ──────────────────────────────

const CONFETTI_COLORS = ['#ff6b9d','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c','#ff4d6d','#48cae4'];

function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
    y: -8 - Math.random() * 50, vx: (Math.random() - 0.5) * 3.5,
    vy: 2.5 + Math.random() * 4, size: 6 + Math.random() * 8,
    rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 12,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    isCircle: Math.random() > 0.45,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y < canvas.height + 20) {
        alive = true; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.isCircle) { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        else { ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2); }
        ctx.restore();
      }
    }
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

function runWorryParticles(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 25 }, () => ({
    x: canvas.width * 0.25 + Math.random() * canvas.width * 0.5,
    y: canvas.height * 0.55 + Math.random() * 60,
    vx: (Math.random() - 0.5) * 1.2, vy: -1.2 - Math.random() * 1.5,
    size: 3 + Math.random() * 4, alpha: 0.5 + Math.random() * 0.4,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.008;
      if (p.y > -20 && p.alpha > 0) {
        alive = true; ctx.globalAlpha = p.alpha; ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

// ─── Result section text ─────────────────────────────────────────────────────

const HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe!',
  concern:  'Hmm, có điều bạn cần biết về da mình...',
};
const BRIDGE: Record<'positive' | 'concern', string> = {
  positive: 'Da bạn đang ở điểm khởi đầu tốt — và chúng tôi có thể giúp bạn duy trì điều đó lâu dài.',
  concern:  'Tình trạng như của bạn không hiếm — và có cách xử lý đúng hướng từ gốc rễ.',
};

// ─── Condition education data (giữ nguyên từ file cũ) ───────────────────────

type ConditionEducation = {
  whyTitle: string;
  steps: { title: string; body: string }[];
  expertQuote: string;
  expertName: string;
};

const CONDITION_EDUCATION: Record<ConditionId, ConditionEducation> = {
  'da-nhon-mun-viem': {
    whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
    steps: [
      { title: 'Tuyến bã nhờn hoạt động quá mức', body: 'Da sản xuất bã nhờn nhiều hơn cần thiết, bịt lỗ chân lông và tạo điều kiện cho vi khuẩn P.acnes phát triển bên trong — nguyên nhân trực tiếp của mụn viêm.' },
      { title: 'Viêm nhiễm hình thành dưới da', body: 'Vi khuẩn kích hoạt phản ứng miễn dịch — tạo ra nốt mụn sưng đỏ và mủ. Đây là giai đoạn gây tổn thương da và thâm nếu không can thiệp sớm.' },
      { title: 'Thâm và sẹo là hậu quả của viêm kéo dài', body: 'Mỗi nốt viêm để lại vết thâm và có nguy cơ gây sẹo rỗ. Điều trị sớm và đúng hướng giảm đáng kể rủi ro này — không nên để mặc hoặc tự nặn.' },
    ],
    expertQuote: 'Mụn viêm do bã nhờn và vi khuẩn là tình trạng điều trị được. Khi can thiệp đúng phác đồ ngay từ sớm, kết quả thường tốt hơn rất nhiều so với để kéo dài.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'lo-chan-long': {
    whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
    steps: [
      { title: 'Bã nhờn và tế bào chết tích tụ trong lỗ chân lông', body: 'Lỗ chân lông bị nhồi đầy dần, giãn to theo thời gian và hình thành đầu đen — ngay cả khi da được rửa sạch hàng ngày.' },
      { title: 'Collagen xung quanh lỗ chân lông suy giảm', body: 'Mô da giữ thành lỗ chân lông săn chắc bị mỏng đi theo tuổi và tổn thương — khiến lỗ chân lông nhìn to hơn kể cả khi sạch.' },
      { title: 'Skincare thông thường không đủ để giải quyết', body: 'Toner và kem thu lỗ chân lông chỉ có tác dụng tạm thời — không thể tác động vào cấu trúc collagen và bã nhờn tầng sâu bên trong.' },
    ],
    expertQuote: 'Lỗ chân lông to cần điều trị từ bên trong — tái tạo collagen và làm sạch sâu. Sản phẩm bôi ngoài không thể thu nhỏ vĩnh viễn, chỉ che phủ tạm thời.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-nhay-cam': {
    whyTitle: 'Điều gì đang xảy ra với làn da của bạn?',
    steps: [
      { title: 'Hàng rào bảo vệ da bị suy yếu', body: 'Da nhạy cảm có lớp lipid mỏng hơn bình thường — khiến tác nhân bên ngoài như UV, khói bụi và mỹ phẩm xâm nhập sâu dễ dàng hơn mức bình thường.' },
      { title: 'Hệ miễn dịch trong da phản ứng quá mức', body: 'Khi gặp kích thích dù nhỏ, hệ miễn dịch kích hoạt phản ứng viêm — gây mẩn đỏ và ngứa ngay cả với sản phẩm được quảng cáo là nhẹ nhàng.' },
      { title: 'Vòng lặp kích ứng khó thoát', body: 'Dùng nhiều sản phẩm để che triệu chứng → da kích ứng thêm → da nhạy cảm hơn. Phá vỡ vòng lặp này cần phục hồi hàng rào bảo vệ đúng cách, không phải che phủ.' },
    ],
    expertQuote: 'Da nhạy cảm cần được phục hồi hàng rào bảo vệ, không phải đè nén triệu chứng. Khi hàng rào mạnh lên, da tự điều chỉnh được nhiều hơn và ít kích ứng hơn đáng kể.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'mun-noi-tiet': {
    whyTitle: 'Điều gì đang xảy ra bên trong cơ thể bạn?',
    steps: [
      { title: 'Hormone androgen kích thích tuyến bã nhờn tăng tiết', body: 'Sự thay đổi hormone — trước kỳ kinh, khi stress hoặc thay đổi thuốc — khiến tuyến bã nhờn ở cằm và quai hàm tiết nhiều bất thường, tạo điều kiện cho mụn bùng phát.' },
      { title: 'Mụn nội tiết không phải lỗi của việc chăm sóc da', body: 'Ngay cả với routine đúng chuẩn, mụn nội tiết vẫn tái phát — vì nguyên nhân nằm bên trong cơ thể, không phải bề mặt da. Đây không phải do bạn chăm sóc da sai.' },
      { title: 'Tại sao skincare đơn thuần không đủ', body: 'Sản phẩm bôi ngoài chỉ kiểm soát triệu chứng tạm thời. Điều trị hiệu quả cần kết hợp phương pháp tác động đến viêm tại chỗ và cân bằng tuyến nhờn từ bên trong.' },
    ],
    expertQuote: 'Mụn nội tiết là phản ứng của cơ thể với hormone — không phải do chăm sóc da sai. Điều trị đúng hướng giúp kiểm soát dài hạn, không chỉ dập tắt tạm thời từng đợt.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'clean-skin': {
    whyTitle: 'Tại sao phòng ngừa quan trọng hơn điều trị?',
    steps: [
      { title: 'Collagen bắt đầu suy giảm từ tuổi 25', body: 'Da ổn định hiện tại không có nghĩa là tự bảo vệ mãi. Collagen giảm dần mỗi năm — xây dựng thói quen chăm sóc từ sớm giúp duy trì nền da tốt lâu hơn đáng kể.' },
      { title: 'Phòng ngừa tiết kiệm hơn điều trị từ 3 đến 5 lần', body: 'Một liệu trình duy trì ngắn định kỳ giúp tránh chi phí điều trị sẹo, thâm và lão hóa sớm — những vấn đề cao hơn rất nhiều lần về chi phí nếu để xảy ra.' },
      { title: 'Đô thị hóa liên tục tấn công da mỗi ngày', body: 'UV, ô nhiễm không khí và căng thẳng là các yếu tố gây lão hóa da không thể tránh hoàn toàn — chỉ có thể giảm thiểu bằng cách chăm sóc đúng và đều đặn.' },
    ],
    expertQuote: 'Da khỏe hôm nay là kết quả của thói quen 6 tháng trước. Đầu tư vào da khi đang ổn là cách khôn ngoan nhất để không phải điều trị tốn kém sau này.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-moi-bat-dau': {
    whyTitle: 'Tại sao bắt đầu đúng cách ngay bây giờ là quan trọng?',
    steps: [
      { title: 'Không có routine không có nghĩa là da đang tốt', body: 'Da chưa bộc lộ vấn đề không có nghĩa là không có gì bên dưới. Tổn thương tích lũy âm thầm và chỉ hiện ra khi đã nặng — thường khó và tốn kém hơn để điều trị.' },
      { title: 'Giai đoạn sớm là thời điểm can thiệp tốt nhất', body: 'Xây dựng routine từ khi da chưa có vấn đề giúp phòng ngừa mụn, thâm và lão hóa sớm hiệu quả hơn bất kỳ điều trị nào sau này.' },
      { title: 'Kiến thức về da giúp tránh sai lầm tốn kém', body: 'Nhiều người mua sản phẩm sai với da vì chưa biết loại da và nhu cầu thật sự. Tư vấn đúng từ đầu tiết kiệm thời gian và chi phí đáng kể về lâu dài.' },
    ],
    expertQuote: 'Da chưa có vấn đề là cơ hội vàng để xây dựng thói quen đúng. Bắt đầu sớm với phác đồ phù hợp giúp duy trì làn da khỏe mạnh mà không cần điều trị sau này.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
};

// ─── Section 3 & 4 data ──────────────────────────────────────────────────────

const O2SKIN_FEATURES = [
  {
    title: 'BÁC SĨ TRỰC TIẾP KHÁM VÀ CÁ NHÂN HÓA PHÁC ĐỒ',
    body: 'Không qua trung gian — bác sĩ da liễu trực tiếp thăm khám, đánh giá và thiết kế bước sóng, mức năng lượng riêng cho từng bệnh nhân.',
  },
  {
    title: 'THIẾT BỊ IPL/LASER NHẬP KHẨU CHÍNH HÃNG',
    body: 'Nhập khẩu chính ngạch với chứng nhận y tế, phát xung chính xác — kiểm soát an toàn và hiệu quả tối đa.',
  },
  {
    title: 'THANH TOÁN LINH HOẠT THEO TỪNG BUỔI',
    body: 'Không ràng buộc gói dài hạn — hỗ trợ tài chính tối đa cho học sinh, sinh viên và người đi làm.',
  },
];

const O2SKIN_STATS = [
  { value: '5+',    label: 'Chi nhánh tại TP.HCM & Cần Thơ' },
  { value: '1000+', label: 'Khách hàng đã điều trị thành công' },
  { value: '5 năm', label: 'Kinh nghiệm y khoa da liễu' },
  { value: '100%',  label: 'Không ép mua liệu trình' },
];

// ─── Mini carousel (reuses ProgramCard + DotsNav từ carousel.tsx) ────────────

function ProgramsMiniCarousel({ programs, highlightId }: { programs: Program[]; highlightId?: string }) {
  const sorted = [
    ...programs.filter(p => p.id === highlightId),
    ...programs.filter(p => p.id !== highlightId),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const isDraggingRef = useRef(false);
  const pointerStartX = useRef(0);

  const prev = () => setActiveIndex(i => Math.max(i - 1, 0));
  const next = () => setActiveIndex(i => Math.min(i + 1, sorted.length - 1));

  function startDrag(clientX: number) { pointerStartX.current = clientX; isDraggingRef.current = true; }
  function moveDrag(clientX: number) { if (!isDraggingRef.current) return; setDragDelta(clientX - pointerStartX.current); }
  function endDrag(clientX: number) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const delta = clientX - pointerStartX.current;
    setDragDelta(0);
    if (delta < -35) next(); else if (delta > 35) prev();
  }

  function getCardStyle(index: number): React.CSSProperties {
    const diff = index - activeIndex;
    const transition = isDraggingRef.current ? 'none' : 'transform 0.4s ease-out, opacity 0.4s ease-out';
    if (diff === 0) return { transform: `translateX(calc(-50% + ${dragDelta}px)) scale(1)`, opacity: 1, zIndex: 10, pointerEvents: 'auto', transition };
    if (Math.abs(diff) === 1) {
      const sign = diff > 0 ? 1 : -1;
      return { transform: `translateX(calc(-50% + ${sign * 72}% + ${dragDelta}px)) scale(0.83)`, opacity: 0.55, zIndex: 5, pointerEvents: 'none', transition };
    }
    const sign = diff > 0 ? 1 : -1;
    return { transform: `translateX(calc(-50% + ${sign * 130}% + ${dragDelta}px)) scale(0.65)`, opacity: 0, zIndex: 1, pointerEvents: 'none', transition };
  }

  return (
    <div className="flex flex-col" style={{ height: '320px' }}>
      <div
        className="flex-1 relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
        style={{ perspective: '800px', touchAction: 'none' }}
        onPointerDown={e => { startDrag(e.clientX); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={e => moveDrag(e.clientX)}
        onPointerUp={e => endDrag(e.clientX)}
        onPointerCancel={() => { isDraggingRef.current = false; setDragDelta(0); }}
      >
        {activeIndex > 0 && (
          <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[var(--lp-bg-card)] shadow-md flex items-center justify-center text-cta/60 text-xs">‹</button>
        )}
        {activeIndex < sorted.length - 1 && (
          <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[var(--lp-bg-card)] shadow-md flex items-center justify-center text-cta/60 text-xs">›</button>
        )}
        {sorted.map((program, idx) => (
          <div key={program.id} className="absolute top-2 bottom-2 left-1/2" style={{ width: '76%', ...getCardStyle(idx) }}>
            <ProgramCard program={program} isSuggested={program.id === highlightId} />
          </div>
        ))}
      </div>
      <DotsNav count={sorted.length} activeIndex={activeIndex} onChange={setActiveIndex} />
    </div>
  );
}

// ─── Section sub-components ──────────────────────────────────────────────────

function WhySection({ conditionId, onScrollDown }: { conditionId: ConditionId; onScrollDown: () => void }) {
  const edu = CONDITION_EDUCATION[conditionId];
  return (
    <div className="max-w-lg md:max-w-3xl mx-auto px-5 py-10 flex flex-col gap-6">
      <h2 className="font-extrabold text-xl md:text-2xl text-cta text-center">{edu.whyTitle}</h2>
      <div className="flex flex-col gap-4">
        {edu.steps.map((step, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-cta text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="font-bold text-cta text-sm md:text-base">{step.title}</p>
              <p className="text-sm text-cta/70 leading-relaxed mt-1">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <blockquote className="bg-violet-50 border-l-4 border-violet-400 px-4 py-3.5 rounded-r-lg">
        <p className="text-sm md:text-base text-cta/80 italic leading-relaxed">
          &ldquo;{edu.expertQuote}&rdquo;
        </p>
        <p className="text-xs text-cta/50 font-semibold mt-2">— {edu.expertName}</p>
      </blockquote>
      <button
        onClick={onScrollDown}
        className="bg-cta text-white font-bold text-sm md:text-base py-3.5 px-9 rounded-soft w-full hover:opacity-90 transition-opacity"
      >
        Tìm ngay giải pháp cho bạn! &#8595;
      </button>
      <div className="h-4" />
    </div>
  );
}

function FeatureSection({ suggestedProgramId }: { suggestedProgramId?: string }) {
  const allPrograms = getPrograms();
  return (
    <div className="relative min-h-[100dvh] bg-[var(--lp-bg-hero)] flex items-center overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 py-12 md:py-16 w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-cta/40 mb-8 text-center">
          Những gì O2skin có
        </p>
        <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          {/* Left: title + feature list */}
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-2xl md:text-3xl text-cta leading-tight">
              O2skin có thể giúp bạn!
            </h2>
            <div className="flex flex-col gap-5">
              {O2SKIN_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cta text-white font-black text-sm flex items-center justify-center shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs md:text-sm text-cta uppercase tracking-wider leading-snug">
                      {f.title}
                    </p>
                    <p className="text-sm text-cta/65 leading-relaxed mt-1.5">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mini carousel với dashed orbit */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="w-64 h-64 rounded-full border-2 border-dashed border-cta/10" />
            </div>
            <ProgramsMiniCarousel programs={allPrograms} highlightId={suggestedProgramId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitSection({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-5 py-12"
      style={{ background: 'linear-gradient(135deg, #1a1654 0%, #2d2982 50%, #5b21b6 100%)' }}
    >
      {/* Texture blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(circle at 15% 85%, rgba(255,255,255,0.07) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(167,139,250,0.12) 0%, transparent 50%)' }} />

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Cam kết của chúng tôi</p>
          <h2 className="font-extrabold text-2xl md:text-3xl text-white">
            Lợi ích khi chọn trị mụn ở O2skin
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 mb-12 md:mb-16">
          {O2SKIN_STATS.map((stat, i) => (
            <div key={i} className="flex justify-center">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white/90 shadow-xl flex flex-col items-center justify-center p-3 text-center">
                <p className="font-black text-2xl md:text-3xl leading-none text-orange-500">{stat.value}</p>
                <p className="text-[11px] md:text-xs font-semibold text-cta/70 mt-2 leading-snug">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="bg-white text-cta font-extrabold text-sm md:text-base py-4 px-10 rounded-soft shadow-lg hover:opacity-90 transition-opacity"
          >
            Xem chương trình phù hợp &#8594;
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ConfettiCardWhyPayoff({ result, onContinue }: PayoffSlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const whyRef   = useRef<HTMLDivElement>(null);
  const featureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (result.condition.tone === 'positive') return runConfetti(canvas);
    return runWorryParticles(canvas);
  }, [result.condition.tone]);

  const isPositive = result.condition.tone === 'positive';
  const suggestedProgram = getSuggestedProgram(result.condition.id);

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">

      {/* Section 1: Kết quả (above fold) */}
      <div className="relative min-h-[100dvh] flex items-center justify-center px-5 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
        <div
          className={['max-w-lg md:max-w-3xl w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-10 shadow-lg shadow-cta/10 relative', isPositive ? 'animate-fade-in-up' : 'payoff-concern-enter'].join(' ')}
          style={{ zIndex: 10 }}
        >
          <p className={['font-extrabold text-xl md:text-2xl mb-4', isPositive ? 'text-teal-800' : 'text-amber-900'].join(' ')}>
            {HEADERS[result.condition.tone]}
          </p>
          <div className="mb-4">
            <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {[
                { key: 'found', color: '#FF5C9E', content: <span>đã soi <b>{result.foundCount}</b> nốt mụn</span> },
                { key: 'zone',  color: '#B39DFF', content: <span>da bạn hay bị ở <b>{result.zoneLabel}</b></span> },
              ].map((chip, i) => (
                <span key={chip.key} className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm font-semibold text-cta" style={{ animationDelay: `${0.5 + i * 0.18}s` }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: chip.color }} />
                  {chip.content}
                </span>
              ))}
            </div>
            {result.triggerNote && (
              <p className="payoff-stat-chip text-xs md:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed" style={{ animationDelay: '0.86s' }}>
                {result.triggerNote}
              </p>
            )}
          </div>
          <p className="text-sm md:text-base text-cta/80 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: result.condition.body }} />
          <p className="text-sm md:text-base text-cta/70 leading-snug px-3 py-2.5 bg-violet-50 border-l-2 border-violet-500 rounded-r-lg mb-5">
            {BRIDGE[result.condition.tone]}
          </p>
          <button
            onClick={() => whyRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-cta text-white font-bold text-sm md:text-base py-3.5 px-9 rounded-soft w-full"
          >
            Điều gì xảy ra bên dưới làn da của bạn? &#8595;
          </button>
        </div>
      </div>

      {/* Section 2: Why */}
      <div ref={whyRef} className="bg-[var(--lp-bg-payoff)]">
        <WhySection
          conditionId={result.condition.id as ConditionId}
          onScrollDown={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      {/* Section 3: Feature */}
      <div ref={featureRef}>
        <FeatureSection suggestedProgramId={suggestedProgram?.id} />
      </div>

      {/* Section 4: Benefit + final CTA */}
      <BenefitSection onContinue={onContinue} />
    </div>
  );
}
