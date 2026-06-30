import { quizResults, type QuizResult } from '../../content/quiz';

export function computeResult(answers: Record<string, string>): QuizResult {
  const primaryAnswerId = answers['q1'];
  const result = quizResults[primaryAnswerId];
  if (!result) {
    throw new Error(`No quiz result mapped for q1 answer: "${primaryAnswerId}"`);
  }
  return result;
}
