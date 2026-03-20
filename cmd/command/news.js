import axios from 'axios'

const sources = {
  cnbc: 'cnbcindonesia', suara: 'suara', liputan6: 'liputan6',
  tribun: 'tribunnews', sindonews: 'sindonews', kompas: 'kompas',
  merdeka: 'merdeka', cnn: 'cnn', jkt48: 'jkt48', antara: 'antara'
}

export default (ev) => {
  ev.on({
    cmd: ['cnbc', 'suara', 'liputan6', 'tribun', 'sindonews', 'kompas', 'merdeka', 'cnn', 'jkt48', 'antara'],
    name: 'Berita',
    run: async (xp, m, { chat, cmd }) => {
      await xp.sendMessage(chat.id, { react: { text: '⏳', key: m.key } })
      try {
        const src = sources[cmd]
        const res = await axios.get(`https://api.siputzx.my.id/api/berita/${src}`)
        if (res.data.status && res.data.data.length > 0) {
          let txt = `*「 ${cmd.toUpperCase()} NEWS 」*\n\n`
          res.data.data.slice(0, 5).forEach((item, i) => {
            txt += `${i + 1}. *${item.title}*\n🔗 ${item.link}\n\n`
          })
          await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
        } else {
          xp.sendMessage(chat.id, { text: `Gagal mengambil berita dari ${cmd}.` }, { quoted: m })
        }
      } catch (e) { console.error(e) }
    }
  })
}
