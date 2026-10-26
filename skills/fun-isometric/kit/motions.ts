// The sticker motion presets, as After Effects keys. Deltas over a rest pose, px on a 500 canvas, 60fps.
import { shift } from './fun'
import type { Ease, Motion, Track, Vec } from './fun'

// The eases every preset is built from
export const EASY: Ease = [0.333, 0, 0.667, 1] // AE easy ease: sways, floats, wiggles, every half swing of a spring
export const POP: Ease = [0.75, 0, 0.25, 1] // stars popping, slow returns
export const SNAP: Ease = [0.8, 0, 0.2, 1] // a part travelling from one slot to another
export const OUT: Ease = [0, 0, 0, 1] // dealt in, all speed up front
export const SOFT: Ease = [0.2, 0, 0, 1] // a latch springing open
export const IN: Ease = [1, 0, 0.8, 1] // a latch slamming shut
export const DROP: Ease = [1, 0, 1, 1] // falling away

const SPRING: ReadonlyArray<Ease> = [
  [0.17, 0.17, 0.55, 1],
  [0.35, 0, 0.62, 1],
  [0.31, 0, 0.67, 1],
  [0.31, 0, 0.64, 1],
  [0.3, 0, 0.64, 1],
  [0.24, 0, 0.57, 1],
]
const REACH = [1.448, 0.778, 1.11, 0.95, 1.012, 1]
const GAPS = [13, 16, 16, 15, 15, 16]

/** The baked spring behind jolt, impact and the settles: overshoot to 1.448 of the travel, swings halving, 91 frames to rest. */
export function spring(to: Vec, start = 0, pace = 1, from: Vec = [0, 0]): Track<Vec> {
  let t = start
  const keys: Array<readonly [number, Vec, Ease | 0]> = [[t, from, SPRING[0]]]
  REACH.forEach((k, i) => {
    t += Math.round(GAPS[i] * pace)
    keys.push([t, [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k], SPRING[i + 1] ?? 0])
  })
  return keys
}
export function springTurn(to: number, start = 0, pace = 1, from = 0): Track<number> {
  return spring([to, 0], start, pace, [from, 0]).map(([t, v, e]) => [t, v[0], e] as const)
}

// Whole object presets

/** Containers spilling contents: winds up 20 degrees, whips past to 22, lands hard and stays still. Pivot on the edge it swings from. */
export const toss: Motion = {
  r: [[0, 0, [0.572, 0, 0.348, 1.001]], [22, -19.9, [0.879, 0, 0.746, 1]], [41, 21.8, [0.092, 0, 0, 1]], [86, 0]],
  // it travels on arcs, not lines: these are its spatial tangents
  p: [
    [0, [0, 0], [0.57, 0, 0.35, 1], [[-1.23, -6.42], [5.77, 1.42]]],
    [22, [-8.5, -11.5], [0.88, 0, 0.75, 1], [[10.73, 10.33], [2.46, -13.42]]],
    [41, [-3.63, 22.63], [0.09, 0, 0, 1], [[6.23, -16.52], [1.54, 6.58]]],
    [86, [0, 0]],
  ],
}
/** What rides inside a toss: the near one barely, the far one swings wide and slides. */
export const tossLag: Motion = { r: [[0, 0, [0.57, 0, 0.35, 1]], [22, 9, [0.88, 0, 0.75, 1]], [41, -2, [0.09, 0, 0, 1]], [86, 0]] }
export const tossLag2: Motion = {
  r: [[0, 0, [0.57, 0, 0.35, 1]], [22, 15.5, [0.88, 0, 0.75, 1]], [41, -11.3, [0.09, 0, 0, 1]], [86, 0]],
  p: [[0, [0, 0], [0.57, 0, 0.35, 1]], [22, [9.4, 3.4], [0.88, 0, 0.75, 1]], [41, [0, 0]]],
}

