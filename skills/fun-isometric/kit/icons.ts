// The fun-isometric set: everyday product icons drawn as slabs, each moving on one preset.
import { VIEWS, arc, ellipse, line, onFace, pill, poly, rect, ring, spark, star, view } from './fun'
import { EASY, SNAP, bob, bounce, clasp, deal, drift, erase, fall, flicker, float, glint, hop, impact, jolt, latch, look, press, shackle, slide, sparkle, springTurn, sway, toss, tossLag, tossLag2, twinkle, twist, wiggle, wobble } from './motions'
import type { Icon, Layer, Motion, Shape, Track, Vec } from './fun'

// colours are palette slots, so draw(..., palette) or play(..., { palette }) recolours the whole set
const LINE = 5
// the house view: faces turned 18 degrees in their plane and leaned back 36, sides falling down left
const { tilt: FACE, extrude: EXT } = VIEWS.right

// a white sparkle riding a parent, popped by whatever motion it is given
const glow = (parent: string, p: Vec, r: number, m: Motion | ReadonlyArray<Motion>, extra: { ip?: number; op?: number } = {}): Layer => ({
  parent,
  a: p,
  p,
  m,
  ...extra,
  shapes: [{ d: spark(p[0], p[1], r), fill: 'white' }],
})

// grows or shrinks a path of plain x y pairs about a point, for rims and insets
const inset = (d: string, k: number, [cx, cy]: Vec) =>
  d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, x: string, y: string) => `${+(cx + (+x - cx) * k).toFixed(2)} ${+(cy + (+y - cy) * k).toFixed(2)}`)

export const folder: Icon = {
  name: 'folder',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { parent: 'body', shapes: [{ d: poly([[-130, -100], [-56, -100], [-34, -76], [130, -76], [130, 92], [-130, 92]], [18, 8, 8, 18, 18, 18]), fill: 'main', depth: 1 }] },
    {
      parent: 'body',
      a: [-108, 50],
      p: [-108, 50],
      m: tossLag2,
      shapes: [{ d: rect(-104, -136, 206, 192, 12), fill: 'white', depth: 0.3 }, { d: line([-78, -118], [8, -118]) }],
    },
    { parent: 'body', a: [-116, 52], p: [-116, 52], m: tossLag, shapes: [{ d: rect(-116, -104, 226, 164, 12), fill: 'ok', depth: 0.3 }] },
    {
      id: 'body',
      a: [-130, 20],
      p: [126, 294],
      tilt: FACE,
      m: toss,
      shapes: [{ d: rect(-130, -46, 260, 138, 18), fill: 'deep', depth: 1 }, { d: pill(-46, -12, 92, 28), fill: 'white', depth: 0.3 }],
    },
  ],
}

const HEART = 'M0 92C-24 74 -132 8 -132 -48C-132 -94 -98 -122 -62 -122C-34 -122 -12 -106 0 -84C12 -106 34 -122 62 -122C98 -122 132 -94 132 -48C132 8 24 74 0 92Z'

export const heart: Icon = {
  name: 'heart',
  frames: 123,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'heart', p: [250, 262], m: hop, shapes: [] },
    { parent: 'heart', tilt: [-14, 30], shapes: [{ d: HEART, fill: 'hot', depth: 1, edges: [[0, 92]] }, { d: inset(HEART, 0.7, [0, -22]) }] },
    glow('heart', [128, -112], 30, twinkle(0, true), { op: 30 }),
    glow('heart', [128, -112], 30, twinkle(48), { ip: 48 }),
    glow('heart', [-150, 10], 18, twinkle(4, true), { op: 34 }),
    glow('heart', [-150, 10], 18, twinkle(54), { ip: 54 }),
  ],
}

const COIN = (cx: number, cy: number) => ellipse(cx, cy, 112, 80)

export const coins: Icon = {
  name: 'coins',
  frames: 180,
  line: LINE,
  extrude: [-2, 18],
  layers: [
    { p: [252, 352], r: -10, shapes: [{ d: COIN(0, 0), fill: 'gold', depth: 1 }] },
    { p: [246, 318], r: -10, shapes: [{ d: COIN(0, 0), fill: 'gold', depth: 1 }] },
    {
      id: 'coin',
      p: [240, 278],
      r: -10,
      m: bounce,
      shapes: [{ d: COIN(0, 0), fill: 'gold', depth: 1 }, { d: ellipse(0, 0, 86, 58) }, { d: star(0, 2, 40, 0.46, 5, 4), fill: 'ink', line: false }],
    },
    glow('coin', [96, -66], 26, glint(2, 98)),
    glow('coin', [-104, -48], 26, glint(6, 122)),
    glow('coin', [-26, 70], 22, glint(12, 107)),
    glow('coin', [92, -70], 28, glint(65, 125)),
  ],
}

