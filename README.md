# skills

Agent skills I build and use. Each lives in `skills/<name>/` with its `SKILL.md` and everything it runs.

| Skill | What it does |
| --- | --- |
| [fun-isometric](skills/fun-isometric) | Draws isometric stickers and animates them on real keyframes. Any object, any palette, four facings. [Try the generator](https://fun-isometric.klvn.dev) |

## Install

With the skills CLI, for Claude Code and the other agents it supports:

```sh
npx skills add kelvinkn17/skills --skill fun-isometric
```

As a Claude Code plugin:

```
/plugin marketplace add kelvinkn17/skills
/plugin install fun-isometric@kelvinkn17-skills
```

## fun-isometric

```
/fun-isometric a piggy bank that wobbles when a coin drops in
/fun-isometric a mailbox, motion jolt, colours brand #2b6cff, facing top left
```

It draws the object as flat slabs with a thick outline, rigs each part where it would hinge, and moves it on keyframe presets
(hop, toss, wiggle, clasp, drift and more) interpolated the way lottie-web plays After Effects keys. Colours are roles, so a brand
colour, one colour or a hue shift repaints a sticker and keeps what each part means.

What you get back is an icon module that plays live on canvas (a React component ships with the kit) or exports to looping alpha
video. Rendering and checks need [Bun](https://bun.sh) and, for video, ffmpeg; Playwright's Chromium installs itself on first use.

## License

MIT
