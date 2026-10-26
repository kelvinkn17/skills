#!/usr/bin/env bun
// fi: renders fun-isometric icons in headless Chromium, as contact sheets to judge motion and as looping alpha video to ship.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const HELP = `fi check  <icons.ts> [name...]
  structure (ids, parents, clips, palette slots, morph commands, loops), clipping at the canvas edge on every frame, the loop seam; exits 1 on a problem
fi sheet  <icons.ts> [name...] [--fps 10] [--cells 20] [--px 200] [--out sheet.png]
  one row pair per icon, frames sampled at --fps from 0, white ground; the kit (fun.ts) must sit next to icons.ts
fi frame  <icons.ts> <name> <frame> [--px 800] [--out frame.png] [--bg #ffffff]
fi export <icons.ts> <name> [--px 400] [--out dir] [--bg #ffffff]
  every frame of the loop at 60fps to <name>.webm (VP9 alpha) and <name>.mp4 (HEVC alpha, Safari), plus <name>.png at the still
  frame for a poster; --bg flattens to H.264 instead
colours, on sheet, frame and export: --palette riso|candy|matcha|sunset|clay|aqua, or '{"main":"#0a84ff"}' (json or a .json file) | --hue <deg> | --brand '<#primary>[,#secondary]' | --mono <#hex>`

const PW = '1.63.0'
const CACHE = path.join(os.homedir(), '.cache', 'fun-isometric')
const die = (m) => (console.error(`fi: ${m}`), process.exit(1))

const argv = process.argv.slice(2)
const flags = {}
const pos = []
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) flags[argv[i].slice(2)] = argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[++i]
  else pos.push(argv[i])
}
const [cmd, file, ...names] = pos
if (!cmd || !file || flags.help) (console.log(HELP), process.exit(cmd ? 0 : 1))
const mod = path.resolve(file)
const kit = path.join(path.dirname(mod), 'fun.ts')
if (!fs.existsSync(mod)) die(`no ${mod}`)
if (!fs.existsSync(kit)) die(`no fun.ts next to ${mod}, copy the kit there`)

// An installed playwright only: the project's, else our cache. A bare import would let Bun auto install a newer one with no browser.
function findPlaywright() {
  for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'node_modules/playwright/package.json'))) return path.join(dir, 'node_modules/playwright')
    if (dir === path.dirname(dir)) break
  }
  const cached = path.join(CACHE, 'node_modules/playwright')
  if (fs.existsSync(path.join(cached, 'package.json'))) return cached
  fs.mkdirSync(CACHE, { recursive: true })
  if (!fs.existsSync(path.join(CACHE, 'package.json'))) fs.writeFileSync(path.join(CACHE, 'package.json'), '{"private":true}')
  console.log(`fi: installing playwright@${PW} into ${CACHE}`)
  if (spawnSync('npm', ['i', `playwright@${PW}`, '--no-audit', '--no-fund'], { cwd: CACHE, stdio: 'inherit' }).status) die('npm install failed')
  return cached
}

