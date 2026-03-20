import axios from 'axios'
import { findUrl, sendMedia, resolveUrl } from '../../system/helper.js'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = process.env.NAZE_API_KEY || 'nz-6f568e3e62'
const apiDanzy = 'https://api.danzy.web.id/api'
const danzyKey = process.env.DANZY_API_KEY || 'isi_apikey_disini'
const dl = async (url) => (await axios.get(url)).data

export default (ev) => {

  // Spotify
  ev.on({
    cmd: ['spotify', 'spotifydl', 'spdl'],
    name: 'Spotify Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://open.spotify.com/track/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const resD = await axios.get(`${apiDanzy}/download/spotify?url=${encodeURIComponent(args[0])}`).catch(() => null)
        if (resD?.data?.status && resD?.data?.data) {
          const d = resD.data.data
          const url = d.url || d.download || d.audio
          return await xp.sendMessage(chat.id, { audio: { url }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
        }
        const res = await dl(`${apiNaze}/download/spotify/audio?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { audio: { url: d.url || d.audio }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // TikTok MP3
  ev.on({
    cmd: ['ttmp3', 'tiktokmp3'],
    name: 'TikTok MP3',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.tiktok.com/@xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const finalUrl = await resolveUrl(args[0])
        const res = await dl(`${apiNaze}/download/tiktok?url=${encodeURIComponent(finalUrl)}&apikey=${nazeKey}`)
        // Robust search for music/audio link in any structure
        const audioUrl = findUrl(res, 'audio')
        if (!audioUrl) return xp.sendMessage(chat.id, { text: '❌ Gagal mendapatkan link audio TikTok.' }, { quoted: m })
        
        await xp.sendMessage(chat.id, { audio: { url: audioUrl }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
      } catch (e) {
        console.error(e)
        try {
            const finalUrl = await resolveUrl(args[0])
            const resD = await axios.get(`${apiDanzy}/download/tiktok?url=${encodeURIComponent(finalUrl)}&apikey=${danzyKey}`).catch(() => null)
            const audioUrlD = findUrl(resD?.data, 'audio')
            if (audioUrlD) {
                return await xp.sendMessage(chat.id, { audio: { url: audioUrlD }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
            }
        } catch (e2) {}
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan saat mengambil audio TikTok.' }, { quoted: m })
      }
    }
  })

  // YTMP3
  ev.on({
    cmd: ['ytmp3', 'yta'],
    name: 'YouTube Music',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://youtu.be/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const finalUrl = await resolveUrl(args[0])
        const resD = await axios.get(`${apiDanzy}/download/ytmp3?url=${encodeURIComponent(finalUrl)}`)
        const urlD = findUrl(resD.data, 'audio')
        if (!urlD) return xp.sendMessage(chat.id, { text: '❌ Gagal mendapatkan link YouTube MP3 dari Danzy.' }, { quoted: m })
        await xp.sendMessage(chat.id, { audio: { url: urlD }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
      } catch (e) {
        console.error(e)
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan saat mendownload YouTube MP3.' }, { quoted: m })
      }
    }
  })

  // SoundCloud
  ev.on({
    cmd: ['scdl', 'soundclouddl'],
    name: 'SoundCloud Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://soundcloud.com/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/soundcloud?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { audio: { url: d.url || d.audio }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

}