// a bell seen from a little above: dome, flared skirt, and a lip whose front curves down
const BELL = 'M-96 40C-94 -20 -80 -96 0 -98C80 -96 94 -20 96 40C108 46 120 54 122 66Q0 96 -122 66C-120 54 -108 46 -96 40Z'
const LIP = 'M-122 66Q0 96 122 66A9 9 0 0 1 124 84Q0 116 -124 84A9 9 0 0 1 -122 66Z'

export const bell: Icon = {
  name: 'bell',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { parent: 'bell', a: [0, 80], p: [0, 80], m: { ...wiggle, at: 6, k: 0.8 }, shapes: [{ d: ellipse(0, 112, 24), fill: 'hot', depth: 0.8 }] },
    {
      id: 'bell',
      a: [0, -112],
      p: [250, 136],
      r: -8,
      m: wiggle,
      shapes: [
        { d: ring(0, -116, 22, 9), fill: 'gold', depth: 0.6 },
        { d: BELL, fill: 'gold', depth: 1 },
        { d: LIP, fill: 'gold', depth: 1 },
      ],
    },
  ],
}

const BADGE = onFace(FACE, [100, 82])

export const calendar: Icon = {
  name: 'calendar',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'cal', p: [244, 262], m: jolt(), shapes: [] },
    {
      parent: 'cal',
      tilt: FACE,
      shapes: [
        { d: rect(-122, -104, 244, 214, 26), fill: 'white', depth: 1 },
        { d: poly([[-122, -104], [122, -104], [122, -44], [-122, -44]], [26, 26, 0, 0]), fill: 'hot' },
        ...[-1, 1].map((s): Shape => ({ d: pill(s * 60 - 13, -128, 26, 50), fill: 'grey', depth: 0.5 })),
        ...[0, 1, 2, 3].flatMap((c) => [0, 1].map((r): Shape => ({ d: rect(-96 + c * 50, -22 + r * 52, 34, 34, 9), ...(c === 1 && r === 1 ? { fill: 'ok' } : {}) }))),
      ],
    },
    {
      parent: 'cal',
      a: BADGE,
      p: BADGE,
      m: [twinkle(14), twinkle(100, true)],
      shapes: [
        { d: ellipse(BADGE[0], BADGE[1], 40), fill: 'ok', depth: 0.7 },
        { d: line([BADGE[0] - 18, BADGE[1]], [BADGE[0] - 5, BADGE[1] + 13], [BADGE[0] + 20, BADGE[1] - 14]), line: 7 },
      ],
    },
  ],
}

const KEYHOLE = ellipse(0, -4, 17) + poly([[-8, 6], [8, 6], [13, 42], [-13, 42]], 3)
const SHACKLE = 'M-74 -40L-74 -122A74 74 0 0 1 74 -122L74 -40L42 -40L42 -122A42 42 0 0 0 -42 -122L-42 -40Z'

export const padlock: Icon = {
  name: 'padlock',
  frames: 130,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'lock', p: [256, 300], m: clasp, shapes: [] },
    { parent: 'body', a: [-58, -62], p: [-58, -62], m: shackle, shapes: [{ d: SHACKLE, fill: 'grey', depth: 0.7 }] },
    {
      id: 'body',
      parent: 'lock',
      tilt: FACE,
      shapes: [
        { d: rect(-112, -80, 224, 176, 24), fill: 'ok', depth: 1 },
        { d: ellipse(0, 8, 36, 50), fill: 'white', depth: 0.25 },
        { d: KEYHOLE, fill: 'ink', line: false },
      ],
    },
    glow('lock', [-142, -70], 30, twinkle(0, true), { op: 30 }),
    glow('lock', [-142, -70], 30, twinkle(75), { ip: 75 }),
  ],
}

const BOW = 'M0 -80C-18 -126 -86 -136 -76 -98C-70 -80 -30 -80 0 -80ZM0 -80C18 -126 86 -136 76 -98C70 -80 30 -80 0 -80Z'

