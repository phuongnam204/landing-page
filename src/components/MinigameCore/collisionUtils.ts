export interface Pt { x: number; y: number }
export interface Box { cx: number; cy: number; halfW: number; halfH: number }

/** True nếu `p` nằm trong bán kính `radius` quanh `center` (đơn vị %). */
export function withinRadius(center: Pt, p: Pt, radius: number): boolean {
  return Math.hypot(center.x - p.x, center.y - p.y) <= radius;
}

/** True nếu `p` nằm trong hình chữ nhật `box` (tâm + nửa cạnh, đơn vị %). */
export function withinBox(p: Pt, box: Box): boolean {
  return Math.abs(p.x - box.cx) <= box.halfW && Math.abs(p.y - box.cy) <= box.halfH;
}
