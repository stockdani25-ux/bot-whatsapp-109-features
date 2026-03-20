import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../user.json')

export function getDb() {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}))
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
}

export function saveDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

// Upload image buffer ke catbox.moe, return URL
export async function uploadImage(buffer, filename = 'image.jpg') {
    try {
        const { default: FormData } = await import('form-data')
        const form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', buffer, { filename, contentType: 'image/jpeg' })
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 15000
        })
        if (typeof res.data === 'string' && res.data.startsWith('https://')) return res.data
        return null
    } catch (e) {
        console.error('Upload error:', e.message)
        return null
    }
}

// Ambil URL gambar dari args[0] atau dari pesan/reply gambar user
export async function getImageUrl(sock, msg, args) {
    if (args[0] && args[0].startsWith('http')) return args[0]
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage
    if (!imgMsg) return null
    const buffer = await downloadMediaMessage(msg, 'buffer', {})
    return await uploadImage(buffer)
}

// Helper: kirim error sebagai pesan WA
export async function sendErr(sock, from, msg, text = 'Terjadi kesalahan.') {
    await sock.sendMessage(from, { text }, { quoted: msg }).catch(() => {})
}
