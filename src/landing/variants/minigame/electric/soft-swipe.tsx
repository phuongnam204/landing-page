'use client';
// arc-wheel minigame — electric soft swipe
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import type { MinigameCopy } from '../../../copy';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';
import {
  FaceDiagram,
  BubbleTwoLayerPicker,
  type Zone,
  type Severity,
  type ZoneMap,
  type ConditionOption,
} from '../face-map';

const ZONE_LABEL: Record<Zone, string> = {
  forehead:      'Trán',
  nose:          'Mũi',
  'left-cheek':  'Má trái',
  'right-cheek': 'Má phải',
  'chin-jaw':    'Cằm & quai hàm',
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'wheel' | 'wizard' | 'scanning' | 'done';

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

// ─── Constants ───────────────────────────────────────────────────────────────

const ARC_CY_OFFSET = 60;
const ARC_STEP = 22;
const DRAG_SENS = 6.5;
const SPRING_STIFFNESS = 0.2;
const SPRING_THRESHOLD = 0.04;
const DAMPING = 0.22;

// Shelf layout — responsive, computed from container width at runtime

const CARDS: SwipeCard[] = [
  {
    id: 'oily', label: 'Da nhờn, bóng dầu', description: 'Mặt hay bóng dầu, đặc biệt vùng trán và mũi',
    conditionId: 'da-nhon-mun-viem', zones: ['forehead', 'nose'], accent: '#F59E0B',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#F59E0B" opacity="0.07"/>
        <path d="M26 9 C26 9 15 22 15 30 C15 37 20 42 26 42 C32 42 37 37 37 30 C37 22 26 9 26 9Z" fill="#F59E0B" opacity="0.80"/>
        <path d="M21 25 C21 25 19 28.5 19 31.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" opacity="0.60"/>
        <path d="M13 20 C13 20 10.5 23 10.5 25.5 C10.5 27.5 11.5 29 13 29 C14.5 29 15.5 27.5 15.5 25.5 C15.5 23 13 20 13 20Z" fill="#F59E0B" opacity="0.45"/>
        <path d="M39 15 C39 15 37 18.5 37 20.5 C37 22.5 38 23.5 39 23.5 C40 23.5 41 22.5 41 20.5 C41 18.5 39 15 39 15Z" fill="#F59E0B" opacity="0.38"/>
      </svg>
    ),
  },
  {
    id: 'acne', label: 'Mụn viêm, mụn bọc', description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',
    conditionId: 'mun-trung-ca', zones: ['left-cheek', 'right-cheek'], accent: '#EF4444',
    image: '/condition/mun-viem-do.jpg',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="22" fill="#EF4444" opacity="0.07"/>
        <circle cx="26" cy="28" r="12" fill="#EF4444" opacity="0.16"/>
        <circle cx="26" cy="26" r="9"  fill="#EF4444" opacity="0.88"/>
        <circle cx="26" cy="22" r="3.2" fill="white" opacity="0.90"/>
        <circle cx="13" cy="17" r="4.2" fill="#EF4444" opacity="0.48"/>
        <circle cx="38" cy="34" r="3.3" fill="#EF4444" opacity="0.38"/>
        <path d="M26 4 L26 8"     stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.45"/>
        <path d="M38 8 L36 11"    stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.38"/>
        <path d="M14 8 L16 11"    stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.38"/>
        <path d="M44 20 L41 21.5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.30"/>
        <path d="M8 20 L11 21.5"  stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.30"/>
      </svg>
    ),
  },
  {
    id: 'blackhead', label: 'Mụn đầu đen', description: 'Nốt đen nhỏ li ti ở mũi, trán — lỗ chân lông bị tắc hở',
    conditionId: 'lo-chan-long', zones: ['nose', 'forehead'], accent: '#374151',
    image: '/condition/mun-dau-den.png',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#374151" opacity="0.06"/>
        <circle cx="26" cy="26" r="5.5" fill="#374151" opacity="0.90"/>
        <circle cx="26" cy="26" r="8" stroke="#374151" strokeWidth="1.4" fill="none" opacity="0.20"/>
        <circle cx="15" cy="19" r="3.8" fill="#374151" opacity="0.72"/>
        <circle cx="36" cy="20" r="3"   fill="#374151" opacity="0.64"/>
        <circle cx="18" cy="34" r="3.2" fill="#374151" opacity="0.66"/>
        <circle cx="35" cy="33" r="2.4" fill="#374151" opacity="0.56"/>
        <circle cx="30" cy="15" r="2.2" fill="#374151" opacity="0.50"/>
        <circle cx="13" cy="29" r="1.8" fill="#374151" opacity="0.40"/>
        <circle cx="38" cy="29" r="1.6" fill="#374151" opacity="0.34"/>
      </svg>
    ),
  },
  {
    id: 'whitehead', label: 'Mụn đầu trắng', description: 'Nốt trắng nhỏ, bít kín — không đau, không viêm',
    conditionId: 'mun-trung-ca', zones: ['forehead', 'nose', 'chin-jaw'], accent: '#9CA3AF',
    image: '/condition/mun-dau-trang.jpg',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#9CA3AF" opacity="0.06"/>
        <circle cx="26" cy="26" r="7.5" fill="white" opacity="0.92" stroke="#9CA3AF" strokeWidth="1.6"/>
        <circle cx="25" cy="24" r="2.5" fill="#9CA3AF" opacity="0.32"/>
        <circle cx="15" cy="20" r="5.2" fill="white" opacity="0.88" stroke="#9CA3AF" strokeWidth="1.4"/>
        <circle cx="14.5" cy="18.5" r="1.7" fill="#9CA3AF" opacity="0.30"/>
        <circle cx="36" cy="18" r="4.2" fill="white" opacity="0.84" stroke="#9CA3AF" strokeWidth="1.3"/>
        <circle cx="35.5" cy="16.8" r="1.3" fill="#9CA3AF" opacity="0.28"/>
        <circle cx="19" cy="34" r="4.8" fill="white" opacity="0.86" stroke="#9CA3AF" strokeWidth="1.4"/>
        <circle cx="18.5" cy="32.5" r="1.6" fill="#9CA3AF" opacity="0.30"/>
        <circle cx="35" cy="33" r="3.6" fill="white" opacity="0.80" stroke="#9CA3AF" strokeWidth="1.2"/>
        <circle cx="34.6" cy="31.8" r="1.1" fill="#9CA3AF" opacity="0.26"/>
      </svg>
    ),
  },
  {
    id: 'dry-red', label: 'Da khô, đỏ, dễ kích ứng', description: 'Da căng rát sau rửa mặt, dễ bong tróc',
    conditionId: 'da-nhay-cam', zones: ['left-cheek', 'right-cheek', 'forehead'], accent: '#F97316',
    image: '/condition/man-do-kich-ung.jpg',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#F97316" opacity="0.07"/>
        <path d="M26 9 L26 19"  stroke="#F97316" strokeWidth="2.8" strokeLinecap="round" opacity="0.75"/>
        <path d="M26 19 L18 26" stroke="#F97316" strokeWidth="2.8" strokeLinecap="round" opacity="0.75"/>
        <path d="M18 26 L21 34" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.70"/>
        <path d="M26 19 L34 23" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" opacity="0.60"/>
        <path d="M34 23 L31 31" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" opacity="0.60"/>
        <path d="M18 26 L11 27" stroke="#F97316" strokeWidth="1.6" strokeLinecap="round" opacity="0.40"/>
        <path d="M31 31 L38 36" stroke="#F97316" strokeWidth="1.6" strokeLinecap="round" opacity="0.38"/>
        <circle cx="21" cy="37" r="2.5" fill="#EF4444" opacity="0.48"/>
        <circle cx="35" cy="29" r="2"   fill="#EF4444" opacity="0.38"/>
        <circle cx="14" cy="33" r="1.5" fill="#EF4444" opacity="0.30"/>
      </svg>
    ),
  },
  {
    id: 'pores', label: 'Lỗ chân lông to, ít mụn', description: 'Lỗ chân lông nhìn thấy rõ, da xuất hiện đầu đen',
    conditionId: 'lo-chan-long', zones: ['nose', 'forehead'], accent: '#8B5CF6',
    image: '/condition/lo-chan-long.jpg',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#8B5CF6" opacity="0.07"/>
        <circle cx="26" cy="26" r="14"  stroke="#8B5CF6" strokeWidth="1.4" opacity="0.30" fill="none"/>
        <circle cx="26" cy="26" r="9.5" stroke="#8B5CF6" strokeWidth="2"   opacity="0.58" fill="none"/>
        <circle cx="26" cy="26" r="5"   stroke="#8B5CF6" strokeWidth="2.8" opacity="0.85" fill="none"/>
        <circle cx="26" cy="26" r="1.8" fill="#8B5CF6" opacity="0.95"/>
        <circle cx="13" cy="14" r="5.5" stroke="#8B5CF6" strokeWidth="1.4" opacity="0.38" fill="none"/>
        <circle cx="13" cy="14" r="2.5" stroke="#8B5CF6" strokeWidth="1.8" opacity="0.58" fill="none"/>
        <circle cx="13" cy="14" r="0.8" fill="#8B5CF6" opacity="0.75"/>
        <circle cx="39" cy="37" r="4.5" stroke="#8B5CF6" strokeWidth="1.4" opacity="0.32" fill="none"/>
        <circle cx="39" cy="37" r="1.8" stroke="#8B5CF6" strokeWidth="1.8" opacity="0.50" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'scar', label: 'Sẹo rỗ, vết lõm sau mụn', description: 'Lỗ nhỏ lõm vào da, còn lại sau đợt mụn viêm',
    conditionId: 'da-seo-ro', zones: ['left-cheek', 'right-cheek'], accent: '#9C7A5F',
    image: '/condition/seo-ro.jpg',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#9C7A5F" opacity="0.07"/>
        <circle cx="20" cy="22" r="4"   stroke="#9C7A5F" strokeWidth="1.8" fill="none" opacity="0.70"/>
        <circle cx="20" cy="22" r="1.5" fill="#9C7A5F" opacity="0.55"/>
        <circle cx="33" cy="18" r="3"   stroke="#9C7A5F" strokeWidth="1.6" fill="none" opacity="0.62"/>
        <circle cx="33" cy="18" r="1.1" fill="#9C7A5F" opacity="0.46"/>
        <circle cx="24" cy="33" r="3.5" stroke="#9C7A5F" strokeWidth="1.7" fill="none" opacity="0.65"/>
        <circle cx="24" cy="33" r="1.3" fill="#9C7A5F" opacity="0.50"/>
        <circle cx="35" cy="30" r="2.2" stroke="#9C7A5F" strokeWidth="1.4" fill="none" opacity="0.45"/>
        <circle cx="16" cy="32" r="1.8" stroke="#9C7A5F" strokeWidth="1.3" fill="none" opacity="0.38"/>
      </svg>
    ),
  },
  {
    id: 'clear', label: 'Da khỏe, không vấn đề rõ rệt', description: 'Da khá ổn định, không có mụn hay kích ứng thường xuyên',
    conditionId: 'clean-skin', zones: [], accent: '#10B981',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="21" fill="#10B981" opacity="0.10"/>
        <circle cx="26" cy="26" r="15" fill="#10B981" opacity="0.18"/>
        <path d="M15 26 L22 33 L37 17" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.92"/>
        <circle cx="9"  cy="11" r="1.8" fill="#10B981" opacity="0.52"/>
        <circle cx="42" cy="14" r="1.4" fill="#10B981" opacity="0.42"/>
        <circle cx="40" cy="40" r="1.8" fill="#10B981" opacity="0.38"/>
        <circle cx="11" cy="40" r="1.3" fill="#10B981" opacity="0.32"/>
        <path d="M42 9 L44 7 M44 9 L42 7" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
        <path d="M10 43 L12 41 M12 43 L10 41" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      </svg>
    ),
  },
];

