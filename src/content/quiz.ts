export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Bạn lo nhất điều gì trên da? 💗',
    options: [
      { id: 'acne', label: 'Mụn' },
      { id: 'dark-spot', label: 'Thâm' },
      { id: 'scar', label: 'Sẹo' },
    ],
  },
  {
    id: 'q2',
    question: 'Da bạn thường trong trạng thái nào nhất?',
    options: [
      { id: 'oily', label: 'Đổ dầu' },
      { id: 'dry', label: 'Khô căng' },
      { id: 'combo', label: 'Hỗn hợp' },
    ],
  },
  {
    id: 'q3',
    question: 'Bạn đã thử bao nhiêu sản phẩm cho vấn đề này?',
    options: [
      { id: 'few', label: 'Vài loại' },
      { id: 'many', label: 'Rất nhiều' },
      { id: 'none', label: 'Chưa thử gì' },
    ],
  },
];

export const quizResults: Record<string, QuizResult> = {
  acne: {
    id: 'acne',
    title: 'Bạn cần giải pháp kiểm soát mụn',
    description: 'Da bạn đang cần một liệu trình tập trung làm sạch và kiểm soát dầu thừa.',
  },
  'dark-spot': {
    id: 'dark-spot',
    title: 'Bạn cần giải pháp mờ thâm',
    description: 'Da bạn đang cần một liệu trình tập trung phục hồi và làm đều màu da.',
  },
  scar: {
    id: 'scar',
    title: 'Bạn cần giải pháp làm mờ sẹo',
    description: 'Da bạn đang cần một liệu trình tập trung tái tạo và làm đầy mô da.',
  },
};
