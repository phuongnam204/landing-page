# Face-Map Two-Layer Bubble Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-layer severity bubble and per-condition wizard with a two-layer bubble picker (L1 = condition multi-select, L2 = severity), add real images to soft-swipe wipe cards, add a multi-condition heading variant, and increase the instruction font size.

**Architecture:** All bubble components live in `face-map.tsx`; soft-swipe.tsx imports them. The new `ZoneMap` type is the single source of truth for zone data; `zoneMapToAssessments()` converts it to the existing `ConditionAssessment[]` format that `assessToConditions()` already understands. `BubbleTwoLayerPicker` orchestrates L1 → L2, skipping L1 when only one condition is available. `FaceMapMinigame` drops its per-condition wizard loop and uses a single face-map screen; `ElectricSoftSwipeMinigame` does the same.

**Tech Stack:** React, TypeScript, Tailwind CSS vars, imperative CSS keyframe animations (same patterns as existing `bubArc` / `bubSelect`)

---

## File Map

| File | Change |
|------|--------|
| `src/landing/variants/minigame/face-map.tsx` | Types, zoneMapToAssessments, updated BubbleSeverityPicker, new BubbleConditionPicker, new BubbleTwoLayerPicker, refactored FaceMapMinigame |
| `src/landing/variants/minigame/electric/soft-swipe.tsx` | Wizard refactor (single face-map + BubbleTwoLayerPicker), SwipeCard image field, CARDS images |

---

## Task 1 — New Types + `zoneMapToAssessments` (face-map.tsx)

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx`

### Background

`Severity` currently is `'nhieu' | 'it' | 'khong'`. We add `'vua'` (vừa phải) and keep `'khong'` in the type union for backward compatibility; however the new UI never produces `'khong'` — zones simply aren't added to the map if the user skips them.

`ZoneMap` stores the single face-map result: per zone, which conditions are present and at what severity. `zoneMapToAssessments()` fans this out into the `ConditionAssessment[]` format that the existing `assessToConditions()` already consumes.

`ConditionOption` is a minimal descriptor used by `BubbleConditionPicker` so it stays decoupled from both `AcneType` and `SwipeCard`.

- [ ] **Step 1: Add `'vua'` to Severity, update SEVERITY_WEIGHT and _getCombinedZoneSeverity**

Find the existing Severity type at line ~10 and the SEVERITY_WEIGHT constant, and replace:

```typescript
// BEFORE
export type Severity = 'nhieu' | 'it' | 'khong';
const SEVERITY_WEIGHT: Record<Severity, number> = { nhieu: 2, it: 1, khong: 0 };
```

```typescript
// AFTER
export type Severity = 'nhieu' | 'vua' | 'it' | 'khong';
const SEVERITY_WEIGHT: Record<Severity, number> = { nhieu: 2, vua: 1, it: 0.5, khong: 0 };
```

Then find `_getCombinedZoneSeverity` (~line 24) and update the logic to handle `'vua'` between `'it'` and `'nhieu'`:

```typescript
// BEFORE
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

```typescript
// AFTER
const SEV_RANK: Record<Severity, number> = { nhieu: 3, vua: 2, it: 1, khong: 0 };

function _getCombinedZoneSeverity(
  assessments: ConditionAssessment[]
): Partial<Record<Zone, Severity>> {
  const result: Partial<Record<Zone, Severity>> = {};
  for (const { zones } of assessments) {
    for (const [zone, sev] of Object.entries(zones) as [Zone, Severity][]) {
      const existing = result[zone];
      if (!existing || SEV_RANK[sev] > SEV_RANK[existing]) {
        result[zone] = sev;
      }
    }
  }
  return result;
}
```

- [ ] **Step 2: Add `ZoneMap`, `ConditionOption`, and `zoneMapToAssessments`**

Insert these exports after the `ZONE_LABELS` block (~line 43):

```typescript
export type ZoneMap = Partial<Record<Zone, {
  conditions: string[];  // AcneType in face-map, card ID in soft-swipe
  severity: Severity;
}>>;

export interface ConditionOption {
  id: string;
  label: string;
  image?: string;
  color: string;
}

export function zoneMapToAssessments(
  zoneMap: ZoneMap,
  idToAcneType: (id: string) => AcneType = id => id as AcneType
): ConditionAssessment[] {
  const byType = new Map<AcneType, Partial<Record<Zone, Severity>>>();
  for (const [zone, data] of Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]) {
    for (const condId of data.conditions) {
      const acneType = idToAcneType(condId);
      if (!byType.has(acneType)) byType.set(acneType, {});
      byType.get(acneType)![zone] = data.severity;
    }
  }
  return Array.from(byType.entries()).map(([acneType, zones]) => ({ acneType, zones }));
}
```

- [ ] **Step 3: TypeScript compile check**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors in face-map.tsx related to these new types. (Other pre-existing errors in unrelated files are acceptable.)

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): add ZoneMap type, ConditionOption, zoneMapToAssessments, vua severity"
```

---

## Task 2 — Update `BubbleSeverityPicker` (face-map.tsx)

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx`

### Background

Replace `'khong'` severity option with `'vua'` (vừa phải). The arc angles stay the same (225°, 315°, 30°) — only the labels and colors change. No signature change to `BubbleSeverityPicker` itself.

- [ ] **Step 1: Update `ARC_CONFIG`**

Find `ARC_CONFIG` (~line 227) and replace the full constant:

```typescript
// BEFORE
const ARC_CONFIG = [
  { severity: 'khong' as Severity, label: 'Không\nbị',   angleDeg: 225, bg: 'rgba(50,60,80,0.90)',   border: '#64748b', color: '#cbd5e1' },
  { severity: 'it'    as Severity, label: 'Ít\nmụn',     angleDeg: 315, bg: 'rgba(155,68,5,0.90)',   border: '#ea8c2a', color: '#fef3c7' },
  { severity: 'nhieu' as Severity, label: 'Nhiều\nmụn',  angleDeg:  30, bg: 'rgba(180,25,25,0.90)',  border: '#f87171', color: '#ffe4e4' },
] as const;
```

```typescript
// AFTER
const ARC_CONFIG = [
  { severity: 'it'    as Severity, label: 'Ít\nmụn',     angleDeg: 225, bg: 'rgba(155,68,5,0.90)',   border: '#ea8c2a', color: '#fef3c7' },
  { severity: 'vua'   as Severity, label: 'Vừa\nphải',   angleDeg: 315, bg: 'rgba(155,100,5,0.85)',  border: '#f59e0b', color: '#fef9c3' },
  { severity: 'nhieu' as Severity, label: 'Nhiều\nmụn',  angleDeg:  30, bg: 'rgba(180,25,25,0.90)',  border: '#f87171', color: '#ffe4e4' },
] as const;
```

- [ ] **Step 2: Add new keyframes to `BUBBLE_KEYFRAMES`**

Find `BUBBLE_KEYFRAMES` constant (~line 210) and append the new keyframes inside the template literal (before the closing backtick):

```typescript
// Add inside BUBBLE_KEYFRAMES string, after existing keyframes:
`
  @keyframes bubCondSelect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    30%  { transform: translate(-50%, -50%) scale(1.4) rotate(-6deg); }
    65%  { transform: translate(-50%, -50%) scale(0.85) rotate(4deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes bubCondDeselect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    50%  { transform: translate(-50%, -50%) scale(0.82) rotate(-4deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes bubConfirmIn {
    from { transform: translateX(-50%) scale(0.7) translateY(8px); opacity: 0; }
    to   { transform: translateX(-50%) scale(1) translateY(0px); opacity: 1; }
  }
`
```

The full `BUBBLE_KEYFRAMES` const should now look like:

```typescript
const BUBBLE_KEYFRAMES = `
  @keyframes bubArc {
    from { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
    to   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  @keyframes bubSelect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    40%  { transform: translate(-50%, -50%) scale(1.35); }
    70%  { transform: translate(-50%, -50%) scale(0.88); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes bubCondSelect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    30%  { transform: translate(-50%, -50%) scale(1.4) rotate(-6deg); }
    65%  { transform: translate(-50%, -50%) scale(0.85) rotate(4deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes bubCondDeselect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    50%  { transform: translate(-50%, -50%) scale(0.82) rotate(-4deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes bubConfirmIn {
    from { transform: translateX(-50%) scale(0.7) translateY(8px); opacity: 0; }
    to   { transform: translateX(-50%) scale(1) translateY(0px); opacity: 1; }
  }
`;
```

- [ ] **Step 3: TypeScript compile check**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): replace khong with vua in BubbleSeverityPicker, add condition bubble keyframes"
```

---

## Task 3 — Implement `BubbleConditionPicker` (face-map.tsx)

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx`

### Background

`BubbleConditionPicker` shows arc-positioned circular bubbles — one per condition — with a photo image inside and allows multiple selection. A confirm CTA button slides in when at least one condition is selected. The confirm button calls `onConfirm(selectedIds)` to advance to Layer 2.

All positions use the same `calcBubblePos(cx, cy, angleDeg)` helper. The `COND_BUBBLE_R = 72` constant gives slightly more spacing than severity bubbles.

**Arc angle algorithm:** Spread N conditions evenly over a 150° arc centered at 280°. This places bubbles in the lower-left to lower-right quadrant around the tap point, which works for all face zones.

- [ ] **Step 1: Add `BubbleConditionPicker` component**

Insert this entire component immediately before the `BubbleSeverityPicker` function declaration (~line 243 in the original, now shifted by earlier additions):

```typescript
// ─── BubbleConditionPicker (Layer 1) ─────────────────────────────────────────

const COND_BUBBLE_R = 72;
const COND_IMG_SIZE = 52;

function conditionArcAngles(n: number): number[] {
  if (n === 0) return [];
  if (n === 1) return [280];
  const SPAN = Math.min((n - 1) * 38, 150); // ~38° per step, cap at 150°
  const half = SPAN / 2;
  return Array.from({ length: n }, (_, i) =>
    280 - half + (n === 1 ? 0 : (i / (n - 1)) * SPAN)
  );
}

export function BubbleConditionPicker({
  cx,
  cy,
  conditions,
  onConfirm,
  onClose,
}: {
  cx: number;
  cy: number;
  conditions: ConditionOption[];
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [justToggled, setJustToggled] = useState<string | null>(null);

  const angles = conditionArcAngles(conditions.length);

  function toggle(id: string) {
    setJustToggled(id);
    setTimeout(() => setJustToggled(null), 320);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const canConfirm = selected.size > 0;

  return (
    <>
      <style>{BUBBLE_KEYFRAMES}</style>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(160,205,230,0.18)' }} onClick={onClose} />

      {/* Condition bubbles */}
      {conditions.map((cond, i) => {
        const pos = calcBubblePos(cx, cy, angles[i] ?? 280);
        const isSel = selected.has(cond.id);
        const isToggling = justToggled === cond.id;
        return (
          <button
            key={cond.id}
            className="fixed z-50 flex flex-col items-center gap-1"
            onClick={(e) => { e.stopPropagation(); toggle(cond.id); }}
            aria-label={cond.label}
            aria-pressed={isSel}
            style={{
              left: pos.left, top: pos.top,
              transform: 'translate(-50%, -50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              animation: isToggling
                ? (isSel ? 'bubCondDeselect 0.30s ease both' : 'bubCondSelect 0.30s ease both')
                : `bubArc 0.32s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both`,
            }}
          >
            {/* Circle image */}
            <div style={{
              width: COND_IMG_SIZE, height: COND_IMG_SIZE, borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0,
              border: isSel ? `3px solid ${cond.color}` : '2.5px dashed rgba(255,255,255,0.45)',
              boxShadow: isSel
                ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px ${cond.color}`
                : '0 3px 12px rgba(0,0,0,0.28)',
              transition: 'border 0.18s ease, box-shadow 0.18s ease',
            }}>
              {cond.image ? (
                <img
                  src={cond.image}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: cond.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} />
              )}
            </div>
            {/* Label */}
            <span style={{
              fontSize: 10, fontWeight: 700, lineHeight: 1.2, textAlign: 'center',
              color: isSel ? cond.color : 'rgba(255,255,255,0.85)',
              textShadow: '0 1px 4px rgba(0,0,0,0.55)',
              maxWidth: 64,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {cond.label}
            </span>
          </button>
        );
      })}

      {/* Confirm CTA — anchored below arc center */}
      <button
        className="fixed z-50"
        onClick={(e) => { e.stopPropagation(); if (canConfirm) onConfirm(Array.from(selected)); }}
        style={{
          left: cx, top: cy + COND_BUBBLE_R + 36,
          transform: 'translateX(-50%)',
          padding: '10px 22px', borderRadius: 999,
          fontWeight: 700, fontSize: 13,
          color: 'white',
          background: canConfirm ? 'var(--lp-accent)' : 'rgba(100,116,139,0.70)',
          border: 'none', cursor: canConfirm ? 'pointer' : 'not-allowed',
          boxShadow: canConfirm ? '0 4px 16px color-mix(in srgb, var(--lp-accent) 35%, transparent)' : 'none',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
          animation: 'bubConfirmIn 0.28s cubic-bezier(0.34,1.56,0.64,1) 0.18s both',
          whiteSpace: 'nowrap',
        }}
      >
        {canConfirm ? `Xác nhận (${selected.size})` : 'Chọn ít nhất 1'}
      </button>
    </>
  );
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no new errors in face-map.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): add BubbleConditionPicker (layer 1, multi-select, arc, animated confirm)"
```

---

## Task 4 — Implement `BubbleTwoLayerPicker` (face-map.tsx)

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx`

### Background

`BubbleTwoLayerPicker` orchestrates the two-layer flow:
1. If `conditions.length <= 1` → skip Layer 1, auto-select all conditions, render Layer 2 immediately.
2. If `conditions.length > 1` → render `BubbleConditionPicker` (Layer 1). When user confirms → switch to Layer 2.
3. Layer 2 → render `BubbleSeverityPicker`. When user selects severity → call `onComplete(conditionIds, severity)`.

The transition from L1 to L2 unmounts L1 and mounts L2 with the existing `bubArc` entrance animation, providing a natural stagger.

- [ ] **Step 1: Add `BubbleTwoLayerPicker` component**

Insert this component immediately after `BubbleConditionPicker` and before `BubbleSeverityPicker`:

```typescript
// ─── BubbleTwoLayerPicker (Layer 1 → Layer 2 orchestrator) ───────────────────

export function BubbleTwoLayerPicker({
  cx,
  cy,
  conditions,
  onComplete,
  onClose,
}: {
  cx: number;
  cy: number;
  conditions: ConditionOption[];
  onComplete: (conditionIds: string[], severity: Severity) => void;
  onClose: () => void;
}) {
  const singleCondition = conditions.length <= 1;
  const [layer, setLayer] = useState<1 | 2>(singleCondition ? 2 : 1);
  const [confirmedIds, setConfirmedIds] = useState<string[]>(
    singleCondition ? conditions.map(c => c.id) : []
  );

  function handleConditionsConfirmed(ids: string[]) {
    setConfirmedIds(ids);
    setLayer(2);
  }

  function handleSeveritySelected(severity: Severity) {
    onComplete(confirmedIds, severity);
  }

  if (layer === 1) {
    return (
      <BubbleConditionPicker
        cx={cx}
        cy={cy}
        conditions={conditions}
        onConfirm={handleConditionsConfirmed}
        onClose={onClose}
      />
    );
  }

  return (
    <BubbleSeverityPicker
      cx={cx}
      cy={cy}
      onSelect={handleSeveritySelected}
      onClose={onClose}
    />
  );
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): add BubbleTwoLayerPicker (L1→L2 orchestrator, skip L1 for single condition)"
```

---

## Task 5 — Refactor `FaceMapMinigame` (face-map.tsx)

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx`

### Background

Replace the per-condition wizard loop with a single face-map screen. Key changes:
1. State: swap `assessments: ConditionAssessment[]` + per-condition `wizardStep` for a single `zoneMap: ZoneMap`.
2. `activeBubble` gains a `conditions: ConditionOption[]` field (the conditions available to Layer 1).
3. `handleZoneTap` builds the `ConditionOption[]` from `selectedAcneTypes` using `ACNE_TYPES` + `CONDITION_IMAGES`.
4. A new `handleTwoLayerComplete` replaces `handleSeveritySelect`.
5. `triggerSubmit` is called with `zoneMapToAssessments(zoneMap)` instead of the old `assessments`.
6. `renderContent()` loses the `ConditionFaceMapStep` branch; `wizardStep > 0` → single face-map.
7. Multi-condition heading: if `selectedAcneTypes.length > 1`, show "Ô da bạn có nhiều tuýp ghé thắm đấy! Cùng tìm kiếm nhé!".
8. Font size: instruction text "Chạm vào vùng da để chọn mức độ" → `text-base` (was `text-sm`).
9. `BubbleSeverityPicker` render → `BubbleTwoLayerPicker`.

Note: `StepProgress` is removed from the new single-step face-map screen (no more per-condition step tracking needed).

- [ ] **Step 1: Update FaceMapMinigame state**

Find the state declarations block (~lines 1143–1149) and replace:

```typescript
// BEFORE
const [pendingTypes, setPendingTypes]          = useState<AcneType[]>([]);
const [selectedAcneTypes, setSelectedAcneTypes] = useState<AcneType[]>([]);
const [assessments, setAssessments]            = useState<ConditionAssessment[]>([]);
const [wizardStep, setWizardStep]              = useState(0);
const [activeBubble, setActiveBubble]          = useState<{ zone: Zone; cx: number; cy: number } | null>(null);
const [isScanning, setIsScanning]              = useState(false);
```

```typescript
// AFTER
const [pendingTypes, setPendingTypes]           = useState<AcneType[]>([]);
const [selectedAcneTypes, setSelectedAcneTypes] = useState<AcneType[]>([]);
const [wizardStep, setWizardStep]               = useState(0); // 0=condition select, 1=face-map
const [zoneMap, setZoneMap]                     = useState<ZoneMap>({});
const [activeBubble, setActiveBubble]           = useState<{
  zone: Zone; cx: number; cy: number; conditions: ConditionOption[];
} | null>(null);
const [isScanning, setIsScanning]               = useState(false);
```

- [ ] **Step 2: Update `handleConditionsSelected`**

Find `handleConditionsSelected` (~line 1151) and replace:

```typescript
// BEFORE
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
```

```typescript
// AFTER
function handleConditionsSelected(types: AcneType[]) {
  if (types.includes('none') || types.length === 0) {
    triggerSubmit(zoneMapToAssessments({}));
    return;
  }
  const ordered = types.filter(t => t !== 'none');
  setSelectedAcneTypes(ordered);
  setZoneMap({});
  setWizardStep(1);
}
```

- [ ] **Step 3: Update `handleZoneTap`**

Find `handleZoneTap` (~line 1162) and replace:

```typescript
// BEFORE
function handleZoneTap(zone: Zone, cx: number, cy: number) {
  setActiveBubble({ zone, cx, cy });
}
```

```typescript
// AFTER
function handleZoneTap(zone: Zone, cx: number, cy: number) {
  const conditionOptions: ConditionOption[] = selectedAcneTypes.map(t => {
    const def = ACNE_TYPES.find(a => a.id === t)!;
    return {
      id: t,
      label: def.label,
      image: CONDITION_IMAGES[t],
      color: def.color,
    };
  });
  setActiveBubble({ zone, cx, cy, conditions: conditionOptions });
}
```

- [ ] **Step 4: Replace `handleSeveritySelect` with `handleTwoLayerComplete`**

Find and delete `handleSeveritySelect` (~line 1166):

```typescript
// DELETE this function entirely:
function handleSeveritySelect(severity: Severity) {
  if (!activeBubble) return;
  const idx = wizardStep - 1;
  setAssessments(prev => prev.map((a, i) =>
    i !== idx ? a : { ...a, zones: { ...a.zones, [activeBubble.zone]: severity } }
  ));
  setActiveBubble(null);
}
```

Add this new handler in its place:

```typescript
function handleTwoLayerComplete(conditionIds: string[], severity: Severity) {
  if (!activeBubble) return;
  setZoneMap(prev => ({
    ...prev,
    [activeBubble.zone]: { conditions: conditionIds, severity },
  }));
  setActiveBubble(null);
}
```

- [ ] **Step 5: Simplify `handleWizardNext` and `handleWizardBack`**

Find and replace `handleWizardNext` and `handleWizardBack`:

```typescript
// BEFORE
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
```

```typescript
// AFTER
function handleWizardNext() {
  setActiveBubble(null);
  triggerSubmit(zoneMapToAssessments(zoneMap));
}

function handleWizardBack() {
  setActiveBubble(null);
  setWizardStep(0);
  setZoneMap({});
}
```

- [ ] **Step 6: Update `triggerSubmit`**

The `triggerSubmit` signature now always receives `ConditionAssessment[]` (from `zoneMapToAssessments`). There's one internal filter that was `s !== 'khong'` — since the new ZoneMap never produces 'khong', this filter still works correctly without changes. No modification to `triggerSubmit` body is needed.

However, find the `ScanningScreen` call (~line 1240):

```typescript
// BEFORE
return <ScanningScreen zoneSeverity={_getCombinedZoneSeverity(assessments)} />;
```

```typescript
// AFTER
return <ScanningScreen zoneSeverity={_getCombinedZoneSeverity(zoneMapToAssessments(zoneMap))} />;
```

- [ ] **Step 7: Update `renderContent()` — replace ConditionFaceMapStep loop with single face-map**

Find the `renderContent()` function body (~lines 1238–1269) and replace completely:

```typescript
// BEFORE
function renderContent() {
  if (isScanning) {
    return <ScanningScreen zoneSeverity={_getCombinedZoneSeverity(assessments)} />;
  }
  if (wizardStep === 0) {
    return (
      <ConditionSelectStep
        selected={pendingTypes}
        onToggle={(t) => setPendingTypes(prev => {
          if (prev.includes(t)) return prev.filter(x => x !== t);
          if (t === 'none') return ['none'];
          return [...prev.filter(x => x !== 'none'), t];
        })}
        onNext={handleConditionsSelected}
        variant={copy?.conditionVariant}
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
```

```typescript
// AFTER
function renderContent() {
  if (isScanning) {
    return <ScanningScreen zoneSeverity={_getCombinedZoneSeverity(zoneMapToAssessments(zoneMap))} />;
  }
  if (wizardStep === 0) {
    return (
      <ConditionSelectStep
        selected={pendingTypes}
        onToggle={(t) => setPendingTypes(prev => {
          if (prev.includes(t)) return prev.filter(x => x !== t);
          if (t === 'none') return ['none'];
          return [...prev.filter(x => x !== 'none'), t];
        })}
        onNext={handleConditionsSelected}
        variant={copy?.conditionVariant}
      />
    );
  }
  // wizardStep === 1 — single face-map for all conditions
  const isMultiCondition = selectedAcneTypes.length > 1;
  const zoneSeverity: Partial<Record<Zone, Severity>> = Object.fromEntries(
    Object.entries(zoneMap).map(([z, v]) => [z, v!.severity])
  ) as Partial<Record<Zone, Severity>>;
  return (
    <div
      className="w-full flex flex-col items-center gap-3"
      style={{ animation: 'fm-fade-in 350ms ease-out both' }}
    >
      <div className="text-center px-4">
        {isMultiCondition ? (
          <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
            Da bạn có nhiều tuýp — hãy đánh dấu từng vùng!
          </h2>
        ) : (
          <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
            {ACNE_TYPES.find(a => a.id === selectedAcneTypes[0])?.label ?? ''} xuất hiện ở đâu?
          </h2>
        )}
        <p className="text-base mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          Chạm vào vùng da để chọn mức độ
        </p>
      </div>
      <FaceDiagram
        zoneSeverity={zoneSeverity}
        onZoneTap={handleZoneTap}
        isScanning={false}
      />
      {/* Zone summary chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 28 }}>
        {Object.entries(zoneMap).length > 0
          ? (Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]).map(([z, data]) => (
              <div key={z} style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: data.severity === 'nhieu' ? '#EF444420' : data.severity === 'vua' ? '#F5950B20' : '#F9731620',
                color: data.severity === 'nhieu' ? '#EF4444' : data.severity === 'vua' ? '#F5950B' : '#F97316',
                border: `1px solid ${data.severity === 'nhieu' ? '#EF444440' : data.severity === 'vua' ? '#F5950B40' : '#F9731640'}`,
              }}>
                {ZONE_LABELS[z]} — {data.severity === 'nhieu' ? 'nhiều' : data.severity === 'vua' ? 'vừa' : 'ít'}
              </div>
            ))
          : <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>
              Chạm vào vùng da để bắt đầu
            </p>
        }
      </div>
      {/* Action buttons */}
      <div style={{
        position: 'fixed', bottom: 24, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 12, padding: '0 20px',
        zIndex: 30,
      }}>
        <button
          onClick={handleWizardBack}
          style={{
            padding: '14px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14,
            color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)',
            background: 'color-mix(in srgb, var(--lp-primary) 8%, var(--lp-bg-hero))',
            border: '1.5px solid color-mix(in srgb, var(--lp-primary) 15%, transparent)',
            cursor: 'pointer',
          }}
        >
          ← Quay lại
        </button>
        <button
          onClick={handleWizardNext}
          style={{
            flex: 1, maxWidth: 240, padding: '14px 32px', borderRadius: 999, fontWeight: 700, fontSize: 16,
            color: 'white', background: 'var(--lp-accent)',
            boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)',
            border: 'none', cursor: 'pointer',
          }}
        >
          Xem kết quả
        </button>
      </div>
    </div>
  );
}
```

You'll also need to add the `fm-fade-in` keyframe — find the `<style>` tag in the container render (or add one near the top of the component JSX return). If no `<style>` tag exists in `FaceMapMinigame`'s return, add it at the top of the outer `<div>`:

```tsx
<div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
  <style>{`@keyframes fm-fade-in { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
  <div className="w-full flex flex-col items-center gap-4">
```

- [ ] **Step 8: Update the `BubbleSeverityPicker` render to `BubbleTwoLayerPicker`**

Find the activeBubble render at the bottom of the component (~lines 1280–1288):

```tsx
{/* BEFORE */}
{activeBubble && (
  <BubbleSeverityPicker
    cx={activeBubble.cx}
    cy={activeBubble.cy}
    onSelect={handleSeveritySelect}
    onClose={() => setActiveBubble(null)}
  />
)}
```

```tsx
{/* AFTER */}
{activeBubble && (
  <BubbleTwoLayerPicker
    cx={activeBubble.cx}
    cy={activeBubble.cy}
    conditions={activeBubble.conditions}
    onComplete={handleTwoLayerComplete}
    onClose={() => setActiveBubble(null)}
  />
)}
```

- [ ] **Step 9: Remove the `totalWizardSteps` line (no longer needed)**

Find and delete:
```typescript
const totalWizardSteps = selectedAcneTypes.length;
```

And remove `StepProgress` from the render:
```tsx
{/* BEFORE — delete this block */}
{!isScanning && wizardStep > 0 && (
  <StepProgress current={wizardStep} total={totalWizardSteps} />
)}
```

The `StepProgress` import/component itself can stay in the file since it may be used elsewhere; just remove it from the FaceMapMinigame render.

- [ ] **Step 10: TypeScript compile check**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors in face-map.tsx.

- [ ] **Step 11: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx
git commit -m "feat(face-map): refactor FaceMapMinigame — single face-map, ZoneMap state, two-layer bubbles, multi-condition heading"
```

---

## Task 6 — Refactor `ElectricSoftSwipeMinigame` Wizard (soft-swipe.tsx)

**Files:**
- Modify: `src/landing/variants/minigame/electric/soft-swipe.tsx`

### Background

The soft-swipe wizard currently shows one `CardFaceMapStep` per selected card (per-condition loop). Replace it with a single face-map step backed by `ZoneMap` state, using `BubbleTwoLayerPicker` instead of `BubbleSeverityPicker`.

The conditions for Layer 1 are derived from the selected CARDS (non-clear), not from `AcneType`. Since `BubbleTwoLayerPicker` accepts `ConditionOption[]`, we map each selected CARD to a `ConditionOption` using its `id`, `label`, `image?`, and `accent`.

The scanning phase derives `allActiveZones` from `Object.keys(zoneMap)`.

- [ ] **Step 1: Update imports**

Find the import from `face-map` (~line 8):

```typescript
// BEFORE
import { FaceDiagram, BubbleSeverityPicker, type Zone, type Severity } from '../face-map';
```

```typescript
// AFTER
import {
  FaceDiagram,
  BubbleTwoLayerPicker,
  type Zone,
  type Severity,
  type ZoneMap,
  type ConditionOption,
} from '../face-map';
```

- [ ] **Step 2: Update state — replace `assessments: CardZones[]` with `zoneMap: ZoneMap`**

Find the state declarations block (~lines 316–319):

```typescript
// BEFORE
const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
const [assessments, setAssessments] = useState<CardZones[]>([]);
const [wizardStep, setWizardStep] = useState(0);
const [activeBubble, setActiveBubble] = useState<{ zone: Zone; cx: number; cy: number } | null>(null);
```

```typescript
// AFTER
const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
const [zoneMap, setZoneMap] = useState<ZoneMap>({});
const [activeBubble, setActiveBubble] = useState<{
  zone: Zone; cx: number; cy: number; conditions: ConditionOption[];
} | null>(null);
```

- [ ] **Step 3: Update `handleWheelConfirm`**

Find `handleWheelConfirm` (~line 800):

```typescript
// BEFORE
function handleWheelConfirm() {
  if (selectedCardIds.length === 0) return;
  wheelLocked.current = true;
  const nonClearIds = selectedCardIds.filter(id => id !== 'clear');
  if (nonClearIds.length === 0) {
    setPhase('scanning');
    return;
  }
  setAssessments(nonClearIds.map(() => ({})));
  setWizardStep(0);
  setPhase('wizard');
}
```

```typescript
// AFTER
function handleWheelConfirm() {
  if (selectedCardIds.length === 0) return;
  wheelLocked.current = true;
  const nonClearIds = selectedCardIds.filter(id => id !== 'clear');
  if (nonClearIds.length === 0) {
    setPhase('scanning');
    return;
  }
  setZoneMap({});
  setPhase('wizard');
}
```

- [ ] **Step 4: Replace `handleZoneTap`, `handleSeveritySelect`, `handleWizardNext`, `handleWizardBack`**

Find the "Wizard handlers" section (~lines 813–844) and replace entirely:

```typescript
// BEFORE
// ─── Wizard handlers ────────────────────────────────────────────────────────
const handleZoneTap = useCallback((zone: Zone, cx: number, cy: number) => {
  setActiveBubble({ zone, cx, cy });
}, []);

function handleSeveritySelect(severity: Severity) {
  if (!activeBubble) return;
  setAssessments(prev => prev.map((zones, i) =>
    i !== wizardStep ? zones : { ...zones, [activeBubble.zone]: severity }
  ));
  setActiveBubble(null);
}

function handleWizardNext() {
  setActiveBubble(null);
  const nonClearIds = selectedCardIds.filter(id => id !== 'clear');
  if (wizardStep < nonClearIds.length - 1) {
    setWizardStep(wizardStep + 1);
  } else {
    setPhase('scanning');
  }
}

function handleWizardBack() {
  setActiveBubble(null);
  if (wizardStep > 0) {
    setWizardStep(wizardStep - 1);
  } else {
    wheelLocked.current = false;
    setPhase('wheel');
  }
}
```

```typescript
// AFTER
// ─── Wizard handlers ────────────────────────────────────────────────────────
const handleZoneTap = useCallback((zone: Zone, cx: number, cy: number) => {
  const nonClearIds = selectedCardIdsRef.current.filter(id => id !== 'clear');
  const conditionOptions: ConditionOption[] = CARDS
    .filter(c => nonClearIds.includes(c.id))
    .map(c => ({
      id: c.id,
      label: c.label,
      image: c.image,
      color: c.accent,
    }));
  setActiveBubble({ zone, cx, cy, conditions: conditionOptions });
}, []);

function handleTwoLayerComplete(conditionIds: string[], severity: Severity) {
  if (!activeBubble) return;
  setZoneMap(prev => ({
    ...prev,
    [activeBubble.zone]: { conditions: conditionIds, severity },
  }));
  setActiveBubble(null);
}

function handleWizardNext() {
  setActiveBubble(null);
  setPhase('scanning');
}

function handleWizardBack() {
  setActiveBubble(null);
  wheelLocked.current = false;
  setZoneMap({});
  setPhase('wheel');
}
```

- [ ] **Step 5: Update scanning phase — replace `assessments` usages**

Find the `useEffect` for scanning (~line 847) and update the zone-derivation logic:

```typescript
// BEFORE
const allActiveZones = [...new Set(assessments.flatMap(zones =>
  (Object.entries(zones) as [Zone, Severity][])
    .filter(([, s]) => s !== 'khong')
    .map(([z]) => z)
))];
```

```typescript
// AFTER
const allActiveZones = Object.keys(zoneMap) as Zone[];
```

Also update `scanZoneSeverity` (~line 893):

```typescript
// BEFORE
const scanZoneSeverity = assessments.reduce<Partial<Record<Zone, Severity>>>((acc, zones) => {
  for (const [z, s] of Object.entries(zones) as [Zone, Severity][]) {
    if (s === 'nhieu') acc[z] = 'nhieu';
    else if (s === 'it' && acc[z] !== 'nhieu') acc[z] = 'it';
  }
  return acc;
}, {});
```

```typescript
// AFTER
const scanZoneSeverity = Object.fromEntries(
  Object.entries(zoneMap).map(([z, v]) => [z, v!.severity])
) as Partial<Record<Zone, Severity>>;
```

- [ ] **Step 6: Update header step counter**

Find the wizard step display in the header (~line 933):

```typescript
// BEFORE
{phase === 'wizard' && `Bước ${wizardStep + 1} / ${selectedCardIds.filter(id => id !== 'clear').length}`}
```

```typescript
// AFTER
{phase === 'wizard' && `Đánh dấu vùng da`}
```

- [ ] **Step 7: Replace wizard render — single face-map with BubbleTwoLayerPicker**

Find the wizard render section (~lines 1156–1174):

```tsx
{/* BEFORE — entire wizard block */}
{/* ── Wizard (face-map per condition) ── */}
{phase === 'wizard' && (() => {
  const nonClearIds = selectedCardIds.filter(id => id !== 'clear');
  const card = CARDS.find(c => c.id === nonClearIds[wizardStep])!;
  const zones = assessments[wizardStep] ?? {};
  if (!card) return null;
  return (
    <CardFaceMapStep
      card={card}
      zones={zones}
      currentStep={wizardStep + 1}
      totalSteps={nonClearIds.length}
      onZoneTap={handleZoneTap}
      onNext={handleWizardNext}
      onBack={handleWizardBack}
      isLast={wizardStep === nonClearIds.length - 1}
    />
  );
})()}
```

```tsx
{/* AFTER */}
{/* ── Wizard (single face-map) ── */}
{phase === 'wizard' && (() => {
  const nonClearIds = selectedCardIds.filter(id => id !== 'clear');
  const isMulti = nonClearIds.length > 1;
  const firstCard = CARDS.find(c => c.id === nonClearIds[0]);
  const zoneSeverity = Object.fromEntries(
    Object.entries(zoneMap).map(([z, v]) => [z, v!.severity])
  ) as Partial<Record<Zone, Severity>>;
  return (
    <div
      className="flex-1 flex flex-col items-center px-5 pt-5 pb-28 gap-3 overflow-y-auto"
      style={{ animation: 'fade-in 350ms ease-out both' }}
    >
      <div className="text-center">
        <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
          {isMulti
            ? 'Da bạn có nhiều tuýp — hãy đánh dấu từng vùng!'
            : `${firstCard?.label ?? ''} xuất hiện ở đâu?`
          }
        </h2>
        <p className="text-base mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          Chạm vào vùng da để chọn mức độ
        </p>
      </div>
      <FaceDiagram
        zoneSeverity={zoneSeverity}
        onZoneTap={handleZoneTap}
        isScanning={false}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 28 }}>
        {Object.entries(zoneMap).length > 0
          ? (Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]).map(([z, data]) => (
              <div key={z} style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: data.severity === 'nhieu' ? '#EF444420' : '#F9731620',
                color: data.severity === 'nhieu' ? '#EF4444' : '#F97316',
                border: `1px solid ${data.severity === 'nhieu' ? '#EF444440' : '#F9731640'}`,
              }}>
                {ZONE_LABEL[z]} — {data.severity === 'nhieu' ? 'nhiều' : data.severity === 'vua' ? 'vừa' : 'ít'}
              </div>
            ))
          : <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>
              Chạm vào vùng da để bắt đầu
            </p>
        }
      </div>
      {/* Fixed bottom buttons */}
      <div style={{
        position: 'fixed', bottom: 24, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 12, padding: '0 20px',
        zIndex: 30,
      }}>
        <button
          onClick={handleWizardBack}
          style={{
            padding: '14px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14,
            color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)',
            background: 'color-mix(in srgb, var(--lp-primary) 8%, var(--lp-bg-hero))',
            border: '1.5px solid color-mix(in srgb, var(--lp-primary) 15%, transparent)',
            cursor: 'pointer',
          }}
        >
          ← Quay lại
        </button>
        <button
          onClick={handleWizardNext}
          style={{
            flex: 1, maxWidth: 240, padding: '14px 32px', borderRadius: 999, fontWeight: 700, fontSize: 16,
            color: 'white', background: 'var(--lp-accent)',
            boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)',
            border: 'none', cursor: 'pointer',
          }}
        >
          Xem kết quả
        </button>
      </div>
    </div>
  );
})()}
```

- [ ] **Step 8: Replace `BubbleSeverityPicker` render with `BubbleTwoLayerPicker`**

Find at ~line 1196:

```tsx
{/* BEFORE */}
{activeBubble && (
  <BubbleSeverityPicker
    cx={activeBubble.cx}
    cy={activeBubble.cy}
    onSelect={handleSeveritySelect}
    onClose={() => setActiveBubble(null)}
  />
)}
```

```tsx
{/* AFTER */}
{activeBubble && (
  <BubbleTwoLayerPicker
    cx={activeBubble.cx}
    cy={activeBubble.cy}
    conditions={activeBubble.conditions}
    onComplete={handleTwoLayerComplete}
    onClose={() => setActiveBubble(null)}
  />
)}
```

- [ ] **Step 9: Delete `CardFaceMapStep` component (no longer used)**

Find the `CardFaceMapStep` function declaration (~line 213) and delete the entire component (from `function CardFaceMapStep` to its closing `}`). Also delete the `CardZones` type if it's no longer used elsewhere:

```typescript
// DELETE: type CardZones = Partial<Record<Zone, Severity>>;
// DELETE: function CardFaceMapStep(...) { ... }
```

Check first that `CardZones` isn't used anywhere else in the file before deleting it.

- [ ] **Step 10: TypeScript compile check**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add src/landing/variants/minigame/electric/soft-swipe.tsx
git commit -m "feat(soft-swipe): refactor wizard to single face-map with two-layer bubble picker"
```

