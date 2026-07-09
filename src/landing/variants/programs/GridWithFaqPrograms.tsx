'use client';
import { useState, useEffect } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { ProgramId } from '../../../content/programs';
import type { ConditionId } from '../../../content/quiz';
import { getPrograms, getConditionById } from '../../../content/catalog';
import { trackEvent } from '../../../lib/trackEvent';

type FaqItem = { q: string; a: string };

const FAQ_BY_CONDITION: Record<ConditionId, FaqItem[]> = {
  'da-nhon-mun-viem': [
    { q: 'Combo Peel có hiệu quả với mụn viêm và thâm không?', a: 'Có. Peel hoá học tẩy lớp tế bào chết tích tụ, thông thoáng lỗ chân lông và kích thích tái tạo da mới. Mụn viêm giảm rõ trong 2–3 buổi đầu, thâm mờ dần sau 4–6 tuần điều trị.' },
    { q: 'Combo Peel có đau không và cần phục hồi không?', a: 'Cảm giác ngứa nhẹ hoặc ấm trong 5–10 phút sau khi bôi dung dịch peel, hoàn toàn chịu đựng được. Da có thể bong nhẹ 2–3 ngày — không cần nghỉ dưỡng, vẫn đi làm bình thường.' },
    { q: 'Cần bao nhiêu buổi để thấy kết quả rõ?', a: 'Thường thấy rõ cải thiện sau buổi thứ 2. Phác đồ chuẩn là 4 buổi cách nhau 3–4 tuần để kiểm soát nhờn và thâm bền vững.' },
    { q: 'Combo Peel có phù hợp với da nhờn nhiều không?', a: 'Đây chính là loại da phù hợp nhất. Peel giúp kiểm soát bã nhờn, thu nhỏ lỗ chân lông và giảm bóng dầu thấy rõ từ buổi đầu.' },
    { q: 'Sau buổi peel cần kiêng gì?', a: 'Tránh nắng trực tiếp và dùng kem chống nắng SPF30+ trong 1 tuần. Tránh sản phẩm tẩy tế bào chết hoặc retinol 5–7 ngày sau mỗi buổi.' },
  ],
  'lo-chan-long': [
    { q: 'Combo Peel có thu nhỏ lỗ chân lông được không?', a: 'Có. Peel làm sạch bã nhờn và tế bào chết bên trong lỗ chân lông, giúp lỗ chân lông trông nhỏ lại rõ rệt. Sau 3–4 buổi, da trông mịn và đều màu hơn đáng kể.' },
    { q: 'Mụn đầu đen có bị loại bỏ hoàn toàn không?', a: 'Peel hoá học giải quyết đầu đen hiệu quả hơn bất kỳ phương pháp nặn cơ học nào — tẩy lớp bã nhờn tắc nghẽn mà không gây tổn thương thành lỗ chân lông.' },
    { q: 'Cần bao nhiêu buổi để thấy lỗ chân lông se lại?', a: 'Thường thấy cải thiện từ buổi thứ 2. Phác đồ 4 buổi cách 3–4 tuần cho kết quả bền vững, kết hợp routine chăm sóc tại nhà đúng cách.' },
    { q: 'Lỗ chân lông có to trở lại sau điều trị không?', a: 'Nếu không duy trì routine kiểm soát nhờn, bã nhờn tích tụ lại theo thời gian. Buổi duy trì định kỳ mỗi 6–8 tuần giúp giữ kết quả lâu dài.' },
    { q: 'Peel tại nhà và tại phòng khám khác nhau thế nào?', a: 'Nồng độ và loại acid peel tại phòng khám mạnh hơn nhiều và được điều chỉnh theo từng loại da. Tự peel tại nhà bằng sản phẩm nồng độ cao có rủi ro kích ứng và bỏng da.' },
  ],
  'da-nhay-cam': [
    { q: 'Laser có an toàn với da nhạy cảm không?', a: 'Laser tại o2skin được hiệu chỉnh thông số riêng cho da nhạy cảm — năng lượng thấp hơn, tần suất điều chỉnh. Trước buổi đầu, bác sĩ sẽ test vùng nhỏ để đảm bảo da không phản ứng bất thường.' },
    { q: 'Cảm giác trong buổi laser như thế nào?', a: 'Cảm giác như chun bắn nhẹ, thoáng qua — hầu hết khách hàng chịu được mà không cần gây tê. Da có thể ửng đỏ nhẹ trong 2–4 tiếng sau buổi trị rồi trở lại bình thường.' },
    { q: 'Bao nhiêu buổi laser mới thấy rõ kết quả?', a: 'Cải thiện đầu tiên thường thấy sau buổi thứ 2–3. Phác đồ cho da nhạy cảm là 5–7 buổi cách nhau 4–5 tuần để kích thích collagen từ từ và bền vững.' },
    { q: 'Laser có làm da nhạy cảm hơn về sau không?', a: 'Ngược lại — laser kích thích tái tạo collagen và củng cố hàng rào bảo vệ da. Da thường chịu đựng tốt hơn sau liệu trình hoàn chỉnh.' },
    { q: 'Sau laser cần chăm sóc da như thế nào?', a: 'Tránh nắng trong 1 tuần (SPF50+), tạm dừng retinol và AHA/BHA 5–7 ngày, tăng cường dưỡng ẩm nhẹ nhàng. Chuyên viên o2skin sẽ hướng dẫn chi tiết sau mỗi buổi.' },
  ],
  'mun-noi-tiet': [
    { q: 'Phác đồ nội tiết khác gì so với điều trị mụn thông thường?', a: 'Phác đồ mụn nội tiết kết hợp IPL kiểm soát viêm tại chỗ với tư vấn điều chỉnh lối sống. Không chỉ dập tắt mụn hiện tại mà còn tấn công nguyên nhân tuyến nhờn bị kích thích từ bên trong.' },
    { q: 'Mụn nội tiết ở cằm và quai hàm có hết hẳn được không?', a: 'Có thể kiểm soát tốt đến mức không tái phát đáng kể. Kết quả phụ thuộc vào mức độ mất cân bằng hormone — bác sĩ sẽ đánh giá trước khi đưa ra dự đoán cụ thể.' },
    { q: 'Cần bao nhiêu buổi để mụn cằm ngừng tái phát?', a: 'Thường cần 6–8 buổi để kiểm soát chu kỳ bùng phát. Trong 3 buổi đầu đã thấy mụn ít viêm hơn và thâm mờ nhanh hơn rõ rệt.' },
    { q: 'Có cần thay đổi chế độ ăn trong thời gian điều trị không?', a: 'Giảm đường, sữa và thực phẩm chỉ số đường huyết cao giúp tăng hiệu quả điều trị rõ rệt. Bác sĩ sẽ tư vấn cụ thể dựa trên tình trạng thực tế của từng người.' },
    { q: 'Sau điều trị có bị tái phát khi hormone thay đổi không?', a: 'Có thể có mụn nhẹ theo chu kỳ — đây là phản ứng sinh lý bình thường. Tuy nhiên mức độ viêm và số lượng mụn giảm đáng kể so với trước. Buổi duy trì 6–8 tuần giúp kiểm soát lâu dài.' },
  ],
  'clean-skin': [
    { q: 'Da đang ổn thì có cần làm gì thêm không?', a: 'Không cần "điều trị" — nhưng cần duy trì. Một phác đồ nhẹ nhàng định kỳ giúp da tiếp tục khoẻ mạnh và phòng ngừa lão hóa sớm, giống như chăm sóc răng định kỳ dù không đau.' },
    { q: 'Chương trình duy trì bao gồm những gì?', a: 'Thường là kết hợp làm sạch sâu định kỳ + dưỡng ẩm chuyên sâu + bảo vệ collagen. Bác sĩ sẽ thiết kế routine phù hợp với tuổi, lối sống và môi trường sống cụ thể của bạn.' },
    { q: 'Bao nhiêu buổi là đủ cho chương trình duy trì?', a: 'Thường 3 buổi ban đầu trong 6–8 tuần, sau đó duy trì 1 buổi mỗi 6–8 tuần. Ít tốn thời gian hơn điều trị mụn hay sẹo rất nhiều.' },
    { q: 'Có cần mua thêm sản phẩm đặc biệt không?', a: 'Chuyên viên sẽ đánh giá routine hiện tại và chỉ điều chỉnh những gì cần thiết — không ép mua thêm nếu những gì đang dùng đã phù hợp.' },
    { q: 'Khi nào nên bắt đầu chương trình duy trì da?', a: 'Càng sớm càng tốt — nhưng bất kỳ thời điểm nào cũng không muộn. Bắt đầu ở tuổi 25–30, da vẫn phản ứng rất tốt với các liệu pháp phòng ngừa và duy trì.' },
  ],
  'da-moi-bat-dau': [
    { q: 'Chưa biết loại da mình là gì, có cần xác định trước không?', a: 'Đây chính là điều đầu tiên bác sĩ o2skin làm trong buổi tư vấn — kiểm tra da thực tế và xác định loại da, nhu cầu và những gì đang thiếu trong routine của bạn.' },
    { q: 'Mua nhiều sản phẩm skincare mà da không cải thiện — tại sao?', a: 'Hầu hết trường hợp do chọn sản phẩm không đúng loại da hoặc dùng sai thứ tự. Tư vấn từ bác sĩ giúp tránh lãng phí vào sản phẩm không phù hợp.' },
    { q: 'Bắt đầu routine da từ đâu nếu chưa biết gì?', a: 'Bắt đầu với tối thiểu — làm sạch nhẹ, dưỡng ẩm phù hợp, chống nắng mỗi ngày. Bác sĩ sẽ xây dựng routine cơ bản phù hợp với lối sống và ngân sách của bạn.' },
    { q: 'Cần bao lâu để thấy da cải thiện sau khi có routine đúng?', a: 'Với routine phù hợp, da thường ổn định hơn trong 4–6 tuần đầu và cải thiện rõ trong 3 tháng. Không cần đợi lâu mới thấy kết quả đầu tiên.' },
    { q: 'Chưa có vấn đề da cụ thể, buổi tư vấn có cần thiết không?', a: 'Buổi tư vấn với người chưa có vấn đề da thường hiệu quả nhất — dễ xây dựng routine phòng ngừa hơn nhiều so với điều trị sau khi vấn đề đã xuất hiện.' },
  ],
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-soft border border-[var(--lp-border)] overflow-hidden bg-[var(--lp-bg-card)]">
      {items.map((item, i) => (
        <div key={i} className={i < items.length - 1 ? 'border-b border-[var(--lp-border)]' : ''}>
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
          <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: openIdx === i ? '200px' : '0px' }}>
            <p className="px-4 pb-4 text-sm text-cta/70 leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConditionTagSmall({ conditionId }: { conditionId: string }) {
  const c = getConditionById(conditionId as ConditionId);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: c ? `${c.color}22` : '#e8e8e8', color: c ? c.color : '#555', filter: 'brightness(0.82)' }}>
      <span className="w-2 h-2 rounded-full" style={{ background: c?.color ?? '#999' }} />
      {c?.label ?? conditionId}
    </span>
  );
}