const DEFAULT_COPY: Required<MinigameCopy> = {
  skipIntro:        false,
  intro:            { heading: 'Chọn tình trạng da của bạn', subtext: 'Xoay bánh xe để duyệt qua các tình trạng, chạm vào thẻ để chọn — có thể chọn nhiều.', cta: 'Bắt đầu →' },
  scratch:          { hint: 'Quét ngón tay trên các vùng để khám phá' },
  analyzing:        { label: 'Đang phân tích...' },
  wheel:            { heading: 'Da của bạn dạo này thế nào?', subtext: 'Chạm vào thẻ để chọn - có thể chọn nhiều tình trạng' },
  faceMap:          { heading: 'Vùng da nào bị ảnh hưởng?', subtext: 'Chạm vào vùng da để chọn mức độ' },
  scanning:         { heading: 'Đang phân tích...' },
  conditionVariant: 'a',
};

const MIN_ANGLE = 0;
const MAX_ANGLE = (CARDS.length - 1) * ARC_STEP;

// ─── Arc math ─────────────────────────────────────────────────────────────────

function arcPos(angleDeg: number, cx: number, cy: number, arcR: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + arcR * Math.sin(rad), y: cy - arcR * Math.cos(rad) };
}

interface CardVisual {
  x: number; y: number;
  w: number; h: number;
  opacity: number;
  tilt: number;
  zIndex: number;
  bgAlpha: number;
  hidden: boolean;
  isCenter: boolean;
  t: number;
}