async function browser() {
  const dir = findPlaywright()
  const pw = createRequire(path.join(dir, 'package.json'))(dir)
  try {
    return await pw.chromium.launch()
  } catch (e) {
    if (!/Executable doesn't exist|playwright install/i.test(e.message)) throw e
    spawnSync('node', [path.join(dir, 'cli.js'), 'install', 'chromium'], { stdio: 'inherit' })
    return pw.chromium.launch()
  }
}

// One bundle exposing every exported icon and a frame painter to the page
async function bundle() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fi-'))
  const entry = path.join(tmp, 'entry.ts')
  fs.writeFileSync(
    entry,
    `import * as mod from ${JSON.stringify(mod)}
import { PALETTES, RISO, brand, draw, hue, mono } from ${JSON.stringify(kit)}
const icons = [...new Set(Object.values(mod).flatMap((v) => (Array.isArray(v) ? v : [v])))].filter((v) => v && typeof v === 'object' && 'layers' in v && 'frames' in v)
const cv = document.createElement('canvas')
let palette
const NUM = /-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?/gi
Object.assign(window, {
  icons: icons.map((i) => ({ name: i.name, frames: i.frames, still: i.still ?? 0 })),
  colours(spec) {
    if (typeof spec.palette === 'string' && !(spec.palette in PALETTES)) throw new Error('no palette ' + spec.palette + ', try ' + Object.keys(PALETTES).join(' '))
    palette = (typeof spec.palette === 'string' ? PALETTES[spec.palette] : spec.palette) ?? (spec.hue != null ? hue(spec.hue) : spec.brand ? brand(...spec.brand.split(/[ ,]+/)) : spec.mono ? mono(spec.mono) : undefined)
  },
  // what the type system cannot see: dangling ids, unknown slots, morphs whose commands drift, loops that do not divide the icon
  lint(name) {
    const icon = icons.find((i) => i.name === name)
    const out = []
    const ids = new Set()
    for (const L of icon.layers) if (L.id) ids.has(L.id) ? out.push(\`id "\${L.id}" used twice\`) : ids.add(L.id)
    const byId = new Map(icon.layers.filter((L) => L.id).map((L) => [L.id, L]))
    icon.layers.forEach((L, i) => {
      const at = L.id ? \`layer "\${L.id}"\` : \`layer \${i}\`
      if (L.parent && !ids.has(L.parent)) out.push(\`\${at}: parent "\${L.parent}" not found\`)
      if (L.clip && !ids.has(L.clip)) out.push(\`\${at}: clip "\${L.clip}" not found\`)
      for (let up = L, n = 0; up?.parent; up = byId.get(up.parent)) if (++n > 32) { out.push(\`\${at}: parents loop\`); break }
      for (const m of [L.m].flat().filter(Boolean)) if (m.loop && icon.frames % m.loop) out.push(\`\${at}: a motion repeats every \${m.loop} frames in a \${icon.frames} frame icon, give it loop: \${icon.frames}\`)
      for (const S of L.shapes) {
        for (const c of [S.fill, S.side, icon.ink].filter(Boolean)) if (c[0] !== '#' && !(c in RISO)) out.push(\`\${at}: "\${c}" is not a palette slot or a hex\`)
        if (Array.isArray(S.d) && new Set(S.d.map(([, d]) => d.replace(NUM, '#'))).size > 1) out.push(\`\${at}: morph keys have different commands\`)
        if (S.trim !== undefined && S.fill) out.push(\`\${at}: trim only draws on an open path, this one is filled\`)
      }
    })
    return [...new Set(out)]
  },
  // frames where ink reaches the canvas edge, so a swing or a sparkle is cut off
  clipped(name) {
    const icon = icons.find((i) => i.name === name)
    const px = 200
    const c = document.createElement('canvas')
    c.width = c.height = px
    const ctx = c.getContext('2d', { willReadFrequently: true })
    const hits = []
    for (let f = 0; f < icon.frames; f++) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, px, px)
      ctx.scale(px / (icon.size ?? 500), px / (icon.size ?? 500))
      draw(ctx, icon, f)
      const d = ctx.getImageData(0, 0, px, px).data
      let hit = false
      for (let i = 0; i < px && !hit; i++) hit = d[i * 4 + 3] > 24 || d[((px - 1) * px + i) * 4 + 3] > 24 || d[i * px * 4 + 3] > 24 || d[(i * px + px - 1) * 4 + 3] > 24
      if (hit) hits.push(f)
    }
    return hits
  },
  shot(name, frame, px, bg) {
    const icon = icons.find((i) => i.name === name)
    cv.width = cv.height = px
    const ctx = cv.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, px, px)
    if (bg) (ctx.fillStyle = bg), ctx.fillRect(0, 0, px, px)
    ctx.scale(px / (icon.size ?? 500), px / (icon.size ?? 500))
    draw(ctx, icon, frame, palette)
    return cv.toDataURL('image/png')
  },
  // pixels whose luminance moves by more than 40 between two frames, at 300px on white
  delta(name, a, b) {
    const icon = icons.find((i) => i.name === name)
    const px = 300
    const lum = (f) => {
      const c = document.createElement('canvas')
      c.width = c.height = px
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, px, px)
      ctx.scale(px / (icon.size ?? 500), px / (icon.size ?? 500))
      draw(ctx, icon, f)
      const d = ctx.getImageData(0, 0, px, px).data
      const out = new Float32Array(px * px)
      for (let i = 0; i < out.length; i++) out[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
      return out
    }
    const [x, y] = [lum(a), lum(b)]
    let n = 0
    for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 40) n++
    return n
  },
})`,
  )
  const out = await Bun.build({ entrypoints: [entry], target: 'browser', format: 'esm', minify: false })
  fs.rmSync(tmp, { recursive: true, force: true })
  if (!out.success) die(out.logs.map(String).join('\n'))
  return out.outputs[0].text()
}

const b = await browser()
const page = await b.newPage()
await page.setContent(`<!doctype html><body style="margin:0"><script type="module">${(await bundle()).replace(/<\/script/g, '<\\/script')}</script></body>`)
await page.waitForFunction(() => window.icons)
const all = await page.evaluate(() => window.icons)
const spec = {
  // a set's name, inline json or a json file
  palette: typeof flags.palette !== 'string' ? undefined : /^[a-z]+$/.test(flags.palette) ? flags.palette : JSON.parse(fs.existsSync(flags.palette) ? fs.readFileSync(flags.palette, 'utf8') : flags.palette),
  hue: flags.hue !== undefined ? Number(flags.hue) : undefined,
  brand: flags.brand,
  mono: flags.mono,
}
await page.evaluate((s) => window.colours(s), spec)
const pick = names.length && cmd !== 'frame' && cmd !== 'export' ? all.filter((i) => names.includes(i.name)) : all
const png = (url) => Buffer.from(url.split(',')[1], 'base64')
const shot = (name, f, px, bg) => page.evaluate(([n, f, px, bg]) => window.shot(n, f, px, bg), [name, f, px, bg ?? null])