export const gift: Icon = {
  name: 'gift',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'box', p: [250, 306], m: impact([3, 12]), shapes: [] },
    {
      id: 'crate',
      parent: 'box',
      tilt: FACE,
      // the ribbon carries its own depth, so it wraps down the side
      shapes: [{ d: rect(-112, -40, 224, 136, 16), fill: 'tint', depth: 1 }, { d: rect(-22, -40, 44, 136), fill: 'gold', depth: 1 }],
    },
    {
      parent: 'crate',
      p: [0, -44],
      m: latch([0, 44]),
      shapes: [
        { d: BOW, fill: 'gold', depth: 0.5 },
        { d: rect(-130, -80, 260, 52, 16), fill: 'tint', depth: 0.8 },
        { d: rect(-24, -80, 48, 52), fill: 'gold', depth: 0.8 },
        { d: pill(-20, -96, 40, 30), fill: 'gold', depth: 0.5 },
      ],
    },
    // they swell as the lid lifts and finish after the seam, so at wraps them round the loop
    glow('box', [-128, -128], 24, { ...glint(0, 110), at: 140 }),
    glow('box', [122, -146], 30, { ...glint(0, 120), at: 146 }),
  ],
}

// modelled in 3d, x forward, y to starboard, z up, so the folds keep true proportions; the near wing droops to show its face
const fly = view(50, 30)
const [NOSE, TAIL, KEEL, FAR, NEAR] = [fly([172, 0, 0]), fly([-128, 0, 0]), fly([-104, 0, -112]), fly([-144, 116, 20]), fly([-144, -116, -44])]
// pivot on the middle of its bounds so drift turns it in place
const MID: Vec = [(Math.min(FAR[0], KEEL[0], NEAR[0]) + NOSE[0]) / 2, (NOSE[1] + Math.max(NEAR[1], KEEL[1])) / 2]

export const plane: Icon = {
  name: 'plane',
  frames: 180,
  line: LINE,
  extrude: [-4, 13],
  layers: [
    {
      a: MID,
      p: [256, 250],
      m: drift,
      shapes: [
        { d: poly([NOSE, FAR, TAIL], 3), fill: 'paper', side: 'white', depth: 1 },
        { d: poly([NOSE, TAIL, KEEL], 3), fill: 'grey', side: 'white', depth: 1 },
        { d: poly([NOSE, TAIL, NEAR], 3), fill: 'paper', side: 'white', depth: 1 },
      ],
    },
  ],
}

export const search: Icon = {
  name: 'search',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'lens', p: [222, 226], m: twist, shapes: [] },
    {
      parent: 'lens',
      tilt: [-20, 28],
      shapes: [
        { d: poly([[54, 90], [90, 54], [178, 142], [142, 178]], [0, 0, 24, 24]), fill: 'hot', depth: 1 },
        { d: poly([[48, 93], [93, 48], [113, 68], [68, 113]], 6), fill: 'grey', depth: 1 },
        { d: ellipse(0, 0, 80), fill: 'white' },
        { d: ring(0, 0, 104, 78), fill: 'main', depth: 1 },
        { d: arc(0, 0, 56, 200, 255) },
      ],
    },
    glow('lens', [30, -26], 22, sparkle(20)),
    glow('lens', [-32, 30], 14, sparkle(96)),
  ],
}

const BUBBLE = poly([[-132, -96], [132, -96], [132, 74], [-36, 74], [-96, 120], [-80, 74], [-132, 74]], [30, 30, 30, 4, 6, 4, 30])
const BOT: Vec = [-16, 30]
// it rocks on the bubble's bottom edge, placed so the face sits where it always did
const ROCK = onFace(BOT, [0, 74])

export const chat: Icon = {
  name: 'chat',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'bot', a: ROCK, p: [252 + ROCK[0], 216 + ROCK[1]], m: wobble, shapes: [] },
    {
      id: 'face',
      parent: 'bot',
      tilt: BOT,
      shapes: [
        { d: pill(-8, -150, 16, 60), fill: 'grey', depth: 0.5 },
        { d: ellipse(0, -152, 20), fill: 'gold', depth: 0.6 },
        { d: BUBBLE, fill: 'main', depth: 1 },
        { d: rect(-104, -70, 208, 118, 26), fill: 'tint' },
        { d: arc(0, 4, 30, 25, 155) },
      ],
    },
    { id: 'eyeL', parent: 'face', shapes: [{ d: ellipse(-46, -20, 26, 30), fill: 'white' }] },
    { id: 'eyeR', parent: 'face', shapes: [{ d: ellipse(46, -20, 26, 30), fill: 'white' }] },
    { parent: 'face', clip: 'eyeL', m: { ...look, k: 1.6 }, shapes: [{ d: ellipse(-40, -14, 15), fill: 'ink', line: false }] },
    { parent: 'face', clip: 'eyeR', m: { ...look, k: 1.6 }, shapes: [{ d: ellipse(52, -14, 15), fill: 'ink', line: false }] },
    glow('bot', [150, -118], 26, sparkle(16)),
    glow('bot', [-156, -60], 16, sparkle(92)),
  ],
}

// Devices: each part dealt in on its own beat, then dropped and cut one after another before the loop comes round
const exit = (start: number): Motion => fall([0, 15], start)

export const phone: Icon = {
  name: 'phone',
  frames: 180,
  line: LINE,
  extrude: EXT,
  still: 120,
  layers: [
    {
      p: [236, 270],
      tilt: FACE,
      op: 172,
      m: [deal([-46, 34], -21, 0), exit(144)],
      shapes: [
        ...[-96, -46].map((y): Shape => ({ d: rect(-92, y, 16, 36, 5), fill: 'deep', depth: 0.9 })),
        { d: rect(-84, -146, 168, 292, 30), fill: 'deep', depth: 0.9 },
        { d: rect(-68, -128, 136, 256, 18), fill: 'tint' },
        { d: pill(-20, -140, 40, 8), fill: 'ink', line: false },
      ],
    },
    {
      p: [284, 220],
      tilt: FACE,
      ip: 14,
      op: 176,
      m: [deal([54, 5], 30, 14), exit(148)],
      shapes: [
        { d: rect(-104, -38, 208, 76, 20), fill: 'white', depth: 0.7 },
        { d: ellipse(-62, 0, 20), fill: 'ok' },
        { d: line([-30, -12], [70, -12]) },
        { d: line([-30, 12], [36, 12]) },
      ],
    },
    {
      p: [338, 152],
      tilt: FACE,
      ip: 34,
      op: 180,
      m: [deal([62, 5], 23, 34, true), exit(152)],
      shapes: [
        { d: ellipse(0, 0, 34), fill: 'hot', depth: 0.8 },
        { d: 'M0 13C-4 10 -18 1 -18 -6C-18 -12 -13 -16 -8 -16C-4 -16 -1 -14 0 -11C1 -14 4 -16 8 -16C13 -16 18 -12 18 -6C18 1 4 10 0 13Z', fill: 'white', line: 3 },
      ],
    },
  ],
}

export const toggle: Icon = {
  name: 'toggle',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    {
      id: 'track',
      p: [250, 262],
      tilt: FACE,
      // bob repeats every 160 frames, so it rests 20 frames to fit this 180 frame loop
      m: { ...bob, loop: 180 },
      shapes: [{ d: pill(-134, -58, 268, 116), fill: 'white', depth: 1 }, { d: pill(-114, -38, 228, 76), fill: 'grey' }],
    },
    {
      parent: 'track',
      a: [-114, 0],
      p: [-114, 0],
      m: { s: [[20, [36, 100], [0.8, 0, 0.2, 1]], [80, [100, 100], 0], [120, [100, 100], [0.8, 0, 0.2, 1]], [180, [36, 100]]] },
      shapes: [{ d: pill(-114, -38, 228, 76), fill: 'ok' }],
    },
    { parent: 'track', m: slide([148, 0], 20, 40), shapes: [{ d: ellipse(-74, 0, 48), fill: 'white', depth: 0.8 }, { d: ellipse(-74, 0, 28) }] },
  ],
}

// flame outlines share one command list so they morph point for point
const flame = (lean: number, tip: number, k = 1, dy = 0) => {
  const y = (v: number) => v * k + dy
  return (
    `M0 ${y(110)}C${-70 * k} ${y(110)} ${-104 * k} ${y(60)} ${-100 * k} ${y(6)}C${-96 * k} ${y(-38)} ${(-62 + lean * 0.4) * k} ${y(-62)} ${(-56 + lean) * k} ${y(-108)}` +
    `C${(-22 + lean * 0.6) * k} ${y(-86)} ${-6 * k} ${y(-62)} 0 ${y(-30)}C${16 * k} ${y(-62)} ${(34 + lean) * k} ${y(-94 - tip * 0.3)} ${(26 + lean * 1.4) * k} ${y(-140 - tip)}` +
    `C${(86 + lean) * k} ${y(-100)} ${106 * k} ${y(-40)} ${100 * k} ${y(10)}C${98 * k} ${y(64)} ${66 * k} ${y(110)} 0 ${y(110)}Z`
  )
}

export const streak: Icon = {
  name: 'streak',
  frames: 160,
  line: LINE,
  extrude: [-1, 18],
  layers: [
    {
      id: 'fire',
      p: [250, 262],
      r: -6,
      m: bob,
      shapes: [
        { d: flicker([flame(0, 0), flame(-14, 10), flame(10, -6), flame(-14, 10)]), fill: 'hot', depth: 1 },
        { d: flicker([flame(0, 0, 0.6, 34), flame(12, 14, 0.6, 34), flame(-10, -4, 0.6, 34), flame(12, 14, 0.6, 34)]), fill: 'gold', depth: 0.35 },
        { d: flicker([flame(0, 0, 0.3, 58), flame(-8, 8, 0.3, 58), flame(8, -2, 0.3, 58), flame(-8, 8, 0.3, 58)]), fill: 'white' },
      ],
    },
  ],
}

export const notes: Icon = {
  name: 'notes',
  frames: 180,
  still: 0,
  line: LINE,
  extrude: EXT,
  layers: [
    {
      id: 'pad',
      a: [0, 136],
      p: [250, 374],
      tilt: FACE,
      m: { ...sway, k: 0.8 },
      shapes: [
        { d: rect(-118, -136, 236, 272, 24), fill: 'main', depth: 1 },
        { d: rect(-96, -108, 192, 222, 10), fill: 'white', depth: 0.2 },
        { d: pill(-52, -154, 104, 42), fill: 'grey', depth: 0.6 },
        { d: pill(-20, -140, 40, 12), fill: 'ink', line: false },
        ...[0, 1, 2, 3].map((i): Shape => ({ d: line([-68, -66 + i * 40], [i === 3 ? 10 : 68, -66 + i * 40]), trim: erase(22 - i * 5, 80 + i * 5) })),
      ],
    },
  ],
}

export const play: Icon = {
  name: 'play',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'base', p: [250, 278], tilt: FACE, shapes: [{ d: rect(-132, -118, 264, 236, 48), fill: 'white', depth: 1 }] },
    {
      parent: 'base',
      m: press,
      shapes: [{ d: ellipse(0, -8, 80), fill: 'ok', depth: 1.6 }, { d: poly([[-20, -42], [38, -8], [-20, 26]], 7), fill: 'white' }],
    },
  ],
}

// A loop de loop written across the pad, in face space, sampled densely so the nib can be keyed onto it
const LOOPS = 4
const SCRIBBLE: Array<Vec> = (() => {
  const [from, to] = [-Math.PI / 2, LOOPS * 2 * Math.PI + 0.7]
  const pts = Array.from({ length: 721 }, (_, i): Vec => {
    const t = from + ((to - from) * i) / 720
    const tall = 30 * (1 + 0.14 * Math.sin(t / 2.6))
    const x = 5.6 * t + 15 * Math.sin(t)
    return [x, tall * Math.cos(t) - 0.14 * x]
  })
  const mid = (pts[0][0] + pts[720][0]) / 2
  return pts.map(([x, y]) => [x - mid, y + 4])
})()
// on screen the pad leans, so speed and trims are measured after the tilt
const SEEN = SCRIBBLE.map((p) => onFace(FACE, p))
const RUN = SEEN.reduce<Array<number>>((acc, p, i) => (acc.push(i ? acc[i - 1] + Math.hypot(p[0] - SEEN[i - 1][0], p[1] - SEEN[i - 1][1]) : 0), acc), [])
const [WRITE, DONE, PIECES] = [16, 118, 8]
const frameAt = (s: number) => WRITE + ((DONE - WRITE) * s) / RUN[720]
const nibAt = (s: number): Vec => {
  let i = 1
  while (i < 720 && RUN[i] < s) i++
  const k = (s - RUN[i - 1]) / (RUN[i] - RUN[i - 1] || 1)
  return [+(SEEN[i - 1][0] + (SEEN[i][0] - SEEN[i - 1][0]) * k).toFixed(2), +(SEEN[i - 1][1] + (SEEN[i][1] - SEEN[i - 1][1]) * k).toFixed(2)]
}
// cut into pieces with their own trims, so a trim's end never drifts from the nib on a long path
const CUTS = Array.from({ length: PIECES + 1 }, (_, j) => RUN.findIndex((r) => r >= (RUN[720] * j) / PIECES))
const INK: ReadonlyArray<Shape> = CUTS.slice(0, -1).map((c, j) => ({
  d: line(...SCRIBBLE.slice(c, CUTS[j + 1] + 1)),
  line: 7,
  round: true,
  trim: [[frameAt(RUN[c]), 0], [frameAt(RUN[CUTS[j + 1]]), 1], [178, 1, 0], [179, 0]],
}))
const SHINE = onFace(FACE, [104, -136])
const START = SEEN[0]
const END = SEEN[720]
const LIFT: Vec = [12, -40]
const HOVER: Vec = [START[0] + LIFT[0], START[1] + LIFT[1]]
// the nib rides the line every two frames, rocking a little with each loop
const NIB: Track<Vec> = [
  [0, HOVER, EASY],
  ...Array.from({ length: (DONE - WRITE) / 2 }, (_, i) => [WRITE + i * 2, nibAt((RUN[720] * i * 2) / (DONE - WRITE))] as const),
  [DONE, END, EASY],
  [DONE + 16, [END[0] + LIFT[0], END[1] + LIFT[1]], SNAP, [[-30, -40], [30, -40]]],
  [168, HOVER],
]
const TURN: Track<number> = [
  [0, 36, EASY],
  [WRITE, 30],
  ...Array.from({ length: (DONE - WRITE) / 2 - 1 }, (_, i) => [WRITE + (i + 1) * 2, 30 + 4 * Math.sin(((i + 1) * 2 * LOOPS * 2 * Math.PI) / (DONE - WRITE))] as const),
  [DONE, 30, EASY],
  [DONE + 16, 34, SNAP],
  [168, 36],
]

export const pen: Icon = {
  name: 'pen',
  frames: 180,
  // the finished scribble, pen lifted and the sparkle out
  still: 136,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'desk', p: [224, 322], shapes: [] },
    { parent: 'desk', tilt: FACE, shapes: [{ d: rect(-116, -116, 232, 232, 28), fill: 'tint', depth: 1 }] },
    { parent: 'desk', tilt: FACE, a: [0, 4], p: onFace(FACE, [0, 4]), m: twinkle(148, true), shapes: INK },
    {
      parent: 'desk',
      p: NIB,
      r: TURN,
      shapes: [
        { d: poly([[-21, -196], [21, -196], [21, -86], [-21, -86]], [20, 20, 0, 0]), fill: 'main', depth: 1 },
        { d: rect(-21, -174, 42, 20), fill: 'deep', depth: 1 },
        { d: rect(8, -168, 9, 58, 4.5), fill: 'grey', depth: 0.4 },
        { d: rect(-21, -90, 42, 42, 6), fill: 'deep', depth: 1 },
        { d: poly([[-19, -50], [19, -50], [4, -6], [-4, -6]], [4, 4, 3, 3]), fill: 'white', depth: 0.5 },
        { d: ellipse(0, -6, 5.5), fill: 'ink', line: false },
      ],
    },
    glow('desk', SHINE, 26, [twinkle(DONE + 4), twinkle(150, true)]),
  ],
}

// the flag springs up when the post comes, the letter slides out of the door, both home before the loop
const BOX: Vec = FACE
export const mailbox: Icon = {
  name: 'mailbox',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'mail', a: [0, 150], p: [250, 392], m: jolt([-4, 10]), shapes: [] },
    { parent: 'mail', tilt: BOX, shapes: [{ d: rect(-18, 40, 36, 150, 6), fill: 'grey', depth: 0.8 }] },
    {
      parent: 'box',
      a: [70, 0],
      p: [70, 0],
      m: slide([56, 0], 24, 72, 40),
      shapes: [{ d: rect(30, -40, 96, 62, 6), fill: 'white', depth: 0.25 }, { d: line([44, -24], [78, -6], [112, -24]) }],
    },
    {
      id: 'box',
      parent: 'mail',
      tilt: BOX,
      shapes: [
        { d: poly([[-136, -96], [136, -96], [136, 56], [-136, 56]], [72, 72, 10, 10]), fill: 'deep', depth: 1 },
        { d: poly([[96, -96], [136, -96], [136, 56], [96, 56]], [0, 72, 10, 0]), fill: 'main', depth: 1 },
      ],
    },
    {
      parent: 'box',
      a: [-60, -10],
      p: [-60, -10],
      r: 84,
      m: { r: [...springTurn(-84, 18), [128, -84, SNAP], [168, 0]] },
      shapes: [{ d: rect(-68, -130, 16, 124, 4), fill: 'grey', depth: 0.5 }, { d: rect(-68, -130, 70, 44, 6), fill: 'hot', depth: 0.5 }],
    },
  ],
}

// notes pop off the band on the beat while the set bops
const NOTE = (x: number, y: number): ReadonlyArray<Shape> => [
  { d: poly([[x + 6, y - 54], [x + 34, y - 44], [x + 34, y - 28], [x + 14, y - 34], [x + 14, y], [x + 6, y]], 3), fill: 'gold', depth: 0.4 },
  { d: ellipse(x - 4, y + 2, 16, 13), fill: 'gold', depth: 0.4 },
]
const BAND = 'M-128 28A128 128 0 0 1 128 28L100 28A100 100 0 0 0 -100 28Z'

export const headphones: Icon = {
  name: 'headphones',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'set', a: [0, 120], p: [250, 392], m: wobble, shapes: [] },
    {
      parent: 'set',
      tilt: [-12, 24],
      shapes: [
        { d: BAND, fill: 'deep', depth: 0.8 },
        ...[-1, 1].flatMap((side): Array<Shape> => [
          { d: rect(side * 114 - 36, 4, 72, 126, 30), fill: 'main', depth: 1 },
          { d: rect(side * 114 - 20, 22, 40, 90, 18), fill: 'tint', depth: 0.3 },
        ]),
      ],
    },
    { parent: 'set', a: [150, -110], p: [150, -110], m: [twinkle(20), twinkle(100, true)], shapes: NOTE(150, -110) },
    { parent: 'set', a: [-150, -70], p: [-150, -70], m: [twinkle(60), twinkle(132, true)], shapes: NOTE(-150, -70) },
  ],
}

// one plane leaned back like the calendar, rim in the silhouette, so the side reads as thickness and not a shadow
const CUP = 'M-100 -134L100 -134L100 -108L84 -108C84 -10 48 30 0 34C-48 30 -84 -10 -84 -108L-100 -108Z'

export const trophy: Icon = {
  name: 'trophy',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'cup', p: [250, 266], m: hop, shapes: [] },
    {
      parent: 'cup',
      tilt: FACE,
      shapes: [
        ...[-1, 1].map((side): Shape => ({ d: ring(side * 88, -60, 44, 24), fill: 'gold', depth: 0.6 })),
        { d: CUP, fill: 'gold', depth: 1 },
        { d: line([-84, -108], [84, -108]) },
        { d: star(0, -46, 32, 0.46, 5, 4), fill: 'white' },
        { d: rect(-16, 30, 32, 38), fill: 'gold', depth: 1 },
        { d: rect(-76, 64, 152, 56, 12), fill: 'deep', depth: 1 },
        { d: rect(-42, 81, 84, 22, 6), fill: 'white' },
      ],
    },
    glow('cup', [138, -132], 30, twinkle(0, true), { op: 30 }),
    glow('cup', [138, -132], 30, twinkle(54), { ip: 54 }),
    glow('cup', [-150, 20], 18, twinkle(6, true), { op: 36 }),
    glow('cup', [-150, 20], 18, twinkle(62), { ip: 62 }),
  ],
}

const SHUTTER = onFace(FACE, [92, -104])
const FLASH = onFace(FACE, [-96, -48])

export const camera: Icon = {
  name: 'camera',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'cam', a: [0, 100], p: [250, 366], m: { ...sway, k: 0.6 }, shapes: [] },
    { parent: 'cam', tilt: FACE, shapes: [{ d: rect(-64, -126, 128, 50, 14), fill: 'deep', depth: 0.8 }] },
    { parent: 'cam', a: SHUTTER, p: SHUTTER, m: { ...press, k: 0.35 }, tilt: FACE, shapes: [{ d: pill(70, -118, 46, 28), fill: 'hot', depth: 0.6 }] },
    {
      parent: 'cam',
      tilt: FACE,
      shapes: [
        { d: rect(-146, -90, 292, 192, 32), fill: 'deep', depth: 1 },
        { d: rect(-146, -24, 292, 64), fill: 'tint' },
        { d: rect(-124, -66, 52, 30, 8), fill: 'gold', depth: 0.3 },
        { d: ellipse(20, 8, 82), fill: 'white', depth: 0.6 },
        { d: ring(20, 8, 70, 46), fill: 'main', depth: 0.8 },
        { d: ellipse(20, 8, 46), fill: 'deep' },
        { d: arc(20, 8, 30, 200, 260) },
      ],
    },
    glow('cam', FLASH, 28, glint(36, 120)),
  ],
}

const PIN = 'M0 118C-24 76 -96 22 -96 -42A96 96 0 0 1 96 -42C96 22 24 76 0 118Z'