/** Badges and hearts: rises tilting 9 degrees, slams through rest, rebounds twice. */
export const hop: Motion = {
  r: [[0, 0, [0.44, 0, 0.42, 1]], [36, 9, [0.42, 0, 0.44, 1]], [54, -4, [0.59, 0, 0.66, 1]], [72, 2, [0.37, 0, 0.51, 1]], [94, 0]],
  p: [[0, [0, 0], [0.64, 0, 0.47, 1]], [36, [7, -24.25], [0.59, 0, 0.52, 1]], [54, [-7.25, 23.25], [0.24, 0, 0.16, 1]], [88, [0, 0]]],
}

/** Coins and tokens: springs up and right to a raised spot, holds, then drops back through rest and springs home. */
export const bounce: Motion = {
  p: [
    [0, [0, 0], EASY], [11, [11.24, -14.24], EASY], [24, [6.02, -7.63], EASY], [37, [8.6, -10.9], EASY], [49, [7.35, -9.32], EASY],
    [62, [7.87, -9.97], EASY], [79, [7.19, -8.98], EASY], [93, [-3.48, 4.4], EASY], [110, [1.74, -2.21], EASY], [126, [-0.84, 1.06], EASY],
    [142, [0.41, -0.52], EASY], [158, [-0.11, 0.13], EASY], [175, [0, 0]],
  ],
  s: [[0, [100, 100], [0.47, 0, 0.33, 1]], [11, [103, 103], [0.45, 0, 0.69, 1]], [31, [100, 100]]],
}

/** Bells and hands: rocks back 20 degrees, taps twice and settles, sliding 12px on the second beat. */
export const wiggle: Motion = {
  r: [[0, 0, EASY], [46, 20, EASY], [71, 11, EASY], [100, 19, EASY], [124, -3, EASY], [148, 5, EASY], [177, 0]],
  p: [[46, [0, 0], [0.2, 0, 0, 1]], [71, [11.8, 0], [0.2, 0, 0.67, 1]], [100, [0, 0]]],
}

/** Cards and warnings: kicked along v with the spring, holds, eases home. */
export const jolt = (v: Vec = [-7.86, 13.25]): Motion => ({ p: [...spring(v, 2), [98, v, [0.65, 0, 0.35, 1]], [141, [0, 0]]] })

/** A body under a lid: takes the hit on frame 24, springs, holds, eases back as the lid lifts. */
export const impact = (v: Vec = [8.7, 15.3]): Motion => ({ p: [...spring(v, 24, 0.92), [119, v, POP], [176, [0, 0]]] })
/** A lid or cap: slams along v on an ease in, sits, pops back sharp at the end. */
export const latch = (v: Vec = [11.5, 21.3]): Motion => ({ p: [[0, [0, 0], IN], [30, v, 0], [146, v, SOFT], [176, [0, 0]]] })

/** Locks and clips: lifts up and left as the shackle springs open, hangs, then slams down right and settles. 130 frame loop. */
export const clasp: Motion = {
  p: [[10, [0, 0], [0.31, 0, 0.12, 1]], [48, [-8.13, -12.37], 0], [61, [-8.13, -12.37], [0.83, 0, 0.49, 1]], [85, [9.75, 14.12], [0.46, 0, 0.33, 1]], [112, [0, 0]]],
}
/** The shackle on the clasp's beat: swung open 33 degrees on a soft pop, back on a slam. Pivot on the leg that stays in. */
export const shackle: Motion = {
  p: [[8, [0, 0], SOFT], [38, [-6, -16], 0], [54, [-6, -16], IN], [84, [0, 0]]],
  r: [[8, 0, SOFT], [38, -33, 0], [54, -33, IN], [84, 0]],
}

