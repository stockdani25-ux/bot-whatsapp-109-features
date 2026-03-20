import axios from 'axios'
import { findUrl, sendMedia, resolveUrl } from '../../system/helper.js'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = process.env.NAZE_API_KEY || 'nz-6f568e3e62'
const apiDanzy = 'https://api.danzy.web.id/api'
const danzyKey = process.env.DANZY_API_KEY || 'isi_apikey_disini'
const dl = async (url) => (await axios.get(url)).data

export default (ev) => {

  // TikTok
  ev.on({
    cmd: ['tiktok', 'tt', 'ttdl', 'tiktokmp4'],
    name: 'TikTok Video',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.tiktok.com/@xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const finalUrl = await resolveUrl(args[0])
        
        // 1. Try Danzy API First
        try {
          const resD = await axios.get(`${apiDanzy}/download/tiktok?url=${encodeURIComponent(finalUrl)}&apikey=${danzyKey}`)
          const dD = resD.data?.data || resD.data
          if (dD && resD.data?.status !== false) {
             const images = dD.images || dD.photo || dD.slideshow
             if (images && images.length > 0) {
               for (const img of images) await xp.sendMessage(chat.id, { image: { url: img }, caption: `Done ✨ (${dD.title || ''})` }, { quoted: m })
               return
             }
             // Prioritize direct video links if available (nowm, no_watermark, etc)
             const vUrl = dD.nowm || dD.no_watermark || dD.video || findUrl(dD, 'video')
             if (vUrl) return await sendMedia(xp, chat, vUrl, dD.title || 'Done ✨', m, 'video')
          }
        } catch (e) { console.error('TikTok Danzy Failed:', e.message) }

        // 2. Try Naze API Second
        try {
          const res = await dl(`${apiNaze}/download/tiktok?url=${encodeURIComponent(finalUrl)}&apikey=${nazeKey}`)
          const d = res.result || res.data
          if (d) {
             const images = d.images || d.photo || d.slideshow
             if (images && images.length > 0) {
               for (const img of images) await xp.sendMessage(chat.id, { image: { url: img }, caption: `Done ✨ (${d.title || ''})` }, { quoted: m })
               return
             }
             const vUrl = findUrl(d, 'video')
             if (vUrl) return await sendMedia(xp, chat, vUrl, d.title || 'Done ✨', m, 'video')
          }
        } catch (e) { console.error('TikTok Naze Failed:', e.message) }

        // 3. Try Siputzx Last
        try {
           const resS = await axios.get(`https://api.siputzx.my.id/api/social/tiktok?url=${encodeURIComponent(finalUrl)}`)
           const dS = resS.data?.data || resS.data
           const vUrl = findUrl(dS, 'video')
           if (vUrl) return await sendMedia(xp, chat, vUrl, dS.title || 'Done ✨', m, 'video')
        } catch (e) { console.error('TikTok Siputzx Failed:', e.message) }

        xp.sendMessage(chat.id, { text: '❌ Gagal mendownload TikTok. Semua API sedang bermasalah.' }, { quoted: m })
      } catch (e) {
        console.error(e)
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan saat memproses link TikTok.' }, { quoted: m })
      }
    }
  })

  // Instagram
  ev.on({
    cmd: ['ig', 'igdl', 'igreels'],
    name: 'Instagram Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.instagram.com/reel/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const finalUrl = await resolveUrl(args[0])
        
        // 1. Try Danzy API First
        try {
          const resD = await axios.get(`${apiDanzy}/download/instagram?url=${encodeURIComponent(finalUrl)}`)
          const dD = resD?.data?.data || resD?.data?.result || resD?.data
          if (dD && resD.data?.status !== false) {
             const results = Array.isArray(dD) ? dD : [dD]
             let sent = false
             for (const item of results) {
               const url = findUrl(item)
               if (url) {
                 await sendMedia(xp, chat, url, resD.data?.title || 'Done ✨', m)
                 sent = true
               }
             }
             if (sent) return
          }
        } catch (e) { console.error('IG Danzy Failed:', e.message) }

        // 2. Try Naze API Second
        try {
          const res = await dl(`${apiNaze}/download/instagram?url=${encodeURIComponent(finalUrl)}&apikey=${nazeKey}`)
          const d = res.result || res.data
          if (d) {
             const results = Array.isArray(d) ? d : [d]
             let sent = false
             for (const item of results) {
               const url = findUrl(item)
               if (url) {
                 await sendMedia(xp, chat, url, 'Done ✨', m)
                 sent = true
               }
             }
             if (sent) return
          }
        } catch (e) { console.error('IG Naze Failed:', e.message) }

        xp.sendMessage(chat.id, { text: '❌ Gagal mendownload Instagram. Pastikan link publik atau coba lagi nanti.' }, { quoted: m })
      } catch (e) {
        console.error(e)
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan saat memproses link Instagram.' }, { quoted: m })
      }
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
        const res = await axios.get(`${apiDanzy}/download/facebook?url=${encodeURIComponent(args[0])}`).catch(() => null)
        const url = findUrl(res?.data, 'video')
        if (url) return await sendMedia(xp, chat, url, 'Done ✨', m, 'video')
        await xp.sendMessage(chat.id, { text: 'Gagal download Facebook.' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // YouTube Video
  ev.on({
    cmd: ['ytmp4', 'ytv'],
    name: 'YouTube Video',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://youtu.be/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const finalUrl = await resolveUrl(args[0])
        const resD = await axios.get(`${apiDanzy}/download/ytmp4?url=${encodeURIComponent(finalUrl)}`)
        const urlD = findUrl(resD.data, 'video')
        if (!urlD) return xp.sendMessage(chat.id, { text: '❌ Gagal mendapatkan link YouTube Video dari Danzy.' }, { quoted: m })
        await sendMedia(xp, chat, urlD, resD.data?.title || 'Done ✨', m, 'video')
      } catch (e) {
        console.error(e)
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan saat mendownload YouTube Video.' }, { quoted: m })
      }
    }
  })

  // AIO
  ev.on({
    cmd: ['aio', 'aio2', 'aio3'],
    name: 'AIO Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://url` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await dl(`${apiNaze}/download/${cmd}?url=${encodeURIComponent(args[0])}&apikey=${nazeKey}`)
        const d = res.result || res.data
        const url = findUrl(d)
        if (!url) return xp.sendMessage(chat.id, { text: '❌ Gagal mendapatkan link.' }, { quoted: m })
        await sendMedia(xp, chat, url, d.title || 'Done ✨', m)
      } catch (e) { console.error(e) }
    }
  })

}
