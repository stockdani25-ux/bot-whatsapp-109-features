import axios from 'axios'
import { findUrl, sendMedia } from '../../system/helper.js'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = process.env.NAZE_API_KEY || 'nz-6f568e3e62'
const dl = async (url) => (await axios.get(url)).data

export default (ev) => {

  // Mediafire
  ev.on({
    cmd: ['mediafire', 'mf'],
    name: 'Mediafire Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.mediafire.com/file/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/mediafire?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { document: { url: d.url || d.download_url }, fileName: d.filename || 'file', mimetype: 'application/octet-stream' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Mega.nz
  ev.on({
    cmd: ['mega', 'meganz'],
    name: 'Mega.nz Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://mega.nz/file/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/meganz?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { document: { url: d.url || d.download_url }, fileName: d.filename || 'file', mimetype: 'application/octet-stream' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Google Drive
  ev.on({
    cmd: ['gdrive', 'gd'],
    name: 'Google Drive Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://drive.google.com/file/d/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/gdrive?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { document: { url: d.url || d.download_url }, fileName: d.filename || 'file', mimetype: 'application/octet-stream' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // GitHub
  ev.on({
    cmd: ['github', 'gh'],
    name: 'GitHub Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://github.com/user/repo` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/github?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { document: { url: d.url || d.download_url }, fileName: d.filename || 'repo.zip', mimetype: 'application/zip' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

}