/** Faces and mascots: dips and rocks a few degrees, never quite still. */
export const wobble: Motion = {
  r: [[0, 0, [0.73, 0, 0.46, 1]], [28, -3.04, [0.59, 0, 0.66, 0.86]], [54, 2.03, [0.36, -0.33, 0.67, 1.01]], [77, 0, [0.52, -0.02, 0.66, 1]], [95, 2.02, [0.47, 0, 0.11, 1]], [128, -1.1, [0.58, 0, 0.56, 1]], [168, 0]],
  p: [[0, [0, 0], [0.62, 0, 0.31, 1]], [35, [0, 17.5], [0.33, 0, 0.85, 0.63]], [84, [0, -0.15], [0.57, 0.91, 0.57, 1]], [108, [0, -13.9], [0.33, 0, 0.4, 1]], [168, [0, 0]]],
}

/** Things that fly: a lazy figure of eight with a slow bank, x and y on their own beats. */
export const drift: ReadonlyArray<Motion> = [
  { r: [[0, 0, [0.6, 0, 0.58, 1]], [48, 3.12, [0.68, 0, 0.44, 0.37]], [110, 6.97, [0.34, 0, 0.3, 1]], [156, 0]] },
  { p: [[0, [0, 0], EASY], [44, [28.5, 0], [0.33, 0, 0.68, 0.75]], [76, [-28.09, 0], [0.33, 2.85, 0.72, 2.83]], [106, [-33, 0], [0.34, 0.26, 0.64, 0.71]], [135, [7.64, 0], [0.27, -1.41, 0.48, 1]], [170, [0, 0]]] },
  { p: [[0, [0, 0], EASY], [34, [0, -20.07], EASY], [82, [0, -7.42], EASY], [122, [0, -25.55], [0.33, 0, 0.43, 1]], [167, [0, 0]]] },
]

/** Keys and tools: turns home sharp, then a slow 17 degree twist out and back, floating 13px. */
export const twist: Motion = {
  r: [[0, -7, [0.17, 0, 0, 1]], [30, 0, SNAP], [90, -17.27, [0.8, 0, 0, 1]], [150, 0, SNAP], [180, -7]],
  p: [[0, [0, 0], EASY], [90, [8, -10], EASY], [180, [0, 0]]],
}

/** A body reacting to a hit: nudged down and right, eases back. */
export const nudge: Motion = {
  p: [[0, [0, 0], [0.33, 0, 0.07, 1]], [48, [8.88, 9.85], [0.24, 0, 0.67, 0.28]], [68, [8.56, 9.38], [0.52, 0.1, 0.25, 1]], [114, [0, 0]]],
}
/** A small part flicking out and back, a tongue or a tab. */
export const flick: Motion = { r: [[31, 0, [0.24, 0, 0.58, 1]], [47, 10, [0.3, 0, 0.64, 0.96]], [62, -7.05, [0.2, -0.46, 0.83, 1]], [95, 0]] }

/** Buttons and keys: pushed 23px into its base with a hint of overshoot, back, then pops 13px proud and settles. Give it a still base to sink into. */
export const press: Motion = {
  p: [[0, [0, 0], [0.37, 0, 0.33, 1.31]], [34, [0, 22.69], [0.4, 0.2, 0.09, 1]], [69, [0, 0], 0], [76, [0, 0], [0.46, 0, 0.34, 1]], [114, [0, -13], [0.38, 0, 0.61, 1]], [145, [0, 0]]],
  x: [[0, 0, [0.37, 0, 0.33, 1.3]], [35, -6.2, [0.4, 0.18, 0.09, 1]], [70, 0, 0], [78, 0, [0.46, 0, 0.3, 1]], [112, 3.2, [0.39, 0, 0.62, 1]], [143, 0]],
}

/** Pupils: a glance up left, a dart down right, home. */
export const look: Motion = {
  p: [[0, [0, 0], [0.46, 0, 0, 1], [[0, 0], [3.5, 2.62]]], [42, [-4.5, -9], [0.49, 0, 0, 1], [[2.69, 1.44], [0, 0]]], [82, [3, 3], [0.58, 0, 0.18, 1]], [123, [0, 0]]],
}

// Ambient

