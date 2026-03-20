import axios from 'axios'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { uploadImage, getImageUrl } from '../../system/helper.js'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = 'nz-6f568e3e62'

const sendImg = async (xp, m, url) =>
  xp.sendMessage(m.key.remoteJid, { image: { url }, caption: 'Done ✨' }, { quoted: m })

export default (ev) => {

  // --- Sticker ---
  ev.on({
    cmd: ['s', 'sticker', 'stiker'],
    name: 'Sticker Maker',
    run: async (xp, m, { chat }) => {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const msg = m.message?.imageMessage || m.message?.videoMessage || quoted?.imageMessage || quoted?.videoMessage
      if (!msg) return xp.sendMessage(chat.id, { text: 'Kirim/reply gambar atau video untuk dijadikan stiker' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const buffer = await downloadMediaMessage(m, 'buffer', {})
        const sticker = new Sticker(buffer, { pack: global.botName, author: global.ownerName, type: StickerTypes.FULL, quality: 50 })
        await xp.sendMessage(chat.id, { sticker: await sticker.toBuffer() }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // --- QC variants ---
  ev.on({
    cmd: ['qc', 'qc2', 'qc3', 'iqc'],
    name: 'Quoted Chat Maker',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} halo dunia` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try { await sendImg(xp, m, `${apiNaze}/create/${cmd}?text=${encodeURIComponent(text)}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- Brat variants ---
  ev.on({
    cmd: ['brat', 'brat2', 'brat4'],
    name: 'Brat Maker',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} halo` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try { await sendImg(xp, m, `${apiNaze}/create/${cmd}?text=${encodeURIComponent(text)}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- TTP variants ---
  ev.on({
    cmd: ['ttp', 'ttp2', 'ttp3'],
    name: 'Text To Picture',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} halo` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try { await sendImg(xp, m, `${apiNaze}/create/${cmd}?text=${encodeURIComponent(text)}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- ATTP variants (sticker animated) ---
  ev.on({
    cmd: ['attp', 'attp2', 'attp3', 'attp4'],
    name: 'Animated Text Sticker',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} halo` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiNaze}/create/${cmd}?text=${encodeURIComponent(text)}&apikey=${nazeKey}`, { responseType: 'arraybuffer' })
        const sticker = new Sticker(res.data, { pack: 'ATTP', author: global.botName, type: StickerTypes.FULL })
        await xp.sendMessage(chat.id, { sticker: await sticker.toBuffer() }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // --- Fake Story ---
  ev.on({
    cmd: ['fakestory', 'fake-story'],
    name: 'Fake Story',
    run: async (xp, m, { text, chat, cmd }) => {
      const p = text.split('|').map(x => x.trim())
      if (p.length < 3) return xp.sendMessage(chat.id, { text: `Format: .${cmd} username|caption|https://foto-profil` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try { await sendImg(xp, m, `${apiNaze}/create/fake-story?username=${encodeURIComponent(p[0])}&caption=${encodeURIComponent(p[1])}&profile=${encodeURIComponent(p[2])}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- Fake Tweet ---
  ev.on({
    cmd: ['faketweet', 'fake-tweet'],
    name: 'Fake Tweet',
    run: async (xp, m, { text, chat, cmd }) => {
      const p = text.split('|').map(x => x.trim())
      if (p.length < 4) return xp.sendMessage(chat.id, { text: `Format: .${cmd} username|fullname|foto|komentar` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try { await sendImg(xp, m, `${apiNaze}/create/fake-tweet?username=${encodeURIComponent(p[0])}&fullname=${encodeURIComponent(p[1])}&profile=${encodeURIComponent(p[2])}&comment=${encodeURIComponent(p[3])}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- Meme / Meme2 ---
  ev.on({
    cmd: ['meme', 'meme2'],
    name: 'Meme Maker',
    run: async (xp, m, { args, text, chat, cmd }) => {
      const parts = text.split('|').map(x => x.trim())
      const urlFromText = parts[0]?.startsWith('http') ? parts[0] : null
      const t1 = urlFromText ? parts[1] : parts[0]
      const t2 = urlFromText ? parts[2] : parts[1]
      const imgUrl = urlFromText || await getImageUrl(xp, m, [])
      if (!imgUrl) return xp.sendMessage(chat.id, { text: `Reply/kirim foto atau: .${cmd} https://url|text atas|text bawah` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try { await sendImg(xp, m, `${apiNaze}/create/${cmd}?url=${encodeURIComponent(imgUrl)}&text=${encodeURIComponent(t1||'')}&text2=${encodeURIComponent(t2||'')}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- Wasted / Triggered / Absolute Cinema / Skintone ---
  ev.on({
    cmd: ['wasted', 'triggered', 'absolute-cinema', 'absolutecinema', 'skintone', 'skin-tone'],
    name: 'Effect Maker',
    run: async (xp, m, { args, chat, cmd }) => {
      const imgUrl = await getImageUrl(xp, m, args)
      if (!imgUrl) return xp.sendMessage(chat.id, { text: `Reply/kirim foto atau: .${cmd} https://url-gambar` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      const nazeCmd = cmd === 'absolutecinema' ? 'absolute-cinema' : cmd === 'skintone' ? 'skin-tone' : cmd
      try { await sendImg(xp, m, `${apiNaze}/create/${nazeCmd}?url=${encodeURIComponent(imgUrl)}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- Nulis ---
  ev.on({
    cmd: ['nulis'],
    name: 'Nulis (Handwriting)',
    run: async (xp, m, { args, chat }) => {
      if (args.length < 2) return xp.sendMessage(chat.id, { text: 'Format: .nulis <mode> <teks>' }, { quoted: m })
      const mode = args[0], text = args.slice(1).join(' ')
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try { await sendImg(xp, m, `${apiNaze}/create/nulis/${mode}?mode=${mode}&text=${encodeURIComponent(text)}&apikey=${nazeKey}`) }
      catch (e) { console.error(e) }
    }
  })

  // --- Ephoto ---
  ev.on({
    cmd: ['ephoto'],
    name: 'Ephoto',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Masukkan teksnya!' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`https://api.termai.cc/api/maker/ephoto?text=${encodeURIComponent(text)}&key=dabi-ai`)
        if (res.data.status) await xp.sendMessage(chat.id, { image: { url: res.data.url }, caption: 'Hasil Ephoto' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // --- Toimg (sticker → gambar) ---
  ev.on({
    cmd: ['toimg', 'sticker2img'],
    name: 'Sticker to Image',
    run: async (xp, m, { chat }) => {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      if (!quoted?.stickerMessage) return xp.sendMessage(chat.id, { text: 'Reply stiker yang mau dijadikan gambar.' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const buf = await downloadMediaMessage({ message: quoted }, 'buffer', {})
        const uploadedUrl = await uploadImage(buf)
        if (!uploadedUrl) return xp.sendMessage(chat.id, { text: 'Gagal upload stiker.' }, { quoted: m })
        await xp.sendMessage(chat.id, { image: { url: uploadedUrl }, caption: 'Done ✨' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // --- Removebg / Blurface ---
  ev.on({
    cmd: ['removebg', 'blurface'],
    name: 'Remove BG / Blur Face',
    run: async (xp, m, { chat, cmd }) => {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const imgMsg = m.message?.imageMessage || quoted?.imageMessage
      if (!imgMsg) return xp.sendMessage(chat.id, { text: 'Reply atau kirim gambar.' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const buf = await downloadMediaMessage(m, 'buffer', {})
        const { default: FormData } = await import('form-data')
        const form = new FormData()
        form.append('file', buf, { filename: 'image.jpg' })
        const res = await axios.post(`https://api.termai.cc/api/tools/${cmd}?key=dabi-ai`, form, { headers: form.getHeaders() })
        if (res.data.status) await xp.sendMessage(chat.id, { image: { url: res.data.url }, caption: `Hasil ${cmd}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })
}
