import { describe, expect, it } from 'vitest'
import { demoPolygon, measurePolygon, provinceCenters, validatePolygon, type Point } from './geometry'

/** A square roughly 1 km on each side, near the Đồng Tháp reference point. */
const square: Point[] = [
  [105.73, 10.61],
  [105.739, 10.61],
  [105.739, 10.619],
  [105.73, 10.619],
]

describe('measurePolygon', () => {
  it('reports nothing for a shape with fewer than three vertices', () => {
    expect(measurePolygon([])).toEqual({ area: 0, perimeter: 0 })
    expect(measurePolygon([square[0], square[1]])).toEqual({ area: 0, perimeter: 0 })
  })

  it('measures a square to its expected hectares and perimeter', () => {
    const { area, perimeter } = measurePolygon(square)
    // ~0.009° of latitude and longitude near the equator is ~1 km a side,
    // so ~100 ha enclosed by a ~4 km boundary.
    expect(area).toBeCloseTo(98.0, 1)
    expect(perimeter).toBeCloseTo(3960, -2)
  })

  it('gives the same area whichever way the ring is wound', () => {
    const clockwise = [...square].reverse()
    expect(measurePolygon(clockwise).area).toBeCloseTo(measurePolygon(square).area, 6)
  })
})

describe('validatePolygon', () => {
  it('accepts a simple square', () => {
    expect(validatePolygon(square)).toBeNull()
  })

  it('accepts the generated demo polygon for every province centre', () => {
    for (const [province, [longitude, latitude]] of Object.entries(provinceCenters)) {
      expect(validatePolygon(demoPolygon(longitude, latitude)), province).toBeNull()
    }
  })

  it('rejects a shape with too few vertices', () => {
    expect(validatePolygon([square[0], square[1]])).toMatch(/ít nhất 3 đỉnh/)
  })

  it('rejects a duplicated vertex', () => {
    expect(validatePolygon([...square, square[0]])).toMatch(/trùng/)
  })

  it('rejects a self-crossing bowtie', () => {
    const bowtie: Point[] = [
      [105.73, 10.61],
      [105.739, 10.619],
      [105.739, 10.61],
      [105.73, 10.619],
    ]
    expect(validatePolygon(bowtie)).toMatch(/tự cắt/)
  })

  it('rejects vertices that sit on one line', () => {
    const collinear: Point[] = [
      [105.73, 10.61],
      [105.735, 10.61],
      [105.739, 10.61],
    ]
    expect(validatePolygon(collinear)).toMatch(/Diện tích quá nhỏ/)
  })

  it('rejects a well-formed but microscopic plot', () => {
    const tiny: Point[] = [
      [105.73, 10.61],
      [105.730001, 10.61],
      [105.730001, 10.610001],
    ]
    expect(validatePolygon(tiny)).toMatch(/Diện tích quá nhỏ/)
  })
})

describe('demoPolygon', () => {
  it('centres the generated plot on the given point', () => {
    const points = demoPolygon(105.73, 10.61)
    const longitudes = points.map((point) => point[0])
    expect(Math.min(...longitudes)).toBeLessThan(105.73)
    expect(Math.max(...longitudes)).toBeGreaterThan(105.73)
    expect(points).toHaveLength(4)
  })
})
