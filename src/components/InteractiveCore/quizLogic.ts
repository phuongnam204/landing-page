import { quizResults, type QuizResult } from '../../content/quiz';

export function computeResult(answers: Record<string, string>): QuizResult {
  if (answers.q1 === 'nu' && answers.q2 === 'co' && answers.q6 === 'ky-kinh') {
    return quizResults['mun-noi-tiet'];
  }
  if (answers.q2 === 'co' && answers.q4 === 'da-dung' && answers.q5 === 'cang-rat') {
    return quizResults['da-nhay-cam'];
  }
  if (answers.q2 === 'co') {
    return quizResults['da-nhon-mun-viem'];
  }
  if (answers.q2 === 'khong' && answers.q3 === 'co') {
    return quizResults['lo-chan-long'];
  }
  if (answers.q2 === 'khong' && answers.q3 === 'khong') {
    return quizResults['clean-skin'];
  }
  return quizResults['da-moi-bat-dau'];
}