---

## Task 7 — Wipe Card Real Images (soft-swipe.tsx)

**Files:**
- Modify: `src/landing/variants/minigame/electric/soft-swipe.tsx`

### Background

Each wipe card currently shows an SVG icon inside a colored circle. This task adds an optional `image` field to `SwipeCard`, populates it for cards that have matching photos in `/public/condition/`, and updates the shelf card render to show the photo when available.

The shelf card render is in the `renderFrame` loop inside the canvas div (around line 1078–1089). The icon-wrap is a static JSX element already present — we extend it to conditionally render an `<img>` tag.

- [ ] **Step 1: Add `image?` to `SwipeCard` interface**

Find the `SwipeCard` interface (~line 24):

```typescript
// BEFORE
interface SwipeCard {
  id: string;
  label: string;
  description: string;
  conditionId: ConditionId;
  zones: Zone[];
  icon: React.ReactNode;
  accent: string;
}
```

```typescript
// AFTER
interface SwipeCard {
  id: string;
  label: string;
  description: string;
  conditionId: ConditionId;
  zones: Zone[];
  icon: React.ReactNode;
  accent: string;
  image?: string;
}
```

- [ ] **Step 2: Add `image` paths to CARDS**

The `/public/condition/` directory contains photos keyed by AcneType. Map CARD IDs to condition photos:
- `oily` → no condition photo (uses icon)
- `acne` → `/condition/mun-viem-do.jpg`
- `dry-red` → `/condition/man-do-kich-ung.jpg`
- `pores` → `/condition/lo-chan-long.jpg`
- `scar` → `/condition/seo-ro.jpg`
- `blackhead` → `/condition/mun-dau-den.png`
- `whitehead` → `/condition/mun-dau-trang.jpg`
- `clear` → no image (keep icon)