function cardVisual(cardAngle: number, cx: number, cy: number, baseW: number, arcR: number): CardVisual {
  const abs = Math.abs(cardAngle);
  const t = abs / ARC_STEP;
  const baseH = Math.round(baseW * 1.26);
  const minW = Math.round(baseW * 0.56);
  const minH = Math.round(baseH * 0.56);
  const { x, y } = arcPos(cardAngle, cx, cy, arcR);
  return {
    x, y,
    w: Math.max(minW, Math.round(baseW - t * baseW * 0.18)),
    h: Math.max(minH, Math.round(baseH - t * baseH * 0.19)),
    opacity: Math.max(0.08, 1 - t * 0.65),
    tilt: -cardAngle * 0.55,
    zIndex: Math.max(1, Math.round(20 - abs)),
    bgAlpha: Math.max(0.06, 1 - t * 0.92),
    hidden: t > 2.7,
    isCenter: t < 0.4,
    t,
  };
}

function clampWithDamping(angle: number): number {
  if (angle < MIN_ANGLE) return MIN_ANGLE + (angle - MIN_ANGLE) * DAMPING;
  if (angle > MAX_ANGLE) return MAX_ANGLE + (angle - MAX_ANGLE) * DAMPING;
  return angle;
}

function getShelfCardSize(containerWidth: number) {
  const isWide = containerWidth >= 600;
  return {
    sw: isWide ? 90 : 62,
    sh: isWide ? 70 : 58,
    gap: isWide ? 10 : 6,
    top: isWide ? 14 : 10,
    padding: isWide ? '6px 4px' : '4px',
  };
}

