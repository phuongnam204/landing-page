# Face-Map Multi-Condition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp face-map minigame từ "chọn 1 loại mụn + tap zones" thành "chọn nhiều loại mụn (Bước 0) + với mỗi loại: tap zone + chọn severity ít/nhiều/không (Bước 1..N) + bubble arc picker tại vị trí zone".

**Architecture:** Single-file refactor của `src/landing/variants/minigame/face-map.tsx`. Thêm type `Severity` + `ConditionAssessment`, hàm `assessToConditions` (reuse logic của `mapToConditions`), 3 component mới (`BubbleSeverityPicker`, `ConditionSelectStep`, `ConditionFaceMapStep`), cập nhật props `FaceDiagram` + `ScanningScreen` + `StepProgress`, viết lại orchestrator `FaceMapMinigame`. Output `onComplete` giữ nguyên shape để `ConversionOrganism` không cần thay đổi.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Next.js 15 App Router. Build verification: `npm run build` (Next.js TypeScript check).

**Spec:** `docs/superpowers/specs/2026-08-07-face-map-multi-condition-design.md`

**Demo approved:** `.superpowers/brainstorm/face-map-brainstorm/content/bubble-demo-v4.html`

---

## File Map

| File | Status | Thay đổi |
|------|--------|---------|
| `src/landing/variants/minigame/face-map.tsx` | Modify | File duy nhất. ~666 → ~950 lines. |

---

### Task 1: Types + assessToConditions + helpers

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx` (after line 8, before `ZONE_LABELS`)

- [ ] **Step 1: Thêm types và helper functions**

Thêm đoạn sau vào ngay sau dòng 8 (`export type AcneType = ...`):

```typescript
export type Severity = 'nhieu' | 'it' | 'khong';

export interface ConditionAssessment {
  acneType: AcneType;
  zones: Partial<Record<Zone, Severity>>;
}

const SEVERITY_WEIGHT: Record<Severity, number> = { nhieu: 2, it: 1, khong: 0 };

function _totalScore(assessment: ConditionAssessment): number {
  return (Object.values(assessment.zones) as Severity[])
    .reduce((s, v) => s + SEVERITY_WEIGHT[v], 0);
}

function _getCombinedZoneSeverity(
  assessments: ConditionAssessment[]
): Partial<Record<Zone, Severity>> {
  const result: Partial<Record<Zone, Severity>> = {};
  for (const { zones } of assessments) {
    for (const [zone, sev] of Object.entries(zones) as [Zone, Severity][]) {
      if (sev === 'nhieu') result[zone] = 'nhieu';
      else if (sev === 'it' && result[zone] !== 'nhieu') result[zone] = 'it';
    }
  }
  return result;
}
```

- [ ] **Step 2: Thêm hàm assessToConditions**

Thêm ngay sau hàm `mapToConditions` (sau line 113):

```typescript
export function assessToConditions(assessments: ConditionAssessment[]): ConditionId[] {
  const ranked = assessments
    .map(a => ({ a, score: _totalScore(a) }))
    .filter(({ score }) => score >= 1)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return ['clean-skin'];

  const result = new Set<ConditionId>();
  for (const { a } of ranked) {
    const activeZones = (Object.entries(a.zones) as [Zone, Severity][])
      .filter(([, s]) => s !== 'khong')
      .map(([z]) => z);
    for (const id of mapToConditions(activeZones, a.acneType)) {
      result.add(id);
    }
  }
  return result.size > 0 ? [...result] : ['clean-skin'];
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors. Nếu lỗi về `_totalScore` / `_getCombinedZoneSeverity` → kiểm tra xem đã thêm đúng vị trí chưa (phải trước `assessToConditions`).

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): add Severity type, ConditionAssessment, assessToConditions"
```

---

### Task 2: FaceDiagram severity-aware props + ScanningScreen update

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx` — hàm `FaceDiagram` (line ~151) và `ScanningScreen` (line ~385) và `Step1` (line ~429)