if (cmd === 'sheet') {
  const [fps, cells, px] = [Number(flags.fps ?? 10), Number(flags.cells ?? 20), Number(flags.px ?? 200)]
  const out = path.resolve(flags.out ?? 'sheet.png')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fi-sheet-'))
  let n = 0
  for (const icon of pick)
    for (let i = 0; i < cells; i++) fs.writeFileSync(path.join(tmp, `${String(n++).padStart(5, '0')}.png`), png(await shot(icon.name, (i * 60) / fps, px, '#ffffff')))
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(tmp, '%05d.png'), '-vf', `tile=10x${Math.ceil(n / 10)}`, '-frames:v', '1', out], { stdio: 'inherit' })
  fs.rmSync(tmp, { recursive: true, force: true })
  if (r.status) die('ffmpeg tile failed')
  console.log(`${out}  ${pick.map((i) => i.name).join(', ')}  ${fps}fps x ${cells}`)
} else if (cmd === 'frame') {
  const [name, f] = names
  const out = path.resolve(flags.out ?? `${name}-${f}.png`)
  fs.writeFileSync(out, png(await shot(name, Number(f), Number(flags.px ?? 800), flags.bg ?? '#ffffff')))
  console.log(out)
} else if (cmd === 'export') {
  const icon = all.find((i) => i.name === names[0]) ?? die(`no icon "${names[0]}" in ${all.map((i) => i.name).join(', ')}`)
  const px = Math.round(Number(flags.px ?? 400) / 2) * 2
  const dir = path.resolve(flags.out ?? '.')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fi-export-'))
  for (let f = 0; f < icon.frames; f++) fs.writeFileSync(path.join(tmp, `${String(f).padStart(5, '0')}.png`), png(await shot(icon.name, f, px, flags.bg)))
  const src = ['-framerate', '60', '-i', path.join(tmp, '%05d.png'), '-an']
  const base = path.join(dir, icon.name)
  fs.mkdirSync(dir, { recursive: true })
  const run = (args) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...src, ...args], { stdio: 'inherit' }).status && die(`ffmpeg failed: ${args.at(-1)}`)
  if (flags.bg) run(['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-movflags', '+faststart', `${base}.mp4`])
  else {
    run(['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '30', '-row-mt', '1', `${base}.webm`])
    if (process.platform === 'darwin') run(['-c:v', 'hevc_videotoolbox', '-alpha_quality', '0.75', '-allow_sw', '1', '-b:v', '800k', '-tag:v', 'hvc1', `${base}.mp4`])
  }
  fs.writeFileSync(`${base}.png`, png(await shot(icon.name, icon.still, px, flags.bg)))
  fs.rmSync(tmp, { recursive: true, force: true })
  console.log(`${base}.${flags.bg ? 'mp4' : 'webm'}  ${icon.frames} frames at ${px}px, poster ${base}.png`)
} else if (cmd === 'check') {
  let bad = 0
  for (const icon of pick) {
    const L = icon.frames - 1
    const [lint, clipped, [before, wrap, after]] = await page.evaluate(
      ([n, L]) => [window.lint(n), window.clipped(n), [window.delta(n, L - 1, L), window.delta(n, L, 0), window.delta(n, 0, 1)]],
      [icon.name, L],
    )
    const problems = [...lint]
    if (clipped.length) problems.push(`touches the canvas edge on ${clipped.length} frame${clipped.length > 1 ? 's' : ''} (${clipped.slice(0, 6).join(', ')}${clipped.length > 6 ? ', ...' : ''}): shrink it or pull it in`)
    // the wrap from the last frame to the first should change no more than the frames either side of it
    if (wrap > 300 && wrap > 3 * Math.max(before, after)) problems.push(`the loop jumps at the seam (${wrap} px against ${before} and ${after}): a preset loop that does not divide the frames, or a motion running past the end`)
    bad += problems.length > 0
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${icon.name}${problems.map((p) => `\n     ${p}`).join('')}`)
  }
  console.log(bad ? `fi: ${bad} of ${pick.length} icons need work` : `fi: ${pick.length} icons pass`)
  process.exitCode = bad ? 1 : 0
} else die(`unknown command ${cmd}\n${HELP}`)
await b.close()
