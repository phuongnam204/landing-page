import React, { useState } from 'react';
import { quizQuestions, q6Options } from '../content/quiz';
import type { QuizResult } from '../content/quiz';
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
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  function transitionTo(nextStep: Step) {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }

  function getNextQuestionIndex(currentIndex: number, currentAnswers: Record<string, string>): number {
    if (currentIndex === 3 && currentAnswers['q4'] === 'chua-bao-gio') {
      return 5; // skip Q5, jump to Q6
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

      if (questionIndex === quizQuestions.length - 1) {
        const result = computeResult(nextAnswers);
        setQuizResult(result);
        setSelectedProgram(result.suggestedProgram);
        trackEvent('quiz_complete', { answers: nextAnswers });
        transitionTo('payoff');
      } else {
        setQuestionIndex(getNextQuestionIndex(questionIndex, nextAnswers));
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
    <div className="h-screen w-full bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-mint flex items-center overflow-hidden">
      <div className="max-w-4xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center">
        {/* Hero image */}
        <div className="flex justify-center mb-6 md:mb-0">
          <img
            src="https://images.unsplash.com/photo-1728727217834-b190862837a3?w=600&q=85&fit=crop&crop=face"
            alt="Cô gái chăm sóc da"
            className="w-52 h-72 md:w-72 md:h-[400px] rounded-3xl object-cover object-top shadow-lg"
          />
        </div>
        {/* Text + CTA */}
        <div className="text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-3xl md:text-4xl text-cta leading-tight">
            Da bạn đang nói gì với bạn?
          </h1>
          <p className="text-sm md:text-base text-cta/70 mt-3">
            Làm quiz 30 giây để tìm ra giải pháp phù hợp với làn da của bạn.
          </p>
          <button
            onClick={onStart}
            className="mt-6 bg-cta text-white font-bold rounded-soft px-8 py-3.5 hover:opacity-90 transition-opacity"
          >
            Khám phá ngay ✨
          </button>
          <p className="text-xs text-cta/40 mt-3">Hàng nghìn bạn trẻ đã tìm ra giải pháp phù hợp</p>
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

function PayoffView({
  result,
  onContinue,
}: {
  result: QuizResult;
  onContinue: () => void;
}) {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center animate-fade-in-up">
        <div className="text-xs font-bold text-label-purple uppercase mb-2">Kết quả của bạn</div>
        <div className="font-extrabold text-xl text-cta mb-3">{result.title}</div>
        <p className="text-sm text-cta/80 mb-2 text-left">{result.skinCondition}</p>
        <p className="text-sm font-semibold text-cta/90 mb-5 text-left">💡 {result.solution}</p>
        <button
          onClick={onContinue}
          className="inline-block bg-cta text-white font-bold text-sm py-3.5 px-9 rounded-soft"
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
  selectedProgram: string | null;
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

const PROGRAMS = [
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
  initialSelected: string;
  onContinue: (programId: string) => void;
}) {
  const [selected, setSelected] = useState(initialSelected);

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
