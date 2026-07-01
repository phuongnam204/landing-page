import React, { useState, useEffect, useRef } from 'react';
import { quizQuestions, q6Options } from '../content/quiz';
import type { QuizResult, ProgramId } from '../content/quiz';
import { computeResult } from './InteractiveCore/quizLogic';
import { trackEvent } from '../lib/trackEvent';

type Step = 'hero' | 'quiz' | 'payoff' | 'programs' | 'conversion' | 'done';

export default function AppFlow() {
  const [step, setStep] = useState<Step>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);

  function transitionTo(nextStep: Step) {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }

  function getNextQuestionIndex(currentIndex: number, currentAnswers: Record<string, string>): number {
    const isCleanPath = currentAnswers['q2'] === 'khong' && currentAnswers['q3'] === 'khong';
    if (currentIndex === 3 && currentAnswers['q4'] === 'chua-bao-gio') {
      return isCleanPath ? quizQuestions.length : 5;
    }
    if (currentIndex === 4 && isCleanPath) {
      return quizQuestions.length; // Q6 (acne timing) is irrelevant for clean-skin path
    }
    if (currentIndex === quizQuestions.length - 1) {
      return quizQuestions.length;
    }
    return currentIndex + 1;
  }

  function handleAnswer(optionId: string) {
    if (pendingAnswer) return;
    setPendingAnswer(optionId);

    const currentQuestion = quizQuestions[questionIndex];
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };

    setTimeout(() => {
      setAnswers(nextAnswers);
      setPendingAnswer(null);

      const nextIndex = getNextQuestionIndex(questionIndex, nextAnswers);
      if (nextIndex >= quizQuestions.length) {
        const result = computeResult(nextAnswers);
        setQuizResult(result);
        setSelectedProgram(result.suggestedProgram);
        trackEvent('quiz_complete', { answers: nextAnswers });
        transitionTo('payoff');
      } else {
        setQuestionIndex(nextIndex);
      }
    }, 150);
  }

  const containerClass = `transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`;

  return (
    <div className={containerClass}>
      {step === 'hero' && (
        <HeroScreen onStart={() => transitionTo('quiz')} />
      )}

      {step === 'quiz' && (
        <QuizScreen
          questionIndex={questionIndex}
          question={
            questionIndex === 5
              ? { ...quizQuestions[5], options: q6Options[(answers['q1'] as 'nu' | 'nam') ?? 'nu'] }
              : quizQuestions[questionIndex]
          }
          pendingAnswer={pendingAnswer}
          onAnswer={handleAnswer}
        />
      )}

      {step === 'payoff' && quizResult && (
        <PayoffView
          result={quizResult}
          gender={(answers['q1'] as 'nu' | 'nam') ?? 'nu'}
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
    <div className="h-screen w-full bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-mint dark:from-[#0f0c1a] dark:via-[#1a1030] dark:to-[#0f0c1a] relative flex items-center overflow-hidden transition-colors duration-500">
      {/* Skin texture overlay — light: subtle multiply; dark: glowing screen */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center hero-texture"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?w=1920&q=40&fit=crop&fm=jpg)',
        }}
      />
      <div className="max-w-4xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-10 md:items-center relative z-10">
        {/* Images column — two overlapping portraits (Google Ads style) */}
        <div className="relative h-64 md:h-[340px] mb-6 md:mb-0">
          {/* Woman — behind, top-left */}
          <img
            src="https://images.unsplash.com/photo-1728727217834-b190862837a3?w=400&q=85&fit=crop&crop=face"
            alt="Cô gái chăm sóc da"
            className="absolute left-0 top-0 w-40 h-56 md:w-56 md:h-[300px] rounded-3xl object-cover object-top shadow-xl z-10 dark:brightness-90 dark:ring-2 dark:ring-white/10"
          />
          {/* Man — in front, bottom-right, slight rotation */}
          <img
            src="https://images.unsplash.com/photo-1643990083813-b7fbcbc60993?w=400&q=85&fit=crop&crop=face"
            alt="Chàng trai chăm sóc da"
            className="absolute right-0 bottom-0 w-40 h-56 md:w-56 md:h-[300px] rounded-3xl object-cover object-top shadow-2xl z-20 rotate-2 dark:brightness-90 dark:ring-2 dark:ring-white/10"
          />
        </div>
        {/* Text + CTA */}
        <div className="text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-4xl md:text-5xl text-cta dark:text-white leading-tight">
            Da bạn đang{' '}
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
              nói gì
            </span>{' '}
            với bạn?
          </h1>
          <p className="text-sm md:text-base text-cta/70 dark:text-white/70 mt-4">
            Làm quiz 30 giây để tìm ra giải pháp phù hợp với làn da của bạn.
          </p>
          <button
            onClick={onStart}
            className="mt-6 bg-cta text-white dark:bg-white dark:text-cta font-bold rounded-soft px-10 py-4 text-base hover:opacity-90 transition-colors duration-300"
          >
            Khám phá ngay ✨
          </button>
          <p className="text-xs text-cta/40 dark:text-white/40 mt-3">Hàng nghìn bạn trẻ đã tìm ra giải pháp phù hợp</p>
        </div>
      </div>
    </div>
  );
}

