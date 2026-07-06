'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { SkinCondition, ConditionId } from '../content/quiz';
import type { Program, ProgramId } from '../content/programs';
import { getPrograms, getSuggestedProgram, getConditionById } from '../content/catalog';
import { SkinGame } from './minigame/SkinGame';
import { trackEvent } from '../lib/trackEvent';

type PayoffStatsData = { foundCount: number; zoneLabel: string };

type Step = 'hero' | 'minigame' | 'payoff' | 'programs' | 'conversion' | 'done';

export default function AppFlow() {
  const [step, setStep] = useState<Step>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizResult, setQuizResult] = useState<SkinCondition | null>(null);
  const [payoffStats, setPayoffStats] = useState<PayoffStatsData | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);

  function transitionTo(nextStep: Step) {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }

  const containerClass = `transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`;

  return (
    <div className={containerClass}>
      {step === 'hero' && <HeroScreen onStart={() => transitionTo('minigame')} />}

      {step === 'minigame' && (
        <SkinGame
          onComplete={(result, stats) => {
            setQuizResult(result);
            setPayoffStats(stats);
            setSelectedProgram(getSuggestedProgram(result.id)?.id ?? null);
            trackEvent('minigame_complete', { resultId: result.id });
            transitionTo('payoff');
          }}
        />
      )}

      {step === 'payoff' && quizResult && (
        <PayoffView
          result={quizResult}
          stats={payoffStats}
          onContinue={() => {
            trackEvent('payoff_view', { resultId: quizResult.id });
            transitionTo('programs');
          }}
        />
      )}

      {step === 'programs' && (
        <ProgramsScreen
          initialSelected={selectedProgram ?? 'khoi-dau'}
          onContinue={(programId) => {
            setSelectedProgram(programId);
            transitionTo('conversion');
          }}
        />
      )}

      {step === 'conversion' && (
        <ConversionForm
          selectedProgram={selectedProgram}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { name, phone, program: selectedProgram });
            transitionTo('done');
          }}
        />
      )}

      {step === 'done' && <DoneScreen />}
    </div>
  );
}

// ─── Screens ────────────────────────────────────────────────────────────────

function HeroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#FFEFF4] via-[#EEF0FA] to-[#E7F8F1] dark:from-[#0f0c1a] dark:via-[#1a1030] dark:to-[#0f0c1a] relative flex items-center overflow-hidden transition-colors duration-500">
      {/* Skin texture overlay — light: subtle multiply; dark: glowing screen */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center hero-texture"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?w=1920&q=40&fit=crop&fm=jpg)',
        }}
      />
      <div className="max-w-6xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center relative z-10">
        <HeroImageColumn />
        <HeroTextColumn onStart={onStart} />
      </div>
    </div>
  );
}

// Cột ảnh của hero — hai chân dung xếp chồng theo phong cách Google Ads.
function HeroImageColumn() {
  return (
    <div className="relative h-72 md:h-[500px] mb-6 md:mb-0">
      {/* Woman — behind, top-left */}
      <img
        src="https://images.unsplash.com/photo-1728727217834-b190862837a3?w=400&q=85&fit=crop&crop=face"
        alt="Cô gái chăm sóc da"
        className="absolute left-0 top-0 w-48 h-64 md:w-80 md:h-[460px] rounded-3xl object-cover object-top shadow-xl z-10 dark:brightness-90 dark:ring-2 dark:ring-white/10"
      />
      {/* Man — in front, bottom-right, slight rotation */}
      <img
        src="https://blog.farmacianovadamaia.pt/wp-content/uploads/2023/02/134_skin-care-homem.jpg"
        alt="Chàng trai chăm sóc da"
        className="absolute right-0 bottom-0 w-48 h-64 md:w-80 md:h-[460px] rounded-3xl object-cover object-top shadow-2xl z-20 rotate-2 dark:brightness-90 dark:ring-2 dark:ring-white/10"
      />
    </div>
  );
}

// Cột chữ + CTA của hero.
function HeroTextColumn({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center md:text-left animate-fade-in-up">
      <h1 className="font-extrabold text-5xl md:text-6xl text-cta dark:text-white leading-tight">
        Da bạn đang{' '}
        <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
          giấu
        </span>{' '}
        điều gì?
      </h1>
      <p className="text-base md:text-lg text-cta/70 dark:text-white/70 mt-5">
        Có những "bạn nhỏ" đang ẩn náu trên làn da của bạn. Tìm chúng — và khám phá điều da bạn thực sự cần.
      </p>
      <button
        onClick={onStart}
        className="mt-7 bg-cta text-white dark:bg-white dark:text-cta font-bold rounded-soft px-12 py-4 text-base md:text-lg hover:opacity-90 transition-colors duration-300"
      >
        Soi da ngay ✨
      </button>
      <p className="text-sm md:text-base text-cta/50 dark:text-white/50 mt-4">Cùng thực hiện một cuộc khám phá làn da nhé!</p>
    </div>
  );
}

