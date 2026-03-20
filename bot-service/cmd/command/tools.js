import axios from 'axios'
import { getImageUrl } from '../../system/helper.js'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = 'nz-6f568e3e62'

export default (ev) => {

  // Image manipulation tools (pakai set/level)
  ev.on({
    cmd: ['mirror', 'rotate', 'pixel', 'hd', 'remini', 'removewm', 'recolor'],
    name: 'Image Tools',
    run: async (xp, m, { args, chat, cmd }) => {
      const endMap = { removewm: 'remove-wm' }
      const endpoint = endMap[cmd] || cmd
      const hasLevel = args[0] && !args[0].startsWith('http')
      const level = hasLevel ? args[0] : (cmd === 'rotate' ? '90' : cmd === 'hd' ? '2' : '5')
      const imgUrl = hasLevel ? (args[1] || null) : (args[0] || null)
      const finalUrl = imgUrl || await getImageUrl(xp, m, [])
      if (!finalUrl) return xp.sendMessage(chat.id, { text: `Reply/kirim foto atau: .${cmd} [level] <url>` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const apiUrl = cmd === 'recolor'
          ? `${apiNaze}/tools/recolor?url=${encodeURIComponent(finalUrl)}&apikey=${nazeKey}`
          : `${apiNaze}/tools/${endpoint}?set=${level}&url=${encodeURIComponent(finalUrl)}&apikey=${nazeKey}`
        const res = await axios.get(apiUrl)
        const imgResult = res.data.result?.url || res.data.result || res.data.url
        await xp.sendMessage(chat.id, { image: { url: imgResult }, caption: 'Done ✨' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Image to ANSI
  ev.on({
    cmd: ['img2ansi', 'image2ansi'],
    name: 'Image to ANSI',
    run: async (xp, m, { args, chat, cmd }) => {
      const finalUrl = await getImageUrl(xp, m, args)
      if (!finalUrl) return xp.sendMessage(chat.id, { text: `Reply/kirim foto atau: .${cmd} https://url` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/tools/image2ansi?url=${encodeURIComponent(finalUrl)}&apikey=${nazeKey}`)
        await xp.sendMessage(chat.id, { text: res.data.result || res.data.data || 'Gagal.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Rainbow text
  ev.on({
    cmd: ['rainbow', 'rainbowtext'],
    name: 'Rainbow Text',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} halo dunia` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/tools/rainbow-text?text=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        await xp.sendMessage(chat.id, { text: res.data.result || res.data.data || 'Gagal.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Sinonim kata
  ev.on({
    cmd: ['sinonim', 'persamaankata'],
    name: 'Sinonim Kata',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} senang` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/tools/persamaan-kata?text=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        const d = res.data.result || res.data.data
        await xp.sendMessage(chat.id, { text: Array.isArray(d) ? d.join(', ') : (d || 'Tidak ditemukan.') }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Singkatan kata
  ev.on({
    cmd: ['singkatan'],
    name: 'Singkatan Kata',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .singkatan gw mau makan' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/tools/singkatan-kata?text=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        await xp.sendMessage(chat.id, { text: res.data.result || res.data.data || 'Tidak ditemukan.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Summarizer
  ev.on({
    cmd: ['rangkum', 'summarize'],
    name: 'Summarizer',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} teks panjang...` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/tools/summarizer-kata?text=${encodeURIComponent(text)}&apikey=${nazeKey}`)
        await xp.sendMessage(chat.id, { text: res.data.result || res.data.data || 'Gagal.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Blur canvas (dari termai / siputzx)
  ev.on({
    cmd: ['blurphoto', 'facepalm'],
    name: 'Canvas Effects',
    run: async (xp, m, { chat, cmd }) => {
      const finalUrl = await getImageUrl(xp, m, [])
      if (!finalUrl) return xp.sendMessage(chat.id, { text: 'Reply/kirim gambar.' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/canvas/${cmd}?image=${encodeURIComponent(finalUrl)}`, { responseType: 'arraybuffer' })
        await xp.sendMessage(chat.id, { image: Buffer.from(res.data), caption: `Hasil ${cmd}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Tolol certificate
  ev.on({
    cmd: ['tolol'],
    name: 'Sertifikat Tolol',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Masukkan nama.' }, { quoted: m })
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/canvas/sertifikat-tolol?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' })
        await xp.sendMessage(chat.id, { image: Buffer.from(res.data), caption: 'Sertifikat Tolol 😂' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })
}
