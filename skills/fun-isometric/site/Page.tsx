import './fun.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ACCENTS, RISO, VIEWS, brand, clock, ellipse, hue, mono, pill, rect, spark } from '../kit/fun'
import { ICONS, chat, gift, piggy, trophy } from '../kit/icons'
import { bounce, clasp, deal, drift, float, hop, jolt, latch, press, slide, sway, toss, twist, wiggle, wobble } from '../kit/motions'
import { Sticker } from '../kit/Sticker'
import type { CSSProperties, ReactNode } from 'react'
import type { Icon, Motion, Palette, View } from '../kit/fun'

const REPO = 'https://github.com/kelvinkn17/skills'
const HERO_COMMAND = '/fun-isometric a piggy bank that wobbles when a coin drops in'

// the presets each sticker moves on, shown under it in the wall
const MOVES: Record<string, string> = {
  folder: 'toss',
  heart: 'hop, twinkle',
  coins: 'bounce, glint',
  bell: 'wiggle',
  calendar: 'jolt, twinkle',
  padlock: 'clasp, shackle',
  gift: 'latch, impact',
  plane: 'drift',
  search: 'twist, sparkle',
  chat: 'wobble, look',
  phone: 'deal, fall',
  toggle: 'slide, bob',
  streak: 'flicker, bob',
  notes: 'erase, sway',
  play: 'press',
  piggy: 'nudge, fall',
  mailbox: 'jolt, spring',
  headphones: 'wobble, twinkle',
  trophy: 'hop, twinkle',
  camera: 'press, glint',
  pin: 'hop, sparkle',
  cloud: 'float, slide',
  bulb: 'hop, twinkle',
  battery: 'float, twinkle',
}

const INSTALLS: Array<[string, string, string]> = [
  ['With npx', 'npx skills add kelvinkn17/skills --skill fun-isometric', 'Installs into Claude Code or any agent that reads skills. Then ask for /fun-isometric.'],
  ['As a Claude Code plugin', '/plugin marketplace add kelvinkn17/skills\n/plugin install fun-isometric@kelvinkn17-skills', 'It shows up as /fun-isometric:fun-isometric.'],
]

function useCopy() {
  const [copied, setCopied] = useState('')
  const copy = (text: string) =>
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied(''), 1600)
    })
  return [copied, copy] as const
}

const SPEEDS = [1, 0.5, 0.25]

function Controls() {
  const [speed, setSpeed] = useState(clock.speed)
  const [paused, setPaused] = useState(clock.paused)
  const scrub = useRef<HTMLInputElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const f = Math.floor(((clock.frame % 180) + 180) % 180)
      if (scrub.current && document.activeElement !== scrub.current) scrub.current.value = String(f)
      if (label.current) label.current.textContent = String(f).padStart(3, '0')
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const pause = (next: boolean) => {
    clock.paused = next
    setPaused(next)
  }
  return (
    <div className="fi-controls">
      <div className="fi-seg" role="group" aria-label="Speed">
        {SPEEDS.map((s) => (
          <button key={s} type="button" aria-pressed={speed === s} onClick={() => ((clock.speed = s), setSpeed(s))}>
            {s === 1 ? '1x' : s === 0.5 ? '½x' : '¼x'}
          </button>
        ))}
      </div>
      <button type="button" className="fi-btn" aria-pressed={paused} onClick={() => pause(!paused)}>
        {paused ? 'Play' : 'Pause'}
      </button>
      <label className="fi-scrub">
        <span className="fi-frame">
          Frame <span ref={label}>000</span>
        </span>
        <input
          ref={scrub}
          type="range"
          min={0}
          max={179}
          step={1}
          defaultValue={0}
          aria-label="Frame"
          onInput={(e) => {
            pause(true)
            clock.frame = Number(e.currentTarget.value)
          }}
        />
      </label>
    </div>
  )
}

// The generator: everything the skill takes, picked by eye, written out as the command to paste

type Tone = { kind: 'riso' } | { kind: 'brand' | 'mono'; hex: string } | { kind: 'hue'; deg: number }

const paletteOf = (t: Tone): Palette | undefined =>
  t.kind === 'brand' ? brand(t.hex) : t.kind === 'mono' ? mono(t.hex) : t.kind === 'hue' ? hue(t.deg) : undefined

const TONES: Array<[Tone['kind'], string]> = [
  ['riso', 'Riso'],
  ['brand', 'Brand'],
  ['mono', 'One colour'],
  ['hue', 'Hue shift'],
]

const FACING: Array<[View, string, string]> = [
  ['right', 'Top right', 'facing top right'],
  ['left', 'Top left', 'facing top left'],
  ['front', 'Front', 'facing front'],
  ['flat', 'Flat', 'lying flat'],
]

// each preset with what it does and what it suits, and the keys the preview card moves on
const MOTIONS: Array<[string, string, Motion | ReadonlyArray<Motion>]> = [
  ['auto', 'Auto, picked from what it does', float],
  ['hop', 'hop: rises and slams, badges and hearts', hop],
  ['bounce', 'bounce: springs up and holds, coins', bounce],
  ['toss', 'toss: winds up and whips, wallets and folders', toss],
  ['wiggle', 'wiggle: rocks back and taps, bells and hands', wiggle],
  ['jolt', 'jolt: kicked and springs home, cards', jolt()],
  ['latch', 'latch: a lid slams on, boxes and caps', latch([0, 36])],
  ['clasp', 'clasp: lifts and slams shut, locks', clasp],
  ['wobble', 'wobble: dips and rocks, faces and mascots', wobble],
  ['drift', 'drift: a lazy figure of eight, things that fly', drift],
  ['twist', 'twist: turns out and back, keys and tools', twist],
  ['press', 'press: pushed in, pops proud, buttons', press],
  ['deal', 'deal: dealt in from the side, scenes', deal([-46, 34], -21, 0)],
  ['slide', 'slide: over and back, toggles and tiles', slide([60, 0], 20, 40)],
  ['sway', 'sway: a slow lean, idle', sway],
]

const IDEAS = ['a piggy bank', 'a rocket', 'a mailbox', 'headphones', 'a trophy']

// a card with a header, a coin and a label: enough parts to see which way a face turns
function sample(view: View, m?: Motion | ReadonlyArray<Motion>): Icon {
  const { tilt, extrude } = VIEWS[view]
  return {
    name: `card facing ${view}`,
    frames: 180,
    line: 5,
    extrude,
    layers: [
      { id: 'rig', p: [250, 256], m, shapes: [] },
      {
        parent: 'rig',
        tilt,
        shapes: [
          { d: rect(-118, -104, 236, 208, 30), fill: 'main', depth: 1 },
          { d: rect(-90, -76, 180, 58, 16), fill: 'white', depth: 0.3 },
          { d: ellipse(-52, 44, 30), fill: 'gold', depth: 0.5 },
          { d: pill(-6, 30, 96, 28), fill: 'tint' },
        ],
      },
      { parent: 'rig', shapes: [{ d: spark(150, -120, 24), fill: 'white' }] },
    ],
  }
}
const SAMPLES = Object.fromEntries(FACING.map(([v]) => [v, sample(v)])) as Record<View, Icon>

