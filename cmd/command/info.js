import axios from 'axios'

export default (ev) => {

  // Menu Utama
  ev.on({
    cmd: ['menu', 'help', 'start', 'allmenu'],
    name: 'Main Menu',
    run: async (xp, m, { chat, sender, pushName, prefix }) => {
      const db = global.db()
      const user = db[sender] || { money: 0, limit: 10, status: 'User Free' }

      const hari = global.time.timeIndo('Asia/Jakarta', 'dddd')
      const tanggal = global.time.timeIndo('Asia/Jakarta', 'DD MMMM YYYY')
      const waktu = global.time.timeIndo('Asia/Jakarta', 'HH.mm.ss')

      const menuText = `*「 ALL MENU - ${global.botName} 」*

👤 *User* : ${pushName}
🏅 *Status* : ${user.status}
💰 *Balance* : Rp ${user.money?.toLocaleString('id-ID') || 0}
🎫 *Limit* : ${user.limit}

📅 *Hari* : ${hari}
📆 *Tanggal* : ${tanggal}
⌚ *Waktu* : ${waktu}

*「 MAIN MENU 」*
⏧ ${prefix}profile
⏧ ${prefix}runtime
⏧ ${prefix}ping
⏧ ${prefix}afk
⏧ ${prefix}menfes
⏧ ${prefix}confes
⏧ ${prefix}roomai
⏧ ${prefix}owner
⏧ ${prefix}tagme

*「 AI MENU 」*
⏧ ${prefix}ai
⏧ ${prefix}chatgpt
⏧ ${prefix}blackbox
⏧ ${prefix}gemini
⏧ ${prefix}bypass
⏧ ${prefix}mathgpt
⏧ ${prefix}deepimg
⏧ ${prefix}editimg

*「 MAKER MENU 」*
⏧ ${prefix}sticker
⏧ ${prefix}brat
⏧ ${prefix}bratv
⏧ ${prefix}qc
⏧ ${prefix}ttp
⏧ ${prefix}attp
⏧ ${prefix}fakestory
⏧ ${prefix}faketweet
⏧ ${prefix}story-ig
⏧ ${prefix}meme
⏧ ${prefix}wasted
⏧ ${prefix}triggered
⏧ ${prefix}absolute-cinema
⏧ ${prefix}skintone
⏧ ${prefix}smeme
⏧ ${prefix}nulis
⏧ ${prefix}ephoto
⏧ ${prefix}toimg
⏧ ${prefix}removebg
⏧ ${prefix}blurface

*「 DOWNLOADER MENU 」*
⏧ ${prefix}tiktok
⏧ ${prefix}ig
⏧ ${prefix}fb
⏧ ${prefix}ytmp4
⏧ ${prefix}ytmp3
⏧ ${prefix}spotify
⏧ ${prefix}scdl
⏧ ${prefix}ttmp3
⏧ ${prefix}mediafire
⏧ ${prefix}mega
⏧ ${prefix}gdrive
⏧ ${prefix}github
⏧ ${prefix}aio

*「 SEARCH MENU 」*
⏧ ${prefix}yts
⏧ ${prefix}lyrics
⏧ ${prefix}pinsearch
⏧ ${prefix}ttsearch
⏧ ${prefix}yimage
⏧ ${prefix}applemusic
⏧ ${prefix}scsearch
⏧ ${prefix}genius
⏧ ${prefix}pixiv
⏧ ${prefix}lahelu

*「 GAME MENU 」*
⏧ ${prefix}tictactoe
⏧ ${prefix}slot
⏧ ${prefix}casino
⏧ ${prefix}suwit
⏧ ${prefix}truth
⏧ ${prefix}dare
⏧ ${prefix}tebakkartun
⏧ ${prefix}tebakkata
⏧ ${prefix}tebakbendera
⏧ ${prefix}tebakhewan
⏧ ${prefix}tebakjkt
⏧ ${prefix}tebaktebakan
⏧ ${prefix}family100
⏧ ${prefix}tebakgambar
⏧ ${prefix}caklontong
⏧ ${prefix}tekateki
⏧ ${prefix}asahotak
⏧ ${prefix}susunkata
⏧ ${prefix}tebaklagu
⏧ ${prefix}tebakgame
⏧ ${prefix}tebaklogo
⏧ ${prefix}siapakahaku
⏧ ${prefix}rob

*「 TOOLS MENU 」*
⏧ ${prefix}hd
⏧ ${prefix}remini
⏧ ${prefix}removewm
⏧ ${prefix}recolor
⏧ ${prefix}mirror
⏧ ${prefix}rotate
⏧ ${prefix}pixel
⏧ ${prefix}img2ansi
⏧ ${prefix}rainbow
⏧ ${prefix}sinonim
⏧ ${prefix}singkatan
⏧ ${prefix}rangkum
⏧ ${prefix}blurphoto
⏧ ${prefix}facepalm
⏧ ${prefix}tolol

*「 NEWS MENU 」*
⏧ ${prefix}cnbc
⏧ ${prefix}cnn
⏧ ${prefix}kompas
⏧ ${prefix}liputan6
⏧ ${prefix}tribun
⏧ ${prefix}jkt48

*「 GROUP MENU 」*
⏧ ${prefix}tagall
⏧ ${prefix}hidetag
⏧ ${prefix}add
⏧ ${prefix}kick
⏧ ${prefix}promote
⏧ ${prefix}demote
⏧ ${prefix}linkgrup

*「 OWNER MENU 」*
⏧ ${prefix}public
⏧ ${prefix}self
⏧ ${prefix}restart
⏧ ${prefix}broadcast
⏧ ${prefix}eval
⏧ ${prefix}adduang
⏧ ${prefix}addlimit
⏧ ${prefix}addowner
⏧ ${prefix}delowner`

      // Test kirim pesan simpel dulu
      await xp.sendMessage(chat.id, { text: '🔄 Memuat Menu...' })

      const adReply = {
        title: `「 ${global.botFullName} 」`,
        body: global.footer,
        sourceUrl: global.idCh,
        mediaType: 1,
        renderLargerThumbnail: true
      }
      if (global.thumbnail) adReply.thumbnailUrl = global.thumbnail

      try {
        await xp.sendMessage(chat.id, {
          text: menuText,
          contextInfo: {
            externalAdReply: adReply
          }
        }, { quoted: m })
      } catch (err) {
        console.error('Menu Send Error:', err)
        // Kirim tanpa adReply kalau gagal
        await xp.sendMessage(chat.id, { text: menuText }, { quoted: m })
      }
    }
  })

  // Ping
  ev.on({
    cmd: ['ping'],
    name: 'Ping',
    run: async (xp, m, { chat }) => {
      const start = Date.now()
      const ping = Date.now() - start
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
