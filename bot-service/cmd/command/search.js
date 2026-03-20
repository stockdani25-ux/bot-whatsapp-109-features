import axios from 'axios'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = 'nz-6f568e3e62'
const fmt = (arr, fn) => arr.slice(0, 5).map((r, i) => fn(r, i + 1)).join('\n\n')

export default (ev) => {

  // Yahoo Image Search
  ev.on({
    cmd: ['yimage', 'yahooimage'],
    name: 'Yahoo Image Search',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} kucing lucu` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/yahoo-image?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        if (!d.length) return xp.sendMessage(chat.id, { text: 'Tidak ditemukan.' }, { quoted: m })
        await xp.sendMessage(chat.id, { image: { url: d[0]?.thumbnail || d[0]?.url || d[0] }, caption: text }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // YouTube Search
  ev.on({
    cmd: ['yts', 'ytsearch'],
    name: 'YouTube Search',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} anime opening` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/youtube?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. *${r.title||r.name}*\n📺 ${r.channel||''}\n⏱ ${r.duration||''}\n🔗 ${r.url||r.link||''}`)
        await xp.sendMessage(chat.id, { text: `*YouTube: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // YouTube Suggestion
  ev.on({
    cmd: ['ytsuggestion', 'ytrekomendasi'],
    name: 'YouTube Suggestion',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} how to` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/youtube-suggestion?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = Array.isArray(d) ? d.slice(0, 10).join('\n') : JSON.stringify(d).slice(0, 400)
        await xp.sendMessage(chat.id, { text: `*Saran YouTube "${text}":*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Apple Music
  ev.on({
    cmd: ['applemusic', 'amusic'],
    name: 'Apple Music Search',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} shape of you` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/apple-music?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.name||r.title} - ${r.artist||''}\n🔗 ${r.url||''}`)
        await xp.sendMessage(chat.id, { text: `*Apple Music: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // SoundCloud Search
  ev.on({
    cmd: ['scsearch', 'soundcloudsearch'],
    name: 'SoundCloud Search',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} alan walker` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/soundcloud?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.title||r.name}\n🎵 ${r.url||''}`)
        await xp.sendMessage(chat.id, { text: `*SoundCloud: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Genius Music
  ev.on({
    cmd: ['genius'],
    name: 'Genius Music',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .genius permainan hati' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/genius-music?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.title||r.name}\n🎤 ${r.artist||''}\n🔗 ${r.url||''}`)
        await xp.sendMessage(chat.id, { text: `*Genius: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Pixiv
  ev.on({
    cmd: ['pixiv'],
    name: 'Pixiv Search',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .pixiv anime' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/pixiv-tag?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        if (!d.length) return xp.sendMessage(chat.id, { text: 'Tidak ditemukan.' }, { quoted: m })
        await xp.sendMessage(chat.id, { image: { url: d[0]?.image || d[0]?.thumbnail || d[0]?.url }, caption: d[0]?.title || text }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Spotify Search
  ev.on({
    cmd: ['spotifysearch', 'spsearch'],
    name: 'Spotify Search',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} name of love` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/spotify?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.name||r.title}\n🎤 ${r.artist||''}\n🔗 ${r.url||r.external_url||''}`)
        await xp.sendMessage(chat.id, { text: `*Spotify: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Spotify Album
  ev.on({
    cmd: ['spalbum', 'spotifyalbum'],
    name: 'Spotify Album Search',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} divide ed sheeran` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/spotify-album?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.name||r.title}\n🎤 ${r.artist||''}\n🔗 ${r.url||''}`)
        await xp.sendMessage(chat.id, { text: `*Spotify Album: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Meloboom
  ev.on({
    cmd: ['meloboom'],
    name: 'Meloboom Search',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .meloboom cinta lama' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/meloboom?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.title||r.name}\n🎵 ${r.url||''}`)
        await xp.sendMessage(chat.id, { text: `*Meloboom: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // TikTok Search
  ev.on({
    cmd: ['ttsearch', 'tiktokcari'],
    name: 'TikTok Search',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} dance` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/tiktok?query=${encodeURIComponent(text)}&type=video&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.title||r.desc||''}\n🔗 ${r.url||r.share_url||''}`)
        await xp.sendMessage(chat.id, { text: `*TikTok: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Douyin Search
  ev.on({
    cmd: ['douyin'],
    name: 'Douyin Search',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .douyin funny videos' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/douyin?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        const txt = fmt(d, (r, i) => `${i}. ${r.title||r.desc||''}\n🔗 ${r.url||''}`)
        await xp.sendMessage(chat.id, { text: `*Douyin: ${text}*\n\n${txt||'Tidak ditemukan.'}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Lahelu
  ev.on({
    cmd: ['lahelu'],
    name: 'Lahelu Search',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .lahelu meme lucu' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/search/lahelu?query=${encodeURIComponent(text)}&page=1&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data || []
        if (!d.length) return xp.sendMessage(chat.id, { text: 'Tidak ditemukan.' }, { quoted: m })
        await xp.sendMessage(chat.id, { image: { url: d[0].image || d[0].thumbnail }, caption: d[0].title || 'Lahelu' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Lirik / Lyrics
  ev.on({
    cmd: ['lirik', 'lyrics'],
    name: 'Lirik Lagu',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} shape of you ed sheeran` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`https://api.termai.cc/api/search/lyrics?q=${encodeURIComponent(text)}&key=dabi-ai`)
        if (res.data.status) {
          await xp.sendMessage(chat.id, { text: `🎵 *${res.data.title}*\n👤 ${res.data.artist}\n\n${res.data.lyrics.slice(0, 3000)}` }, { quoted: m })
        } else {
          xp.sendMessage(chat.id, { text: 'Lirik tidak ditemukan.' }, { quoted: m })
        }
      } catch (e) { console.error(e) }
    }
  })
}
