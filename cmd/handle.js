import chalk from 'chalk'
import fs from 'fs'
import p from 'path'
import EventEmitter from 'events'
import { pathToFileURL, fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = p.dirname(__filename)
const dir = p.join(__dirname, 'command')

const _idCmd = def => {
  const fl = def.file || 'unknown',
        name = (def.name || 'noname').toLowerCase().trim().split(/\s+/).join('+'),
        cmds = [].concat(def.cmd || []).map(x => x.toLowerCase()).sort().join('+')
  return `file=${fl}&name=${name}&cmd=${cmds}`
}

class CmdEmitter extends EventEmitter {
  on(def, listener) {
    if (typeof def !== 'object' || !def.cmd || !def.run)
      return super.on(def, listener)

    const cmds = Array.isArray(def.cmd) ? def.cmd : [def.cmd]
    def.file ??= global.lastCmdUpdate?.file
    def.call ??= 0
    def.set ??= Date.now()
    def.id ??= _idCmd(def)
    def.handlers ??= new Map()

    for (const c2 of cmds) {
      const lc = c2.toLowerCase()
      const handler = async (xp, m, extra) => {
        try {
          if (def.owner && !extra.isOwner) {
              console.log(chalk.red(`[DENIED] Command "${lc}" oleh ${extra.pushName} - Bukan Owner`))
              return
          }
          console.log(chalk.blue(`[EXEC] Menjalankan "${def.name || lc}" untuk ${extra.pushName}`))
          def.call += 1
          await def.run(xp, m, extra)
          console.log(chalk.green(`[OK] Berhasil menjalankan "${def.name || lc}"`))
        } catch (e) {
          console.error(chalk.redBright.bold(`[ERR] Error ${def.name || c2}: `), e)
          await xp.sendMessage(m.key.remoteJid, { text: `⚠️ *Error:* ${e.message}` })
        }
      }
      super.on(lc, handler)
      def.handlers.set(lc, handler)
    }
    ;(this.cmd ??= []).push(def)
  }
}

export const ev = new CmdEmitter()

export const loadFile = async (f) => {
  try {
    const fp = p.join(dir, f)
    const mod = await import(pathToFileURL(fp).href + `?update=${Date.now()}`)
    const plugin = mod.default || mod
    if (typeof plugin === 'function') plugin(ev)
  } catch (e) {
    console.error('File error', f, e.message)
  }
}

export const loadAll = async () => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const files = fs.readdirSync(dir).filter(x => x.endsWith('.js'))
  for (const f of files) await loadFile(f)
  console.log(chalk.greenBright.bold(`✅ Berhasil memuat ${ev.cmd?.length || 0} cmd`))
}

// Router utama: dipanggil dari index.js setiap ada pesan command
export const handleCmd = async (command, xp, m, extra) => {
  if (ev.listenerCount(command) > 0) {
    ev.emit(command, xp, m, extra)
  }
  // Command tidak ditemukan = diam saja (tidak spam "command not found")
}