function getShelfLeft(containerWidth: number, sw: number, gap: number, numCards: number, slotIdx: number): number {
  const n = Math.max(1, numCards);
  const totalW = n * (sw + gap) - gap;
  const leftStart = Math.max(8, Math.round((containerWidth - totalW) / 2));
  return leftStart + slotIdx * (sw + gap);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ElectricSoftSwipeMinigame({ onComplete, copy }: MinigameSlotProps) {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>(copy?.skipIntro ? 'wheel' : 'intro');
  const [introFading, setIntroFading] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [zoneMap, setZoneMap] = useState<ZoneMap>({});
  const [activeBubble, setActiveBubble] = useState<{
    zone: Zone; cx: number; cy: number; conditions: ConditionOption[];
  } | null>(null);

  const c = {
    intro:    { ...DEFAULT_COPY.intro,    ...copy?.intro    },
    wheel:    { ...DEFAULT_COPY.wheel,    ...copy?.wheel    },
    faceMap:  { ...DEFAULT_COPY.faceMap,  ...copy?.faceMap  },
    scanning: { ...DEFAULT_COPY.scanning, ...copy?.scanning },
  };

  // ─── Wheel refs (no re-render during gesture) ────────────────────────────────
  const wheelAngle = useRef(0);
  const animFrame = useRef<number | null>(null);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const isDragging = useRef(false);
  const wheelLocked = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shelfZoneRef = useRef<HTMLDivElement>(null);

  // selectedCardIds mirror for imperative code (avoids stale closure in renderFrame)
  const selectedCardIdsRef = useRef<string[]>([]);
  // Cards currently mid-animation — renderFrame skips them
  const animatingCards = useRef<Set<number>>(new Set());

  // Keep ref in sync with state
  useEffect(() => {
    selectedCardIdsRef.current = selectedCardIds;
  }, [selectedCardIds]);

  // ─── Arc params helper (used by renderFrame + animation helpers) ─────────────
  const getArcParams = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;
    const cx = container.offsetWidth / 2;
    const isWide = container.offsetWidth >= 600;
    const baseW = isWide
      ? Math.min(260, Math.max(190, Math.round(container.offsetWidth * 0.19)))
      : Math.min(240, Math.max(190, Math.round(container.offsetWidth * 0.52)));
    const arcCyOffset = isWide
      ? Math.max(ARC_CY_OFFSET, Math.round(container.offsetHeight * 0.18))
      : ARC_CY_OFFSET;
    const arcCy = container.offsetHeight + arcCyOffset;
    const maxSafeArcR = arcCy - Math.round(Math.round(baseW * 1.26) / 2) - 8;
    const arcR = isWide
      ? Math.min(maxSafeArcR, Math.max(300, Math.round(container.offsetWidth * 0.38)))
      : Math.max(280, Math.round(container.offsetHeight * 0.72));
    return { cx, baseW, arcCy, arcR };
  }, []);

  // ─── Imperative render (60fps, no React re-render) ───────────────────────────
  const renderFrame = useCallback(() => {
    const params = getArcParams();
    if (!params) return;
    const { cx, baseW, arcCy, arcR } = params;
    const containerWidth = cx * 2;
    const centerIdx = Math.round(wheelAngle.current / ARC_STEP);

    CARDS.forEach((card, i) => {
      const el = cardRefs.current[i];
      const ghost = ghostRefs.current[i];
      if (!el) return;

      const angle = i * ARC_STEP - wheelAngle.current;
      const v = cardVisual(angle, cx, arcCy, baseW, arcR);

      // Skip cards mid-animation (CSS transition owns them)
      if (animatingCards.current.has(i)) {
        if (ghost) ghost.style.display = 'none';
        return;
      }

      const isSelected = selectedCardIdsRef.current.includes(card.id);

      if (isSelected) {
        const { sw, sh, gap, top, padding } = getShelfCardSize(containerWidth);
        const shelfIdx = selectedCardIdsRef.current.indexOf(card.id);
        const numSelected = selectedCardIdsRef.current.length;
        const shelfLeft = getShelfLeft(containerWidth, sw, gap, numSelected, shelfIdx);

        el.style.transition = '';
        el.style.display = 'flex';
        el.style.left = `${shelfLeft}px`;
        el.style.top = `${top}px`;
        el.style.width = `${sw}px`;
        el.style.height = `${sh}px`;
        el.style.padding = padding;
        el.style.opacity = '1';
        el.style.zIndex = '25';
        el.style.transform = 'rotate(0deg)';
        el.style.borderRadius = '14px';
        el.style.background = `color-mix(in srgb, ${card.accent} 12%, var(--lp-bg-card))`;
        el.style.border = `2px solid ${card.accent}`;
        el.style.boxShadow = `0 2px 12px color-mix(in srgb, ${card.accent} 25%, transparent)`;

        // Icon-only in shelf — hide label
        const labelEl = el.querySelector<HTMLElement>('[data-role="card-lbl"]');
        if (labelEl) labelEl.style.display = 'none';

        // Ghost at arc position (dashed placeholder)
        if (ghost) {
          if (v.hidden) {
            ghost.style.display = 'none';
          } else {
            ghost.style.display = 'block';
            ghost.style.left = `${v.x - v.w / 2}px`;
            ghost.style.top = `${v.y - v.h / 2}px`;
            ghost.style.width = `${v.w}px`;
            ghost.style.height = `${v.h}px`;
            ghost.style.opacity = `${Math.max(0.1, v.opacity * 0.35)}`;
            ghost.style.zIndex = `${v.zIndex}`;
            ghost.style.transform = `rotate(${v.tilt}deg)`;
          }
        }
        return;
      }

      // Not selected — normal arc render, restore from possible shelf state
      if (ghost) ghost.style.display = 'none';
      const labelEl = el.querySelector<HTMLElement>('[data-role="card-lbl"]');
      if (labelEl) labelEl.style.display = '';
      el.style.padding = '10px 8px';

      if (v.hidden) { el.style.display = 'none'; return; }
      el.style.transition = '';
      el.style.display = 'flex';
      el.style.left = `${v.x - v.w / 2}px`;
      el.style.top = `${v.y - v.h / 2}px`;
      el.style.width = `${v.w}px`;
      el.style.height = `${v.h}px`;
      el.style.opacity = `${v.opacity}`;
      el.style.zIndex = `${v.zIndex}`;
      el.style.transform = `rotate(${v.tilt}deg)`;
      el.style.borderRadius = '16px';

      if (v.isCenter) {
        el.style.background = 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))';
        el.style.boxShadow = '0 8px 28px color-mix(in srgb, var(--lp-accent) 22%, transparent)';
        el.style.border = '2px solid var(--lp-accent)';
      } else {
        el.style.background = 'var(--lp-bg-card)';
        el.style.boxShadow = 'none';
        el.style.border = '2px solid var(--lp-border)';
      }
    });

    // Update shelf zone position and size responsively
    const zone = shelfZoneRef.current;
    if (zone) {
      const { sw, sh, gap, top } = getShelfCardSize(containerWidth);
      const numSelected = selectedCardIdsRef.current.length;
      const n = Math.max(1, numSelected);
      const totalW = n * (sw + gap) - gap;
      const leftStart = Math.max(8, Math.round((containerWidth - totalW) / 2));
      zone.style.left = `${leftStart - 4}px`;
      zone.style.top = `${top - 4}px`;
      zone.style.width = `${totalW + 8}px`;
      zone.style.height = `${sh + 8}px`;
      const hasSel = numSelected > 0;
      zone.style.borderColor = `color-mix(in srgb, var(--lp-accent) ${hasSel ? 35 : 18}%, transparent)`;
      zone.style.background = `color-mix(in srgb, var(--lp-accent) ${hasSel ? 5 : 2}%, transparent)`;
    }

    const dotsEl = document.getElementById('wh-dots');
    if (dotsEl) {
      dotsEl.querySelectorAll<HTMLDivElement>('[data-dot]').forEach((dot, i) => {
        const active = i === centerIdx;
        dot.style.background = active ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 22%, transparent)';
        dot.style.width = active ? '18px' : '6px';
      });
    }
  }, [getArcParams]);

  // Auto-advance intro → wheel after 2 s, with fade-out animation
  useEffect(() => {
    if (phase !== 'intro') return;
    const t1 = setTimeout(() => setIntroFading(true), 2000);
    const t2 = setTimeout(() => setPhase('wheel'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'wheel') return;
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => renderFrame());
    ro.observe(container);
    renderFrame();
    return () => ro.disconnect();
  }, [phase, renderFrame]);

  // ─── Spring + snap ─────────────────────────────────────────────────────────
  const springTo = useCallback((target: number) => {
    if (animFrame.current !== null) cancelAnimationFrame(animFrame.current);
    function step() {
      wheelAngle.current += (target - wheelAngle.current) * SPRING_STIFFNESS;
      renderFrame();
      if (Math.abs(target - wheelAngle.current) < SPRING_THRESHOLD) {
        wheelAngle.current = target;
        renderFrame();
        animFrame.current = null;
        return;
      }
      animFrame.current = requestAnimationFrame(step);
    }
    animFrame.current = requestAnimationFrame(step);
  }, [renderFrame]);

  const snapBy = useCallback((dir: -1 | 1) => {
    if (wheelLocked.current) return;
    const current = Math.round(wheelAngle.current / ARC_STEP);
    const next = Math.max(0, Math.min(CARDS.length - 1, current + dir));
    springTo(next * ARC_STEP);
  }, [springTo]);

  // ─── Shelf animation helpers ─────────────────────────────────────────────────

  const animateCardToShelf = useCallback((cardIdx: number, shelfIdx: number) => {
    const el = cardRefs.current[cardIdx];
    if (!el) return;
    const card = CARDS[cardIdx];
    const containerWidth = containerRef.current?.offsetWidth ?? 375;
    const { sw, sh, gap, top, padding } = getShelfCardSize(containerWidth);
    const numCards = shelfIdx + 1;
    const targetLeft = getShelfLeft(containerWidth, sw, gap, numCards, shelfIdx);

    animatingCards.current.add(cardIdx);
    const ghost = ghostRefs.current[cardIdx];
    if (ghost) ghost.style.display = 'none';

    // Hide label immediately so it doesn't show during the fly animation
    const labelEl = el.querySelector<HTMLElement>('[data-role="card-lbl"]');
    if (labelEl) labelEl.style.display = 'none';

    el.style.transition = [
      'left 0.46s cubic-bezier(0.34,1.56,0.64,1)',
      'top 0.46s cubic-bezier(0.34,1.56,0.64,1)',
      'width 0.32s ease',
      'height 0.32s ease',
      'border-radius 0.28s ease',
      'padding 0.32s ease',
      'opacity 0.2s ease',
    ].join(', ');

    el.style.left = `${targetLeft}px`;
    el.style.top = `${top}px`;
    el.style.width = `${sw}px`;
    el.style.height = `${sh}px`;
    el.style.padding = padding;
    el.style.opacity = '1';
    el.style.zIndex = '25';
    el.style.transform = 'rotate(0deg)';
    el.style.borderRadius = '14px';
    el.style.background = `color-mix(in srgb, ${card.accent} 12%, var(--lp-bg-card))`;
    el.style.border = `2px solid ${card.accent}`;
    el.style.boxShadow = `0 2px 12px color-mix(in srgb, ${card.accent} 25%, transparent)`;

    setTimeout(() => {
      animatingCards.current.delete(cardIdx);
      el.style.transition = '';
    }, 520);
  }, []);

  const animateCardToArc = useCallback((cardIdx: number) => {
    const el = cardRefs.current[cardIdx];
    const params = getArcParams();
    if (!el || !params) return;
    const { cx, baseW, arcCy, arcR } = params;

    // Restore label and padding before the return flight begins
    const labelEl = el.querySelector<HTMLElement>('[data-role="card-lbl"]');
    if (labelEl) labelEl.style.display = '';
    el.style.padding = '10px 8px';

    const angle = cardIdx * ARC_STEP - wheelAngle.current;
    const v = cardVisual(angle, cx, arcCy, baseW, arcR);

    animatingCards.current.add(cardIdx);
    const ghost = ghostRefs.current[cardIdx];
    if (ghost) ghost.style.display = 'none';

    el.style.transition = [
      'left 0.42s cubic-bezier(0.34,1.56,0.64,1)',
      'top 0.42s cubic-bezier(0.34,1.56,0.64,1)',
      'width 0.28s ease',
      'height 0.28s ease',
      'border-radius 0.28s ease',
      'opacity 0.22s ease',
    ].join(', ');

    if (v.hidden) {
      el.style.opacity = '0';
    } else {
      el.style.left = `${v.x - v.w / 2}px`;
      el.style.top = `${v.y - v.h / 2}px`;
      el.style.width = `${v.w}px`;
      el.style.height = `${v.h}px`;
      el.style.opacity = `${v.opacity}`;
      el.style.zIndex = `${v.zIndex}`;
      el.style.transform = `rotate(${v.tilt}deg)`;
      el.style.borderRadius = '16px';
      el.style.background = v.isCenter
        ? 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))'
        : 'var(--lp-bg-card)';
      el.style.border = v.isCenter ? '2px solid var(--lp-accent)' : '2px solid var(--lp-border)';
      el.style.boxShadow = v.isCenter
        ? '0 8px 28px color-mix(in srgb, var(--lp-accent) 22%, transparent)'
        : 'none';
    }

    setTimeout(() => {
      animatingCards.current.delete(cardIdx);
      el.style.transition = '';
    }, 470);
  }, [getArcParams]);

  // ─── Pointer handlers ────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (wheelLocked.current) return;
    if (animFrame.current !== null) { cancelAnimationFrame(animFrame.current); animFrame.current = null; }
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartAngle.current = wheelAngle.current;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!isDragging.current || wheelLocked.current) return;
    const raw = dragStartAngle.current - (e.clientX - dragStartX.current) / DRAG_SENS;
    wheelAngle.current = clampWithDamping(raw);
    renderFrame();
  }, [renderFrame]);

  // ─── Card tap → toggle selection / spring to center ─────────────────────────
  const handleCardTap = useCallback((cardIdx: number) => {
    if (wheelLocked.current) return;
    const cardId = CARDS[cardIdx].id;

    // Tapping a shelf card → recall it back to arc
    if (selectedCardIdsRef.current.includes(cardId)) {
      animateCardToArc(cardIdx);
      const newIds = selectedCardIdsRef.current.filter(id => id !== cardId);
      selectedCardIdsRef.current = newIds;
      setSelectedCardIds(newIds);
      return;
    }

    // Not selected — if not at center, spring to it
    const centerIdx = Math.round(wheelAngle.current / ARC_STEP);
    if (cardIdx !== centerIdx) {
      springTo(cardIdx * ARC_STEP);
      return;
    }

    // Selecting the center card
    if (cardId === 'clear') {
      // Recall all non-clear cards currently on shelf
      selectedCardIdsRef.current
        .filter(id => id !== 'clear')
        .forEach(id => {
          const i = CARDS.findIndex(c => c.id === id);
          if (i >= 0) animateCardToArc(i);
        });
      // 'clear' flies to shelf position 0
      animateCardToShelf(cardIdx, 0);
      selectedCardIdsRef.current = ['clear'];
      setSelectedCardIds(['clear']);
    } else {
      // If 'clear' was on shelf, recall it first
      if (selectedCardIdsRef.current.includes('clear')) {
        const clearIdx = CARDS.findIndex(c => c.id === 'clear');
        if (clearIdx >= 0) animateCardToArc(clearIdx);
      }
      const newIds = [...selectedCardIdsRef.current.filter(id => id !== 'clear'), cardId];
      animateCardToShelf(cardIdx, newIds.length - 1);
      selectedCardIdsRef.current = newIds;
      setSelectedCardIds(newIds);

      // Auto-advance to next unselected card (skip clear)
      const n = CARDS.length;
      let nextIdx = -1;
      for (let offset = 1; offset < n; offset++) {
        const idx = (cardIdx + offset) % n;
        if (!newIds.includes(CARDS[idx].id) && CARDS[idx].id !== 'clear') { nextIdx = idx; break; }
      }
      if (nextIdx >= 0) {
        setTimeout(() => { if (!wheelLocked.current) springTo(nextIdx * ARC_STEP); }, 240);
      }
    }
  }, [springTo, animateCardToShelf, animateCardToArc]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!isDragging.current) return;
    const dragDelta = Math.abs(e.clientX - dragStartX.current);
    isDragging.current = false;
    const target = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, Math.round(wheelAngle.current / ARC_STEP) * ARC_STEP));
    springTo(target);

    if (e.type === 'pointerup' && dragDelta < 8) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      const tapY = e.clientY - rect.top;
      let tappedIdx = -1;
      let highestZ = -1;
      CARDS.forEach((_, i) => {
        const el = cardRefs.current[i];
        if (!el || el.style.display === 'none') return;
        const l = parseFloat(el.style.left);
        const t = parseFloat(el.style.top);
        const w = parseFloat(el.style.width);
        const h = parseFloat(el.style.height);
        const z = parseInt(el.style.zIndex) || 0;
        if (tapX >= l && tapX <= l + w && tapY >= t && tapY <= t + h && z > highestZ) {
          tappedIdx = i;
          highestZ = z;
        }
      });
      if (tappedIdx >= 0) handleCardTap(tappedIdx);
    }
  }, [springTo, handleCardTap]);

  // iOS Safari: native Touch Events
  useEffect(() => {
    if (phase !== 'wheel') return;
    const container = containerRef.current;
    if (!container) return;

    function onTouchStart(e: TouchEvent) {
      if (wheelLocked.current) return;
      if (animFrame.current !== null) { cancelAnimationFrame(animFrame.current); animFrame.current = null; }
      isDragging.current = true;
      dragStartX.current = e.touches[0].clientX;
      dragStartAngle.current = wheelAngle.current;
    }

    function onTouchMove(e: TouchEvent) {
      if (!isDragging.current || wheelLocked.current) return;
      e.preventDefault();
      const raw = dragStartAngle.current - (e.touches[0].clientX - dragStartX.current) / DRAG_SENS;
      wheelAngle.current = clampWithDamping(raw);
      renderFrame();
    }

    function onTouchEnd(e: TouchEvent) {
      if (!isDragging.current) return;
      const endX = e.changedTouches[0].clientX;
      const dragDelta = Math.abs(endX - dragStartX.current);
      isDragging.current = false;
      const target = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, Math.round(wheelAngle.current / ARC_STEP) * ARC_STEP));
      springTo(target);
      if (dragDelta < 8) {
        const c = containerRef.current;
        if (!c) return;
        const rect = c.getBoundingClientRect();
        const tapX = endX - rect.left;
        const tapY = e.changedTouches[0].clientY - rect.top;
        let tappedIdx = -1;
        let highestZ = -1;
        CARDS.forEach((_, i) => {
          const cardEl = cardRefs.current[i];
          if (!cardEl || cardEl.style.display === 'none') return;
          const l = parseFloat(cardEl.style.left);
          const t = parseFloat(cardEl.style.top);
          const w = parseFloat(cardEl.style.width);
          const h = parseFloat(cardEl.style.height);
          const z = parseInt(cardEl.style.zIndex) || 0;
          if (tapX >= l && tapX <= l + w && tapY >= t && tapY <= t + h && z > highestZ) {
            tappedIdx = i;
            highestZ = z;
          }
        });
        if (tappedIdx >= 0) handleCardTap(tappedIdx);
      }
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [phase, renderFrame, springTo, handleCardTap]);

  // ─── Wheel confirm → wizard or scanning ────────────────────────────────────
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

  // ─── Wizard handlers ────────────────────────────────────────────────────────
  const handleZoneTap = useCallback((zone: Zone, cx: number, cy: number) => {
    const nonClearIds = selectedCardIdsRef.current.filter(id => id !== 'clear');
    const conditionOptions: ConditionOption[] = CARDS
      .filter(c => nonClearIds.includes(c.id))
      .map(c => ({ id: c.id, label: c.label, image: c.image, color: c.accent }));
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

  // ─── Scanning → onComplete ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'scanning') return;
    const timeout = setTimeout(() => {
      const nonClearIds = selectedCardIds.filter(id => id !== 'clear');

      if (nonClearIds.length === 0) {
        const condition = skinConditions['clean-skin']!;
        onComplete({
          condition,
          conditions: [condition],
          zoneIds: [],
          zoneLabel: 'Không có vùng cụ thể',
          triggerNote: 'Da khỏe',
        });
        return;
      }

      const seenConditionIds = new Set<string>();
      const conditions = nonClearIds
        .map(id => CARDS.find(c => c.id === id)!)
        .map(card => skinConditions[card.conditionId])
        .filter((c): c is NonNullable<typeof c> => {
          if (!c || seenConditionIds.has(c.id)) return false;
          seenConditionIds.add(c.id);
          return true;
        });

      const allActiveZones = Object.keys(zoneMap) as Zone[];

      const zoneLabel = allActiveZones.map(z => ZONE_LABEL[z]).join(', ') || 'Không có vùng cụ thể';
      const triggerNote = nonClearIds
        .map(id => CARDS.find(c => c.id === id)?.label ?? '')
        .filter(Boolean)
        .join(', ');

      onComplete({
        conditions,
        condition: conditions[0],
        zoneIds: allActiveZones,
        zoneLabel,
        triggerNote,
      });
    }, 1800);
    return () => clearTimeout(timeout);
  }, [phase, selectedCardIds, zoneMap, onComplete]);

  // ─── Combined zone severity for scanning display ────────────────────────────
  const scanZoneSeverity = Object.fromEntries(
    Object.entries(zoneMap).map(([z, v]) => [z, v!.severity])
  ) as Partial<Record<Zone, Severity>>;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--lp-bg-hero)' }}>
      <div
        className="flex-1 flex flex-col overflow-hidden w-full"
        style={{ animation: 'fade-in 350ms ease-out both' }}
      >
        <style>{`
          @keyframes fade-in { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
          @keyframes shelf-in { 0% { transform:scaleX(0.6); opacity:0; } 70% { transform:scaleX(1.06); opacity:1; } 100% { transform:scaleX(1); opacity:1; } }
        `}</style>

        {/* Header bar */}
        <div
          className="sticky top-0 z-20 border-b"
          style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}
        >
          <div className="flex items-center justify-between px-5 md:px-10 py-3 md:py-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--lp-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div className="text-sm md:text-base font-bold" style={{ color: 'var(--lp-primary)' }}>O2 Skin · Kiểm tra da</div>
            </div>
            <div className="text-xs md:text-sm font-semibold" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              {phase === 'intro' && 'Hướng dẫn'}
              {phase === 'wheel' && (selectedCardIds.length > 0
                ? `Đã chọn ${selectedCardIds.length}`
                : `Thẻ ${Math.round(wheelAngle.current / ARC_STEP) + 1} / ${CARDS.length}`)}
              {phase === 'wizard' && 'Đánh dấu vùng da'}
              {phase === 'scanning' && 'Đang phân tích...'}
            </div>
          </div>
        </div>

        {/* ── Intro ── */}
        {phase === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-7"
            style={{ animation: 'fade-in 350ms ease-out both', opacity: introFading ? 0 : 1, transform: introFading ? 'translateY(-10px)' : 'translateY(0)', transition: 'opacity 380ms ease-out, transform 380ms ease-out' }}>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
                  style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 25%, transparent)', background: 'color-mix(in srgb, var(--lp-primary) 6%, white)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>Trước</span>
              </div>

              <div className="w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md"
                style={{ background: 'var(--lp-bg-card)', border: '1.5px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, white)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lp-accent)" strokeWidth="2">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                  </svg>
                </div>
                <div className="text-[10px] font-bold text-center leading-tight px-1" style={{ color: 'var(--lp-primary)' }}>
                  Tình trạng da
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
                  style={{ borderColor: 'var(--lp-accent)', background: 'color-mix(in srgb, var(--lp-accent) 10%, white)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ color: 'var(--lp-accent)' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--lp-accent)' }}>Sau</span>
              </div>
            </div>

            <div className="text-center max-w-xs">
              <h2 className="font-extrabold text-xl mb-2" style={{ color: 'var(--lp-primary)' }}>
                {c.intro.heading}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
                {c.intro.subtext}
              </p>
            </div>

            <button
              onClick={() => { setIntroFading(false); setPhase('wheel'); }}
              className="px-8 py-3.5 rounded-full font-bold text-base text-white transition-all active:scale-[0.97]"
              style={{ background: 'var(--lp-accent)', boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)' }}
            >
              {c.intro.cta}
            </button>
          </div>
        )}

        {/* ── Wheel ── */}
        {phase === 'wheel' && (
          <div className="flex-1 flex flex-col" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="pt-6 pb-2 px-5 text-center">
              <h2 className="font-extrabold text-2xl md:text-4xl leading-snug" style={{ color: 'var(--lp-primary)' }}>
                {c.wheel.heading}
              </h2>
              <p className="text-sm md:text-base mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
                {c.wheel.subtext}
              </p>
            </div>

            {/* Arc canvas */}
            <div
              ref={containerRef}
              style={{ flex: 1, position: 'relative', touchAction: 'none', cursor: 'grab' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Shelf zone — position/size driven imperatively by renderFrame */}
              <div
                ref={shelfZoneRef}
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 4,
                  height: 66,
                  width: 200,
                  borderRadius: 14,
                  border: '1.5px dashed color-mix(in srgb, var(--lp-accent) 18%, transparent)',
                  background: 'color-mix(in srgb, var(--lp-accent) 2%, transparent)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  transition: 'border-color 0.3s ease, background 0.3s ease',
                }}
              />

              {/* Ghost placeholders — positioned by renderFrame at arc positions */}
              {CARDS.map((card, i) => (
                <div
                  key={`ghost-${card.id}`}
                  ref={el => { ghostRefs.current[i] = el; }}
                  style={{
                    position: 'absolute',
                    display: 'none',
                    borderRadius: 16,
                    border: `2px dashed color-mix(in srgb, ${card.accent} 45%, transparent)`,
                    background: `color-mix(in srgb, ${card.accent} 4%, transparent)`,
                    pointerEvents: 'none',
                    willChange: 'transform, opacity',
                  }}
                />
              ))}

              {/* Arc cards — managed imperatively by renderFrame */}
              {CARDS.map((card, i) => (
                <div
                  key={card.id}
                  ref={el => { cardRefs.current[i] = el; }}
                  style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 8px',
                    borderRadius: 16,
                    cursor: 'pointer',
                    userSelect: 'none',
                    textAlign: 'center',
                    border: '2px solid var(--lp-border)',
                    background: 'var(--lp-bg-card)',
                    willChange: 'transform, left, top, width, height, opacity',
                    overflow: 'hidden',
                  } as React.CSSProperties}
                >
                  <div data-role="icon-wrap" style={{
                    width: 84, height: 84, borderRadius: '50%',
                    overflow: 'hidden',
                    background: `color-mix(in srgb, ${card.accent} 12%, var(--lp-bg-card, white))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    marginBottom: 4,
                  }}>
                    {card.image ? (
                      <img src={card.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : card.icon}
                  </div>
                  <div data-role="card-lbl" style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.25, color: 'var(--lp-primary)' }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            <div id="wh-dots" style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 8 }}>
              {CARDS.map((_, i) => (
                <div key={i} data-dot={i} style={{
                  height: 5, borderRadius: 3,
                  background: i === 0 ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 22%, transparent)',
                  width: i === 0 ? 18 : 6,
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>

            {/* Arrow controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingBottom: 20 }}>
              <button onClick={() => snapBy(-1)} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--lp-primary) 8%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={() => snapBy(1)} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--lp-primary) 8%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Sticky "Tiếp theo" CTA — slides up when ≥1 card selected */}
            <div style={{
              position: 'fixed', bottom: 24, left: 0, right: 0,
              display: 'flex', justifyContent: 'center',
              transform: selectedCardIds.length > 0 ? 'translateY(0)' : 'translateY(80px)',
              opacity: selectedCardIds.length > 0 ? 1 : 0,
              transition: 'transform 350ms cubic-bezier(0.34,1.56,0.64,1), opacity 250ms ease',
              pointerEvents: selectedCardIds.length > 0 ? 'auto' : 'none',
              zIndex: 40,
            }}>
              <button
                onClick={handleWheelConfirm}
                style={{
                  padding: '14px 48px', borderRadius: 999, fontWeight: 700, fontSize: 16,
                  color: 'white', background: 'var(--lp-accent)',
                  boxShadow: '0 4px 24px color-mix(in srgb, var(--lp-accent) 40%, transparent)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Tiếp theo →
              </button>
            </div>
          </div>
        )}

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
              className="flex-1 flex flex-col items-center px-5 pt-5 pb-40 gap-3 overflow-y-auto"
              style={{ animation: 'fade-in 350ms ease-out both' }}
            >
              <div className="text-center">
                <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
                  {isMulti
                    ? 'Da bạn có nhiều tuýp — hãy đánh dấu từng vùng!'
                    : `${firstCard?.label ?? ''} xuất hiện ở đâu?`}
                </h2>
                <p className="text-base mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
                  Chạm vào vùng da để chọn mức độ
                </p>
              </div>
              <FaceDiagram zoneSeverity={zoneSeverity} onZoneTap={handleZoneTap} isScanning={false} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 28 }}>
                {Object.entries(zoneMap).length > 0
                  ? (Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]).map(([z, data]) => (
                      <div key={z} style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: data.severity === 'nhieu' ? '#EF444420' : data.severity === 'vua' ? '#F59E0B20' : '#F9731620',
                        color:      data.severity === 'nhieu' ? '#EF4444'   : data.severity === 'vua' ? '#D97706'   : '#F97316',
                        border: `1px solid ${data.severity === 'nhieu' ? '#EF444440' : data.severity === 'vua' ? '#F59E0B40' : '#F9731640'}`,
                      }}>
                        {ZONE_LABEL[z]} — {data.severity === 'nhieu' ? 'nhiều' : data.severity === 'vua' ? 'vừa' : 'ít'}
                      </div>
                    ))
                  : <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>Chạm vào vùng da để bắt đầu</p>
                }
              </div>
              <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, padding: '0 20px', zIndex: 30 }}>
                <button
                  onClick={handleWizardBack}
                  style={{ padding: '14px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14, color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)', background: 'color-mix(in srgb, var(--lp-primary) 8%, var(--lp-bg-hero))', border: '1.5px solid color-mix(in srgb, var(--lp-primary) 15%, transparent)', cursor: 'pointer' }}
                >
                  ← Quay lại
                </button>
                <button
                  onClick={handleWizardNext}
                  style={{ flex: 1, maxWidth: 240, padding: '14px 32px', borderRadius: 999, fontWeight: 700, fontSize: 16, color: 'white', background: 'var(--lp-accent)', boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)', border: 'none', cursor: 'pointer' }}
                >
                  Xem kết quả
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Scanning ── */}
        {phase === 'scanning' && (
          <div
            className="flex-1 flex flex-col items-center justify-center px-5 gap-4"
            style={{ animation: 'fade-in 350ms ease-out both' }}
          >
            <div className="text-center mb-1">
              <h2 className="font-extrabold text-lg" style={{ color: 'var(--lp-primary)' }}>
                {c.scanning.heading}
              </h2>
            </div>
            <FaceDiagram
              zoneSeverity={scanZoneSeverity}
              onZoneTap={() => {}}
              isScanning={true}
            />
          </div>
        )}
      </div>

      {activeBubble && (
        <BubbleTwoLayerPicker
          cx={activeBubble.cx}
          cy={activeBubble.cy}
          conditions={activeBubble.conditions}
          onComplete={handleTwoLayerComplete}
          onClose={() => setActiveBubble(null)}
        />
      )}
    </div>
  );
}
