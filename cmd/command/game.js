import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import { getDb, saveDb, isOwner } from '../../system/helper.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Game sessions (global agar bisa diakses dari multiple places)
if (!global.gameSessions) global.gameSessions = {}

export default (ev) => {

  // Slot machine
  ev.on({
    cmd: ['slot'],
    name: 'Slot Machine',
    run: async (xp, m, { args, chat, sender, senderNum, isOwner: ownerCheck }) => {
      let db = getDb()
      const user = db[sender]
      const isUserOwner = ownerCheck || isOwner(senderNum)
      
      const amount = parseInt(args[0]) || 1
      if (amount < 1) return xp.sendMessage(chat.id, { text: 'Minimal bet 1 limit!' }, { quoted: m })
      if (!isUserOwner && user.limit < amount) return xp.sendMessage(chat.id, { text: `Limit kamu tidak cukup! Sisa limit: ${user.limit}` }, { quoted: m })
      
      const winChance = (global.winChance || 10) / 100
      const slots = ['🍎', '🍋', '🍇', '⭐', '💎', '🔔']
      const win = Math.random() < winChance
      
      // Deduct limit if not owner
      if (!isUserOwner) user.limit -= amount
      
      let r1, r2, r3
      if (win) {
        r1 = r2 = r3 = slots[Math.floor(Math.random() * slots.length)]
        if (!isUserOwner) user.limit += (amount * 3)
      } else {
        r1 = slots[Math.floor(Math.random() * slots.length)]
        r2 = slots[Math.floor(Math.random() * slots.length)]
        r3 = slots[Math.floor(Math.random() * slots.length)]
        if (r1 === r2 && r2 === r3) r3 = slots[(slots.indexOf(r1) + 1) % slots.length]
      }
      
      saveDb(db)

      const txt = `🎰 *SLOT MACHINE* 🎰\n\n[ ${r1} | ${r2} | ${r3} ]\n\n${win ? '🎉 JACKPOT! Kamu menang ' + (amount * 3) + ' limit!' : '😢 Sayang, kamu kalah ' + amount + ' limit.'}\n\nSisa limit: ${isUserOwner ? 'Infinity' : user.limit}`
      await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
    }
  })

  // Casino (roulette)
  ev.on({
    cmd: ['casino', 'roulette'],
    name: 'Casino Roulette',
    run: async (xp, m, { args, chat, sender, senderNum, isOwner: ownerCheck }) => {
      const pilihanUser = args[0]?.toLowerCase()
      const amount = parseInt(args[1]) || 1
      const isUserOwner = ownerCheck || isOwner(senderNum)
      
      let db = getDb()
      const user = db[sender]
      const options = ['merah', 'hitam', 'hijau']
      
      if (!pilihanUser || !options.includes(pilihanUser)) return xp.sendMessage(chat.id, { text: `Pilih: .casino <merah/hitam/hijau> <jumlah>\nPeluang hijau 1/12` }, { quoted: m })
      if (!isUserOwner && user.limit < amount) return xp.sendMessage(chat.id, { text: `Limit kamu tidak cukup! Sisa limit: ${user.limit}` }, { quoted: m })

      const winChance = (global.winChance || 10) / 100
      const win = Math.random() < winChance
      
      // Deduct limit if not owner
      if (!isUserOwner) user.limit -= amount
      
      const hasil = win ? pilihanUser : options.filter(o => o !== pilihanUser)[Math.floor(Math.random() * 2)]
      const mult = hasil === 'hijau' ? 12 : 2
      
      if (win) {
          if (!isUserOwner) user.limit += (amount * mult)
      }
      
      saveDb(db)
      
      const txt = `🎡 *ROULETTE*\n\n🎯 Pilihanmu: *${pilihanUser}*\n🎰 Hasilnya: *${hasil}*\n\n${win ? `🎉 MENANG! +${amount * mult} limit!` : `😢 KALAH! -${amount} limit.`}\n\nSisa limit: ${isUserOwner ? 'Infinity' : user.limit}`
      await xp.sendMessage(chat.id, { text: txt }, { quoted: m })
    }
  })

  // Rock Paper Scissors (Suwit)
  ev.on({
    cmd: ['suwit', 'rps'],
    name: 'Suit/RPS',
    run: async (xp, m, { args, chat }) => {
      const choices = { 'batu': '✊', 'kertas': '✋', 'gunting': '✌️' }
      const pilihanUser = args[0]?.toLowerCase()
      if (!choices[pilihanUser]) return xp.sendMessage(chat.id, { text: 'Pilih: .suwit batu/kertas/gunting' }, { quoted: m })
      const keys = Object.keys(choices)
      const bot = keys[Math.floor(Math.random() * 3)]
      const wins = { batu: 'gunting', kertas: 'batu', gunting: 'kertas' }
      let result = '🤝 Seri!'
      if (wins[pilihanUser] === bot) result = '🎉 Kamu menang!'
      else if (wins[bot] === pilihanUser) result = '😢 Kamu kalah!'
      await xp.sendMessage(chat.id, { text: `✊✋✌️ *SUIT*\n\nKamu: ${choices[pilihanUser]} ${pilihanUser}\nBot: ${choices[bot]} ${bot}\n\n${result}` }, { quoted: m })
    }
  })

  // Truth or Dare
  ev.on({
    cmd: ['truth', 'dare'],
    name: 'Truth or Dare',
    run: async (xp, m, { chat, cmd }) => {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/r/${cmd === 'truth' ? 'truth' : 'dare'}`)
        const text = res.data.data || res.data.result || 'Tidak ada data.'
        await xp.sendMessage(chat.id, { text: `*${cmd.toUpperCase()}*\n\n${text}` }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Tebak games
  ev.on({
    cmd: ['tebak-kartun', 'tebakkartun', 'tebak-kata', 'tebakkata', 'tebak-bendera', 'tebakbendera',
      'tebak-hewan', 'tebakhewan', 'tebak-jkt', 'tebakjkt', 'tebak-tebakan', 'tebaktebakan',
      'family100', 'tebak-gambar', 'tebakgambar', 'cak-lontong', 'caklontong', 'tebak-kalimat',
      'tebakkalimat', 'tekateki', 'teka-teki', 'asah-otak', 'asahotak', 'susun-kata', 'susunkata',
      'tebak-lagu', 'tebaklagu', 'tebak-kimia', 'tebakkimia', 'tebak-game', 'tebakgame',
      'tebak-logo', 'tebaklogo', 'tebak-lirik', 'tebaklirik', 'siapakahaku', 'surah',
      'karakter-freefire', 'lengkapi-kalimat', 'lengkapikalimat'],
    name: 'Tebak Games',
    run: async (xp, m, { chat, cmd }) => {
      if (global.gameSessions[chat.id]) return xp.sendMessage(chat.id, { text: 'Ada game yang sedang berjalan!' }, { quoted: m })
      const gameName = cmd.replace(/-/g, '')
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/games/${gameName}`)
        if (!res.data.status) return xp.sendMessage(chat.id, { text: 'Game tidak tersedia.' }, { quoted: m })
        const data = res.data.data
        const answer = data.jawaban || data.name || data.result
        if (!answer) return xp.sendMessage(chat.id, { text: 'Gagal mendapatkan jawaban.' }, { quoted: m })
        global.gameSessions[chat.id] = {
          answer,
          command: gameName,
          timeout: setTimeout(() => {
            if (global.gameSessions[chat.id]) {
              const ans = Array.isArray(global.gameSessions[chat.id].answer) ? global.gameSessions[chat.id].answer[0] : global.gameSessions[chat.id].answer
              xp.sendMessage(chat.id, { text: `⏱️ *WAKTU HABIS!*\nJawaban: *${ans}*` })
              delete global.gameSessions[chat.id]
            }
          }, 60000)
        }
        let qMsg = `*GAME: ${gameName.toUpperCase()}*\n\n${data.soal || data.pertanyaan || data.unsur || 'Tebak ya!'}`
        if (data.deskripsi) qMsg += `\n\n*Hint:* ${data.deskripsi}`
        const img = data.img || data.gambar || (data.data?.img) || (data.data?.image)
        if (img) await xp.sendMessage(chat.id, { image: { url: img }, caption: qMsg }, { quoted: m })
        else await xp.sendMessage(chat.id, { text: qMsg }, { quoted: m })
      } catch (e) { console.error(e) }
    }
  })

  // Tic Tac Toe
  ev.on({
    cmd: ['tictactoe', 'ttt'],
    name: 'Tic Tac Toe',
    run: async (xp, m, { chat, sender }) => {
      if (global.gameSessions[chat.id]) return xp.sendMessage(chat.id, { text: 'Ada game yang sedang berjalan!' }, { quoted: m })
      global.gameSessions[chat.id] = {
        command: 'tictactoe',
        board: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        turn: sender,
        player1: sender,
        player2: null,
        status: 'waiting'
      }
      await xp.sendMessage(chat.id, { text: `*TIC TAC TOE*\n\nMenunggu lawan... Ketik *terima* untuk bergabung.\n\nBoard:\n1 | 2 | 3\n4 | 5 | 6\n7 | 8 | 9` })
    }
  })

  // Rob
  ev.on({
    cmd: ['rob', 'rampok'],
    name: 'Rob',
    run: async (xp, m, { chat }) => {
      const winChance = (global.winChance || 50) / 100
      const success = Math.random() < winChance
      const amount = Math.floor(Math.random() * 500) + 50
      await xp.sendMessage(chat.id, { text: success ? `✅ Berhasil merampok! Kamu mendapat ${amount} limit 💰` : `❌ Gagal merampok! Kamu kehilangan ${amount} limit 😢` }, { quoted: m })
    }
  })
}
