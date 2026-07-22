# Task: Workflow Diversity — 8 version workflows

## Context

Dự án Next.js 15 landing page cho phòng khám O2skin. Hệ thống hiện có 25 version, tất cả đều dùng cùng một luồng:

```
hook → minigame → payoff → programs? → conversion → socialProof? → done?
```

Task này thêm **sự đa dạng về cấu trúc bước** vào 8 version: v14, v15, v17, v18, v20, v21, v22, v23. Mỗi version sẽ có một workflow khác nhau thực sự, không chỉ khác visual.

**4 loại thay đổi:**
- **Loại A** (v21, v22, v23): thêm variant mới cho slot `minigame` — mỗi version có mechanic khác nhau
- **Loại B** (v15, v20): thêm variant mới cho slot `programs` — UX khác
- **Loại C** (v14): thêm slot optional mới `expertHandoff` sau payoff
- **Loại D** (v17, v18): thêm slot optional mới `teaserPayoff`/`pathChooser` + LandingFlow branching

**Ràng buộc cứng:**
- `MinigameResult` contract không thay đổi — mọi minigame mới vẫn emit đúng shape `{ conditions, condition, zoneLabel, zoneIds, triggerNote }`
- Slot `minigame` vẫn là REQUIRED
- Các new slot phải là optional — 17 version còn lại không bị ảnh hưởng

**Condition IDs thực tế** (từ `src/content/quiz.ts`):
- `'da-nhon-mun-viem'` — da nhờn + mụn viêm
- `'da-mun-tham-seo'` — da mụn thâm sẹo
- `'lo-chan-long'` — lỗ chân lông to
- `'da-nhay-cam'` — da nhạy cảm
- `'mun-noi-tiet'` — mụn nội tiết
- `'da-moi-bat-dau'` — chưa có routine (fallback)

---

## Thay đổi 1: Thêm 3 slot prop types vào `slots.ts`

Mở `src/landing/slots.ts`. Append vào cuối file (sau `DoneSlotProps`):

```ts
export type ExpertHandoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;
};

export type TeaserPayoffSlotProps = {
  onContinue: () => void;
};

export type PathChooserSlotProps = {
  onFastTrack: () => void;
  onFullFlow:  () => void;
};
```

---

## Thay đổi 2: Cập nhật `validateRecipe.ts`

Mở `src/landing/validateRecipe.ts` và **thay thế toàn bộ nội dung**:

```ts
export type RecipeSlots = {
  hook:           string;
  minigame:       string;
  payoff:         string;
  teaserPayoff?:  string;
  pathChooser?:   string;
  expertHandoff?: string;
  programs?:      string;
  conversion:     string;
  socialProof?:   string;
  done?:          string;
};

export type Recipe = {
  id: string;
  label: string;
  theme?: string;
  chipColor?: { bg: string; text: string; label: string };
  slots: RecipeSlots;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

const REQUIRED = ['hook', 'minigame', 'payoff', 'conversion'] as const;
const OPTIONAL = ['teaserPayoff', 'pathChooser', 'expertHandoff', 'programs', 'socialProof', 'done'] as const;

export function validateRecipe(
  recipe: Recipe,
  registry: Record<string, Record<string, unknown>>,
): ValidationResult {
  const errors: string[] = [];
  for (const slot of REQUIRED) {
    const id = recipe.slots[slot];
    if (!id) errors.push(`Missing required slot: "${slot}"`);
    else if (!registry[slot]?.[id]) errors.push(`Unknown variant for slot "${slot}": "${id}"`);
  }
  for (const slot of OPTIONAL) {
    const id = recipe.slots[slot];
    if (id && !registry[slot]?.[id]) errors.push(`Unknown variant for slot "${slot}": "${id}"`);
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
```

---

## Thay đổi 3: Cập nhật test `validateRecipe.test.ts`

Mở `src/landing/__tests__/validateRecipe.test.ts`. Append 4 test case mới vào trong `describe('validateRecipe', ...)`, trước dấu `});` cuối:

```ts
  it('passes recipe with teaserPayoff slot when registered', () => {
    const reg2 = { ...reg, teaserPayoff: { 'bold-classic': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, teaserPayoff: 'bold-classic' } }, reg2);
    expect(r.valid).toBe(true);
  });
  it('fails recipe with unknown teaserPayoff variant', () => {
    const reg2 = { ...reg, teaserPayoff: { 'bold-classic': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, teaserPayoff: 'ghost' } }, reg2);
    expect(r.valid).toBe(false);
  });
  it('passes recipe with expertHandoff slot when registered', () => {
    const reg2 = { ...reg, expertHandoff: { 'natural-spa': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, expertHandoff: 'natural-spa' } }, reg2);
    expect(r.valid).toBe(true);
  });
  it('passes recipe with pathChooser slot when registered', () => {
    const reg2 = { ...reg, pathChooser: { 'bold-stacked': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, pathChooser: 'bold-stacked' } }, reg2);
    expect(r.valid).toBe(true);
  });
```

---

## Thay đổi 4: Thay toàn bộ `LandingFlow.tsx`

Mở `src/landing/LandingFlow.tsx` và **thay thế toàn bộ nội dung**:

```tsx
'use client';
import React, { useState } from 'react';
import type { ProgramId } from '../content/programs';
import { recommendPrograms, type ScoredProgram } from '../content/recommend';
import { trackEvent } from '../lib/trackEvent';
import { registry } from './registry';
import type { MinigameResult } from './slots';
import type { Recipe } from './validateRecipe';

type Step =
  | 'hook'
  | 'teaserPayoff'
  | 'pathChooser'
  | 'minigame'
  | 'payoff'
  | 'expertHandoff'
  | 'programs'
  | 'conversion'
  | 'socialProof'
  | 'done';

export default function LandingFlow({ recipe }: { recipe: Recipe }) {
  const [step, setStep]               = useState<Step>('hook');
  const [transitioning, setTransitioning] = useState(false);
  const [minigameResult, setMinigameResult] = useState<MinigameResult | null>(null);
  const [suggestedPrograms, setSuggestedPrograms] = useState<ScoredProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);
  const [isFastTrack, setIsFastTrack] = useState(false);

  function transitionTo(next: Step) {
    setTransitioning(true);
    setTimeout(() => { setStep(next); setTransitioning(false); }, 300);
  }

  function nextAfterHook() {
    if (recipe.slots.teaserPayoff) return transitionTo('teaserPayoff');
    if (recipe.slots.pathChooser)  return transitionTo('pathChooser');
    return transitionTo('minigame');
  }

  function nextAfterPayoff() {
    if (recipe.slots.expertHandoff) return transitionTo('expertHandoff');
    if (recipe.slots.programs)      return transitionTo('programs');
    return transitionTo('conversion');
  }

  function nextAfterConversion() {
    if (recipe.slots.socialProof) return transitionTo('socialProof');
    transitionTo('done');
  }

  const themeClass = `theme-${recipe.theme ?? 'blossom'}`;
  const containerClass = `transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`;

  const Hook         = registry.hook[recipe.slots.hook];
  const Minigame     = registry.minigame[recipe.slots.minigame];
  const Payoff       = registry.payoff[recipe.slots.payoff];
  const Programs     = recipe.slots.programs      ? registry.programs[recipe.slots.programs]             : null;
  const Conversion   = registry.conversion[recipe.slots.conversion];
  const SocialProof  = recipe.slots.socialProof   ? registry.socialProof[recipe.slots.socialProof]       : null;
  const Done         = recipe.slots.done          ? registry.done[recipe.slots.done]                     : null;
  const TeaserPayoff = recipe.slots.teaserPayoff  ? registry.teaserPayoff?.[recipe.slots.teaserPayoff]   : null;
  const PathChooser  = recipe.slots.pathChooser   ? registry.pathChooser?.[recipe.slots.pathChooser]     : null;
  const ExpertHandoff= recipe.slots.expertHandoff ? registry.expertHandoff?.[recipe.slots.expertHandoff] : null;

  return (
    <div className={`overflow-hidden ${themeClass} ${containerClass}`}>
      {step === 'hook' && Hook && <Hook onStart={nextAfterHook} />}

      {step === 'teaserPayoff' && TeaserPayoff && (
        <TeaserPayoff onContinue={() => transitionTo('minigame')} />
      )}

      {step === 'pathChooser' && PathChooser && (
        <PathChooser
          onFastTrack={() => {
            setIsFastTrack(true);
            trackEvent('path_chooser', { path: 'fast_track' });
            transitionTo('conversion');
          }}
          onFullFlow={() => {
            setIsFastTrack(false);
            trackEvent('path_chooser', { path: 'full_flow' });
            transitionTo('minigame');
          }}
        />
      )}

      {step === 'minigame' && Minigame && (
        <Minigame onComplete={(result) => {
          setMinigameResult(result);
          const conditionIds = result.conditions.map(c => c.id);
          const ranked = recommendPrograms(conditionIds);
          setSuggestedPrograms(ranked);
          setSelectedProgram(ranked[0]?.program.id ?? null);
          trackEvent('minigame_complete', { resultId: result.condition.id });
          transitionTo('payoff');
        }} />
      )}

      {step === 'payoff' && Payoff && minigameResult && (
        <Payoff result={minigameResult} onContinue={() => {
          trackEvent('payoff_view', { resultId: minigameResult.condition.id });
          nextAfterPayoff();
        }} />
      )}

      {step === 'expertHandoff' && ExpertHandoff && minigameResult && (
        <ExpertHandoff result={minigameResult} onContinue={() => {
          if (recipe.slots.programs) transitionTo('programs');
          else transitionTo('conversion');
        }} />
      )}

      {step === 'programs' && Programs && (
        <Programs suggestedPrograms={suggestedPrograms}
          onContinue={(programId) => { setSelectedProgram(programId); transitionTo('conversion'); }} />
      )}

      {step === 'conversion' && Conversion && (
        <Conversion selectedProgramId={selectedProgram} minigameResult={minigameResult}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { program: selectedProgram, fastTrack: isFastTrack });
            nextAfterConversion();
          }} />
      )}

      {step === 'socialProof' && SocialProof && (
        <SocialProof onContinue={() => { if (recipe.slots.done) transitionTo('done'); }} />
      )}

      {step === 'done' && (Done
        ? <Done selectedProgramId={selectedProgram} />
        : <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5">
            <div className="bg-[var(--lp-bg-card)] rounded-soft p-8 shadow-lg text-center max-w-sm w-full">
              <svg viewBox="0 0 48 48" className="w-12 h-12 text-teal-500 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
                <path d="M14 25l7 7 13-14" />
              </svg>
              <p className="font-extrabold text-xl text-cta">Đã nhận thông tin của bạn!</p>
              <p className="text-sm text-cta/60 mt-2">Chuyên viên sẽ liên hệ trong 24 giờ.</p>
            </div>
          </div>
      )}
    </div>
  );
}
```

---

## Thay đổi 5: Tạo v21 — `electric/classic-chained.tsx`

Tạo file mới `src/landing/variants/minigame/electric/classic-chained.tsx`:

> **Workflow v21:** hook → [phase 1: zone tap] → [phase 2: 3-câu chip quiz] → payoff
> Hai micro-interaction bên trong một component. LandingFlow coi đây vẫn là 1 minigame slot.
> `ZONE_LABELS` không được export từ face-map.tsx — định nghĩa lại local.

