'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'wheel' | 'face-map' | 'scanning' | 'done';

interface SwipeCard {
  id: string;
  label: string;
  description: string;
  conditionId: ConditionId;
  zones: string[];
}

interface FaceZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ARC_CX = 160;
const ARC_R = 248;
const ARC_CY_OFFSET = 60;   // circle center is containerHeight + 60 below top
const ARC_STEP = 22;         // degrees between adjacent cards
const DRAG_SENS = 4.2;       // px of drag per 1° of rotation
const SPRING_STIFFNESS = 0.2;
const SPRING_THRESHOLD = 0.04;
const DAMPING = 0.22;

const CARDS: SwipeCard[] = [
  { id: 'oily',    label: 'Da nhờn, bóng dầu',           description: 'Mặt hay bóng dầu, đặc biệt vùng trán và mũi', conditionId: 'da-nhon-mun-viem', zones: ['forehead', 'nose'] },
  { id: 'acne',    label: 'Mụn viêm, mụn bọc',            description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',   conditionId: 'mun-trung-ca',     zones: ['cheeks'] },
  { id: 'dry-red', label: 'Da khô, đỏ, dễ kích ứng',      description: 'Da căng rát sau rửa mặt, dễ bong tróc',       conditionId: 'da-nhay-cam',      zones: ['cheeks', 'forehead'] },
  { id: 'pores',   label: 'Lỗ chân lông to, ít mụn',      description: 'Lỗ chân lông nhìn thấy rõ, da xuất hiện đầu đen', conditionId: 'lo-chan-long', zones: ['nose', 'forehead'] },
  { id: 'clear',   label: 'Da khỏe, không vấn đề rõ rệt', description: 'Da khá ổn định, không có mụn hay kích ứng thường xuyên', conditionId: 'clean-skin', zones: [] },
];

const MIN_ANGLE = 0;
const MAX_ANGLE = (CARDS.length - 1) * ARC_STEP; // 88°

const FACE_ZONES: FaceZone[] = [
  { id: 'forehead', label: 'Trán', x: 33, y: 12, w: 34, h: 14 },
  { id: 'nose',     label: 'Mũi',  x: 42, y: 32, w: 16, h: 16 },
  { id: 'cheeks',   label: 'Má',   x: 14, y: 30, w: 72, h: 26 },
  { id: 'chin',     label: 'Cằm',  x: 40, y: 58, w: 20, h: 14 },
];

// ─── Arc math ────────────────────────────────────────────────────────────────

function arcPos(angleDeg: number, cy: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: ARC_CX + ARC_R * Math.sin(rad), y: cy - ARC_R * Math.cos(rad) };
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

function cardVisual(cardAngle: number, cy: number): CardVisual {
  const abs = Math.abs(cardAngle);
  const t = abs / ARC_STEP;
  const { x, y } = arcPos(cardAngle, cy);
  return {
    x, y,
    w: Math.max(70, Math.round(118 - t * 21)),
    h: Math.max(88, Math.round(148 - t * 27)),
    opacity: Math.max(0.12, 1 - t * 0.42),
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

// ─── Component (placeholder — filled in subsequent tasks) ────────────────────

export function ElectricSoftSwipeMinigame({ onComplete }: MinigameSlotProps) {
  return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>;
}