Find each CARD definition and add the `image` field. For example, for `acne`:

```typescript
// BEFORE
{
  id: 'acne', label: 'Mụn viêm, mụn bọc', description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',
  conditionId: 'mun-trung-ca', zones: ['left-cheek', 'right-cheek'], accent: '#EF4444',
  icon: ( ... ),
},
```

```typescript
// AFTER
{
  id: 'acne', label: 'Mụn viêm, mụn bọc', description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',
  conditionId: 'mun-trung-ca', zones: ['left-cheek', 'right-cheek'], accent: '#EF4444',
  image: '/condition/mun-viem-do.jpg',
  icon: ( ... ),
},
```

Apply the same pattern for all cards in CARDS that have a matching image. Verify each path exists in `public/condition/` before adding it. If a path doesn't exist, leave `image` undefined.

- [ ] **Step 3: Update shelf card render to show image when available**

Find the icon-wrap div inside the arc canvas JSX (the static shelf cards render, ~line 1078):

```tsx
{/* BEFORE */}
<div data-role="icon-wrap" style={{
  width: 48, height: 48, borderRadius: '50%',
  background: `color-mix(in srgb, ${card.accent} 12%, var(--lp-bg-card, white))`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}}>
  {card.icon}
</div>
```

```tsx
{/* AFTER */}
<div data-role="icon-wrap" style={{
  width: 48, height: 48, borderRadius: '50%',
  overflow: 'hidden',
  background: `color-mix(in srgb, ${card.accent} 12%, var(--lp-bg-card, white))`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}}>
  {card.image ? (
    <img
      src={card.image}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    card.icon
  )}
</div>
```

