# skills

Agent skills I build and use. Each lives in `skills/<name>/` with its `SKILL.md` and everything it runs.

| Skill | What it does |
| --- | --- |
| [fun-isometric](skills/fun-isometric) | Draws isometric stickers and animates them on real keyframes. Any object, any palette, four facings. [Try the generator](https://skills.klvn.dev/fun-isometric) |

## Install

```sh
npx skills add kelvinkn17/skills@fun-isometric
```

The CLI asks which agents to add it to (Claude Code, Codex, Cursor and more) and whether it goes in every project. Start a new
session, then ask for `/fun-isometric`, or `$fun-isometric` in Codex.

Or download [fun-isometric.zip](https://skills.klvn.dev/fun-isometric/fun-isometric.zip) and unzip it into your skills folder:

```sh
unzip fun-isometric.zip -d ~/.claude/skills
```

As a Claude Code plugin it shows up as `/fun-isometric:fun-isometric`:

```
/plugin marketplace add kelvinkn17/skills
/plugin install fun-isometric@kelvinkn17-skills
```

## fun-isometric

```
/fun-isometric a pen scribbling on a square pad
/fun-isometric a mailbox, motion jolt, colours brand #2b6cff, facing top left
```

In Codex the same requests start with `$fun-isometric`.

It draws the object as flat slabs with a thick outline, rigs each part where it would hinge, and moves it on keyframe presets
(hop, toss, wiggle, clasp, drift and more) interpolated the way lottie-web plays After Effects keys. Colours are roles, so a brand
colour, one colour or a hue shift repaints a sticker and keeps what each part means.

What you get back is an icon module that plays live on canvas (a React component ships with the kit) or exports to looping alpha
video. Rendering and checks need [Bun](https://bun.sh) and, for video, ffmpeg; Playwright's Chromium installs itself on first use.

## License

MIT
