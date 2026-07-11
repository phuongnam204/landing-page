import { skinConditions, type SkinCondition } from '../../content/quiz';

/** Q1 — vùng da hay nổi loạn (face mapping driver). */
export type SkinZone = 'cam-quai-ham' | 'chu-t' | 'hai-ma' | 'khong-bi';
/** Q2 — cảm giác da chủ đạo. */
export type SkinFeel = 'dau' | 'kho' | 'nhay-cam' | 'on-dinh';
/** Q3 — thời điểm da nổi loạn (chỉ cá nhân hoá copy, không đổi bucket). */
export type SkinTrigger = 'ky-kinh' | 'nang' | 'stress' | 'thuc-khuya';

export interface SelfReportAnswers {
  zone: SkinZone;
  feel: SkinFeel;
  trigger: SkinTrigger;
}

/**
 * Waterfall ánh xạ 3 câu tự khai → 1 trong 6 profile của content/quiz.ts.
 * Deterministic. Zone là driver chính; feel tinh chỉnh nhánh chu-t & khong-bi;
 * trigger KHÔNG đổi profile (chỉ dùng cá nhân hoá copy reveal).
 */
export function resolveProfile(zone: SkinZone, feel: SkinFeel, _trigger: SkinTrigger): SkinCondition {
  switch (zone) {
    case 'cam-quai-ham':
      return skinConditions['mun-noi-tiet']!;
    case 'chu-t':
      return feel === 'dau' ? skinConditions['da-nhon-mun-viem']! : skinConditions['lo-chan-long']!;
    case 'hai-ma':
      return skinConditions['da-nhay-cam']!;
    case 'khong-bi':
      return feel === 'on-dinh' ? skinConditions['clean-skin']! : skinConditions['da-moi-bat-dau']!;
    default:
      return skinConditions['da-moi-bat-dau']!;
  }
}
