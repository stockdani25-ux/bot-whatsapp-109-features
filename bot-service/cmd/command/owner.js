import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const cfgPath = path.join(__dirname, '../../system/set/config.json')

export default (ev) => {

  ev.on({
    cmd: ['public'],
    name: 'Public Mode',
    owner: true,
    run: async (xp, m, { chat }) => {
      global.public = true
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'))
      cfg.ownerSetting.public = true
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))
      await xp.sendMessage(chat.id, { text: '✅ Bot sekarang dalam mode *PUBLIC*' }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['self', 'private'],
    name: 'Self Mode',
    owner: true,
    run: async (xp, m, { chat }) => {
      global.public = false
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'))
      cfg.ownerSetting.public = false
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))
      await xp.sendMessage(chat.id, { text: '✅ Bot sekarang dalam mode *SELF*' }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['restart'],
    name: 'Restart Bot',
    owner: true,
    run: async (xp, m, { chat }) => {
      await xp.sendMessage(chat.id, { text: '🔄 Bot akan direstart...' }, { quoted: m })
      setTimeout(() => process.exit(0), 1000)
    }
  })

  ev.on({
    cmd: ['stop'],
    name: 'Stop Bot',
    owner: true,
    run: async (xp, m, { chat }) => {
      await xp.sendMessage(chat.id, { text: '🛑 Bot dimatikan.' }, { quoted: m })
      setTimeout(() => process.exit(0), 1000)
    }
  })

  ev.on({
    cmd: ['eval', '>'],
    name: 'Eval JS',
    owner: true,
    run: async (xp, m, { text, chat }) => {
      if (!text) return
      try {
        let res = await eval(text)
        if (typeof res !== 'string') {
          const { inspect } = await import('util')
          res = inspect(res)
        }
        await xp.sendMessage(chat.id, { text: String(res) }, { quoted: m })
      } catch (e) {
        await xp.sendMessage(chat.id, { text: String(e) }, { quoted: m })
      }
    }
  })

  ev.on({
    cmd: ['adduang', 'addmoney'],
    name: 'Add Uang',
    owner: true,
    run: async (xp, m, { args, text, chat }) => {
      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
      const amount = parseInt(args[1] || args[0]) || 0
      if (!target || !amount) return xp.sendMessage(chat.id, { text: 'Format: .adduang @user jumlah' }, { quoted: m })
      await xp.sendMessage(chat.id, { text: `✅ Berhasil menambah ${amount} uang ke @${target.split('@')[0]}`, mentions: [target] }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['addlimit'],
    name: 'Add Limit',
    owner: true,
    run: async (xp, m, { args, chat }) => {
      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
      const amount = parseInt(args[1] || args[0]) || 0
      if (!target || !amount) return xp.sendMessage(chat.id, { text: 'Format: .addlimit @user jumlah' }, { quoted: m })
      await xp.sendMessage(chat.id, { text: `✅ Berhasil menambah ${amount} limit ke @${target.split('@')[0]}`, mentions: [target] }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['addrole'],
    name: 'Add Role',
    owner: true,
    run: async (xp, m, { args, chat }) => {
      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
      const role = args[1] || args[0] || 'User Free'
      if (!target) return xp.sendMessage(chat.id, { text: 'Format: .addrole @user <role>' }, { quoted: m })
      await xp.sendMessage(chat.id, { text: `✅ Role @${target.split('@')[0]} diubah menjadi *${role}*`, mentions: [target] }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['menfes'],
    name: 'Menfes',
    owner: true,
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Masukkan pesan untuk disebarkan.' }, { quoted: m })
      await xp.sendMessage(chat.id, { text: `📢 *MENFES*\n\n${text}` }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['broadcast', 'bc'],
    name: 'Broadcast',
    owner: true,
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Masukkan pesan broadcast.' }, { quoted: m })
      await xp.sendMessage(chat.id, { text: `📡 *BROADCAST*\nPesan "${text}" siap disebarkan.` }, { quoted: m })
    }
  })
}