// ─── PayoffView helpers ───────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  '#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff',
  '#c77dff', '#ff9f1c', '#ff4d6d', '#48cae4',
];

function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
    y: -8 - Math.random() * 50,
    vx: (Math.random() - 0.5) * 3.5,
    vy: 2.5 + Math.random() * 4,
    size: 6 + Math.random() * 8,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 12,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    isCircle: Math.random() > 0.45,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y < canvas.height + 20) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.isCircle) {
          ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({ length: 25 }, () => ({
    x: canvas.width * 0.25 + Math.random() * canvas.width * 0.5,
    y: canvas.height * 0.55 + Math.random() * 60,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -1.2 - Math.random() * 1.5,
    size: 3 + Math.random() * 4,
    alpha: 0.5 + Math.random() * 0.4,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.008;
      if (p.y > -20 && p.alpha > 0) {
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

const PAYOFF_HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe! 🌸',
  concern: 'Hmm, có điều bạn cần biết về da mình... 😟',
};

const PAYOFF_BRIDGE: Record<'positive' | 'concern', string> = {
  positive:
    'Da bạn đang ở điểm khởi đầu tốt — và chúng tôi có thể giúp bạn duy trì điều đó lâu dài. Hãy xem chương trình chúng tôi chuẩn bị cho bạn.',
  concern:
    'Tình trạng như của bạn không hiếm — và có cách xử lý đúng hướng. Tại o2skin, chúng tôi đã thiết kế chương trình phù hợp ngay cho bạn.',
};

// ─────────────────────────────────────────────────────────────────────────────

function PayoffView({
  result,
  stats,
  onContinue,
}: {
  result: SkinCondition;
  stats: { foundCount: number; zoneLabel: string } | null;
  onContinue: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (result.tone === 'positive') return runConfetti(canvas);
    return runWorryParticles(canvas);
  }, [result.tone]);

  const header = PAYOFF_HEADERS[result.tone];
  const bridge = PAYOFF_BRIDGE[result.tone];
  const isPositive = result.tone === 'positive';

  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden relative">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      <div
        className={[
          'max-w-lg md:max-w-3xl w-full bg-white rounded-soft p-5 md:p-10 shadow-lg shadow-cta/10 relative',
          isPositive ? 'animate-fade-in-up' : 'payoff-concern-enter',
        ].join(' ')}
        style={{ zIndex: 10 }}
      >
        <p
          className={[
            'font-extrabold text-xl md:text-2xl mb-4',
            isPositive ? 'text-teal-800' : 'text-amber-900',
          ].join(' ')}
        >
          {header}
        </p>
        {stats && <PayoffStats stats={stats} />}
        <p
          className="text-sm md:text-base text-cta/80 leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: result.body }}
        />
        <p className="text-sm md:text-base text-cta/70 leading-snug px-3 py-2.5 bg-violet-50 border-l-2 border-violet-500 rounded-r-lg mb-5">
          {bridge}
        </p>
        <button
          onClick={onContinue}
          className="bg-cta text-white font-bold text-sm md:text-base py-3.5 px-9 rounded-soft w-full"
        >
          Kham khảo chương trình của chúng tôi →
        </button>
      </div>
    </div>
  );
}

// Short "achievement" statistics shown between the header and the result body.
// Each chip pops in one-by-one, left to right, to reward finishing the minigame.
function PayoffStats({ stats }: { stats: { foundCount: number; zoneLabel: string } }) {
  const chips: { key: string; color: string; content: React.ReactNode }[] = [
    {
      key: 'found',
      color: '#FF5C9E',
      content: (
        <span>
          đã soi <b>{stats.foundCount}</b> nốt mụn
        </span>
      ),
    },
    {
      key: 'zone',
      color: '#B39DFF',
      content: (
        <span>
          da bạn hay bị ở <b>{stats.zoneLabel}</b>
        </span>
      ),
    },
  ];
  return (
    <div className="mb-4">
      <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <span
            key={chip.key}
            className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm md:text-base font-semibold text-cta"
            style={{ animationDelay: `${0.5 + index * 0.18}s` }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: chip.color }}
            />
            {chip.content}
          </span>
        ))}
      </div>
    </div>
  );
}

