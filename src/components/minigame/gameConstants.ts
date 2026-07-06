/** Ngưỡng giữ để nặn 1 mụn trắng (ms). */
export const PRESS_HOLD_MS = 300;
/** Bán kính bắt cho press & swipe (theo % scene). */
export const CATCH_RADIUS = 12;
/** Escalating hint: highlight lại sau ngần này ms không tiến triển. */
export const HINT_ESCALATE_MS = 20000;
/** Safety net: tự hoàn thành pha sau ngần này ms không tiến triển. */
export const SAFETY_NET_MS = 35000;
/** Ranh giới trời/da theo % chiều cao scene (3:2 → 60%). */
export const SKY_RATIO = 60;
/** Số nốt mụn đầu trắng trong PressPhase (5 spots cố định). */
export const PRESS_SPOT_COUNT = 5;
/** Số chấm mụn đầu đen trong DragPhase (7 cột × 4 hàng). */
export const DRAG_DOT_COUNT = 28;
