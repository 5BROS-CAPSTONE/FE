export type Point = [longitude: number, latitude: number]

export const provinceCenters: Record<string, Point> = {
  'Hà Nội': [105.728, 21.193],
  'Đồng Tháp': [105.733, 10.611],
  'An Giang': [105.082, 10.387],
  'Bắc Ninh': [106.105, 21.183],
  'Long An': [106.198, 10.572],
  Khác: [105.85, 16.05],
}

export const provinces = Object.keys(provinceCenters)

export function demoPolygon(longitude: number, latitude: number, width = 0.0026, height = 0.0019): Point[] {
  return [
    [longitude - width / 2, latitude - height / 2],
    [longitude + width / 2, latitude - height / 2],
    [longitude + width * 0.6, latitude + height / 2],
    [longitude - width * 0.35, latitude + height * 0.55],
  ]
}

export function measurePolygon(points: Point[]) {
  if (points.length < 3) return { area: 0, perimeter: 0 }
  const latitude = points.reduce((sum, point) => sum + point[1], 0) / points.length
  const xScale = 111320 * Math.cos((latitude * Math.PI) / 180)
  const yScale = 110574
  let twiceArea = 0
  let perimeter = 0
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length]
    twiceArea += point[0] * xScale * next[1] * yScale - next[0] * xScale * point[1] * yScale
    perimeter += Math.hypot((point[0] - next[0]) * xScale, (point[1] - next[1]) * yScale)
  })
  return { area: Math.abs(twiceArea) / 20000, perimeter }
}

function segmentsCross(a: Point, b: Point, c: Point, d: Point) {
  const turn = (p: Point, q: Point, r: Point) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
  return turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0
}

export function validatePolygon(points: Point[]): string | null {
  if (points.length < 3) return 'Cần vẽ ít nhất 3 đỉnh khác nhau.'
  if (new Set(points.map((point) => point.join(','))).size !== points.length) return 'Có đỉnh bị trùng.'
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue
      if (segmentsCross(points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length])) {
        return 'Đường ranh tự cắt. Hãy vẽ lại đa giác.'
      }
    }
  }
  if (measurePolygon(points).area < 0.001) return 'Diện tích quá nhỏ hoặc các đỉnh nằm trên một đường.'
  return null
}

export const formatArea = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })
