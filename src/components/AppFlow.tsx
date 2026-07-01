import React, { useState } from 'react';
import { quizQuestions } from '../content/quiz';
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

  function transitionTo(nextStep: Step) {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }

  function handleAnswer(optionId: string) {
    const currentQuestion = quizQuestions[questionIndex];
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(nextAnswers);

    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      const result = computeResult(nextAnswers);
      setQuizResult(result);
      trackEvent('quiz_complete', { answers: nextAnswers });
      transitionTo('payoff');
    }
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
          question={quizQuestions[questionIndex]}
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
        <ProgramsScreen onContinue={() => transitionTo('conversion')} />
      )}

      {step === 'conversion' && (
        <ConversionForm
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { name, phone });
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
  onAnswer,
}: {
  questionIndex: number;
  question: { id: string; question: string; options: { id: string; label: string }[] };
  onAnswer: (optionId: string) => void;
}) {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-xs font-bold text-label-purple uppercase mb-2">
          Câu {questionIndex + 1}/{quizQuestions.length}
        </div>
        <div className="font-bold text-lg text-cta mb-4">{question.question}</div>
        <div className="flex gap-2.5">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              className="flex-1 bg-white border-2 border-border-pink rounded-2xl py-4 md:py-5 px-2 text-center font-bold text-sm md:text-base text-cta"
            >
              {option.label}
            </button>
          ))}
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

function ConversionForm({ onSubmit }: { onSubmit: (name: string, phone: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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
        <div className="font-extrabold text-lg text-cta mb-1">Để lại thông tin để nhận tư vấn</div>
        <input
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm md:text-base text-cta"
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm md:text-base text-cta"
        />
        <button
          type="submit"
          className="bg-cta text-white font-bold text-sm md:text-base py-3.5 rounded-soft mt-2"
        >
          Gửi thông tin
        </button>
      </form>
    </div>
  );
}

const PROGRAMS = [
  {
    name: 'Khởi đầu',
    duration: '4 tuần',
    description: 'Phù hợp với mụn nhẹ, lần đầu điều trị. Liệu trình cơ bản giúp làm sạch da và kiểm soát dầu.',
  },
  {
    name: 'Chuyên sâu',
    duration: '8 tuần',
    description: 'Kết hợp nhiều bước điều trị, phù hợp mụn từ trung bình. Tập trung vào nguyên nhân gốc rễ.',
  },
  {
    name: 'Toàn diện',
    duration: '12 tuần',
    description: 'Dành cho mụn nặng và tái phát. Kết hợp chăm sóc da và tư vấn dinh dưỡng, nội tiết.',
  },
];

function ProgramsScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="h-screen w-full bg-pastel-lavender flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-2xl w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-xs font-bold text-label-purple uppercase mb-1">Chương trình của chúng tôi</div>
          <div className="font-extrabold text-xl text-cta">Chương trình trị mụn phù hợp với bạn</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {PROGRAMS.map((program) => (
            <div
              key={program.name}
              className="bg-white rounded-soft p-5 shadow-md shadow-cta/10 flex flex-col gap-2"
            >
              <div className="font-bold text-base text-cta">{program.name}</div>
              <div className="text-xs font-bold text-label-purple">{program.duration}</div>
              <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-cta text-white font-bold text-sm py-3.5 px-9 rounded-soft hover:opacity-90 transition-opacity"
          >
            Nhận tư vấn miễn phí →
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
