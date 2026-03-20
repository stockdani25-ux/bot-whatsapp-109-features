import axios from 'axios'

export default (ev) => {

  ev.on({
    cmd: ['waifu'],
    name: 'Waifu Image',
    run: async (xp, m, { chat }) => {
      try {
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
}
