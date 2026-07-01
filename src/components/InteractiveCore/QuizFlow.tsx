import React, { useState } from 'react';
import { quizQuestions } from '../../content/quiz';
import { computeResult } from './quizLogic';
import { trackEvent } from '../../lib/trackEvent';

type Step = 'quiz' | 'payoff' | 'conversion' | 'done';

export default function QuizFlow() {
  const [step, setStep] = useState<Step>('quiz');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = quizQuestions[questionIndex];

  function handleAnswer(optionId: string) {
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(nextAnswers);

    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      trackEvent('quiz_complete', { answers: nextAnswers });
      setStep('payoff');
    }
  }

  if (step === 'quiz') {
    return (
      <div key={`quiz-${questionIndex}`} className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10">
        <div className="text-xs md:text-sm font-bold text-label-purple uppercase mb-2">
          Câu {questionIndex + 1}/{quizQuestions.length}
        </div>
        <div className="font-bold text-lg md:text-xl text-cta mb-4">{currentQuestion.question}</div>
        <div className="flex gap-2.5">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className="flex-1 bg-white border-2 border-border-pink rounded-2xl py-4 md:py-5 px-2 text-center font-bold text-sm md:text-base text-cta"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'payoff') {
    const result = computeResult(answers);

    return (
      <PayoffView
        result={result}
        onContinue={() => {
          trackEvent('payoff_view', { resultId: result.id });
          setStep('conversion');
        }}
      />
    );
  }

  if (step === 'conversion') {
    return (
      <ConversionForm
        onSubmit={(name, phone) => {
          trackEvent('form_submit', { name, phone });
          setStep('done');
        }}
      />
    );
  }

  if (step === 'done') {
    return (
      <div className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center">
        <div className="font-extrabold text-lg md:text-xl text-cta mb-2">Cảm ơn bạn!</div>
        <p className="text-sm md:text-base text-cta/80">Đội ngũ tư vấn sẽ liên hệ với bạn sớm nhất.</p>
      </div>
    );
  }

  return null;
}

function ConversionForm({ onSubmit }: { onSubmit: (name: string, phone: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      return;
    }
    onSubmit(name.trim(), phone.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3"
    >
      <div className="font-extrabold text-lg md:text-xl text-cta mb-1">Để lại thông tin để nhận tư vấn</div>
      <input
        type="text"
        placeholder="Tên của bạn"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm md:text-base text-cta"
      />
      <input
        type="tel"
        placeholder="Số điện thoại"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
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
  );
}

function PayoffView({
  result,
  onContinue,
}: {
  result: ReturnType<typeof computeResult>;
  onContinue: () => void;
}) {
  return (
    <div className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center">
      <div className="text-xs md:text-sm font-bold text-label-purple uppercase mb-2">Kết quả của bạn</div>
      <div className="font-extrabold text-xl md:text-2xl text-cta mb-2">{result.title}</div>
      <p className="text-sm md:text-base text-cta/80 mb-5">{result.description}</p>
      <button
        onClick={onContinue}
        className="inline-block bg-cta text-white font-bold text-sm md:text-base py-3.5 px-9 rounded-soft"
      >
        Nhận tư vấn miễn phí →
      </button>
    </div>
  );
}
