import Jimp from 'jimp'
const apiDanzy = 'https://api.danzy.web.id/api'

export default (ev) => {

  ev.on({
    cmd: ['waifu'],
    name: 'Waifu Image',
    run: async (xp, m, { chat }) => {
      try {
        const resD = await axios.get(`${apiDanzy}/random/waifu`, { responseType: 'arraybuffer' }).catch(() => null)
        if (resD) {
          console.log('Danzy Waifu Status:', resD.status)
          if (resD.status === 200) {
            return await xp.sendMessage(chat.id, { image: Buffer.from(resD.data), caption: 'Waifu ✨ (Danzy)' }, { quoted: m })
          }
        }
        const res = await axios.get('https://api.waifu.pics/sfw/waifu')
        await xp.sendMessage(chat.id, { image: { url: res.data.url }, caption: 'Waifu ✨' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  ev.on({
    cmd: ['neko'],
    name: 'Neko Image',
    run: async (xp, m, { chat }) => {
      try {
        const resD = await axios.get(`${apiDanzy}/random/neko`, { responseType: 'arraybuffer' }).catch(() => null)
        if (resD) {
          console.log('Danzy Neko Status:', resD.status)
          if (resD.status === 200) {
            return await xp.sendMessage(chat.id, { image: Buffer.from(resD.data), caption: 'Neko ~ (Danzy)' }, { quoted: m })
          }
        }
        const res = await axios.get('https://api.waifu.pics/sfw/neko')
        await xp.sendMessage(chat.id, { image: { url: res.data.url }, caption: 'Neko  ~' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  ev.on({
    cmd: ['blue-archive', 'bluearchive'],
    name: 'Blue Archive',
    run: async (xp, m, { chat }) => {
      try {
        const resD = await axios.get(`${apiDanzy}/random/blue-archive`, { responseType: 'arraybuffer' }).catch(() => null)
        if (resD && resD.status === 200) {
          return await xp.sendMessage(chat.id, { image: Buffer.from(resD.data), caption: 'Blue Archive ✨ (Danzy)' }, { quoted: m })
        }
        const res = await axios.get('https://api.siputzx.my.id/api/r/blue-archive')
        const url = res.data?.data?.url || res.data?.url
        if (url) await xp.sendMessage(chat.id, { image: { url }, caption: 'Blue Archive ✨' }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  ev.on({
    cmd: ['quotesanime', 'kuoteanime'],
    name: 'Quotes Anime',
    run: async (xp, m, { chat }) => {
      try {
        const resD = await axios.get(`${apiDanzy}/random/quotesanime`).catch(() => null)
        if (resD?.data) {
          console.log('Danzy Quotes Debug:', JSON.stringify(resD.data, null, 2))
          const d = resD.data
          const status = d.status === true || d.status === 200 || d.success === true
          const val = d.data || d.result
          if (status && val) {
            const txt = typeof val === 'string' ? val : `"${val.text || val.quote || val.lyrics}"\n\n— *${val.character || val.author || 'Unknown'}*`
            return await xp.sendMessage(chat.id, { text: txt + '\n\n(Danzy)' }, { quoted: m })
          }
        }
        const res = await axios.get('https://api.siputzx.my.id/api/r/anime-quotes')
        const d = res.data?.data || res.data
        const txt = typeof d === 'string' ? d : `"${d.text || d.quote}"\n\n— *${d.character || d.author || 'Unknown'}*`
        await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  ev.on({
    cmd: ['fakegm', 'fakegf'],
    name: 'Fake Chat',
    run: async (xp, m, { args, chat, cmd }) => {
      if (!args[0]) return xp.sendMessage(chat.id, { text: `Contoh: .${cmd} halo kamu cantik` }, { quoted: m })
      const text = args.join(' ')
      const type = cmd === 'fakegm' ? 'gm' : 'gf'
      const name = cmd === 'fakegm' ? 'Fajar' : 'Aisyah'
      await xp.sendMessage(chat.id, { image: { url: `https://api.siputzx.my.id/api/canvas/fake-chat?type=${type}&name=${name}&text=${encodeURIComponent(text)}` }, caption: 'Done ✨' }, { quoted: m })
    }
  })

  // --- Quotes ---
  ev.on({
    cmd: ['quotes', 'quote'],
    name: 'Random Quotes',
    run: async (xp, m, { chat }) => {
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const res = await axios.get('https://zyzzkylin3.vercel.app/api/random/quotes')
        const d = res.data.result || res.data
        const txt = `"${d.quotes || d.quote || d.text}"\n\n— *${d.author || 'Unknown'}*`
        await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // --- NSFW Categories ---
  ev.on({
    cmd: ['waifunsfw', 'waifu-nsfw', 'nekonsfw', 'neko-nsfw', 'trap', 'blowjob', 'hentai', 'pussy', 'masturbation', 'ahegao', 'panties', 'thighs', 'ass', 'orgy'],
    name: 'NSFW Random Image',
    run: async (xp, m, { chat, cmd }) => {
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const category = cmd.replace(/-/g, '').replace('nsfw', '')
        let url = ''
        
        // Waifu.pics support these tags
        const wpTags = ['waifu', 'neko', 'trap', 'blowjob']
        if (wpTags.includes(category)) {
          const res = await axios.get(`https://api.waifu.pics/nsfw/${category}`)
          url = res.data.url
        } else {
          // Others via Siputzx
          const res = await axios.get(`https://api.siputzx.my.id/api/r/${category}`)
          url = res.data.data?.url || res.data.url
        }

        if (url) {
            const imgRes = await axios.get(url, { responseType: 'arraybuffer' })
            const image = await Jimp.read(imgRes.data)
            const jpgBuffer = await image.quality(90).getBufferAsync(Jimp.MIME_JPEG)
            await xp.sendMessage(chat.id, { image: jpgBuffer, mimetype: 'image/jpeg', fileName: `${cmd}.jpg`, caption: `Done ✨ Category: ${cmd}` }, { quoted: m })
        } else throw new Error('No URL found')
      } catch (e) {
        console.error(e)
        await xp.sendMessage(chat.id, { text: `❌ Gagal mengambil gambar NSFW kategori ${cmd}.` }, { quoted: m })
      }
    }
  })
}