```tsx
'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';
import { FaceDiagram, mapToConditions } from '../face-map';
import type { Zone, AcneType } from '../face-map';

const ZONE_LABEL_MAP: Record<Zone, string> = {
  forehead:      'vùng trán',
  nose:          'vùng mũi / chữ T',
  'left-cheek':  'má trái',
  'right-cheek': 'má phải',
  'chin-jaw':    'cằm & quai hàm',
};

type ChatQuestion = { text: string; options: { label: string; value: string }[] };

const QUESTIONS: ChatQuestion[] = [
  {
    text: 'Loại mụn bạn hay gặp ở vùng đó?',
    options: [
      { label: 'Mụn viêm đỏ, có mủ',    value: 'inflamed'  },
      { label: 'Đầu đen / đầu trắng',   value: 'blackhead' },
      { label: 'Mẩn đỏ, dễ kích ứng',   value: 'sensitive' },
      { label: 'Lỗ chân lông to rõ',    value: 'pore'      },
    ],
  },
  {
    text: 'Mụn xuất hiện thường xuyên như thế nào?',
    options: [
      { label: 'Liên tục, không dứt',    value: 'constant'   },
      { label: 'Theo chu kỳ tháng',      value: 'periodic'   },
      { label: 'Thỉnh thoảng bùng phát', value: 'occasional' },
    ],
  },
  {
    text: 'Mức độ ảnh hưởng đến bạn?',
    options: [
      { label: 'Nhẹ — đôi khi có 1–2 nốt',   value: 'mild'     },
      { label: 'Vừa — thấy rõ trên mặt',      value: 'moderate' },
      { label: 'Nhiều — đang rất khó chịu',   value: 'severe'   },
    ],
  },
];

function ProgressDots({ phase }: { phase: 1 | 2 }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {[1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            background: i <= phase ? 'var(--lp-accent)' : 'var(--lp-border)',
            transform: i === phase ? 'scale(1.3)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

function PhaseZoneTap({ selectedZones, onToggle, onNext }: { selectedZones: Zone[]; onToggle: (z: Zone) => void; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 pt-8">
      <ProgressDots phase={1} />
      <h2 className="text-xl font-extrabold text-cta text-center mb-1">Bạn hay bị mụn ở vùng nào?</h2>
      <p className="text-sm text-cta/50 text-center mb-6">Chạm vào vùng trên mặt để chọn (tối đa 2 vùng)</p>
      <FaceDiagram selectedZones={selectedZones} onToggle={onToggle} isScanning={false} />
      {selectedZones.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {selectedZones.map(z => (
            <span key={z} className="text-xs bg-[var(--lp-accent)]/10 text-cta font-semibold rounded-full px-3 py-1">
              {ZONE_LABEL_MAP[z]}
            </span>
          ))}
        </div>
      )}
      <button
        onClick={onNext}
        disabled={selectedZones.length === 0}
        className="mt-8 w-full max-w-xs py-3.5 rounded-soft font-bold text-sm transition-all duration-200 disabled:opacity-30 text-white"
        style={{ background: selectedZones.length > 0 ? 'var(--lp-accent)' : 'var(--lp-border)' }}
      >
        Tiếp theo
      </button>
    </div>
  );
}

function PhaseSkinChat({ onComplete }: { onComplete: (acneType: AcneType, frequency: string, severity: string) => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  function pick(value: string) {
    const next = [...answers, value];
    if (qIndex < QUESTIONS.length - 1) {
      setAnswers(next);
      setQIndex(i => i + 1);
    } else {
      onComplete((next[0] ?? 'inflamed') as AcneType, next[1] ?? 'constant', next[2] ?? 'moderate');
    }
  }

  const q = QUESTIONS[qIndex]!;
  return (
    <div className="flex flex-col items-center px-5 pt-8" style={{ animation: 'slideInUp 0.3s ease-out' }}>
      <ProgressDots phase={2} />
      <div className="w-full max-w-xs mb-6">
        <div className="flex gap-1 mb-4">
          {QUESTIONS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i <= qIndex ? 'var(--lp-accent)' : 'var(--lp-border)' }} />
          ))}
        </div>
        <p className="text-xs text-cta/40 uppercase tracking-widest mb-3">Câu {qIndex + 1} / {QUESTIONS.length}</p>
        <h2 className="text-xl font-extrabold text-cta mb-6">{q.text}</h2>
        <div className="flex flex-col gap-3">
          {q.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              className="w-full py-3.5 px-4 rounded-soft border-2 text-sm font-semibold text-left transition-all duration-150 active:scale-[0.98]"
              style={{ borderColor: 'var(--lp-border)', background: 'var(--lp-bg-card)', color: 'var(--lp-primary)' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ElectricClassicChainedMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase]               = useState<1 | 2>(1);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);

  function toggleZone(z: Zone) {
    setSelectedZones(prev => {
      if (prev.includes(z)) return prev.filter(x => x !== z);
      if (prev.length >= 2)  return [...prev.slice(1), z];
      return [...prev, z];
    });
  }

  function handlePhase2Complete(acneType: AcneType, frequency: string, severity: string) {
    const conditionIds = mapToConditions(selectedZones, acneType);
    const resolved = conditionIds.map(id => skinConditions[id]).filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0 ? resolved : [skinConditions['da-moi-bat-dau']!].filter(Boolean);
    const condition = conditions[0];
    if (!condition) return;
    onComplete({
      conditions,
      condition,
      zoneLabel: selectedZones.map(z => ZONE_LABEL_MAP[z]).join(', '),
      zoneIds: [...selectedZones],
      triggerNote: `Tần suất: ${frequency}; Mức độ: ${severity}`,
    });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)]">
      <style>{`@keyframes slideInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {phase === 1 && <PhaseZoneTap selectedZones={selectedZones} onToggle={toggleZone} onNext={() => setPhase(2)} />}
      {phase === 2 && <PhaseSkinChat onComplete={handlePhase2Complete} />}
    </div>
  );
}
```

---

## Thay đổi 6: Tạo v22 — `electric/glow-scratch.tsx`

Tạo file mới `src/landing/variants/minigame/electric/glow-scratch.tsx`:

> **Workflow v22:** hook → [chọn vấn đề da] → [cào để reveal kết quả] → payoff
> Scratch effect dùng SVG mask — không cần canvas.
> Coverage estimate bằng grid sampling 20×20.

```tsx
'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';

const CHOICES = [
  { label: 'Mụn',              sub: 'Mụn viêm, mụn trứng cá',             conditionId: 'da-nhon-mun-viem' as ConditionId },
  { label: 'Thâm sẹo',         sub: 'Vết thâm sau mụn, da không đều màu', conditionId: 'da-mun-tham-seo'  as ConditionId },
  { label: 'Da nhờn kích ứng', sub: 'Lỗ chân lông to, dễ nổi mẩn',       conditionId: 'lo-chan-long'       as ConditionId },
] as const;

type ScratchPoint = { x: number; y: number };

function estimateCoverage(points: ScratchPoint[], width: number, height: number): number {
  if (width <= 0 || height <= 0 || points.length === 0) return 0;
  const R = 30;
  let covered = 0;
  for (let gx = 0; gx < 20; gx++) {
    for (let gy = 0; gy < 20; gy++) {
      const sx = (gx + 0.5) * (width / 20);
      const sy = (gy + 0.5) * (height / 20);
      if (points.some(p => Math.hypot(p.x - sx, p.y - sy) < R)) covered++;
    }
  }
  return covered / 400;
}

