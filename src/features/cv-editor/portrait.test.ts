import { describe, expect, it } from 'vitest'
import { centeredPortrait, movePortrait, portraitCrop } from './portrait'

describe('portrait framing', () => {
  it('centers landscape, portrait and existing square sources without zoom', () => {
    expect(portraitCrop(900, 300, centeredPortrait)).toEqual({
      left: 300,
      top: 0,
      size: 300,
    })
    expect(portraitCrop(300, 900, centeredPortrait)).toEqual({
      left: 0,
      top: 300,
      size: 300,
    })
    expect(portraitCrop(512, 512, centeredPortrait)).toEqual({
      left: 0,
      top: 0,
      size: 512,
    })
  })

  it('keeps the crop inside every source at all position and zoom limits', () => {
    for (const [width, height] of [
      [900, 300],
      [300, 900],
      [512, 512],
      [1, 1536],
    ]) {
      for (const zoom of [1, 2, 4]) {
        for (const x of [0, 0.5, 1]) {
          for (const y of [0, 0.5, 1]) {
            const crop = portraitCrop(width!, height!, { x, y, zoom })
            expect(crop.size).toBeGreaterThan(0)
            expect(crop.left).toBeGreaterThanOrEqual(0)
            expect(crop.top).toBeGreaterThanOrEqual(0)
            expect(crop.left + crop.size).toBeLessThanOrEqual(width!)
            expect(crop.top + crop.size).toBeLessThanOrEqual(height!)
          }
        }
      }
    }
  })

  it('moves with the drag, clamps edges and leaves a fully filled axis unchanged', () => {
    expect(movePortrait(900, 300, centeredPortrait, 900, -900)).toEqual({
      x: 0,
      y: 0.5,
      zoom: 1,
    })
    expect(movePortrait(900, 300, centeredPortrait, -900, 900)).toEqual({
      x: 1,
      y: 0.5,
      zoom: 1,
    })
    expect(movePortrait(512, 512, centeredPortrait, 20, 30)).toEqual(
      centeredPortrait,
    )
    expect(
      movePortrait(512, 512, { x: 0.5, y: 0.5, zoom: 2 }, 128, -128),
    ).toEqual({ x: 0, y: 1, zoom: 2 })
  })
})
