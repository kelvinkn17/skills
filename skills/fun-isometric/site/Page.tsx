import './ui.css'
import './fun.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { track } from '@vercel/analytics'
import { ACCENTS, PALETTES, RISO, VIEWS, brand, clock, ellipse, mono, pill, rect, spark } from '../kit/fun'
import { ICONS, pen } from '../kit/icons'
import { bounce, clasp, deal, drift, float, hop, jolt, latch, press, slide, sway, toss, twist, wiggle, wobble } from '../kit/motions'
import { Sticker } from '../kit/Sticker'
import { ColorArea, ColorPicker, ColorSlider, ColorSwatch, Input, Label, ListBox, Select, Slider, TextField, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import type { CSSProperties, ReactNode } from 'react'
import type { Icon, Motion, Palette, PaletteName, View } from '../kit/fun'

const REPO = 'https://github.com/kelvinkn17/skills'
const MAKER = { name: 'Kelvin Adithya', url: 'https://x.com/KelvinAdithya', follow: 'https://x.com/intent/follow?screen_name=KelvinAdithya' }
const EXAMPLE = 'a pen scribbling on a square pad'

// one command for every agent, the CLI asks which ones and where; the zip skips Node
const SITE = 'https://skills.klvn.dev/fun-isometric'
const INSTALL = 'npx skills add kelvinkn17/skills@fun-isometric'
const UNZIP = 'unzip fun-isometric.zip -d ~/.claude/skills'

// the presets each sticker moves on, shown under it in the wall
const MOVES: Record<string, string> = {
  pen: 'scribble, twinkle',
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
  mailbox: 'jolt, spring',
  headphones: 'wobble, twinkle',
  trophy: 'hop, twinkle',
  camera: 'press, glint',
  pin: 'hop, sparkle',
  cloud: 'float, slide',
  bulb: 'hop, twinkle',
  battery: 'float, twinkle',
}

// Copy rolls up into a drawn check and Copied on a spring, and the pill bounces once per copy
function CopyButton({ text, what, disabled }: { text: string; what: 'install' | 'maker'; disabled?: boolean }) {
  const [hits, setHits] = useState(0)
  const [done, setDone] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = () =>
    void navigator.clipboard.writeText(text).then(() => {
      track('Copy command', { what })
      setHits((n) => n + 1)
      setDone(true)
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setDone(false), 1800)
    })
  return (
    <button type="button" className="fi-btn fi-gel fi-copy" data-done={done ? (hits % 2 ? 'a' : 'b') : undefined} onClick={copy} disabled={disabled}>
      <span className="fi-copy-idle" aria-hidden={done}>
        Copy
      </span>
      <span className="fi-copy-done" aria-hidden={!done}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
        Copied
      </span>
    </button>
  )
}

function Install() {
  return (
    <div className="fi-install" id="install">
      <p className="fi-label">Add it to Claude Code, Codex or any agent with one command.</p>
      <div className="fi-command">
        <code>{INSTALL}</code>
        <CopyButton text={INSTALL} what="install" />
      </div>
      <p className="fi-label">Or download the skill and unzip it into your skills folder.</p>
      <div className="fi-command">
        <code>{UNZIP}</code>
        <a className="fi-btn" href={`${SITE}/fun-isometric.zip`} download onClick={() => track('Download zip')}>
          Download
        </a>
      </div>
    </div>
  )
}

const SPEEDS = [1, 0.5, 0.25]