/** Idle: a 5 degree lean and back over 3 seconds. Use k to tune, at to put parts out of phase. */
export const sway: Motion = { r: [[0, 0, EASY], [90, -5, EASY], [180, 0]], loop: 180 }
/** Idle: 10px down and up over 3 seconds; neighbours sit 20 frames apart. */
export const float: Motion = { p: [[0, [0, 0], EASY], [90, [0, 10], EASY], [180, [0, 0]]], loop: 180 }
/** Idle: a smaller bob with a sideways lean, 160 frame period. */
export const bob: Motion = { p: [[0, [0, 0], EASY], [80, [-1.5, 5], EASY], [160, [0, 0]]], loop: 160 }

// Builders

/** Scenes: dealt in from off to rest in 60 frames, all speed up front, swooping in level. Stagger parts 14 to 20 frames. */
export const deal = (from: Vec, turn: number, start = 0, grow = false): Motion => ({
  p: shift<Vec>([[0, from, OUT, [[0, 0], [from[0] * 0.6, 0]]], [60, [0, 0]]], start),
  r: shift([[0, turn, OUT], [60, 0]], start),
  ...(grow ? { s: shift<Vec>([[0, [85, 85], SNAP], [60, [100, 100]]], start) } : {}),
})
/** Falls away on an ease in, 28 frames: clears a scene before it loops. */
export const fall = (to: Vec, start: number, len = 28): Motion => ({ p: [[start, [0, 0], DROP], [start + len, to]] })
/** Toggles and tiles: one part to another slot over 60 frames on SNAP, holds, comes home. */
export const slide = (to: Vec, start: number, hold = 60, len = 60): Motion => ({
  p: [[start, [0, 0], SNAP], [start + len, to, 0], [start + len + hold, to, SNAP], [start + len * 2 + hold, [0, 0]]],
})

/** Glare: swells out of nothing on a slow start, eases to 80%, shrinks away, drifting up and right. 71 frames. */
export const glint = (start: number, size = 100): Motion => ({
  s: shift<Vec>([[0, [0, 0], [1, 0, 0.76, 1]], [30, [size, size], [0.31, 0, 0.23, 1]], [54, [size * 0.8, size * 0.8], [0.17, 0, 0.83, 1]], [71, [0, 0]]], start),
  p: shift<Vec>([[0, [0, 0], [0.9, 0, 0.83, 0.83]], [30, [7.5, -4.8]]], start),
})
/** Star: pops to 110 and settles in 30 frames; out reverses it. */
export const twinkle = (start: number, out = false): Motion => ({
  s: shift<Vec>(out ? [[0, [100, 100], POP], [10, [110, 110], POP], [30, [0, 0]]] : [[0, [0, 0], POP], [10, [110, 110], POP], [30, [100, 100]]], start),
})
/** Sparkle: grows and turns 46 degrees fast, then shrinks back on an ease in, 84 frames. */
export const sparkle = (start: number): Motion => ({
  s: shift<Vec>([[0, [0, 0], [0.13, 0, 0, 1]], [42, [100, 100], [1, 0, 0.81, 1]], [84, [0, 0]]], start),
  r: shift([[0, 0, [0.13, 0, 0, 1]], [42, 45.89, [1, 0, 0.81, 1]], [84, 0]], start),
})
/** Text lines: erased in 15 frames, staggered 5 apart, drawn back on a slow start. For a shape's trim. */
export const erase = (start: number, back: number): Track<number> => [[start, 1, [0.3, 0, 0.1, 1]], [start + 15, 0, 0], [back, 0, [0.9, 0, 0.7, 1]], [back + 15, 1]]
/** Flames: steps between drawn shapes every 40 frames, snapping out of each. For a shape's d. */
export const flicker = (shapes: ReadonlyArray<string>, gap = 40): Track<string> => [...shapes, shapes[0]].map((d, i) => [i * gap, d, [0.33, 0, 0, 1]] as const)