- [ ] **Step 4: Verify available images**

Run this to confirm which image files exist:

```bash
ls public/condition/
```

Cross-check with the image paths added in Step 2. Remove any `image` entries for files that don't exist.

- [ ] **Step 5: TypeScript compile check**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/landing/variants/minigame/electric/soft-swipe.tsx
git commit -m "feat(soft-swipe): add real condition photos to wipe cards"
```

---

## Post-Implementation Verification

After all tasks are complete, do a final end-to-end check:

1. Navigate to a landing page variant that uses `FaceMapMinigame` (face-map.tsx).
2. Select 1 condition → confirm → tap a face zone → verify: L1 skipped, 3 severity bubbles appear (Ít / Vừa phải / Nhiều).
3. Select 2+ conditions → confirm → tap a face zone → verify: L1 appears with condition bubbles → select some → confirm → L2 severity bubbles appear.
4. Navigate to a landing page variant that uses `ElectricSoftSwipeMinigame` (soft-swipe.tsx).
5. Select 1 card → Tiếp theo → single face-map → tap zone → L1 skipped, severity bubbles appear.
6. Select 2+ cards → Tiếp theo → single face-map → tap zone → L1 condition bubbles → confirm → severity bubbles.
7. Check wipe cards show photos in the shelf zone.
8. Run full TypeScript check: `npx tsc --noEmit`.

---

## Notes

- `face-map-v2.tsx` is a separate variant file that may contain its own `FaceMapMinigame`. If so, apply the same refactor from Task 5 to that file as well (the component API is identical).
- `BubbleSeverityPicker` remains exported from face-map.tsx for any consumers that still need single-layer severity picking.
- The existing `ConditionFaceMapStep` component in face-map.tsx becomes dead code after Task 5 and can be deleted in a cleanup commit.
