import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

const apiTermai = 'https://api.termai.cc'
const termaiKey = 'Bell409'

export default (ev) => {

  // ChatGPT / AI
  ev.on({
    cmd: ['ai', 'chatgpt'],
    name: 'AI Chat',
    run: async (xp, m, { text, chat, cmd }) => {
      if (!text) return xp.sendMessage(chat.id, { text: 'Ada yang bisa saya bantu?' }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
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
        if (res.data.status) await xp.sendMessage(chat.id, { image: { url: res.data.data }, caption: text }, { quoted: m })
      } catch (e) { console.error(e) }
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
}