function ConversionForm({
  selectedProgram,
  onSubmit,
}: {
  selectedProgram: ProgramId | null;
  onSubmit: (name: string, phone: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const programName = selectedProgram
    ? getPrograms().find((p) => p.id === selectedProgram)?.name
    : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSubmit(name.trim(), phone.trim());
  }

  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3 animate-fade-in-up"
      >
        <div className="font-extrabold text-lg text-cta mb-1">
          {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
        </div>
        {programName && (
          <p className="text-sm text-cta/70 -mt-2 mb-1">
            Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.
          </p>
        )}
        <input
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm text-cta"
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm text-cta"
        />
        <button
          type="submit"
          className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft mt-2"
        >
          Gửi thông tin
        </button>
      </form>
    </div>
  );
}

function ProgramsScreen({
  initialSelected,
  onContinue,
}: {
  initialSelected: ProgramId;
  onContinue: (programId: ProgramId) => void;
}) {
  const [selected, setSelected] = useState<ProgramId>(initialSelected);
  const allPrograms = getPrograms();
  const suggestedId = initialSelected;

  return (
    <div className="ps-fadeDown h-[100dvh] w-full bg-pastel-lavender overflow-y-auto py-6">
      <div className="min-h-full flex flex-col items-center justify-center px-4">
        {/* Header với 2 nurse chibi */}
        <div className="relative w-full max-w-5xl mb-5">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <img
              src="/mascots/nurse-cheer.png"
              alt=""
              className="ps-popCheer ps-floaty w-16 md:w-24 h-auto object-contain"
              style={{ zIndex: 20 }}
            />
            <h2 className="ps-fadeDown text-xl md:text-2xl font-extrabold text-cta text-center [animation-delay:0.1s]">
              Các gói dịch vụ tại O2Skin
            </h2>
            <img
              src="/mascots/nurse-review.png"
              alt=""
              className="ps-popCheer ps-floaty hidden sm:block w-16 md:w-24 h-auto object-contain"
              style={{ animationDelay: '0.2s', zIndex: 20 }}
            />
          </div>
        </div>

        {/* Lưới card auto-fill */}
        <div
          className="w-full max-w-5xl grid gap-4 mb-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
        >
          {allPrograms.map((program, idx) => (
            <ProgramCardB
              key={program.id}
              program={program}
              selected={selected === program.id}
              isSuggested={program.id === suggestedId}
              onSelect={() => setSelected(program.id)}
              style={{ animationDelay: `${0.15 + idx * 0.08}s` }}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => onContinue(selected)}
            className="bg-violet-600 text-white font-bold text-sm py-3.5 px-9 rounded-soft hover:bg-violet-700 transition-colors duration-200"
          >
            {`Đăng ký chương trình ${allPrograms.find((p) => p.id === selected)?.name ?? ''} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Card hướng B — dải header tint màu + badge VIP + badge loại bệnh
function ProgramCardB({
  program,
  selected,
  isSuggested,
  onSelect,
  style,
}: {
  program: Program;
  selected: boolean;
  isSuggested: boolean;
  onSelect: () => void;
  style?: React.CSSProperties;
}) {
  const mainCondition = getConditionById(program.treatsConditions[0]);
  const tintColor = mainCondition?.color ?? '#A0AEC0';

  return (
    <button
      onClick={onSelect}
      className={[
        'ps-cardUp text-left rounded-soft shadow-md shadow-cta/10 flex flex-col overflow-hidden',
        'border-2 transition-colors duration-[160ms]',
        selected ? 'border-[#7C3AED]' : 'border-transparent',
      ].join(' ')}
      style={style}
    >
      {/* Dải header — bg đủ đậm để white text readable */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${tintColor}CC` }}>
        <div className="font-bold text-base text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>{program.name}</div>
        {selected && <span className="font-bold text-sm text-white">✓</span>}
      </div>

      {/* Thân card */}
      <div className="px-4 py-3 flex flex-col gap-2 flex-1" style={{ background: selected ? `${tintColor}0A` : '#fff' }}>
        {program.isVip && (
          <span className="self-start inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            VIP
          </span>
        )}
        <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
        {/* Badge loại bệnh */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {program.treatsConditions.map((cid) => {
            const cond = getConditionById(cid);
            return (
              <span
                key={cid}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: cond ? `${cond.color}30` : '#e8e8e8',
                  color: cond ? cond.color : '#555',
                  filter: cond ? 'brightness(0.82)' : 'none',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: cond?.color ?? '#999' }}
                />
                {cond?.label ?? cid}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}

function DoneScreen() {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center animate-fade-in-up">
        <div className="font-extrabold text-lg md:text-xl text-cta mb-2">Cảm ơn bạn!</div>
        <p className="text-sm md:text-base text-cta/80">Đội ngũ tư vấn sẽ liên hệ với bạn sớm nhất.</p>
      </div>
    </div>
  );
}
