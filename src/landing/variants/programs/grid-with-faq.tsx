'use client';
import { useState, useEffect } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import { getPrograms, getConditionById } from '../../../content/catalog';
import { trackEvent } from '../../../lib/trackEvent';

const FAQ_ITEMS = [
  {
    q: 'IPL có thực sự hiệu quả với mụn viêm và thâm không?',
    a: 'Có. IPL phát ra ánh sáng cường độ cao nhắm vào vi khuẩn P.acnes dưới da, giảm viêm mà không cần kháng sinh. Thâm mụn mờ dần nhờ kích thích tái tạo collagen. Hiệu quả thấy rõ sau 2-3 buổi.',
  },
  {
    q: 'IPL có đau không?',
    a: 'Cảm giác như chun bắn nhẹ vào da, thoáng qua. Hầu hết khách hàng chịu được hoàn toàn mà không cần gây tê. Da hơi ửng đỏ sau 1-2 tiếng rồi trở lại bình thường.',
  },
  {
    q: 'Cần bao nhiêu buổi để thấy rõ kết quả?',
    a: 'Thường 3-5 buổi, cách nhau 3-4 tuần. Mụn viêm cải thiện từ buổi thứ 2, thâm mờ rõ từ buổi thứ 3. Bác sĩ sẽ điều chỉnh số buổi sau khi khám tình trạng da thực tế.',
  },
  {
    q: 'IPL có phù hợp với da nhạy cảm không?',
    a: 'Phần lớn da nhạy cảm vẫn dùng được IPL với thông số phù hợp. Bác sĩ sẽ test vùng nhỏ trước buổi đầu tiên để đảm bảo an toàn.',
  },
  {
    q: 'Sau buổi trị có cần nghỉ dưỡng không?',
    a: 'Không cần nghỉ dưỡng - bạn có thể đi làm ngay sau buổi trị. Chỉ cần tránh nắng trực tiếp và dùng kem chống nắng SPF30+ trong 3-5 ngày.',
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-soft border border-[var(--lp-border)] overflow-hidden bg-[var(--lp-bg-card)]">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={i < FAQ_ITEMS.length - 1 ? 'border-b border-[var(--lp-border)]' : ''}>
          <button
            type="button"
            onClick={() => {
              const next = openIdx === i ? null : i;
              setOpenIdx(next);
              if (next !== null) trackEvent('faq_item_open', { index: next });
            }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-cta hover:bg-[var(--lp-bg-hero)] transition-colors"
          >
            <span>{item.q}</span>
            <ChevronIcon open={openIdx === i} />
          </button>
          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: openIdx === i ? '200px' : '0px' }}
          >
            <p className="px-4 pb-4 text-sm text-cta/70 leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);

  const program = getPrograms().find(p => p.id === suggestedProgramId);
  const cond = program ? getConditionById(program.treatsConditions[0]) : null;
  const tint = cond?.color ?? '#A0AEC0';

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-5">
        <p className="text-xs font-bold uppercase tracking-widest text-cta/50 text-center">
          Gợi ý liệu trình cho bạn
        </p>

        {program && (
          <div className="bg-[var(--lp-bg-card)] rounded-soft shadow-lg shadow-cta/10 overflow-hidden">
            <div className="px-5 py-4" style={{ background: `${tint}CC` }}>
              <span className="inline-block text-xs font-bold bg-white/30 text-white px-2.5 py-0.5 rounded-full mb-2">
                Phù hợp nhất
              </span>
              <h2 className="text-lg font-extrabold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>
                {program.name}
              </h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {program.treatsConditions.map(cid => {
                  const c = getConditionById(cid);
                  return (
                    <span key={cid}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: c ? `${c.color}22` : '#e8e8e8', color: c ? c.color : '#555', filter: 'brightness(0.82)' }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: c?.color ?? '#999' }} />
                      {c?.label ?? cid}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => onContinue(suggestedProgramId)}
          className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft w-full hover:opacity-90 transition-opacity"
        >
          Đặt lịch với liệu trình này
        </button>

        <div className="flex items-center gap-3 my-1">
          <hr className="flex-1 border-[var(--lp-border)]" />
          <span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Câu hỏi thường gặp</span>
          <hr className="flex-1 border-[var(--lp-border)]" />
        </div>

        <p className="text-xs text-cta/40 text-center -mt-2">&#8595; Kéo xuống để đọc</p>

        <FaqAccordion />
        <div className="h-4" />
      </div>
    </div>
  );
}