export function ElectricGlowScratchMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase]             = useState<1 | 2>(1);
  const [chosen, setChosen]           = useState<typeof CHOICES[number] | null>(null);
  const [scratchPoints, setScratchPoints] = useState<ScratchPoint[]>([]);
  const [revealed, setRevealed]       = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const scratchBoxRef                 = useRef<HTMLDivElement>(null);
  const completedRef                  = useRef(false);

  useEffect(() => {
    if (phase !== 2) return;
    const t = setTimeout(() => setFallbackVisible(true), 8000);
    return () => clearTimeout(t);
  }, [phase]);

  const finishReveal = useCallback(() => {
    if (completedRef.current || !chosen) return;
    completedRef.current = true;
    setRevealed(true);
    const condition = skinConditions[chosen.conditionId];
    if (!condition) return;
    setTimeout(() => {
      onComplete({
        conditions: [condition],
        condition,
        zoneLabel: 'Toàn mặt',
        zoneIds: [],
        triggerNote: `Phân tích theo lựa chọn: ${chosen.label}`,
      });
    }, 800);
  }, [chosen, onComplete]);

  function addPoint(clientX: number, clientY: number) {
    if (!scratchBoxRef.current || completedRef.current) return;
    const rect = scratchBoxRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setScratchPoints(prev => {
      const next = [...prev, { x, y }];
      if (estimateCoverage(next, rect.width, rect.height) >= 0.6) setTimeout(finishReveal, 0);
      return next;
    });
  }

  const condition = chosen ? skinConditions[chosen.conditionId] : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--lp-bg-minigame)] px-5 py-10">
      {phase === 1 && (
        <>
          <h2 className="text-xl font-extrabold text-cta text-center mb-2">Da bạn thường gặp vấn đề gì nhất?</h2>
          <p className="text-sm text-cta/50 text-center mb-8">Chọn 1 để khám phá kết quả của bạn</p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {CHOICES.map(c => (
              <button
                key={c.conditionId}
                onClick={() => setChosen(c)}
                className="w-full py-4 px-5 rounded-soft border-2 text-left transition-all duration-150 active:scale-[0.98]"
                style={{
                  borderColor: chosen?.conditionId === c.conditionId ? 'var(--lp-accent)' : 'var(--lp-border)',
                  background: chosen?.conditionId === c.conditionId ? 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))' : 'var(--lp-bg-card)',
                }}
              >
                <p className="font-bold text-cta">{c.label}</p>
                <p className="text-xs text-cta/50 mt-0.5">{c.sub}</p>
              </button>
            ))}
          </div>
          {chosen && (
            <button onClick={() => setPhase(2)} className="mt-8 w-full max-w-xs py-3.5 rounded-soft font-bold text-sm text-white" style={{ background: 'var(--lp-accent)' }}>
              Cào để khám phá
            </button>
          )}
        </>
      )}

      {phase === 2 && (
        <>
          <h2 className="text-lg font-extrabold text-cta text-center mb-2">Cào để xem kết quả phân tích da của bạn</h2>
          <p className="text-xs text-cta/40 text-center mb-8">Vuốt ngón tay qua thẻ bên dưới</p>
          <div
            ref={scratchBoxRef}
            className="relative w-full max-w-xs rounded-soft overflow-hidden select-none"
            style={{ height: 180, touchAction: 'none' }}
            onPointerMove={(e) => { if (e.buttons > 0 || e.pointerType !== 'mouse') { e.preventDefault(); addPoint(e.clientX, e.clientY); } }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); addPoint(e.clientX, e.clientY); }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-soft" style={{ background: 'var(--lp-bg-card)', border: '2px solid var(--lp-border)' }}>
              {condition && (
                <>
                  <p className="text-xs uppercase tracking-widest text-cta/40 mb-2">Kết quả của bạn</p>
                  <p className="text-xl font-extrabold text-cta text-center">{condition.label}</p>
                  <p className="text-xs text-cta/60 text-center mt-2 leading-relaxed line-clamp-2">{condition.bridge}</p>
                </>
              )}
            </div>
            {!revealed && (
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} aria-hidden="true">
                <defs>
                  <mask id="scratch-mask">
                    <rect width="100%" height="100%" fill="white" />
                    {scratchPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="30" fill="black" />)}
                  </mask>
                </defs>
                <rect width="100%" height="100%" rx="12" fill="var(--lp-accent)" mask="url(#scratch-mask)" opacity="0.9" />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  Cào tại đây
                </text>
              </svg>
            )}
          </div>
          {fallbackVisible && !revealed && (
            <button onClick={finishReveal} className="mt-6 w-full max-w-xs py-3 rounded-soft font-bold text-sm text-white" style={{ background: 'var(--lp-accent)' }}>
              Xem kết quả
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

---

## Thay đổi 7: Tạo v23 — `electric/soft-swipe.tsx`

Tạo file mới `src/landing/variants/minigame/electric/soft-swipe.tsx`:

> **Workflow v23:** hook → [5 thẻ swipe trái/phải] → payoff
> Swipe phải = "Có", swipe trái = "Không". Cũng có 2 button "Không"/"Có" cho desktop.
> Ngưỡng xác nhận swipe: `|dx| > 80px`.

```tsx
'use client';
import React, { useState, useRef } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';

const CARDS = [
  { text: 'Mình hay bị mụn ở vùng trán và mũi',      conditionId: 'da-nhon-mun-viem' as ConditionId },
  { text: 'Da mình nhờn bóng, lỗ chân lông to',      conditionId: 'lo-chan-long'       as ConditionId },
  { text: 'Mình có nhiều thâm sẹo sau khi mụn lặn',  conditionId: 'da-mun-tham-seo'   as ConditionId },
  { text: 'Da mình nhạy cảm, dễ đỏ và kích ứng',     conditionId: 'da-nhay-cam'        as ConditionId },
  { text: 'Mình bị mụn đầu đen nhiều ở vùng cằm',    conditionId: 'mun-noi-tiet'       as ConditionId },
] as const;

export function ElectricSoftSwipeMinigame({ onComplete }: MinigameSlotProps) {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<boolean[]>([]);
  const [dragX, setDragX]       = useState(0);
  const [exiting, setExiting]   = useState<'left' | 'right' | null>(null);
  const startXRef               = useRef(0);
  const startYRef               = useRef(0);
  const isSwipingRef            = useRef(false);

  function buildResult(finalAnswers: boolean[]) {
    const yesIds = CARDS.filter((_, i) => finalAnswers[i]).map(c => c.conditionId);
    const conditionIds: ConditionId[] = yesIds.length > 0 ? yesIds : ['da-moi-bat-dau'];
    const resolved = conditionIds.map(id => skinConditions[id]).filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0 ? resolved : [skinConditions['da-moi-bat-dau']!].filter(Boolean);
    const condition = conditions[0];
    if (!condition) return;
    onComplete({ conditions, condition, zoneLabel: 'Toàn mặt', zoneIds: [], triggerNote: `Đồng ý với ${yesIds.length}/${CARDS.length} vấn đề` });
  }

  function advance(yes: boolean) {
    const nextAnswers = [...answers, yes];
    setExiting(yes ? 'right' : 'left');
    setTimeout(() => {
      setExiting(null);
      setDragX(0);
      if (current >= CARDS.length - 1) buildResult(nextAnswers);
      else { setAnswers(nextAnswers); setCurrent(c => c + 1); }
    }, 280);
  }

  function onPointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX; startYRef.current = e.clientY; isSwipingRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    if (!isSwipingRef.current && Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 8) isSwipingRef.current = true;
    if (isSwipingRef.current) { e.preventDefault(); setDragX(dx); }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!isSwipingRef.current) return;
    if (Math.abs(e.clientX - startXRef.current) > 80) advance(e.clientX > startXRef.current);
    else setDragX(0);
    isSwipingRef.current = false;
  }

  const tilt = dragX * 0.08;
  const hint = dragX > 40 ? 'yes' : dragX < -40 ? 'no' : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-between bg-[var(--lp-bg-minigame)] px-5 py-8 select-none">
      <div className="flex gap-2">
        {CARDS.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{ width: i === current ? 20 : 8, height: 8, background: i <= current ? 'var(--lp-accent)' : 'var(--lp-border)', opacity: i < current ? 0.4 : 1 }} />
        ))}
      </div>

      <div className="relative flex items-center justify-center w-full" style={{ height: 320 }}>
        {current + 1 < CARDS.length && (
          <div className="absolute w-full max-w-xs rounded-soft bg-[var(--lp-bg-card)] border-2 border-[var(--lp-border)] flex items-center justify-center p-8" style={{ height: 220, transform: `scale(${exiting ? 1 : 0.95})`, transition: 'transform 0.28s ease-out', zIndex: 0 }}>
            <p className="text-base font-semibold text-cta/40 text-center">{CARDS[current + 1]?.text}</p>
          </div>
        )}
        <div
          className="absolute w-full max-w-xs rounded-soft bg-[var(--lp-bg-card)] border-2 flex items-center justify-center p-8 cursor-grab active:cursor-grabbing"
          style={{
            height: 220, zIndex: 1,
            borderColor: hint === 'yes' ? 'var(--lp-accent)' : hint === 'no' ? '#ef4444' : 'var(--lp-border)',
            transform: exiting ? `translateX(${exiting === 'right' ? 120 : -120}%) rotate(${exiting === 'right' ? 18 : -18}deg)` : `translateX(${dragX}px) rotate(${tilt}deg)`,
            transition: exiting ? 'transform 0.28s ease-in' : dragX !== 0 ? 'none' : 'transform 0.2s ease-out',
          }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        >
          {hint === 'yes' && <div className="absolute top-4 left-4 text-xs font-extrabold uppercase tracking-widest px-2 py-1 rounded border-2" style={{ color: 'var(--lp-accent)', borderColor: 'var(--lp-accent)' }}>Có</div>}
          {hint === 'no'  && <div className="absolute top-4 right-4 text-xs font-extrabold uppercase tracking-widest px-2 py-1 rounded border-2 text-red-500 border-red-500">Không</div>}
          <p className="text-lg font-bold text-cta text-center leading-snug" style={{ pointerEvents: 'none' }}>{CARDS[current]?.text}</p>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        <button onClick={() => !exiting && advance(false)} className="flex-1 py-3 rounded-soft border-2 border-red-400 text-red-500 font-bold text-sm transition-all active:scale-95">Không</button>
        <button onClick={() => !exiting && advance(true)}  className="flex-1 py-3 rounded-soft font-bold text-sm text-white transition-all active:scale-95" style={{ background: 'var(--lp-accent)' }}>Có</button>
      </div>
    </div>
  );
}
```

---

## Thay đổi 8: Tạo v15 — `programs/natural/editorial-journey.tsx`

Tạo file mới `src/landing/variants/programs/natural/editorial-journey.tsx`:

> **Workflow v15:** minigame → payoff → [timeline 4 milestone] → conversion
> Dùng `ProgramsSlotProps` giữ nguyên. Chỉ hiện `suggestedPrograms[0]` ngầm — không có UI chọn program.

```tsx
'use client';
import React from 'react';
import type { ProgramsSlotProps } from '../../../slots';

const MILESTONES = [
  { period: 'Tuần 1–2', title: 'Thăm khám và làm sạch nền',     desc: 'Đánh giá tình trạng da, loại bỏ nhân mụn ẩn và làm sạch lỗ chân lông toàn diện.' },
  { period: 'Tuần 3–4', title: 'Liệu trình điều trị cá nhân',   desc: 'Chuyên viên xây dựng phác đồ riêng theo loại da, kiên trì điều trị từng bước.' },
  { period: 'Tháng 2',  title: 'Những thay đổi đầu tiên',       desc: 'Da bắt đầu sáng đều, mụn giảm rõ rệt. Bạn sẽ thấy sự khác biệt từ gương.' },
  { period: 'Tháng 3+', title: 'Da ổn định và đẹp hơn',          desc: 'Làn da mới: ổn định, ít mụn, đều màu. Duy trì kết quả với routine đơn giản hơn.' },
] as const;

export function NaturalEditorialJourneyPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const topProgram = suggestedPrograms[0];
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)] px-5 py-12">
      <p className="text-xs uppercase tracking-widest text-cta/40 text-center mb-2">Hành trình của bạn</p>
      <h2 className="text-2xl font-extrabold text-cta text-center mb-2 leading-snug">Da đẹp hơn sau 3 tháng — từng bước rõ ràng</h2>
      {topProgram && (
        <p className="text-sm text-cta/50 text-center mb-10">
          Đề xuất: <span className="font-semibold text-cta">{topProgram.program.name}</span>
        </p>
      )}
      <div className="relative flex flex-col max-w-md mx-auto w-full">
        {MILESTONES.map((m, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, var(--lp-bg-card))' }}>
                <span className="text-sm font-extrabold" style={{ color: 'var(--lp-accent)' }}>{i + 1}</span>
              </div>
              {i < MILESTONES.length - 1 && <div className="w-px flex-1 my-1" style={{ background: 'var(--lp-border)', minHeight: 24 }} />}
            </div>
            <div className="pb-8 pt-1">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--lp-accent)' }}>{m.period}</p>
              <p className="text-base font-bold text-cta mb-1">{m.title}</p>
              <p className="text-sm text-cta/60 leading-relaxed">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onContinue(topProgram?.program.id ?? '')}
        className="mt-4 w-full max-w-md mx-auto py-4 rounded-soft font-bold text-white text-base transition-all active:scale-[0.98]"
        style={{ background: 'var(--lp-accent)' }}
      >
        Bắt đầu hành trình của bạn
      </button>
    </div>
  );
}
```

---

## Thay đổi 9: Tạo v20 — `programs/bold/typographic-commitment.tsx`

Tạo file mới `src/landing/variants/programs/bold/typographic-commitment.tsx`:

> **Workflow v20:** minigame → payoff → [chọn mức độ cam kết] → conversion
> 3 lựa chọn intensity map sang suggestedPrograms theo index.

```tsx
'use client';
import React, { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ScoredProgram } from '../../../../content/recommend';

const LEVELS = [
  { value: 'light'     as const, title: 'Nhẹ nhàng',  sub: 'Cải thiện dần, phù hợp với lịch trình bận rộn' },
  { value: 'steady'    as const, title: 'Đều đặn',     sub: 'Kết quả rõ ràng sau 4–6 tuần — được nhiều người chọn nhất' },
  { value: 'intensive' as const, title: 'Chuyên sâu',  sub: 'Tập trung điều trị triệt để trong thời gian ngắn' },
] as const;

type Level = typeof LEVELS[number]['value'];

function pickProgram(level: Level, programs: ScoredProgram[]) {
  if (programs.length === 0) return null;
  if (programs.length === 1) return programs[0]!;
  if (level === 'light')     return programs[programs.length - 1]!;
  if (level === 'steady')    return programs[0]!;
  return programs.find(p => p.program.isVip) ?? programs[0]!;
}

export function BoldTypographicCommitmentPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const [selected, setSelected] = useState<Level | null>(null);

  function handleContinue() {
    if (!selected) return;
    const picked = pickProgram(selected, suggestedPrograms);
    onContinue(picked?.program.id ?? suggestedPrograms[0]?.program.id ?? '');
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-[var(--lp-bg-minigame)] px-6 py-12">
      <p className="text-xs uppercase tracking-widest text-cta/40 mb-3">Cam kết của bạn</p>
      <h2 className="text-3xl font-extrabold text-cta leading-tight mb-10">Bạn muốn tiếp cận theo hướng nào?</h2>
      <div className="flex flex-col mb-10">
        {LEVELS.map((l, i) => {
          const isSelected = selected === l.value;
          return (
            <button
              key={l.value}
              onClick={() => setSelected(l.value)}
              className="w-full py-6 text-left transition-all duration-150 active:scale-[0.99]"
              style={{ borderBottom: i < LEVELS.length - 1 ? '1px solid var(--lp-border)' : 'none', opacity: selected && !isSelected ? 0.35 : 1 }}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 w-4 h-4 rounded-full border-2 shrink-0 transition-all duration-150" style={{ borderColor: isSelected ? 'var(--lp-accent)' : 'var(--lp-border)', background: isSelected ? 'var(--lp-accent)' : 'transparent' }} />
                <div>
                  <p className="text-xl font-extrabold text-cta">{l.title}</p>
                  <p className="text-sm text-cta/50 mt-1 leading-relaxed">{l.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <button onClick={handleContinue} className="w-full py-4 rounded-soft font-extrabold text-white text-base transition-all active:scale-[0.98]" style={{ background: 'var(--lp-accent)' }}>
          Tiếp tục
        </button>
      )}
    </div>
  );
}
```

---

## Thay đổi 10: Tạo v14 — `expertHandoff/natural/spa.tsx`

Tạo **thư mục mới** `src/landing/variants/expertHandoff/natural/` rồi tạo file `spa.tsx`:

> **Workflow v14:** payoff → [3 chat bubble staggered + CTA] → conversion
> Bubble 2 personalise theo `result.condition.id`.

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import type { ExpertHandoffSlotProps } from '../../../slots';
import type { ConditionId } from '../../../../content/quiz';

const HANDOFF_MESSAGES: Partial<Record<ConditionId, string>> = {
  'mun-noi-tiet':    'Da bạn đang có mụn nội tiết — cần được chăm sóc từ gốc rễ, không chỉ bề mặt. Mình thấy liệu trình điều trị chuyên sâu sẽ phù hợp nhất với bạn.',
  'da-nhon-mun-viem':'Da nhờn và mụn viêm của bạn hoàn toàn có thể kiểm soát được. Bên mình có phác đồ riêng giúp da cân bằng bã nhờn và giảm viêm hiệu quả.',
  'da-nhay-cam':     'Da nhạy cảm cần được tiếp cận nhẹ nhàng. Mình sẽ hướng dẫn bạn từng bước để da không bị kích ứng thêm trong quá trình điều trị.',
  'lo-chan-long':    'Lỗ chân lông to có thể cải thiện rõ rệt khi được làm sạch đúng cách. Bên mình có liệu trình chuyên cho da dầu và lỗ chân lông mà bạn có thể thử.',
  'da-mun-tham-seo': 'Thâm sẹo sau mụn là điều nhiều bạn gặp phải và hoàn toàn có thể điều trị. Mình nghĩ protocol phục hồi da của bên mình sẽ rất phù hợp.',
  'da-seo-ro':       'Sẹo rỗ cần thời gian và đúng phương pháp. Mình sẽ tư vấn quy trình điều trị từng giai đoạn để da phục hồi tốt nhất.',
};

const DEFAULT_MESSAGE = 'Tình trạng da của bạn hoàn toàn có thể cải thiện được. Mình nghĩ bên mình có thể giúp bạn đạt được làn da bạn muốn.';

export function NaturalSpaExpertHandoff({ result, onContinue }: ExpertHandoffSlotProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  const personalMessage = HANDOFF_MESSAGES[result.condition.id as ConditionId] ?? DEFAULT_MESSAGE;
  const bubbles = [
    'Mình đã xem qua kết quả phân tích của bạn rồi ...',
    personalMessage,
    'Bạn muốn đặt lịch tư vấn để mình hướng dẫn chi tiết hơn không?',
  ];

  useEffect(() => {
    if (visibleCount >= bubbles.length) return;
    const t = setTimeout(() => setVisibleCount(n => n + 1), visibleCount === 0 ? 600 : 900);
    return () => clearTimeout(t);
  }, [visibleCount, bubbles.length]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)] px-5 pt-10 pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0" style={{ background: 'var(--lp-accent)' }} aria-hidden="true">L</div>
        <div>
          <p className="text-sm font-bold text-cta">Chuyên viên Lan</p>
          <p className="text-xs text-cta/40">O2 Skin Clinic</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {bubbles.map((text, i) => (
          <div key={i} className="max-w-[80%] transition-all duration-500" style={{ opacity: i < visibleCount ? 1 : 0, transform: i < visibleCount ? 'translateY(0)' : 'translateY(12px)' }}>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed" style={{ background: 'var(--lp-bg-card)', border: '1px solid var(--lp-border)', color: 'var(--lp-primary)' }}>
              {text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 transition-all duration-500" style={{ opacity: visibleCount >= bubbles.length ? 1 : 0, transform: visibleCount >= bubbles.length ? 'translateY(0)' : 'translateY(12px)' }}>
        <button
          onClick={onContinue}
          disabled={visibleCount < bubbles.length}
          className="w-full py-4 rounded-soft font-bold text-white text-base transition-all active:scale-[0.98] disabled:opacity-0"
          style={{ background: 'var(--lp-accent)' }}
        >
          Đặt lịch ngay
        </button>
      </div>
    </div>
  );
}
```

---

## Thay đổi 11: Tạo v17 — `teaserPayoff/bold/classic.tsx`

Tạo **thư mục mới** `src/landing/variants/teaserPayoff/bold/` rồi tạo file `classic.tsx`:

> **Workflow v17:** hook → [preview mờ + breathing animation] → "Phân tích ngay" → minigame
> Hiện trước minigame để tạo anticipation. CTA click là vào thẳng minigame.

```tsx
'use client';
import React from 'react';
import type { TeaserPayoffSlotProps } from '../../../slots';

export function BoldClassicTeaserPayoff({ onContinue }: TeaserPayoffSlotProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--lp-bg-minigame)] px-5 py-12">
      <style>{`@keyframes teaser-breathe { 0%,100%{filter:blur(8px) opacity(0.65);transform:scale(1)} 50%{filter:blur(6px) opacity(0.8);transform:scale(1.015)} }`}</style>
      <p className="text-xs uppercase tracking-widest text-cta/40 mb-3 text-center">Kết quả cá nhân hoá</p>
      <h2 className="text-2xl font-extrabold text-cta text-center mb-2 leading-snug">Kết quả phân tích da của bạn</h2>
      <p className="text-sm text-cta/50 text-center mb-10 max-w-xs">Hoàn thành phân tích da để nhận đánh giá chính xác dành riêng cho bạn</p>
      <div className="relative w-full max-w-xs mb-10">
        <div className="w-full rounded-soft overflow-hidden" style={{ animation: 'teaser-breathe 2.4s ease-in-out infinite' }}>
          {['Da nhờn + mụn viêm', 'Lỗ chân lông to', 'Da ổn định'].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0" style={{ background: 'var(--lp-bg-card)', borderColor: 'var(--lp-border)' }}>
              <div className="w-4 h-4 rounded-full shrink-0" style={{ background: 'var(--lp-accent)', opacity: 0.4 }} />
              <div className="flex-1"><div className="h-3 rounded-full w-2/3" style={{ background: 'var(--lp-border)' }} /></div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-soft">
          <div className="px-4 py-2 rounded-full text-xs font-bold text-white" style={{ background: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)' }}>
            Cá nhân hóa cho bạn sau khi phân tích
          </div>
        </div>
      </div>
      <button onClick={onContinue} className="w-full max-w-xs py-4 rounded-soft font-extrabold text-white text-base transition-all active:scale-[0.98]" style={{ background: 'var(--lp-accent)' }}>
        Phân tích da của bạn
      </button>
    </div>
  );
}
```

---

## Thay đổi 12: Tạo v18 — `pathChooser/bold/stacked.tsx`

Tạo **thư mục mới** `src/landing/variants/pathChooser/bold/` rồi tạo file `stacked.tsx`:

> **Workflow v18 — branching:**
> - Path A (fast track): hook → [2-card chooser] → conversion (minigameResult = null, đã xử lý OK trong ConversionOrganism)
> - Path B (full flow): hook → [2-card chooser] → minigame → payoff → conversion

```tsx
'use client';
import React from 'react';
import type { PathChooserSlotProps } from '../../../slots';

export function BoldStackedPathChooser({ onFastTrack, onFullFlow }: PathChooserSlotProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)]">
      <button
        onClick={onFastTrack}
        className="flex-1 flex flex-col justify-center px-8 transition-all duration-150 active:opacity-80 active:scale-[0.99]"
        style={{ borderBottom: '1px solid var(--lp-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-2xl font-extrabold text-cta leading-tight mb-2">Tôi biết da mình<br />cần gì</p>
            <p className="text-sm text-cta/50">Đặt lịch tư vấn nhanh</p>
          </div>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M8 16h16M18 10l6 6-6 6" stroke="var(--lp-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      <button
        onClick={onFullFlow}
        className="flex-1 flex flex-col justify-center px-8 transition-all duration-150 active:opacity-80 active:scale-[0.99]"
        style={{ background: 'color-mix(in srgb, var(--lp-accent) 6%, var(--lp-bg-minigame))' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-2xl font-extrabold text-cta leading-tight mb-2">Hãy phân tích da<br />giúp mình</p>
            <p className="text-sm text-cta/50">Nhận kết quả cá nhân hóa</p>
          </div>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="8" stroke="var(--lp-accent)" strokeWidth="2" />
            <circle cx="16" cy="16" r="3" fill="var(--lp-accent)" opacity="0.6" />
            <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
      </button>
    </div>
  );
}
```

---

## Thay đổi 13: Cập nhật `registry.ts`

Mở `src/landing/registry.ts`.

**Bước 1 — Thêm vào dòng import từ `'./slots'` ở đầu file**, thêm 3 type mới:

```ts
import type { HookSlotProps, MinigameSlotProps, PayoffSlotProps, ProgramsSlotProps, ConversionSlotProps, SocialProofSlotProps, DoneSlotProps, ExpertHandoffSlotProps, TeaserPayoffSlotProps, PathChooserSlotProps } from './slots';
```

**Bước 2 — Thêm 8 import mới** (append sau block import cuối cùng, trước `export const registry`):

```ts
// Loại A — new minigame mechanics
import { ElectricClassicChainedMinigame } from './variants/minigame/electric/classic-chained';
import { ElectricGlowScratchMinigame }    from './variants/minigame/electric/glow-scratch';
import { ElectricSoftSwipeMinigame }      from './variants/minigame/electric/soft-swipe';
// Loại B — new programs variants
import { NaturalEditorialJourneyPrograms }     from './variants/programs/natural/editorial-journey';
import { BoldTypographicCommitmentPrograms }   from './variants/programs/bold/typographic-commitment';
// Loại C/D — new optional slots
import { NaturalSpaExpertHandoff } from './variants/expertHandoff/natural/spa';
import { BoldClassicTeaserPayoff }  from './variants/teaserPayoff/bold/classic';
import { BoldStackedPathChooser }   from './variants/pathChooser/bold/stacked';
```

**Bước 3 — Thêm 3 entry vào `minigame:` branch** (append trước `as Record<...>`):

```ts
'electric-classic-chained': ElectricClassicChainedMinigame,
'electric-glow-scratch':    ElectricGlowScratchMinigame,
'electric-soft-swipe':      ElectricSoftSwipeMinigame,
```

**Bước 4 — Thêm 2 entry vào `programs:` branch** (append trước `as Record<...>`):

```ts
'natural-editorial-journey':     NaturalEditorialJourneyPrograms,
'bold-typographic-commitment':   BoldTypographicCommitmentPrograms,
```

**Bước 5 — Thêm 3 branch mới** vào cuối object `registry`, sau `done:`:

```ts
  expertHandoff: { 'natural-spa': NaturalSpaExpertHandoff } as Record<string, ComponentType<ExpertHandoffSlotProps>>,
  teaserPayoff:  { 'bold-classic': BoldClassicTeaserPayoff } as Record<string, ComponentType<TeaserPayoffSlotProps>>,
  pathChooser:   { 'bold-stacked': BoldStackedPathChooser } as Record<string, ComponentType<PathChooserSlotProps>>,
```

---

## Thay đổi 14: Cập nhật 8 recipe files

**v14** — `src/landing/recipes/v14-natural-spa.ts`:
```ts
import type { Recipe } from '../validateRecipe';
export const v14NaturalSpa: Recipe = {
  id: 'v14-natural-spa', label: 'v14 — Natural Sage / Spa', theme: 'dusty-rose',
  slots: { hook: 'natural-spa', minigame: 'natural-spa', payoff: 'natural-spa', expertHandoff: 'natural-spa', conversion: 'natural-spa', done: 'natural-spa' },
};
```

**v15** — `src/landing/recipes/v15-natural-editorial.ts` (đọc file hiện có, chỉ thay `programs`):
```ts
programs: 'natural-editorial-journey',
```

**v17** — `src/landing/recipes/v17-bold-classic.ts` (đọc file hiện có, thêm `teaserPayoff`):
```ts
teaserPayoff: 'bold-classic',
```
Đặt sau `hook:`, trước `minigame:`.

**v18** — `src/landing/recipes/v18-bold-stacked.ts` (đọc file hiện có, thêm `pathChooser`):
```ts
pathChooser: 'bold-stacked',
```
Đặt sau `hook:`, trước `minigame:`.

**v20** — `src/landing/recipes/v20-bold-typographic.ts` (đọc file hiện có, chỉ thay `programs`):
```ts
programs: 'bold-typographic-commitment',
```

**v21** — `src/landing/recipes/v21-electric-classic.ts` (chỉ thay `minigame`):
```ts
minigame: 'electric-classic-chained',
```

**v22** — `src/landing/recipes/v22-electric-glow-heavy.ts` (**thay toàn bộ** — xoá `programs`):
```ts
import type { Recipe } from '../validateRecipe';
export const v22ElectricGlowHeavy: Recipe = {
  id: 'v22-electric-glow-heavy', label: 'v22 — Electric Magenta / Glow Heavy', theme: 'crimson',
  slots: { hook: 'electric-glow-heavy', minigame: 'electric-glow-scratch', payoff: 'electric-glow-heavy', conversion: 'electric-glow-heavy', done: 'electric-glow-heavy' },
};
```

**v23** — `src/landing/recipes/v23-electric-soft-dark.ts` (**thay toàn bộ** — xoá `programs`):
```ts
import type { Recipe } from '../validateRecipe';
export const v23ElectricSoftDark: Recipe = {
  id: 'v23-electric-soft-dark', label: 'v23 — Electric Magenta / Soft Dark', theme: 'periwinkle',
  slots: { hook: 'electric-soft-dark', minigame: 'electric-soft-swipe', payoff: 'electric-soft-dark', conversion: 'electric-soft-dark', done: 'electric-soft-dark' },
};
```

---

## Verify

```bash
npx tsc --noEmit
```

Expected: 0 errors.

```bash
npx vitest run src/landing/__tests__/validateRecipe.test.ts
```

Expected: 10/10 tests pass.

---

## Commit

```bash
git add src/landing/slots.ts src/landing/validateRecipe.ts src/landing/__tests__/validateRecipe.test.ts src/landing/LandingFlow.tsx
git add src/landing/variants/minigame/electric/classic-chained.tsx src/landing/variants/minigame/electric/glow-scratch.tsx src/landing/variants/minigame/electric/soft-swipe.tsx
git add src/landing/variants/programs/natural/editorial-journey.tsx src/landing/variants/programs/bold/typographic-commitment.tsx
git add src/landing/variants/expertHandoff/ src/landing/variants/teaserPayoff/ src/landing/variants/pathChooser/
git add src/landing/registry.ts
git add src/landing/recipes/v14-natural-spa.ts src/landing/recipes/v15-natural-editorial.ts src/landing/recipes/v17-bold-classic.ts src/landing/recipes/v18-bold-stacked.ts src/landing/recipes/v20-bold-typographic.ts src/landing/recipes/v21-electric-classic.ts src/landing/recipes/v22-electric-glow-heavy.ts src/landing/recipes/v23-electric-soft-dark.ts
git commit -m "feat(workflow): add structural workflow diversity to v14–v23 — 3 new minigame mechanics, 2 programs variants, expertHandoff/teaserPayoff/pathChooser slots"
```

---

## Do NOT

- Không sửa bất kỳ file nào của v01–v13, v16, v19, v24, v25
- Không thay đổi `MinigameResult` type trong `slots.ts` — các new minigame component phải emit đúng shape đó
- Không bỏ `minigame` ra khỏi `REQUIRED` trong `validateRecipe.ts`
- Không thêm hardcoded hex color — dùng `var(--lp-accent)`, `var(--lp-border)`, `var(--lp-bg-card)`, v.v.
- Không import `ZONE_LABELS` từ `face-map.tsx` — nó không được export. Dùng `ZONE_LABEL_MAP` định nghĩa local trong component
- Không sửa bất kỳ shared organism nào (`ConfettiCardWhyPayoff`, `ConversionOrganism`, v.v.)
- Không cần tạo test cho từng component mới — `tsc --noEmit` và `vitest run` đã đủ để verify