function QuizScreen({
  questionIndex,
  question,
  pendingAnswer,
  onAnswer,
}: {
  questionIndex: number;
  question: { id: string; question: string; options: { id: string; label: string }[] };
  pendingAnswer: string | null;
  onAnswer: (optionId: string) => void;
}) {
  const isVertical = question.options.length > 2;
  const progress = ((questionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-xs font-bold text-label-purple uppercase mb-1">
          Câu {questionIndex + 1} / {quizQuestions.length}
        </div>
        <div className="h-[5px] bg-violet-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full"
            style={{ width: `${progress}%`, transition: 'width 400ms ease' }}
          />
        </div>
        <div key={questionIndex} className="quiz-slide-in">
          <div className="font-bold text-lg text-cta mb-4">{question.question}</div>
          <div className={isVertical ? 'flex flex-col gap-2.5' : 'flex gap-2.5'}>
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onAnswer(option.id)}
                disabled={!!pendingAnswer}
                className={[
                  isVertical ? 'w-full text-left px-4' : 'flex-1 text-center px-2',
                  'relative border-2 rounded-2xl py-4 font-bold text-sm text-cta',
                  'transition-colors duration-[160ms]',
                  pendingAnswer === option.id
                    ? 'border-violet-600 bg-violet-100'
                    : 'border-border-pink hover:border-violet-400 hover:bg-violet-50',
                ].join(' ')}
              >
                {option.label}
                {pendingAnswer === option.id && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-600 font-bold text-base">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
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

const PAYOFF_HEADERS: Record<'positive' | 'concern', Record<'nu' | 'nam', string>> = {
  positive: {
    nu: 'Tuyệt vời cô gái, da bạn đang rất khỏe! 🌸',
    nam: 'Tuyệt vời chàng trai, da bạn đang rất khỏe! 💪',
  },
  concern: {
    nu: 'Hmm cô gái ơi, có điều bạn cần biết về da mình... 😟',
    nam: 'Hmm chàng trai ơi, có điều bạn cần biết về da mình... 😟',
  },
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
  gender,
  onContinue,
}: {
  result: QuizResult;
  gender: 'nu' | 'nam';
  onContinue: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (result.tone === 'positive') return runConfetti(canvas);
    return runWorryParticles(canvas);
  }, [result.tone]);

  const header = PAYOFF_HEADERS[result.tone][gender];
  const bridge = PAYOFF_BRIDGE[result.tone];
  const isPositive = result.tone === 'positive';

  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden relative">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      <div
        className={[
          'max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 relative',
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
        <p
          className="text-sm text-cta/80 leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: result.body }}
        />
        <p className="text-sm text-cta/70 leading-snug px-3 py-2.5 bg-violet-50 border-l-2 border-violet-500 rounded-r-lg mb-3">
          {bridge}
        </p>
        <p className="text-sm font-semibold text-cta/90 mb-5 leading-relaxed">
          💡 {result.solution}
        </p>
        <button
          onClick={onContinue}
          className="bg-cta text-white font-bold text-sm py-3.5 px-9 rounded-soft w-full"
        >
          Xem chương trình phù hợp →
        </button>
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
    ? PROGRAMS.find((p) => p.id === selectedProgram)?.name
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

const PROGRAMS: { id: ProgramId; name: string; duration: string; description: string }[] = [
  {
    id: 'khoi-dau',
    name: 'Khởi đầu',
    duration: '4 tuần',
    description: 'Phù hợp với mụn nhẹ, lần đầu điều trị. Liệu trình cơ bản giúp làm sạch da và kiểm soát dầu.',
  },
  {
    id: 'chuyen-sau',
    name: 'Chuyên sâu',
    duration: '8 tuần',
    description: 'Kết hợp nhiều bước điều trị, phù hợp mụn từ trung bình. Tập trung vào nguyên nhân gốc rễ.',
  },
  {
    id: 'toan-dien',
    name: 'Toàn diện',
    duration: '12 tuần',
    description: 'Dành cho mụn nặng và tái phát. Kết hợp chăm sóc da và tư vấn dinh dưỡng, nội tiết.',
  },
];

function ProgramsScreen({
  initialSelected,
  onContinue,
}: {
  initialSelected: ProgramId;
  onContinue: (programId: ProgramId) => void;
}) {
  const [selected, setSelected] = useState<ProgramId>(initialSelected);

  return (
    <div className="h-screen w-full bg-pastel-lavender flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-2xl w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-xs font-bold text-label-purple uppercase mb-1">Chương trình của chúng tôi</div>
          <div className="font-extrabold text-xl text-cta">Chương trình trị mụn phù hợp với bạn</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {PROGRAMS.map((program) => (
            <button
              key={program.id}
              onClick={() => setSelected(program.id)}
              className={[
                'text-left rounded-soft p-5 shadow-md shadow-cta/10 flex flex-col gap-2',
                'border-2 transition-colors duration-[160ms]',
                selected === program.id
                  ? 'bg-violet-50 border-violet-600'
                  : 'bg-white border-transparent hover:border-violet-400',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-base text-cta">{program.name}</div>
                {selected === program.id && (
                  <span className="text-violet-600 font-bold text-sm">✓</span>
                )}
              </div>
              <div className="text-xs font-bold text-label-purple">{program.duration}</div>
              <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => onContinue(selected)}
            className="bg-violet-600 text-white font-bold text-sm py-3.5 px-9 rounded-soft hover:bg-violet-700 transition-colors duration-200"
          >
            {`Đăng ký chương trình ${PROGRAMS.find((p) => p.id === selected)?.name} →`}
          </button>
        </div>
      </div>
    </div>
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
