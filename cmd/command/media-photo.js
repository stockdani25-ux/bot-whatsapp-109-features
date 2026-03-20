import axios from 'axios'
import { findUrl, sendMedia, resolveUrl } from '../../system/helper.js'

const apiNaze = 'https://api.naze.biz.id'
const nazeKey = process.env.NAZE_API_KEY || 'nz-6f568e3e62'
const apiDanzy = 'https://api.danzy.web.id/api'
const dl = async (url) => (await axios.get(url)).data

export default (ev) => {

  // Pinterest
  ev.on({
    cmd: ['pin', 'pindl'],
    name: 'Pinterest Downloader',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} https://www.pinterest.com/pin/xxx` }, { quoted: m })
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const finalUrl = await resolveUrl(args[0])

        // 1. Danzy API
        try {
          const resD = await axios.get(`${apiDanzy}/download/pinterest?url=${encodeURIComponent(finalUrl)}`)
          const urlD = findUrl(resD?.data, 'image')
          if (urlD) return await sendMedia(xp, chat, urlD, 'Done ✨', m, 'image')
        } catch (e) { console.error('Pin Danzy Failed:', e.message) }

        // 2. Naze API
        try {
          const res = await dl(`${apiNaze}/download/pinterest?url=${encodeURIComponent(finalUrl)}&apikey=${nazeKey}`)
          const d = res.result || res.data
          const url = findUrl(d, 'image')
          if (url) return await sendMedia(xp, chat, url, 'Done ✨', m)
        } catch (e) { console.error('Pin Naze Failed:', e.message) }

        xp.sendMessage(chat.id, { text: '❌ Gagal mendownload Pinterest. Pastikan link benar.' }, { quoted: m })
      } catch (e) {
        console.error(e)
        xp.sendMessage(chat.id, { text: '❌ Terjadi kesalahan saat memproses Pinterest.' }, { quoted: m })
      }
    }
  })

}