function ProgramHighlight({ program, tint, onContinue, suggestedProgramId }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  onContinue: (id: ProgramId) => void;
  suggestedProgramId: ProgramId;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-widest text-cta/50 text-center md:text-left">
        Gợi ý liệu trình cho bạn
      </p>
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
            {program.treatsConditions.map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
          </div>
        </div>
      </div>
      <button
        onClick={() => onContinue(suggestedProgramId)}
        className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft w-full hover:opacity-90 transition-opacity"
      >
        Đặt lịch với liệu trình này
      </button>
    </div>
  );
}

function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Câu hỏi thường gặp</span>
        <hr className="flex-1 border-[var(--lp-border)]" />
      </div>
      <p className="text-xs text-cta/40 text-center md:hidden">&#8595; Kéo xuống để đọc</p>
      <FaqAccordion items={items} />
    </div>
  );
}

export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);

  const program = getPrograms().find(p => p.id === suggestedProgramId);
  const primaryConditionId = (program?.treatsConditions[0] ?? 'da-nhon-mun-viem') as ConditionId;
  const cond = program ? getConditionById(program.treatsConditions[0]) : null;
  const tint = cond?.color ?? '#A0AEC0';
  const faqItems = FAQ_BY_CONDITION[primaryConditionId] ?? FAQ_BY_CONDITION['da-nhon-mun-viem'];

  if (!program) return null;

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-8 md:items-start">
          <ProgramHighlight
            program={program}
            tint={tint}
            onContinue={onContinue}
            suggestedProgramId={suggestedProgramId}
          />
          <FaqSection items={faqItems} />
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
