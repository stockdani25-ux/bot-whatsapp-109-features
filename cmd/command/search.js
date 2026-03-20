import axios from 'axios'
import sharp from 'sharp'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = process.env.NAZE_API_KEY || 'nz-6f568e3e62'
const apiDanzy = 'https://api.danzy.web.id/api'
const fmt = (arr, fn) => arr.slice(0, 5).map((r, i) => fn(r, i + 1)).join('\n\n')

const findUrl = (d, type = 'any') => {
  if (!d) return null
  const isMedia = (u) => {
    if (typeof u !== 'string' || !u.startsWith('http')) return false
    const lower = u.toLowerCase()
    if (lower.includes('google.com/store') || lower.includes('apple.com/app')) return false
    if (type === 'video') return lower.includes('.mp4') || lower.includes('.mov')
    if (type === 'image') return lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp')
    return true
  }
  if (typeof d === 'string' && isMedia(d)) return d
  if (Array.isArray(d)) {
    for (const item of d) {
      const u = typeof item === 'string' ? item : (item?.url || item?.link || item?.image || item?.thumbnail)
      if (typeof u === 'string' && (u.includes('.jpg') || u.includes('.png'))) return u
    }
    for (const item of d) {
      const res = findUrl(item, type)
      if (res) return res
    }
  }
  if (typeof d === 'object') {
    const priority = ['image', 'url', 'thumbnail', 'video', 'link']
    for (const key of priority) {
      if (typeof d[key] === 'string' && isMedia(d[key])) return d[key]
    }
    for (const key in d) {
      if (typeof d[key] === 'object' || Array.isArray(d[key])) {
        const res = findUrl(d[key], type)
        if (res) return res
      }
    }
  }
  return null
}

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
        // 1. Coba Danzy dulu
        let d = []
        try {
          const resD = await axios.get(`${apiDanzy}/search/yts?q=${encodeURIComponent(text)}`)
          d = resD.data.result || resD.data.data || []
        } catch (e) {
          console.error('YTS Danzy Failed:', e.message)
          // 2. Fallback ke Naze
          const res = await axios.get(`${apiNaze}/search/youtube?query=${encodeURIComponent(text)}&apikey=${nazeKey}`)
          d = res.data.result || res.data.data || []
        }

        if (!d.length) return xp.sendMessage(chat.id, { text: 'Tidak ditemukan.' }, { quoted: m })
        
        const txt = fmt(d, (r, i) => {
          const info = r.views ? `👁 ${r.views} • 📅 ${r.uploaded || ''}` : `📺 ${r.channel || ''}`
          return `${i}. *${r.title || r.name}*\n${info}\n⏱ ${r.duration || ''}\n🔗 ${r.url || r.link || ''}`
        })
        
        await xp.sendMessage(chat.id, { text: `*YouTube Search: ${text}*\n\n${txt}` }, { quoted: m })
      } catch (e) {
        console.error(e)
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan saat mencari di YouTube.' }, { quoted: m })
      }
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
        const url = d[0]?.image || d[0]?.thumbnail || d[0]?.url
        if (!url) return xp.sendMessage(chat.id, { text: '❌ Gagal mendapatkan gambar dari Pixiv.' }, { quoted: m })
        await xp.sendMessage(chat.id, { image: { url }, caption: d[0]?.title || text }, { quoted: m })
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
        // Coba Danzy dulu
        const resD = await axios.get(`${apiDanzy}/search/tiktok?q=${encodeURIComponent(text)}`).catch(() => null)
        if (resD?.data) {
          console.log('Danzy TT Search Debug:', JSON.stringify(resD.data, null, 2))
          const d = resD.data
          const status = d.status === true || d.status === 200 || d.success === true
          const val = d.data || d.result
          if (status && Array.isArray(val) && val.length > 0) {
            const txt = fmt(val, (r, i) => `${i}. ${r.title||r.desc||''}\n🔗 ${r.url||r.share_url||''}`)
            return await xp.sendMessage(chat.id, { text: `*TikTok Search (Danzy): ${text}*\n\n${txt}` }, { quoted: m })
          }
        }

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
        // Coba Danzy dulu
        const resD = await axios.get(`${apiDanzy}/search/lyrics?q=${encodeURIComponent(text)}`).catch(() => null)
        if (resD?.data) {
          const d = resD.data
          const status = d.status === true || d.status === 200 || d.success === true
          const val = d.data || d.result || d
          
          if (status && val) {
             const track = Array.isArray(val) ? val[0] : val
             const content = track?.plainLyrics || track?.syncedLyrics || track?.lyrics || (typeof track === 'string' ? track : null)
             
             if (content && typeof content === 'string') {
                return await xp.sendMessage(chat.id, { text: `🎵 *${track.name || track.title || text}*\n👤 ${track.artistName || track.artist || '-'}\n\n${content}` }, { quoted: m })
             }
          }
        }

        const res = await axios.get(`https://api.termai.cc/api/search/lyrics?q=${encodeURIComponent(text)}&key=dabi-ai`)
        if (res.data.status) {
          await xp.sendMessage(chat.id, { text: `🎵 *${res.data.title}*\n👤 ${res.data.artist}\n\n${res.data.lyrics.slice(0, 3000)}` }, { quoted: m })
        } else {
          xp.sendMessage(chat.id, { text: '❌ Lirik tidak ditemukan.' }, { quoted: m })
        }
      } catch (e) {
        console.error(e)
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan atau terlalu banyak permintaan (429). Coba lagi nanti.' }, { quoted: m })
      }
    }
  })

  // Pinterest Search
  ev.on({
    cmd: ['pinsearch', 'pinterestsearch'],
    name: 'Pinterest Search',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .pinterest aesthetic' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const resD = await axios.get(`${apiDanzy}/search/pinterest?q=${encodeURIComponent(text)}`).catch(() => null)
        if (resD?.data) {
          console.log('Danzy Pin Search Debug:', JSON.stringify(resD.data, null, 2))
          const url = findUrl(resD.data, 'image')
          if (url) {
            console.log('Final Pin Search URL identified:', url)
            return await xp.sendMessage(chat.id, { image: { url }, caption: `Pinterest: ${text}` }, { quoted: m })
          }
        }
        await xp.sendMessage(chat.id, { text: 'Tidak ada hasil dari Pinterest.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // --- NSFW Gen ---
  ev.on({
    cmd: ['nsfwgen'],
    name: 'NSFW Image Generator',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} maid` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      
      try {
        // Primary: Vercel (User's preferred)
        const primaryUrl = `https://kyzzzneko-xvz1.vercel.app/api/ai/nsfwgen?q=${encodeURIComponent(text)}`
        const res = await axios.get(primaryUrl, { responseType: 'arraybuffer' })
        
        // Convert to JPG using sharp (fixes WebP saving issue)
        const jpgBuffer = await sharp(res.data).jpeg({ quality: 90 }).toBuffer()
        return await xp.sendMessage(chat.id, { image: jpgBuffer, mimetype: 'image/jpeg', fileName: 'nsfwgen.jpg', caption: `NSFW Gen: ${text}` }, { quoted: m })
        
      } catch (e) {
        console.error('NSFW Gen Primary (Vercel) failed:', e.message)
        try {
          // Fallback: Termai
          const terRes = await axios.get(`https://api.termai.cc/api/ai/nsfwgen?q=${encodeURIComponent(text)}&key=dabi-ai`)
          const tUrl = terRes.data.url || terRes.data.result || terRes.data.data
          if (tUrl) {
            const tImgRes = await axios.get(tUrl, { responseType: 'arraybuffer' })
            const tJpgBuffer = await sharp(tImgRes.data).jpeg({ quality: 90 }).toBuffer()
            return await xp.sendMessage(chat.id, { image: tJpgBuffer, mimetype: 'image/jpeg', fileName: 'nsfwgen_fallback.jpg', caption: `NSFW Gen (Fallback): ${text}` }, { quoted: m })
          }
        } catch (e2) {
          console.error('NSFW Gen Fallback failed:', e2.message)
        }
        await xp.sendMessage(chat.id, { text: '❌ Gagal membuat gambar NSFW. Provider sedang sibuk.' }, { quoted: m })
      }
    }
  })
}
