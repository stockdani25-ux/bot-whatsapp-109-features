import axios from 'axios'
import { getImageUrl } from '../../system/helper.js'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = 'nz-6f568e3e62'
const dl = async (url) => (await axios.get(url)).data

export default (ev) => {

  // AIO Downloader
  ev.on({
    cmd: ['aio', 'aio2', 'aio3'],
    name: 'AIO Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://url` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/${cmd}?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { video: { url: d.url || d.video }, caption: d.title || 'Done ✨' }, { quoted: m })
      } catch (e) { console.error(e); xp.sendMessage(chat.id, { text: 'Terjadi kesalahan.' }, { quoted: m }) }
    }
  })

  // Instagram
  ev.on({
    cmd: ['ig', 'igdl', 'igreels', 'igdl2'],
    name: 'Instagram Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.instagram.com/reel/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const ep = cmd === 'igdl2' ? 'instagram2' : 'instagram'
        const res = await dl(`${apiNaze}/download/${ep}?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        const url = d.url || d.video || d.image
        await xp.sendMessage(chat.id, { video: { url }, caption: d.caption || 'Done ✨' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

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

  // Spotify
  ev.on({
    cmd: ['spotify', 'spotifydl'],
    name: 'Spotify Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://open.spotify.com/track/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/spotify/audio?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { audio: { url: d.url || d.audio }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // TikTok
  ev.on({
    cmd: ['tiktok', 'tt', 'ttdl', 'tiktokmp4'],
    name: 'TikTok Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.tiktok.com/@xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/tiktok?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        await xp.sendMessage(chat.id, { video: { url: d.url || d.video || d.nowm }, caption: d.title || d.desc || 'Done ✨' }, { quoted: m })
      } catch (e) { console.error(e); xp.sendMessage(chat.id, { text: 'Terjadi kesalahan.' }, { quoted: m }) }
    }
  })

  // TikTok MP3
  ev.on({
    cmd: ['tiktokmp3'],
    name: 'TikTok MP3',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.tiktok.com/@xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/tiktok?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        const audioUrl = d.audio || d.music || d.url
        await xp.sendMessage(chat.id, { audio: { url: audioUrl }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // YouTube
  ev.on({
    cmd: ['ytmp3', 'yta', 'ytmp4', 'ytv'],
    name: 'YouTube Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://youtu.be/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      const format = (cmd === 'ytmp3' || cmd === 'yta') ? 'mp3' : 'mp4'
      try {
        const res = await dl(`${apiNaze}/download/youtube?url=${encodeURIComponent(args[0])}&format=${format}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        const url = d.url || d.download_url
        if (format === 'mp3') {
          await xp.sendMessage(chat.id, { audio: { url }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
        } else {
          await xp.sendMessage(chat.id, { video: { url }, caption: d.title || 'Done ✨' }, { quoted: m })
        }
      } catch (e) { console.error(e); xp.sendMessage(chat.id, { text: 'Terjadi kesalahan.' }, { quoted: m }) }
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

  // Pinterest
  ev.on({
    cmd: ['pin', 'pindl', 'pinterest'],
    name: 'Pinterest Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.pinterest.com/pin/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/pinterest?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        if (!d) return xp.sendMessage(chat.id, { text: 'Gagal.' }, { quoted: m })
        if (d.video) {
          await xp.sendMessage(chat.id, { video: { url: d.video }, caption: 'Done ✨' }, { quoted: m })
        } else {
          await xp.sendMessage(chat.id, { image: { url: d.url || d.image }, caption: 'Done ✨' }, { quoted: m })
        }
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

  // Facebook
  ev.on({
    cmd: ['fb', 'fbdl'],
    name: 'Facebook Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.facebook.com/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`https://api.danzy.web.id/api/download/facebook?url=${encodeURIComponent(args[0])}`)
        if (res.data.status && res.data.data) {
          await xp.sendMessage(chat.id, { video: { url: res.data.data.hd || res.data.data.sd } }, { quoted: m })
        }
      } catch (e) { console.error(e) }
    }
  })
}
