import './system/global.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, Browsers } from '@whiskeysockets/baileys'
import pino from 'pino'
import chalk from 'chalk'
import 'dotenv/config'
import { loadAll, handleCmd } from './cmd/handle.js'
import { getDb, saveDb, dailyReset, isOwner as checkOwner } from './system/helper.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: true,
        markOnlineOnConnect: false
    })

    // Load semua cmd/command files
    await loadAll()

    sock.ev.on('creds.update', saveCreds)

    // Koneksi
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log(chalk.redBright.bold('Koneksi terputus.'), shouldReconnect ? 'Menghubungkan ulang...' : 'Logout.')
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log(chalk.greenBright.bold('✅ Bot sudah terhubung!'))
        }
    })

    // Handler pesan masuk
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0]
            if (!msg?.message) return
            
            // Prevent self-response to avoid infinite loops
            const botId = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : ''
            const sender = msg.key.participant || msg.key.remoteJid || ''
            if (msg.key.fromMe || (botId && sender === botId)) return
            
            if (m.type !== 'notify') return

            const from = msg.key.remoteJid
            const senderNum = sender.split('@')[0]
            const pushName = msg.pushName || 'User'
            const isGroup = from.endsWith('@g.us')
            
            // Database & Daily Reset
            let db = getDb()
            db = dailyReset(db, sender)
            saveDb(db)
            
            const isOwner = checkOwner(senderNum)

            const body = (msg.message?.conversation
                || msg.message?.extendedTextMessage?.text
                || msg.message?.imageMessage?.caption
                || msg.message?.videoMessage?.caption
                || msg.message?.buttonsResponseMessage?.selectedButtonId
                || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId
                || '').trim()

            const prefix = global.prefix || '.'
            const isCmd = body.startsWith(prefix)

            // Logging
            const color = isGroup ? chalk.cyan : chalk.magenta
            const type = isGroup ? 'GROUP' : 'PRIVATE'
            const pushNameLog = chalk.whiteBright(pushName)
            const senderLog = chalk.grey(senderNum)
            const bodyLog = isCmd ? chalk.yellowBright(body) : chalk.white(body)

            if (body) {
                if (isCmd) {
                    console.log(chalk.black.bgWhite(' CMD ') + ` ${color(type)} dari ${pushNameLog} (${senderLog}): ${bodyLog}`)
                } else {
                    console.log(chalk.black.bgGreen(' CHAT ') + ` ${color(type)} dari ${pushNameLog} (${senderLog}): ${bodyLog}`)
                }
            }

            if (!isCmd) {
                // Cek Room AI
                if (global.roomAI?.[from] && body.trim()) {
                    await handleCmd('ai', sock, msg, {
                        args: body.split(' '),
                        text: body,
                        cmd: 'ai',
                        chat: { id: from },
                        sender,
                        senderNum,
                        pushName,
                        isOwner,
                        isGroup,
                        prefix
                    })
                }
                // [LOGIC GAME] Cek jawaban game (tanpa prefix)
                if (global.gameSessions?.[from]) {
                    const session = global.gameSessions[from]
                    const userAns = body.trim().toLowerCase()
                    const correctAns = Array.isArray(session.answer)
                        ? session.answer.map(a => a.toLowerCase())
                        : [session.answer.toLowerCase()]

                    // Terminal log untuk owner
                    console.log(chalk.black.bgYellow(' GAME ') + ` Jawaban seharusnya: ${chalk.bold(correctAns[0])} | User: ${userAns}`)

                    // 1. Cek Jawaban Benar (100% match)
                    if (correctAns.some(a => userAns === a || userAns.includes(a))) {
                        clearTimeout(session.timeout)
                        delete global.gameSessions[from]
                        await sock.sendMessage(from, { text: `🎉 *BENAR!*\n\nJawaban: *${correctAns[0]}*\n\nSelamat @${senderNum}, kamu mendapatkan hadiah!`, mentions: [sender] })
                    } 
                    // 2. Cek Jawaban Mendekati (Similarity)
                    else {
                        const threshold = 0.75 // 75% kemiripan
                        const isClose = correctAns.some(a => {
                            const longer = a.length > userAns.length ? a : userAns
                            const shorter = a.length > userAns.length ? userAns : a
                            if (longer.length === 0) return 1.0
                            const editDistance = (s1, s2) => {
                                let costs = []
                                for (let i = 0; i <= s1.length; i++) {
                                    let lastValue = i
                                    for (let j = 0; j <= s2.length; j++) {
                                        if (i == 0) costs[j] = j
                                        else {
                                            if (j > 0) {
                                                let newValue = costs[j - 1]
                                                if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
                                                costs[j - 1] = lastValue
                                                lastValue = newValue
                                            }
                                        }
                                    }
                                    if (i > 0) costs[s2.length] = lastValue
                                }
                                return costs[s2.length]
                            }
                            const similarity = (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length)
                            return similarity >= threshold
                        })

                        if (isClose) {
                            await sock.sendMessage(from, { text: '🤏 *Dikit lagi!* Jawaban kamu hampir benar.' }, { quoted: msg })
                        } else {
                            // User bilang "kalau salah ya salah", bisa beri feedback ringkas
                            // (Opsional: tambahkan reaction atau biarkan saja agar tidak spam)
                            // await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
                        }
                    }
                }
                // Cek AFK
                if (global.afkList?.[sender]) {
                    const afkData = global.afkList[sender]
                    delete global.afkList[sender]
                    const elapsed = Math.floor((Date.now() - afkData.time) / 1000)
                    await sock.sendMessage(from, { text: `wb @${senderNum}! Kamu sudah kembali setelah ${elapsed} detik.\nAlasan AFK: ${afkData.reason}`, mentions: [sender] })
                }
                return
            }

            const args = body.slice(prefix.length).trim().split(/\s+/)
            const cmd = args.shift().toLowerCase()
            const text = args.join(' ')

            const extra = {
                args,
                text,
                cmd,
                chat: { id: from },
                sender,
                senderNum,
                pushName,
                isOwner,
                isGroup,
                prefix
            }

            // Manually force owner if number matches (LID & Phone)
            // (Sudah ditangani oleh checkOwner di atas)

            if (!global.public && !extra.isOwner) return

            console.log(chalk.gray(`-> Memproses command: ${cmd}`))
            await handleCmd(cmd, sock, msg, extra)

        } catch (e) {
            console.error(chalk.redBright.bold('Error:'), e)
        }
    })
}

startBot()
