import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

const apiTermai = 'https://api.termai.cc'
const termaiKey = process.env.TERMAI_API_KEY || 'Bell409'
const apiNaze = 'https://api.naze.biz.id'
const nazeKey = process.env.NAZE_API_KEY || 'nz-6f568e3e62'
const apiDanzy = process.env.DANZY_API_URL || 'https://api.danzy.web.id/api'

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

  // ChatGPT / AI
  ev.on({
    cmd: ['ai', 'chatgpt'],
    name: 'AI Chat',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Ada yang bisa saya bantu?' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const resD = await axios.get(`${apiDanzy}/ai/chatgpt?text=${encodeURIComponent(text)}`).catch(() => null)
        if (resD?.data) {
          console.log('Danzy GPT Debug:', JSON.stringify(resD.data, null, 2))
          const d = resD.data
          const status = d.status === true || d.status === 200 || d.success === true
          const content = d.data?.result || d.data || d.result
          if (status && content && typeof content === 'string') {
            return await xp.sendMessage(chat.id, { text: content + '\n\n(Danzy)' }, { quoted: m })
          }
        }
        const res = await axios.get(`${apiTermai}/api/ai/chatgpt?q=${encodeURIComponent(text)}&key=${termaiKey}`)
        if (res.data.status) await xp.sendMessage(chat.id, { text: res.data.data?.answer || res.data.data }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Blackbox
  ev.on({
    cmd: ['blackbox'],
    name: 'Blackbox AI',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Masukkan pertanyaan!' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const resD = await axios.get(`${apiDanzy}/ai/blackbox?text=${encodeURIComponent(text)}`).catch(() => null)
        if (resD?.data) {
          console.log('Danzy Blackbox Debug:', JSON.stringify(resD.data, null, 2))
          const d = resD.data
          const status = d.status === true || d.status === 200 || d.success === true
          const content = d.data?.result || d.data || d.result
          if (status && content && typeof content === 'string') {
            return await xp.sendMessage(chat.id, { text: content + '\n\n(Danzy)' }, { quoted: m })
          }
        }
        const res = await axios.get(`${apiTermai}/api/ai/blackbox?q=${encodeURIComponent(text)}&key=${termaiKey}`)
        if (res.data.status) await xp.sendMessage(chat.id, { text: res.data.data?.answer || res.data.data }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Gemini
  ev.on({
    cmd: ['gemini'],
    name: 'Gemini AI',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Masukkan pertanyaan!' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const resD = await axios.get(`${apiDanzy}/ai/gemini?text=${encodeURIComponent(text)}`).catch(() => null)
        if (resD?.data) {
          console.log('Danzy Gemini Debug:', JSON.stringify(resD.data, null, 2))
          const d = resD.data
          const status = d.status === true || d.status === 200 || d.success === true
          const content = d.data?.result || d.data || d.result
          if (status && content && typeof content === 'string') {
            return await xp.sendMessage(chat.id, { text: content + '\n\n(Danzy)' }, { quoted: m })
          }
        }
        const apiKey = process.env.GEMINI_API_KEY || ''
        if (!apiKey) return xp.sendMessage(chat.id, { text: 'GEMINI_API_KEY belum diset di .env' }, { quoted: m })
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent(text)
        await xp.sendMessage(chat.id, { text: result.response.text() }, { quoted: m })
      } catch (e) { console.error(e); xp.sendMessage(chat.id, { text: 'Gagal terhubung ke Gemini.' }, { quoted: m }) }
    }
  })

  // Bypass link
  ev.on({
    cmd: ['bypass'],
    name: 'Bypass Link',
    run: async (xp, m, { args, chat }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: 'Masukkan link yang mau dibypass.' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiTermai}/api/tools/bypass?url=${encodeURIComponent(args[0])}&key=${termaiKey}`)
        if (res.data.status) await xp.sendMessage(chat.id, { text: `✅ Link bypass:\n${res.data.data}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Deep Image Generator
  ev.on({
    cmd: ['deepimg', 'imagine'],
    name: 'AI Image Generator',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Masukkan deskripsi gambar!' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiTermai}/api/ai/deepai?prompt=${encodeURIComponent(text)}&key=${termaiKey}`)
        if (res.data) {
           console.log('DeepAI Debug:', JSON.stringify(res.data, null, 2))
           const url = findUrl(res.data)
           if (url) {
             console.log('Final DeepAI URL identified:', url)
             return await xp.sendMessage(chat.id, { image: { url }, caption: text }, { quoted: m })
           }
        }
        await xp.sendMessage(chat.id, { text: '❌ Gagal membuat gambar AI.' }, { quoted: m })
      } catch (e) {
        console.error(e)
        await xp.sendMessage(chat.id, { text: `❌ Terjadi kesalahan: ${e.message}` }, { quoted: m })
      }
    }
  })

  // Edit Image with AI
  ev.on({
    cmd: ['editimg'],
    name: 'Edit Image AI',
    run: async (xp, m, { args, text, chat }) => {
      const prompt = text || args.join(' ')
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const imgMsg = m.message?.imageMessage || quoted?.imageMessage
      if (!imgMsg) return xp.sendMessage(chat.id, { text: 'Reply gambar dengan caption: .editimg <deskripsi>' }, { quoted: m })
      if (!prompt) return xp.sendMessage(chat.id, { text: 'Masukkan deskripsi editan.' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        await xp.sendMessage(chat.id, { text: '⚡ Fitur edit image masih dalam pengembangan.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Room AI (mode AI aktif terus)
  ev.on({
    cmd: ['roomai'],
    name: 'Room AI On',
    run: async (xp, m, { chat }) => {
      if (!global.roomAI) global.roomAI = {}
      global.roomAI[chat.id] = true
      await xp.sendMessage(chat.id, { text: '🤖 Mode AI diaktifkan di chat ini! Semua pesan akan dijawab AI.\nKetik .delroomai untuk menonaktifkan.' })
    }
  })

  ev.on({
    cmd: ['delroomai'],
    name: 'Room AI Off',
    run: async (xp, m, { chat }) => {
      if (global.roomAI) delete global.roomAI[chat.id]
      await xp.sendMessage(chat.id, { text: '🔕 Mode AI dinonaktifkan.' }, { quoted: m })
    }
  })

  // Math GPT
  ev.on({
    cmd: ['mathgpt', 'hitung'],
    name: 'Math GPT',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} 2+2*10` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`${apiTermai}/api/ai/mathgpt?q=${encodeURIComponent(text)}&key=${termaiKey}`)
        await xp.sendMessage(chat.id, { text: res.data.data || res.data.result || 'Gagal.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Muslim AI (Harz)
  ev.on({
    cmd: ['muslimai'],
    name: 'Muslim AI',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .muslimai siapa itu nabi muhammad' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`https://api.harzrestapi.web.id/api/muslimai?text=${encodeURIComponent(text)}`)
        await xp.sendMessage(chat.id, { text: res.data.result || res.data.data || 'Gagal.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Felo AI (Harz)
  ev.on({
    cmd: ['felo'],
    name: 'Felo AI',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .felo apa itu nextjs' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`https://api.harzrestapi.web.id/api/felo?text=${encodeURIComponent(text)}`)
        await xp.sendMessage(chat.id, { text: res.data.result || res.data.data || 'Gagal.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Hermes AI (Harz)
  ev.on({
    cmd: ['hermes'],
    name: 'Hermes AI',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .hermes apa itu quantum physics' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get(`https://api.harzrestapi.web.id/api/hermes?text=${encodeURIComponent(text)}`)
        await xp.sendMessage(chat.id, { text: res.data.result || res.data.data || 'Gagal.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // AI Generate (Harz)
  ev.on({
    cmd: ['aigen', 'aigenerate'],
    name: 'AI Image Generate',
    run: async (xp, m, { text, chat }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Contoh: .aigen futuristic vibes --style anime' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const style = text.includes('--style') ? text.split('--style')[1].trim() : 'anime'
        const prompt = text.split('--style')[0].trim()
        const res = await axios.get(`https://api.harzrestapi.web.id/api/aigenerate?prompt=${encodeURIComponent(prompt)}&style=${encodeURIComponent(style)}`)
        const url = findUrl(res.data)
        if (url) {
          await xp.sendMessage(chat.id, { image: { url }, caption: `Prompt: ${prompt}\nStyle: ${style}` }, { quoted: m })
        } else {
          await xp.sendMessage(chat.id, { text: '❌ Gagal membuat gambar AI.' }, { quoted: m })
        }
      } catch (e) { console.error(e) }
    }
  })
}