function Controls() {
  const [speed, setSpeed] = useState(clock.speed)
  const [paused, setPaused] = useState(clock.paused)
  const [frame, setFrame] = useState(0)
  // the slider follows the page clock, one render per whole frame
  useEffect(() => {
    let raf = 0
    const tick = () => {
      setFrame(Math.floor(((clock.frame % 180) + 180) % 180))
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
      <ToggleButtonGroup
        aria-label="Speed"
        size="sm"
        disallowEmptySelection
        selectedKeys={[String(speed)]}
        onSelectionChange={(keys) => {
          const next = Number([...keys][0])
          clock.speed = next
          setSpeed(next)
        }}
      >
        {SPEEDS.map((s) => (
          <ToggleButton key={s} id={String(s)}>
            {s === 1 ? '1x' : s === 0.5 ? '½x' : '¼x'}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <button type="button" className="fi-btn" aria-pressed={paused} onClick={() => pause(!paused)}>
        {paused ? 'Play' : 'Pause'}
      </button>
      <Slider
        className="fi-scrub"
        aria-label="Frame"
        minValue={0}
        maxValue={179}
        value={frame}
        formatOptions={{ minimumIntegerDigits: 3 }}
        onChange={(v) => {
          pause(true)
          clock.frame = v as number
          setFrame(v as number)
        }}
      >
        <Slider.Output className="fi-frame" />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
    </div>
  )
}

// The generator: everything the skill takes, picked by eye, written out as the command to paste

type Tone = { kind: 'set'; name: PaletteName } | { kind: 'brand'; hex: string; two: string } | { kind: 'mono'; hex: string }

const paletteOf = (t: Tone): Palette | undefined =>
  t.kind === 'brand' ? brand(t.hex, t.two) : t.kind === 'mono' ? mono(t.hex) : t.name === 'riso' ? undefined : PALETTES[t.name]

const SETS = Object.keys(PALETTES) as Array<PaletteName>
// brand pairs that start somewhere good, the pickers take it from there
const PAIRS: Array<[string, string]> = [
  ['#0a84ff', '#ff7a1a'],
  ['#ff58a8', '#2b50e0'],
  ['#7c5cff', '#16b88a'],
  ['#ef4444', '#1e3a8a'],
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

const IDEAS = ['a pen', 'a rocket', 'a mailbox', 'headphones', 'a trophy']

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

// a palette to pick, shown as its strong accents so the choice is made by eye; the pale tint would vanish on the picked card
const STRIP = ACCENTS.filter((k) => k !== 'tint')

function Swatch({ label, palette, on, pick }: { label: string; palette?: Palette; on: boolean; pick: () => void }) {
  return (
    <button type="button" className="fi-pal" aria-pressed={on} onClick={pick}>
      <span className="fi-strip" aria-hidden>
        {STRIP.map((k) => (
          <i key={k} style={{ background: (palette ?? RISO)[k] }} />
        ))}
      </span>
      {label}
    </button>
  )
}

function Pick({ label, value, set }: { label: string; value: string; set: (hex: string) => void }) {
  return (
    <ColorPicker value={value} onChange={(c) => set(c.toString('hex').toLowerCase())}>
      <ColorPicker.Trigger className="fi-pick">
        <ColorSwatch />
        <span>
          {label}
          <span className="fi-frame">{value}</span>
        </span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover className="fi-pop">
        <ColorArea aria-label={`${label} colour`} colorSpace="hsb" xChannel="saturation" yChannel="brightness">
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider aria-label="Hue" channel="hue" colorSpace="hsb">
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      </ColorPicker.Popover>
    </ColorPicker>
  )
}

function Maker({ tone, setTone }: { tone: Tone; setTone: (t: Tone) => void }) {
  const [thing, setThing] = useState('')
  const [motion, setMotion] = useState('auto')
  const [view, setView] = useState<View>('right')
  const palette = useMemo(() => paletteOf(tone), [tone])
  const preview = useMemo(() => sample(view, MOTIONS.find(([id]) => id === motion)?.[2]), [view, motion])
  const colours = tone.kind === 'brand' ? `colours brand ${tone.hex} ${tone.two}` : tone.kind === 'mono' ? `colours mono ${tone.hex}` : tone.name === 'riso' ? '' : `colours ${tone.name}`
  const parts = [thing.trim() || '<object>', motion !== 'auto' && `motion ${motion}`, colours, view !== 'right' && FACING.find(([v]) => v === view)?.[2]]
  const command = `/fun-isometric ${parts.filter(Boolean).join(', ')}`
  return (
    <div className="fi-maker">
      <div className="fi-fields">
        <div className="fi-field">
          <TextField value={thing} onChange={setThing} className="fi-field">
            <Label className="fi-label">Object</Label>
            <Input className="fi-input" placeholder={EXAMPLE} />
          </TextField>
          <span className="fi-chips">
            {IDEAS.map((idea) => (
              <button key={idea} type="button" className="fi-chip" onClick={() => setThing(idea)}>
                {idea}
              </button>
            ))}
          </span>
        </div>

        <Select className="fi-field" value={motion} onChange={(k) => k !== null && setMotion(String(k))}>
          <Label className="fi-label">Motion</Label>
          <Select.Trigger className="fi-input">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="fi-pop">
            <ListBox>
              {MOTIONS.map(([id, label]) => (
                <ListBox.Item key={id} id={id} textValue={label}>
                  {label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <fieldset className="fi-field">
          <legend className="fi-label">Colours</legend>
          <div className="fi-palettes">
            {SETS.map((name) => (
              <Swatch key={name} label={name[0].toUpperCase() + name.slice(1)} palette={PALETTES[name]} on={tone.kind === 'set' && tone.name === name} pick={() => setTone({ kind: 'set', name })} />
            ))}
            <Swatch label="Brand" palette={tone.kind === 'brand' ? palette : brand(...PAIRS[0])} on={tone.kind === 'brand'} pick={() => tone.kind !== 'brand' && setTone({ kind: 'brand', hex: PAIRS[0][0], two: PAIRS[0][1] })} />
            <Swatch label="One colour" palette={tone.kind === 'mono' ? palette : mono('#2b6cff')} on={tone.kind === 'mono'} pick={() => tone.kind !== 'mono' && setTone({ kind: 'mono', hex: '#2b6cff' })} />
          </div>
          {tone.kind === 'brand' && (
            <div className="fi-tune">
              <Pick label="Primary" value={tone.hex} set={(hex) => setTone({ ...tone, hex })} />
              <Pick label="Secondary" value={tone.two} set={(two) => setTone({ ...tone, two })} />
              <span className="fi-pairs" role="group" aria-label="Suggested pairs">
                {PAIRS.map(([hex, two]) => (
                  <button
                    key={hex + two}
                    type="button"
                    aria-label={`${hex} with ${two}`}
                    aria-pressed={tone.hex === hex && tone.two === two}
                    style={{ background: `linear-gradient(135deg, ${hex} 50%, ${two} 50%)` }}
                    onClick={() => setTone({ kind: 'brand', hex, two })}
                  />
                ))}
              </span>
            </div>
          )}
          {tone.kind === 'mono' && (
            <div className="fi-tune">
              <Pick label="Colour" value={tone.hex} set={(hex) => setTone({ kind: 'mono', hex })} />
            </div>
          )}
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
          <CopyButton text={command} what="maker" disabled={!thing.trim()} />
        </div>
      </div>
    </div>
  )
}

// the wall pops its stickers in a scattered order, 60ms apart
const order = ICONS.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % 23) - ((b * 7 + 3) % 23))

// children land before the install section, so a host can add its own sections under the same palette and clock
export default function Page({ className, children }: { className?: string; children?: ReactNode }) {
  const [tone, setTone] = useState<Tone>({ kind: 'set', name: 'riso' })
  const palette = useMemo(() => paletteOf(tone), [tone])
  const tint = (palette ?? RISO).tint
  useEffect(() => {
    return () => {
      Object.assign(clock, { speed: 1, paused: false })
    }
  }, [])
  return (
    <main className={className ? `show-fun ${className}` : 'show-fun'} style={{ '--fi-tint': tint } as CSSProperties}>
      <header className="fi-nav">
        <p className="fi-brand">
          <a className="fi-word" href="#top">
            fun-isometric
          </a>
          <a className="fi-by" href={MAKER.url} target="_blank" rel="noopener">
            by {MAKER.name}
          </a>
        </p>
        <nav className="fi-links" aria-label="Site">
          <a href="#make">Make</a>
          <a href="#examples">Examples</a>
          <a className="fi-btn fi-hub" href={REPO} onClick={() => track('Open GitHub', { from: 'nav' })}>
            GitHub
          </a>
          <a className="fi-btn fi-follow" href={MAKER.follow} target="_blank" rel="noopener" aria-label={`Follow ${MAKER.name} on X`} onClick={() => track('Follow on X')}>
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
            Follow
          </a>
        </nav>
      </header>

      <section className="fi-hero" id="top">
        <div className="fi-emblem">
          <Sticker icon={pen} enter={0.15} palette={palette} label="A pen scribbling on a square pad" />
        </div>
        <h1 className="fi-display">/fun-isometric</h1>
        <p className="fi-lede">
          A skill for Claude Code and Codex. Name an object and what it does, and it comes back as an isometric sticker looping on real
          keyframes, in any palette.
        </p>
        <Install />
        <p className="fi-meta">Start a new session, then ask for <span className="fi-nowrap">/fun-isometric</span>, or <span className="fi-nowrap">$fun-isometric</span> in Codex. Rendering needs Bun, and video needs ffmpeg.</p>
      </section>

      <section className="fi-sec" id="make">
        <header className="fi-head">
          <h2 className="fi-h2">Make your own.</h2>
          <p className="fi-meta">Pick the object, the motion, the colours and the facing, then paste the command into your agent.</p>
        </header>
        <Maker tone={tone} setTone={setTone} />
      </section>

      <section className="fi-sec" id="examples">
        <header className="fi-head">
          <h2 className="fi-h2">Examples.</h2>
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

      {children}

      <footer className="fi-foot">
        <p>
          MIT licensed. Made by <a href="https://www.klvn.dev">Kelvin</a>.
        </p>
        <a href={REPO} onClick={() => track('Open GitHub', { from: 'footer' })}>
          Source on GitHub
        </a>
      </footer>
    </main>
  )
}
