import axios from 'axios'

export default (ev) => {

  // Menu Utama
  ev.on({
    cmd: ['menu', 'help', 'start'],
    name: 'Menu',
    run: async (xp, m, { chat }) => {
      const menu = `╭─「 *${global.botName}* 」
│
│  🖼️ *MAKER*
│  .s/sticker, .brat, .qc/qc2/qc3/iqc
│  .ttp/ttp2/ttp3, .attp~attp4
│  .fakestory, .faketweet, .meme/meme2
│  .wasted, .triggered, .absolutecinema
│  .skintone, .nulis, .ephoto, .toimg
│  .removebg, .blurface
│
│  📥 *DOWNLOADER*
│  .ytmp3, .ytmp4, .spotify, .tiktok
│  .ig, .igdl2, .mediafire, .mega
│  .gdrive, .github, .scdl, .fb
│  .aio, .aio2, .aio3, .pindl, .tiktokmp3
│
│  🛠️ *TOOLS*
│  .mirror, .rotate, .pixel, .hd
│  .remini, .removewm, .recolor
│  .img2ansi, .rainbow, .sinonim
│  .singkatan, .rangkum
│
│  🔍 *SEARCH*
│  .yts, .yimage, .applemusic
│  .scsearch, .genius, .pixiv
│  .spotifysearch, .spalbum, .meloboom
│  .ttsearch, .douyin, .lirik, .lahelu
│
│  🤖 *AI*
│  .ai, .chatgpt, .gemini, .blackbox
│  .bypass, .deepimg, .editimg
│  .roomai (mode AI aktif), .delroomai
│
│  🎮 *GAME*
│  .slot, .casino, .suwit, .truth, .dare
│  .tictactoe, .rob, .tebakgambar
│  .tebakkartun, .tebakkata, .tebaklagu
│
│  📰 *BERITA*
│  .kompas, .cnbc, .cnn, .liputan6
│  .tribun, .suara, .merdeka, .antara
│
│  🎲 *RANDOM*
│  .waifu, .neko, .quotesanime
│
│  ℹ️ *INFO*
│  .profile, .ping, .runtime
│  .tagall, .tagme, .react, .afk
│  .transfer, .transferlimit
│
│  👑 *OWNER*
│  .public, .self, .restart, .stop
│  .adduang, .addlimit, .addrole
│  .eval, .sc, .menfes
│
╰─ ${global.footer}`
      await xp.sendMessage(chat.id, { image: { url: global.thumbnail }, caption: menu }, { quoted: m })
    }
  })

  // Ping
  ev.on({
    cmd: ['ping'],
    name: 'Ping',
    run: async (xp, m, { chat }) => {
      const start = performance.now()
      const ping = performance.now() - start
      await xp.sendMessage(chat.id, { text: `🏓 *Pong!* Speed: ${ping.toFixed(2)}ms` }, { quoted: m })
    }
  })

  // Runtime
  ev.on({
    cmd: ['runtime', 'uptime'],
    name: 'Runtime',
    run: async (xp, m, { chat }) => {
      const s = process.uptime()
      const h = Math.floor(s / 3600), min = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
      await xp.sendMessage(chat.id, { text: `⏱️ *Runtime:* ${h}h ${min}m ${sec}s` }, { quoted: m })
    }
  })

  // Tagme
  ev.on({
    cmd: ['tagme'],
    name: 'Tag Me',
    run: async (xp, m, { chat, sender }) => {
      await xp.sendMessage(chat.id, { text: `@${sender.split('@')[0]}`, mentions: [sender] }, { quoted: m })
    }
  })

  // React
  ev.on({
    cmd: ['react'],
    name: 'React Pesan',
    run: async (xp, m, { args, chat }) => {
      if (!m.message?.extendedTextMessage?.contextInfo?.stanzaId) return xp.sendMessage(chat.id, { text: 'Reply pesan yang mau direact.' })
      if (!args[0]) return xp.sendMessage(chat.id, { text: 'Masukkan emojinya.' })
      await xp.sendMessage(chat.id, {
        react: {
          text: args[0],
          key: {
            remoteJid: chat.id,
            fromMe: false,
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant
          }
        }
      })
    }
  })

  // AFK
  ev.on({
    cmd: ['afk'],
    name: 'AFK',
    run: async (xp, m, { args, chat, sender }) => {
      if (!global.afkList) global.afkList = {}
      global.afkList[sender] = { reason: args.join(' ') || 'Tanpa alasan', time: Date.now() }
      await xp.sendMessage(chat.id, { text: `✈️ *AFK*\n@${sender.split('@')[0]} sedang AFK\nAlasan: ${global.afkList[sender].reason}`, mentions: [sender] }, { quoted: m })
    }
  })

  // Transfer limit
  ev.on({
    cmd: ['transferlimit'],
    name: 'Transfer Limit',
    run: async (xp, m, { args, chat, sender }) => {
      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
      const amount = parseInt(args[1] || args[0]) || 0
      if (!target || !amount) return xp.sendMessage(chat.id, { text: 'Format: .transferlimit @user jumlah' }, { quoted: m })
      await xp.sendMessage(chat.id, { text: `✅ Berhasil transfer ${amount} limit ke @${target.split('@')[0]}`, mentions: [target] }, { quoted: m })
    }
  })

  // Sumber kontak owner
  ev.on({
    cmd: ['owner', 'sc'],
    name: 'Owner Info',
    run: async (xp, m, { chat }) => {
      const num = global.ownerNumber[0]
      await xp.sendMessage(chat.id, {
        contacts: { displayName: global.ownerName, contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${global.ownerName}\nTEL;type=CELL;type=VOICE;waid=${num}:+${num}\nEND:VCARD` }] }
      }, { quoted: m })
    }
  })

  // Profil
  ev.on({
    cmd: ['profile', 'profil'],
    name: 'Profil User',
    run: async (xp, m, { chat, sender }) => {
      await xp.sendMessage(chat.id, {
        text: `👤 *Profil*\n\nNama: ${m.pushName || 'User'}\nNomor: ${sender.split('@')[0]}\nChat: ${chat.id.endsWith('@g.us') ? 'Grup' : 'Private'}`
      }, { quoted: m })
    }
  })
}
