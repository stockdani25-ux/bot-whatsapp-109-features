export default (ev) => {

  ev.on({
    cmd: ['tagall', 'tagmember'],
    name: 'Tag All Member',
    run: async (xp, m, { chat, text }) => {
      if (!chat.id.endsWith('@g.us')) return xp.sendMessage(chat.id, { text: 'Hanya untuk grup!' }, { quoted: m })
      const metadata = await xp.groupMetadata(chat.id)
      const members = metadata.participants.map(p => p.id)
      const msg = text || 'Hey!'
      let teks = `📢 *${msg}*\n\n`
      members.forEach(m2 => { teks += `@${m2.split('@')[0]}\n` })
      await xp.sendMessage(chat.id, { text: teks, mentions: members }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['hidetag'],
    name: 'Hide Tag',
    run: async (xp, m, { chat, text }) => {
      if (!chat.id.endsWith('@g.us')) return xp.sendMessage(chat.id, { text: 'Hanya untuk grup!' }, { quoted: m })
      const metadata = await xp.groupMetadata(chat.id)
      const members = metadata.participants.map(p => p.id)
      await xp.sendMessage(chat.id, { text: text || '‎', mentions: members }, { quoted: m })
    }
  })

  ev.on({
    cmd: ['add'],
    name: 'Add Member',
    run: async (xp, m, { args, chat, isOwner }) => {
      if (!chat.id.endsWith('@g.us')) return xp.sendMessage(chat.id, { text: 'Hanya untuk grup!' }, { quoted: m })
      
      const metadata = await xp.groupMetadata(chat.id)
      const botId = xp.user.id.replace(/:.*@/, '@')
      const botParticipant = metadata.participants.find(p => p.id === botId)
      const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')
      if (!isBotAdmin) return xp.sendMessage(chat.id, { text: 'Bot harus jadi admin!' }, { quoted: m })

      const senderParticipant = metadata.participants.find(p => p.id === m.sender)
      const isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin')
      if (!isSenderAdmin && !isOwner) return xp.sendMessage(chat.id, { text: 'Hanya admin yang bisa tambah member!' }, { quoted: m })

      if (!args[0]) return xp.sendMessage(chat.id, { text: 'Masukkan nomor yang mau ditambahkan.' }, { quoted: m })
      const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      try {
        await xp.groupParticipantsUpdate(chat.id, [number], 'add')
        await xp.sendMessage(chat.id, { text: `✅ Berhasil menambahkan @${args[0]}`, mentions: [number] }, { quoted: m })
      } catch (e) {
        xp.sendMessage(chat.id, { text: 'Gagal menambahkan member.' }, { quoted: m })
      }
    }
  })

  ev.on({
    cmd: ['kick', 'remove'],
    name: 'Kick Member',
    run: async (xp, m, { chat, isOwner }) => {
      if (!chat.id.endsWith('@g.us')) return xp.sendMessage(chat.id, { text: 'Hanya untuk grup!' }, { quoted: m })
      
      const metadata = await xp.groupMetadata(chat.id)
      const botId = xp.user.id.replace(/:.*@/, '@')
      const botParticipant = metadata.participants.find(p => p.id === botId)
      const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')
      if (!isBotAdmin) return xp.sendMessage(chat.id, { text: 'Bot harus jadi admin!' }, { quoted: m })

      const senderParticipant = metadata.participants.find(p => p.id === m.sender)
      const isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin')
      if (!isSenderAdmin && !isOwner) return xp.sendMessage(chat.id, { text: 'Hanya admin yang bisa kick!' }, { quoted: m })

      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || m.message?.extendedTextMessage?.contextInfo?.participant
      if (!target) return xp.sendMessage(chat.id, { text: 'Tag member yang mau dikick.' }, { quoted: m })
      try {
        await xp.groupParticipantsUpdate(chat.id, [target], 'remove')
        await xp.sendMessage(chat.id, { text: `✅ @${target.split('@')[0]} berhasil dikick.`, mentions: [target] }, { quoted: m })
      } catch (e) {
        xp.sendMessage(chat.id, { text: 'Gagal kick member.' }, { quoted: m })
      }
    }
  })

  ev.on({
    cmd: ['promote', 'addadmingrup'],
    name: 'Promote Member',
    run: async (xp, m, { chat, isOwner }) => {
      if (!chat.id.endsWith('@g.us')) return xp.sendMessage(chat.id, { text: 'Hanya untuk grup!' }, { quoted: m })
      
      const metadata = await xp.groupMetadata(chat.id)
      const botId = xp.user.id.replace(/:.*@/, '@')
      const botParticipant = metadata.participants.find(p => p.id === botId)
      const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')
      
      if (!isBotAdmin) return xp.sendMessage(chat.id, { text: 'Bot harus jadi admin untuk melakukan perintah ini!' }, { quoted: m })

      const senderParticipant = metadata.participants.find(p => p.id === m.sender)
      const isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin')
      
      if (!isSenderAdmin && !isOwner) return xp.sendMessage(chat.id, { text: 'Hanya admin yang bisa melakukan perintah ini!' }, { quoted: m })

      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || m.message?.extendedTextMessage?.contextInfo?.participant
      if (!target) return xp.sendMessage(chat.id, { text: 'Tag member yang mau dipromote.' }, { quoted: m })
      try {
        await xp.groupParticipantsUpdate(chat.id, [target], 'promote')
        await xp.sendMessage(chat.id, { text: `✅ @${target.split('@')[0]} berhasil dipromote jadi admin.`, mentions: [target] }, { quoted: m })
      } catch (e) {
        xp.sendMessage(chat.id, { text: 'Gagal promote member.' }, { quoted: m })
      }
    }
  })

  ev.on({
    cmd: ['demote'],
    name: 'Demote Admin',
    run: async (xp, m, { chat, isOwner }) => {
      if (!chat.id.endsWith('@g.us')) return xp.sendMessage(chat.id, { text: 'Hanya untuk grup!' }, { quoted: m })
      
      const metadata = await xp.groupMetadata(chat.id)
      const botId = xp.user.id.replace(/:.*@/, '@')
      const botParticipant = metadata.participants.find(p => p.id === botId)
      const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')
      if (!isBotAdmin) return xp.sendMessage(chat.id, { text: 'Bot harus jadi admin!' }, { quoted: m })

      const senderParticipant = metadata.participants.find(p => p.id === m.sender)
      const isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin')
      if (!isSenderAdmin && !isOwner) return xp.sendMessage(chat.id, { text: 'Hanya admin yang bisa demote!' }, { quoted: m })

      const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      if (!target) return xp.sendMessage(chat.id, { text: 'Tag admin yang mau didemote.' }, { quoted: m })
      try {
        await xp.groupParticipantsUpdate(chat.id, [target], 'demote')
        await xp.sendMessage(chat.id, { text: `✅ @${target.split('@')[0]} berhasil didemote.`, mentions: [target] }, { quoted: m })
      } catch (e) {
        xp.sendMessage(chat.id, { text: 'Gagal demote admin.' }, { quoted: m })
      }
    }
  })

  ev.on({
    cmd: ['linkgrup', 'linkgc'],
    name: 'Link Grup',
    run: async (xp, m, { chat }) => {
      if (!chat.id.endsWith('@g.us')) return xp.sendMessage(chat.id, { text: 'Hanya untuk grup!' }, { quoted: m })
      try {
        const code = await xp.groupInviteCode(chat.id)
        await xp.sendMessage(chat.id, { text: `🔗 Link grup:\nhttps://chat.whatsapp.com/${code}` }, { quoted: m })
      } catch (e) { xp.sendMessage(chat.id, { text: 'Gagal ambil link.' }, { quoted: m }) }
    }
  })
}