export const pin: Icon = {
  name: 'pin',
  frames: 180,
  line: LINE,
  extrude: [-3, 16],
  layers: [
    { id: 'drop', a: [0, 118], p: [250, 362], m: { ...hop, at: 20 }, shapes: [] },
    { parent: 'drop', shapes: [{ d: PIN, fill: 'main', depth: 1, edges: [[0, 118]] }, { d: ring(0, -42, 46, 22), fill: 'white', depth: 0.3 }] },
    glow('drop', [104, -128], 26, sparkle(48)),
    glow('drop', [-118, -20], 16, sparkle(110)),
  ],
}

const CLOUD = 'M-112 64A54 54 0 0 1 -116 -38A72 72 0 0 1 20 -76A64 64 0 0 1 124 -18A44 44 0 0 1 112 64Z'

export const cloud: Icon = {
  name: 'cloud',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'sky', p: [250, 270], m: float, shapes: [] },
    { parent: 'sky', tilt: FACE, shapes: [{ d: CLOUD, fill: 'white', depth: 1 }] },
    {
      parent: 'sky',
      tilt: FACE,
      m: slide([0, -40], 30, 50, 50),
      shapes: [{ d: poly([[0, -66], [52, -10], [22, -10], [22, 50], [-22, 50], [-22, -10], [-52, -10]], 6), fill: 'ok', depth: 0.8 }],
    },
  ],
}

const BULB = 'M-44 64L-44 44C-78 22 -96 -8 -96 -48A96 96 0 0 1 96 -48C96 -8 78 22 44 44L44 64Z'

export const bulb: Icon = {
  name: 'bulb',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'lamp', a: [0, 120], p: [250, 372], m: hop, shapes: [] },
    {
      parent: 'lamp',
      tilt: FACE,
      shapes: [
        { d: BULB, fill: 'gold', depth: 1 },
        { d: line([-34, -24], [-17, -46], [0, -24], [17, -46], [34, -24]), round: true },
        { d: line([-34, -24], [-30, 44]) },
        { d: line([34, -24], [30, 44]) },
        { d: arc(0, -48, 70, 196, 246) },
        { d: rect(-50, 60, 100, 28, 9), fill: 'grey', depth: 0.8 },
        { d: rect(-44, 84, 88, 26, 9), fill: 'grey', depth: 0.8 },
        { d: rect(-24, 106, 48, 22, 10), fill: 'deep', depth: 0.6 },
      ],
    },
    glow('lamp', [-126, -132], 26, [twinkle(36), twinkle(120, true)]),
    glow('lamp', [134, -150], 30, [twinkle(42), twinkle(126, true)]),
    glow('lamp', [150, -34], 16, [twinkle(48), twinkle(132, true)]),
  ],
}

// the cells fill one by one, the bolt pops when it is full, then all of it drains before the loop
const CELL = (i: number): Vec => [-86 + i * 52, 0]

export const battery: Icon = {
  name: 'battery',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'cell', p: [244, 262], m: float, shapes: [] },
    {
      id: 'batt',
      parent: 'cell',
      tilt: FACE,
      shapes: [
        { d: rect(116, -28, 26, 56, 8), fill: 'grey', depth: 0.8 },
        { d: rect(-132, -66, 252, 132, 26), fill: 'white', depth: 1 },
        { d: rect(-114, -48, 216, 96, 14), fill: 'paper' },
      ],
    },
    ...[0, 1, 2, 3].map(
      (i): Layer => ({ parent: 'batt', a: CELL(i), p: CELL(i), m: [twinkle(14 + i * 14), twinkle(132 + i * 6, true)], shapes: [{ d: rect(CELL(i)[0] - 22, -38, 44, 76, 8), fill: 'ok', depth: 0.3 }] }),
    ),
    {
      parent: 'batt',
      a: [-6, 0],
      p: [-6, 0],
      m: [twinkle(70), twinkle(124, true)],
      shapes: [{ d: poly([[6, -62], [-34, 8], [-6, 8], [-18, 62], [26, -10], [-2, -10]], 4), fill: 'gold', depth: 0.5 }],
    },
    glow('cell', [150, -96], 24, [twinkle(76), twinkle(128, true)]),
  ],
}

export const ICONS: ReadonlyArray<Icon> = [pen, folder, heart, coins, bell, calendar, padlock, gift, plane, search, chat, phone, toggle, streak, notes, play, mailbox, headphones, trophy, camera, pin, cloud, bulb, battery]
