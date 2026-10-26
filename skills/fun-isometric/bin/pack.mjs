#!/usr/bin/env bun
// pack: builds what the site serves from this folder's tracked files, the unzip download and the agent-skills discovery index.
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const NAME = path.basename(ROOT)
const PUBLIC = path.join(ROOT, 'public')
const KNOWN = path.join(PUBLIC, '.well-known', 'agent-skills')
const die = (m) => (console.error(`pack: ${m}`), process.exit(1))
const run = (cmd, args, opts) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...opts })
const list = (...args) => run('git', ['ls-files', ...args, '.']).split('\n').filter(Boolean)

// a stray local file would ship to everyone, so only committed files go in
const stray = list('-o', '--exclude-standard')
if (stray.length) die(`commit or ignore these first:\n${stray.join('\n')}`)
const files = list()

// zip appends to an existing archive, so start clean
const download = path.join(PUBLIC, `${NAME}.zip`)
const archive = path.join(KNOWN, `${NAME}.zip`)
fs.rmSync(download, { force: true })
fs.rmSync(KNOWN, { recursive: true, force: true })
fs.mkdirSync(KNOWN, { recursive: true })

// the download keeps the folder for `unzip -d ~/.claude/skills`, the discovery archive puts SKILL.md at its root
run('zip', ['-qX', download, '-@'], { cwd: path.dirname(ROOT), input: files.map((f) => `${NAME}/${f}`).join('\n') })
run('zip', ['-qX', archive, '-@'], { input: files.join('\n') })

const description = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf8').match(/^description: (.+)$/m)?.[1]
if (!description || description.length > 1024) die('SKILL.md needs a description of 1 to 1024 characters')
const digest = `sha256:${createHash('sha256').update(fs.readFileSync(archive)).digest('hex')}`

// absolute url, so the index answers the same at the site root and under /<name>
const index = {
  $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
  skills: [{ name: NAME, type: 'archive', description, url: `/${NAME}/.well-known/agent-skills/${NAME}.zip`, digest }],
}
fs.writeFileSync(path.join(KNOWN, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)
console.log(`pack: ${files.length} files, ${path.relative(ROOT, download)}, ${path.relative(ROOT, archive)} (${digest.slice(0, 19)}…)`)
