import './system/global.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, Browsers } from '@whiskeysockets/baileys'
import pino from 'pino'
import chalk from 'chalk'
import 'dotenv/config'
import { loadAll, handleCmd } from './cmd/handle.js'

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
            if (msg.key.fromMe) return
            if (m.type !== 'notify') return

            const from = msg.key.remoteJid
            const sender = msg.key.participant || msg.key.remoteJid || ''
            const senderNum = sender.split('@')[0]
            const pushName = msg.pushName || 'User'
            const isGroup = from.endsWith('@g.us')
            const isOwner = global.ownerNumber.includes(senderNum)

            const body = msg.message?.conversation
                || msg.message?.extendedTextMessage?.text
                || msg.message?.imageMessage?.caption
                || msg.message?.videoMessage?.caption
                || msg.message?.buttonsResponseMessage?.selectedButtonId
                || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId
                || ''

            const prefix = global.prefix || '.'
            if (!body.startsWith(prefix)) {
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
                // Cek jawaban game
                if (global.gameSessions?.[from]) {
                    const session = global.gameSessions[from]
                    const userAns = body.trim().toLowerCase()
                    const correctAns = Array.isArray(session.answer)
                        ? session.answer.map(a => a.toLowerCase())
                        : [session.answer.toLowerCase()]
                    if (correctAns.some(a => userAns.includes(a))) {
                        clearTimeout(session.timeout)
                        delete global.gameSessions[from]
                        await sock.sendMessage(from, { text: `🎉 *BENAR!*\nJawaban: *${correctAns[0]}*\nSolusi dijawab oleh @${senderNum}`, mentions: [sender] })
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

            if (!global.public && !isOwner) return

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

            await handleCmd(cmd, sock, msg, extra)

        } catch (e) {
            console.error(chalk.redBright.bold('Error:'), e)
        }
    })
}

startBot()