function Maker({ tone, setTone }: { tone: Tone; setTone: (t: Tone) => void }) {
  const [thing, setThing] = useState('')
  const [motion, setMotion] = useState('auto')
  const [view, setView] = useState<View>('right')
  const [copied, copy] = useCopy()
  const palette = useMemo(() => paletteOf(tone), [tone])
  const preview = useMemo(() => sample(view, MOTIONS.find(([id]) => id === motion)?.[2]), [view, motion])
  const colours = tone.kind === 'brand' || tone.kind === 'mono' ? `colours ${tone.kind} ${tone.hex}` : tone.kind === 'hue' ? `colours hue ${tone.deg}` : ''
  const parts = [thing.trim() || '<object>', motion !== 'auto' && `motion ${motion}`, colours, view !== 'right' && FACING.find(([v]) => v === view)?.[2]]
  const command = `/fun-isometric ${parts.filter(Boolean).join(', ')}`
  return (
    <div className="fi-maker">
      <div className="fi-fields">
        <label className="fi-field">
          <span className="fi-label">Object</span>
          <input className="fi-input" value={thing} onChange={(e) => setThing(e.target.value)} placeholder="a piggy bank that wobbles when a coin drops in" />
          <span className="fi-chips">
            {IDEAS.map((idea) => (
              <button key={idea} type="button" className="fi-chip" onClick={() => setThing(idea)}>
                {idea}
              </button>
            ))}
          </span>
        </label>

        <label className="fi-field">
          <span className="fi-label">Motion</span>
          <select className="fi-input" value={motion} onChange={(e) => setMotion(e.target.value)}>
            {MOTIONS.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="fi-field">
          <legend className="fi-label">Colours</legend>
          <div className="fi-seg" role="group" aria-label="Colours">
            {TONES.map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                aria-pressed={tone.kind === kind}
                onClick={() => setTone(kind === 'riso' ? { kind } : kind === 'hue' ? { kind, deg: 140 } : { kind, hex: 'hex' in tone ? tone.hex : '#2b6cff' })}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="fi-tune">
            <span className="fi-swatches" aria-hidden>
              {ACCENTS.map((k) => (
                <i key={k} style={{ background: (palette ?? RISO)[k] }} />
              ))}
            </span>
            {(tone.kind === 'brand' || tone.kind === 'mono') && (
              <>
                <input type="color" value={tone.hex} aria-label="Colour" onChange={(e) => setTone({ kind: tone.kind, hex: e.target.value })} />
                <span className="fi-frame">{tone.hex}</span>
              </>
            )}
            {tone.kind === 'hue' && (
              <>
                <input type="range" min={0} max={359} value={tone.deg} aria-label="Hue shift" onChange={(e) => setTone({ kind: 'hue', deg: Number(e.target.value) })} />
                <span className="fi-frame">{tone.deg}°</span>
              </>
            )}
          </span>
        </fieldset>

        <fieldset className="fi-field">
          <legend className="fi-label">Facing</legend>
          <div className="fi-views">
            {FACING.map(([v, label]) => (
              <button key={v} type="button" className="fi-view" aria-pressed={view === v} onClick={() => setView(v)}>
                <Sticker icon={SAMPLES[v]} palette={palette} label={`A card ${label.toLowerCase()}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="fi-out">
        <div className="fi-stage">
          <Sticker icon={preview} palette={palette} label="Preview of the chosen motion, colours and facing" />
        </div>
        <div className="fi-command">
          <code>{command}</code>
          <button type="button" className="fi-btn fi-gel" onClick={() => copy(command)} disabled={!thing.trim()}>
            {copied === command ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

// the wall pops its stickers in a scattered order, 60ms apart
const order = ICONS.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % 23) - ((b * 7 + 3) % 23))

// children land before the install section, so a host can add its own sections under the same palette and clock
export default function Page({ className, children }: { className?: string; children?: ReactNode }) {
  const [tone, setTone] = useState<Tone>({ kind: 'riso' })
  const [copied, copy] = useCopy()
  const palette = useMemo(() => paletteOf(tone), [tone])
  const tint = (palette ?? RISO).tint
  useEffect(
    () => () => {
      Object.assign(clock, { speed: 1, paused: false })
    },
    [],
  )
  return (
    <main className={className ? `show-fun ${className}` : 'show-fun'} style={{ '--fi-tint': tint } as CSSProperties}>
      <header className="fi-nav">
        <a className="fi-word" href="#top">
          fun-isometric
        </a>
        <nav className="fi-links" aria-label="Site">
          <a href="#make">Make</a>
          <a href="#stickers">Stickers</a>
          <a href={REPO}>GitHub</a>
          <a className="fi-btn fi-gel" href="#install">
            Install
          </a>
        </nav>
      </header>

      <section className="fi-hero" id="top">
        <div className="fi-hero-copy">
          <h1 className="fi-display">
            Stickers that move
            <br />
            like they mean it.
          </h1>
          <p className="fi-lede">
            A Claude skill that draws isometric stickers and animates them on real keyframes. Say what the object is and what it does, and it
            comes back drawn, rigged and looping, in any palette.
          </p>
          <div className="fi-command fi-hero-command">
            <code>{HERO_COMMAND}</code>
            <button type="button" className="fi-btn" onClick={() => copy(HERO_COMMAND)}>
              {copied === HERO_COMMAND ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="fi-hero-art">
          <Sticker icon={piggy} enter={0.15} palette={palette} label="A piggy bank taking a coin" />
        </div>
      </section>

      <section className="fi-sec" id="make">
        <header className="fi-head">
          <h2 className="fi-h2">Make your own.</h2>
          <p className="fi-meta">Pick the object, the motion, the colours and the facing, then paste the command into Claude.</p>
        </header>
        <Maker tone={tone} setTone={setTone} />
      </section>

      <section className="fi-sec" id="stickers">
        <header className="fi-head">
          <h2 className="fi-h2">
            {ICONS.length} stickers.
            <br />
            One motion system.
          </h2>
          <Controls />
        </header>
        <ul className="fi-wall">
          {ICONS.map((icon, i) => (
            <li key={icon.name} className="fi-tile">
              <Sticker icon={icon} enter={0.3 + order.indexOf(i) * 0.06} palette={palette} />
              <p className="fi-name">{icon.name}</p>
              <p className="fi-meta">{MOVES[icon.name]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="fi-sec">
        <ul className="fi-cards">
          <li>
            <div className="fi-card-art">
              <Sticker icon={gift} palette={palette} />
            </div>
            <p>
              <strong>Real keyframes.</strong> Every move is a set of After Effects keys with their own easing and arcs, replayed the way
              lottie-web plays them. Nothing here is a sine wave.
            </p>
          </li>
          <li>
            <div className="fi-card-art fi-trio">
              <Sticker icon={chat} palette={brand('#2b6cff')} label="The chat sticker in a blue brand palette" />
              <Sticker icon={chat} palette={mono('#16a34a')} label="The chat sticker in one green" />
              <Sticker icon={chat} palette={hue(160)} label="The chat sticker with the hue shifted" />
            </div>
            <p>
              <strong>Any palette.</strong> Colours are roles, not hexes, so a brand colour, one colour or a hue shift repaints every part and
              keeps what it means.
            </p>
          </li>
          <li>
            <div className="fi-card-art">
              <Sticker icon={trophy} palette={palette} />
            </div>
            <p>
              <strong>Ships anywhere.</strong> A React component, a canvas player with no dependencies, or a looping alpha video with its poster
              frame.
            </p>
          </li>
        </ul>
      </section>

      {children}

      <section className="fi-sec fi-install" id="install">
        <h2 className="fi-h2">
          Install it once.
          <br />
          Ask for stickers forever.
        </h2>
        <ul className="fi-steps">
          {INSTALLS.map(([title, cmd, note]) => (
            <li key={title}>
              <p className="fi-name">{title}</p>
              <div className="fi-command fi-code">
                <code>{cmd}</code>
                <button type="button" className="fi-btn" onClick={() => copy(cmd)}>
                  {copied === cmd ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="fi-meta">{note}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="fi-foot">
        <p>
          MIT licensed. Made by <a href="https://www.klvn.dev">Kelvin</a>.
        </p>
        <a href={REPO}>Source on GitHub</a>
      </footer>
    </main>
  )
}
