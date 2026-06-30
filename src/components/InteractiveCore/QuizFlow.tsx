import { useState } from 'react';
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
      <div className="bg-white rounded-soft p-5 shadow-lg shadow-cta/10">
        <div className="text-xs font-bold text-label-purple uppercase mb-2">
          Câu {questionIndex + 1}/{quizQuestions.length}
        </div>
        <div className="font-bold text-lg text-cta mb-4">{currentQuestion.question}</div>
        <div className="flex gap-2.5">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className="flex-1 bg-white border-2 border-border-pink rounded-2xl py-4 px-2 text-center font-bold text-sm text-cta"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