**Context:** `FaceDiagram` hiện nhận `selectedZones: Zone[]` + `onToggle`. Cần đổi sang `zoneSeverity: Partial<Record<Zone, Severity>>` + `onZoneTap(z, cx, cy)`. Có 4 callsite trong file: trong `ScanningScreen`, trong `Step1`, và 2 trong desktop layout của `FaceMapMinigame` (2 callsite này sẽ bị xóa hoàn toàn ở Task 6 nên có thể để tạm).

- [ ] **Step 1: Thay thế toàn bộ hàm FaceDiagram**

Xóa hàm `FaceDiagram` từ line 151 đến 274, thay bằng:

```typescript
export function FaceDiagram({
  zoneSeverity,
  onZoneTap,
  isScanning,
}: {
  zoneSeverity: Partial<Record<Zone, Severity>>;
  onZoneTap: (z: Zone, cx: number, cy: number) => void;
  isScanning: boolean;
}) {
  const [hovered, setHovered] = useState<Zone | null>(null);
  const hasInteracted = Object.keys(zoneSeverity).length > 0;

  return (
    <div className="select-none w-full max-w-[240px] md:max-w-[320px]" style={{ filter: 'drop-shadow(0 4px 16px color-mix(in srgb, var(--lp-accent) 28%, transparent))' }}>
      <svg
        viewBox="0 0 176 240"
        className="w-full h-auto"
        fill="none"
        aria-label="Sơ đồ khuôn mặt — chạm vào vùng có mụn"
        role="img"
      >
        <defs>
          <clipPath id="fc-clip">
            <ellipse cx={FACE_CLIP.cx} cy={FACE_CLIP.cy} rx={FACE_CLIP.rx} ry={FACE_CLIP.ry} />
          </clipPath>
          <style>{SVG_KEYFRAMES}</style>
        </defs>

        {/* Illustrated face base */}
        <image
          href="/face-map-minigame.svg"
          x={FACE_OFFSET_X} y="0"
          width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
          preserveAspectRatio="xMidYMin meet"
        />

        <g clipPath="url(#fc-clip)">
          {ZONES_SVG.map(z => {
            const severity = zoneSeverity[z.id];
            const active   = severity === 'nhieu' || severity === 'it';
            const isHov    = hovered === z.id && !isScanning;
            const fillColor =
              severity === 'nhieu' ? '#EF4444'
              : severity === 'it'  ? '#F97316'
              : 'var(--lp-accent)';
            const dotColor = severity === 'nhieu' ? '#EF4444' : '#F97316';
            return (
              <g
                key={z.id}
                onClick={(e) => {
                  if (isScanning) return;
                  const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
                  const cx = rect.left + rect.width  / 2;
                  const cy = rect.top  + rect.height / 2;
                  onZoneTap(z.id, cx, cy);
                }}
                onMouseEnter={() => setHovered(z.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: isScanning ? 'default' : 'pointer' }}
                role="button"
                aria-label={z.label}
                aria-pressed={active}
              >
                {/* Zone fill */}
                <ellipse
                  cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                  fill={fillColor}
                  opacity={active ? 0.22 : isHov ? 0.14 : 0.06}
                  style={{
                    transition: 'opacity 0.15s ease',
                    animation: !hasInteracted && !active && !isScanning
                      ? 'zone-hint 1.1s ease-in-out 4'
                      : undefined,
                  }}
                />
                {/* Dashed border when idle */}
                {!active && (
                  <ellipse
                    cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                    fill="none"
                    stroke="var(--lp-accent)"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity={isHov ? 0.55 : 0.28}
                    style={{ transition: 'opacity 0.15s ease', pointerEvents: 'none' }}
                  />
                )}
                {/* Solid border + ring when active */}
                {active && (
                  <ellipse
                    cx={z.cx} cy={z.cy} rx={z.rx + 3} ry={z.ry + 3}
                    stroke={fillColor} fill="none" opacity={0.7}
                    style={{ animation: 'zone-ring 1.6s ease-out infinite' }}
                  />
                )}
                {/* Animated acne dots — colored by severity */}
                {active && z.dots.map((d, i) => (
                  <circle
                    key={i}
                    cx={d.x} cy={d.y} r="3.5"
                    fill={dotColor}
                    style={{
                      animation: [
                        `acne-pop 0.25s ease-out ${i * 0.07}s both`,
                        `acne-pulse 1.3s ease-in-out ${0.25 + i * 0.07}s infinite`,
                      ].join(', '),
                    }}
                  />
                ))}
              </g>
            );
          })}

          {/* Scan line */}
          {isScanning && (
            <>
              <rect
                x="0" y="0" width="176" height="18"
                fill="var(--lp-accent)" opacity="0.09"
                style={{ animation: 'scan-glow 1.2s ease-in-out forwards' }}
              />
              <rect
                x="0" y="0" width="176" height="3" rx="1"
                fill="var(--lp-accent)" opacity="0.85"
                style={{ animation: 'scan-sweep 1.2s ease-in-out forwards' }}
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Cập nhật ScanningScreen**

Thay thế toàn bộ `ScanningScreen` (line ~385):

```typescript
export function ScanningScreen({ zoneSeverity }: { zoneSeverity: Partial<Record<Zone, Severity>> }) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Đang phân tích da của bạn...</p>
        <p className="text-sm text-cta/50 mt-1">Chỉ mất vài giây</p>
      </div>
      <FaceDiagram zoneSeverity={zoneSeverity} onZoneTap={() => {}} isScanning={true} />
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-cta/40"
            style={{ animation: `acne-pulse 0.9s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Cập nhật Step1 để dùng API mới**

`Step1` vẫn giữ external API cũ (`selectedZones`, `onToggle`) nhưng bên trong bridge sang API mới của `FaceDiagram`:

```typescript
export function Step1({
  selectedZones, onToggle, onNext, isScanning, onBack,
  heading, subtext,
}: {
  selectedZones: Zone[]; onToggle: (z: Zone) => void; onNext: () => void; isScanning: boolean;
  onBack?: () => void;
  heading?: string; subtext?: string;
}) {
  const h = heading || 'Bạn hay bị mụn ở đâu?';
  const s = subtext  || 'Chạm vào vùng da bạn hay có mụn nhất';

  // Bridge: selectedZones → zoneSeverity (all selected zones = 'nhieu')
  const zoneSeverity: Partial<Record<Zone, Severity>> = Object.fromEntries(
    selectedZones.map(z => [z, 'nhieu' as Severity])
  );

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3 md:gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">{h}</p>
      </div>
      {selectedZones.length === 0 && (
        <div className="flex flex-col items-center gap-1 -mb-2" aria-hidden="true">
          <style>{`@keyframes arrow-bounce{0%,100%{transform:translateY(0);opacity:.45}50%{transform:translateY(7px);opacity:.85}}`}</style>
          <p className="text-xs text-cta/45 font-semibold">{s}</p>
          <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-cta/50" style={{ animation: 'arrow-bounce 1.3s ease-in-out infinite' }}>
            <path d="M9 2 L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 15 L9 23 L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <FaceDiagram
        zoneSeverity={zoneSeverity}
        onZoneTap={(z) => !isScanning && onToggle(z)}
        isScanning={isScanning}
      />
      <SelectedZoneTags selectedZones={selectedZones} />
      <div className="flex gap-2 w-full">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isScanning}
            className="px-5 py-3.5 rounded-soft border-2 border-cta/20 text-cta/60 text-sm font-semibold disabled:opacity-40"
          >
            &#8592; Quay lại
          </button>
        )}
        <button
          onClick={onNext}
          className="flex-1 bg-cta text-white font-bold py-3.5 rounded-soft text-sm hover:opacity-90 transition-opacity"
        >
          Tiếp theo &#8594;
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: 0 TypeScript errors. Nếu có lỗi về `selectedZones` ở desktop layout trong `FaceMapMinigame` → đó là 2 callsite sẽ bị xóa ở Task 6, tạm thời sửa thành `zoneSeverity={{}}` để pass build.

- [ ] **Step 5: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): update FaceDiagram to zoneSeverity+onZoneTap, update ScanningScreen+Step1"
```

---

### Task 3: BubbleSeverityPicker component

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx` — thêm component mới sau `SVG_KEYFRAMES` const (sau line ~147)

- [ ] **Step 1: Thêm BUBBLE_KEYFRAMES và ARC_CONFIG**

Thêm ngay sau block `const SVG_KEYFRAMES = ...`:

```typescript
const BUBBLE_KEYFRAMES = `
  @keyframes bubArc {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0) translateY(10px); }
    55%  { opacity: 1; transform: translate(-50%, -50%) scale(1.08) translateY(-4px); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1)    translateY(0); }
  }
  @keyframes bubSelect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    40%  { transform: translate(-50%, -50%) scale(1.35); }
    70%  { transform: translate(-50%, -50%) scale(0.88); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
`;

const ARC_CONFIG = [
  { severity: 'khong' as Severity, label: 'Không\nbị',   angleDeg: 225, bg: 'rgba(50,60,80,0.90)',   border: '#64748b', color: '#cbd5e1' },
  { severity: 'it'    as Severity, label: 'Ít\nmụn',     angleDeg: 315, bg: 'rgba(155,68,5,0.90)',   border: '#ea8c2a', color: '#fef3c7' },
  { severity: 'nhieu' as Severity, label: 'Nhiều\nmụn',  angleDeg:  30, bg: 'rgba(180,25,25,0.90)',  border: '#f87171', color: '#ffe4e4' },
] as const;

const BUBBLE_R = 60;

function calcBubblePos(cx: number, cy: number, angleDeg: number) {
  const rad = angleDeg * Math.PI / 180;
  return {
    left: Math.max(37, Math.min(window.innerWidth  - 37, cx + BUBBLE_R * Math.sin(rad))),
    top:  Math.max(37, Math.min(window.innerHeight - 37, cy - BUBBLE_R * Math.cos(rad))),
  };
}
```

- [ ] **Step 2: Viết BubbleSeverityPicker component**

Thêm component này ngay sau `calcBubblePos`:

```typescript
function BubbleSeverityPicker({
  cx,
  cy,
  onSelect,
  onClose,
}: {
  cx: number;
  cy: number;
  onSelect: (s: Severity) => void;
  onClose: () => void;
}) {
  const [selecting, setSelecting] = useState<Severity | null>(null);

  function pick(s: Severity) {
    setSelecting(s);
    setTimeout(() => { onSelect(s); }, 280);
  }

  return (
    <>
      <style>{BUBBLE_KEYFRAMES}</style>
      {/* Backdrop — tap outside to close */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(160,205,230,0.18)' }}
        onClick={onClose}
      />
      {/* 3 arc-positioned bubbles */}
      {ARC_CONFIG.map((cfg, i) => {
        const pos = calcBubblePos(cx, cy, cfg.angleDeg);
        const isSelecting = selecting === cfg.severity;
        return (
          <button
            key={cfg.severity}
            className="fixed z-50 flex items-center justify-center rounded-full text-center"
            onClick={(e) => { e.stopPropagation(); pick(cfg.severity); }}
            aria-label={cfg.label.replace('\n', ' ')}
            style={{
              width: 54, height: 54,
              left: pos.left, top: pos.top,
              background: cfg.bg,
              border: `2.5px solid ${cfg.border}`,
              color: cfg.color,
              fontSize: 11, fontWeight: 800, lineHeight: 1.25,
              boxShadow: '0 5px 20px rgba(0,0,0,0.30)',
              whiteSpace: 'pre-line',
              animation: isSelecting
                ? 'bubSelect 0.22s ease both'
                : `bubArc 0.32s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.09}s both`,
            }}
          >
            {cfg.label}
          </button>
        );
      })}
    </>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): add BubbleSeverityPicker arc overlay component"
```

---

### Task 4: StepProgress update + ConditionSelectStep

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx` — `StepProgress` (line ~278) và thêm `ConditionSelectStep`

- [ ] **Step 1: Cập nhật StepProgress**

Thay thế hàm `StepProgress`:

```typescript
export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full max-w-sm mb-5 flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-cta/10 overflow-hidden">
        <div
          className="h-full bg-cta/50 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-cta/40 font-semibold shrink-0">{current} / {total}</span>
    </div>
  );
}
```

- [ ] **Step 2: Viết ConditionSelectStep**

Thêm component này sau `AcneCard` (sau line ~381):

```typescript
function ConditionSelectStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: AcneType[];
  onToggle: (t: AcneType) => void;
  onNext: (types: AcneType[]) => void;
}) {
  const anySelected = selected.length > 0;

  function handleSelect(t: AcneType) {
    if (t === 'none') {
      // "Da ổn" → skip wizard entirely
      onNext(['none']);
      return;
    }
    onToggle(t);
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Da bạn đang gặp tình trạng nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn tất cả những gì bạn đang có</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {ACNE_TYPES.map(t => (
          <AcneCard
            key={t.id}
            type={t}
            selected={selected.includes(t.id)}
            onSelect={() => handleSelect(t.id)}
          />
        ))}
      </div>
      <button
        onClick={() => onNext(selected)}
        disabled={!anySelected}
        className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        Tiếp theo &rarr;
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Fix tất cả callsite của StepProgress cũ**

Tìm trong file tất cả chỗ gọi `<StepProgress step={...}` và sửa. Nếu vẫn còn trong code cũ của `FaceMapMinigame`, để tạm `<StepProgress current={1} total={2}` — sẽ được thay đúng ở Task 6.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: 0 errors. Nếu có lỗi `step` prop → đã fix ở step trên.

- [ ] **Step 5: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): update StepProgress, add ConditionSelectStep"
```

---

### Task 5: ConditionFaceMapStep

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx` — thêm component sau `ScanningScreen`

- [ ] **Step 1: Viết ConditionFaceMapStep**

Thêm ngay sau hàm `ScanningScreen`:

```typescript
function ConditionFaceMapStep({
  acneType,
  assessment,
  currentStep,
  totalSteps,
  onZoneTap,
  onNext,
  onBack,
  isLast,
}: {
  acneType: AcneType;
  assessment: ConditionAssessment;
  currentStep: number;
  totalSteps: number;
  onZoneTap: (zone: Zone, cx: number, cy: number) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}) {
  const typeInfo = ACNE_TYPES.find(t => t.id === acneType)!;
  const severityEntries = (Object.entries(assessment.zones) as [Zone, Severity][])
    .filter(([, s]) => s !== 'khong');
  const hasAnyZone = severityEntries.length > 0;

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3 animate-fade-in-up">
      <div className="text-center">
        <p className="text-xs text-cta/40 font-semibold mb-1">
          Tình trạng {currentStep} / {totalSteps}
        </p>
        <p className="font-extrabold text-xl text-cta">
          {typeInfo.label} xuất hiện ở đâu?
        </p>
        <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da để chọn mức độ</p>
      </div>
      <FaceDiagram
        zoneSeverity={assessment.zones}
        onZoneTap={onZoneTap}
        isScanning={false}
      />
      {/* Severity summary tags */}
      <div className="min-h-7 flex flex-wrap gap-1.5 justify-center">
        {hasAnyZone
          ? severityEntries.map(([z, s]) => (
              <span
                key={z}
                className="text-xs rounded-full px-2.5 py-1 font-semibold"
                style={{
                  background: s === 'nhieu' ? '#EF444420' : '#F9731620',
                  color: s === 'nhieu' ? '#EF4444' : '#F97316',
                }}
              >
                {ZONE_LABELS[z]} &mdash; {s === 'nhieu' ? 'nhiều' : 'ít'}
              </span>
            ))
          : <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da để chọn mức độ</p>
        }
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-soft border-2 border-cta/20 text-cta/60 text-sm font-semibold"
        >
          &#8592; Quay lại
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-cta text-white font-bold py-3.5 rounded-soft text-sm hover:opacity-90 transition-opacity"
        >
          {isLast ? 'Xem kết quả' : 'Tiếp theo →'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): add ConditionFaceMapStep component"
```

---

### Task 6: FaceMapMinigame orchestrator refactor

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx` — hàm `FaceMapMinigame` (line ~516 đến cuối file)

**Context quan trọng:**
- `wizardStep === 0` → `ConditionSelectStep`
- `wizardStep === 1..N` → `ConditionFaceMapStep` cho condition ở index `wizardStep - 1`
- `isScanning === true` → `ScanningScreen`
- `activeBubble !== null` → render `BubbleSeverityPicker` overlaid on top
- Desktop: cùng flow với mobile (không split-column nữa — wizard cần focus từng bước)
- Xóa `Step2` (không dùng nữa, không export)
- `ScanningScreen` cũ nhận `selectedZones` — đã đổi sang `zoneSeverity` ở Task 2

- [ ] **Step 1: Thay thế toàn bộ phần từ function Step2 đến cuối file**

Xóa từ `function Step2` (line ~477) đến cuối file (line 666). Thay bằng:

```typescript
// ─── Main export ──────────────────────────────────────────────────────────────

export function FaceMapMinigame({ onComplete, copy }: MinigameSlotProps) {
  const hasIntro = !!(copy?.intro?.heading);
  const [showIntro, setShowIntro]               = useState(hasIntro);
  const [pendingTypes, setPendingTypes]          = useState<AcneType[]>([]);
  const [selectedAcneTypes, setSelectedAcneTypes] = useState<AcneType[]>([]);
  const [assessments, setAssessments]            = useState<ConditionAssessment[]>([]);
  const [wizardStep, setWizardStep]              = useState(0);
  const [activeBubble, setActiveBubble]          = useState<{ zone: Zone; cx: number; cy: number } | null>(null);
  const [isScanning, setIsScanning]              = useState(false);

  function handleConditionsSelected(types: AcneType[]) {
    if (types.includes('none') || types.length === 0) {
      triggerSubmit([]);
      return;
    }
    const ordered = types.filter(t => t !== 'none');
    setSelectedAcneTypes(ordered);
    setAssessments(ordered.map(t => ({ acneType: t, zones: {} })));
    setWizardStep(1);
  }

  function handleZoneTap(zone: Zone, cx: number, cy: number) {
    setActiveBubble({ zone, cx, cy });
  }

  function handleSeveritySelect(severity: Severity) {
    if (!activeBubble) return;
    const idx = wizardStep - 1;
    setAssessments(prev => prev.map((a, i) =>
      i !== idx ? a : { ...a, zones: { ...a.zones, [activeBubble.zone]: severity } }
    ));
    setActiveBubble(null);
  }

  function handleWizardNext() {
    setActiveBubble(null);
    if (wizardStep < selectedAcneTypes.length) {
      setWizardStep(wizardStep + 1);
    } else {
      triggerSubmit(assessments);
    }
  }

  function handleWizardBack() {
    setActiveBubble(null);
    if (wizardStep <= 1) {
      setWizardStep(0);
      setAssessments([]);
    } else {
      setWizardStep(wizardStep - 1);
    }
  }

  function triggerSubmit(finalAssessments: ConditionAssessment[]) {
    if (isScanning) return;
    const conditionIds = assessToConditions(finalAssessments);
    const resolved = conditionIds
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0
      ? resolved
      : [skinConditions['da-moi-bat-dau']].filter((c): c is NonNullable<typeof c> => c != null);
    const condition = conditions[0];
    if (!condition) return;

    const allPairs = finalAssessments.flatMap(
      a => (Object.entries(a.zones) as [Zone, Severity][])
    );
    const activeZones = [...new Set(
      allPairs.filter(([, s]) => s !== 'khong').map(([z]) => z)
    )];
    const zoneLabel = activeZones.map(z => ZONE_LABELS[z]).join(', ');
    const triggerNote = finalAssessments
      .filter(a => _totalScore(a) > 0)
      .map(a => ACNE_TYPES.find(t => t.id === a.acneType)?.label)
      .filter(Boolean)
      .join(', ');

    setIsScanning(true);
    setTimeout(() => {
      onComplete({ conditions, condition, zoneLabel, zoneIds: activeZones, triggerNote });
    }, 1150);
  }

  if (showIntro && copy?.intro) {
    return (
      <IntroScreen
        heading={copy.intro.heading!}
        subtext={copy.intro.subtext}
        cta={copy.intro.cta || 'Bắt đầu'}
        onStart={() => setShowIntro(false)}
      />
    );
  }

  const totalWizardSteps = selectedAcneTypes.length;

  function renderContent() {
    if (isScanning) {
      return <ScanningScreen zoneSeverity={_getCombinedZoneSeverity(assessments)} />;
    }
    if (wizardStep === 0) {
      return (
        <ConditionSelectStep
          selected={pendingTypes}
          onToggle={(t) => setPendingTypes(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
          )}
          onNext={handleConditionsSelected}
        />
      );
    }
    const idx = wizardStep - 1;
    return (
      <ConditionFaceMapStep
        acneType={selectedAcneTypes[idx]}
        assessment={assessments[idx]}
        currentStep={wizardStep}
        totalSteps={totalWizardSteps}
        onZoneTap={handleZoneTap}
        onNext={handleWizardNext}
        onBack={handleWizardBack}
        isLast={wizardStep === totalWizardSteps}
      />
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
      <div className="w-full flex flex-col items-center gap-4">
        {!isScanning && wizardStep > 0 && (
          <StepProgress current={wizardStep} total={totalWizardSteps} />
        )}
        {renderContent()}
      </div>

      {/* Bubble severity picker — rendered at root level for z-index */}
      {activeBubble && (
        <BubbleSeverityPicker
          cx={activeBubble.cx}
          cy={activeBubble.cy}
          onSelect={handleSeveritySelect}
          onClose={() => setActiveBubble(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 0 TypeScript errors. Checklist nếu có lỗi:
- `_totalScore` not found → Task 1 chưa được thêm đúng vị trí
- `assessToConditions` not found → Task 1 chưa done
- `BubbleSeverityPicker` not found → Task 3 chưa done
- `ConditionSelectStep` not found → Task 4 chưa done
- `ConditionFaceMapStep` not found → Task 5 chưa done
- `ScanningScreen` prop mismatch → Task 2 Step 2 chưa done
- `StepProgress` prop `step` → Task 4 Step 1 chưa done

- [ ] **Step 3: Manual browser test**

Khởi động dev server:
```bash
npm run dev
```

Mở trình duyệt → navigate đến landing page chứa face-map minigame.

Checklist thủ công:
- [ ] Bước 0 (ConditionSelectStep): hiện 6 card, multi-select hoạt động; click "Da ổn, ít mụn" → thẳng scanning; click 2+ card → nút Tiếp theo enable
- [ ] Bước 1/N: header đúng tên condition, progress "1 / 2" hiện đúng
- [ ] Tap zone → bubble arc xuất hiện đúng tại vị trí zone (3 bubble theo arc)
- [ ] Chọn severity → zone đổi màu (đỏ / cam), bubble đóng
- [ ] Tags phía dưới face hiện zone + severity ("vùng trán — nhiều")
- [ ] Nút Quay lại ở Bước 1 → về Bước 0 (với selections cũ)
- [ ] Nút Tiếp theo ở bước cuối → scanning animation → conversion screen
- [ ] Overlay backdrop (nhấn ngoài bubble) → bubble đóng

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): refactor FaceMapMinigame orchestrator to multi-condition + severity wizard"
```

---

### Task 7: Final integration check + cleanup

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx` nếu cần fix

- [ ] **Step 1: Kiểm tra external imports**

```bash
grep -r "from.*face-map" src/ --include="*.tsx" --include="*.ts"
```

Kiểm tra từng file import: nếu có import `ScanningScreen` hoặc `StepProgress` → cập nhật props theo API mới (`zoneSeverity` / `current+total`).

- [ ] **Step 2: Kiểm tra không còn hardcode `step={1}` hoặc `step={2}`**

```bash
grep -n "step={[12]}" src/landing/variants/minigame/face-map.tsx
```

Expected: không có kết quả.

- [ ] **Step 3: Final build + type check**

```bash
npm run build
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Final commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): multi-condition severity wizard complete"
```

---

## Tóm tắt thứ tự thực hiện

1. Task 1 → types + assessToConditions (foundation)
2. Task 2 → FaceDiagram API (breaking change, update tất cả callsite)
3. Task 3 → BubbleSeverityPicker (new overlay component)
4. Task 4 → StepProgress + ConditionSelectStep
5. Task 5 → ConditionFaceMapStep
6. Task 6 → FaceMapMinigame orchestrator (wire everything)
7. Task 7 → cleanup + final check

Mỗi task kết thúc bằng `npm run build` pass và 1 commit.
