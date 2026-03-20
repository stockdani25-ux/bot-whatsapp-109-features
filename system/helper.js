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
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    return db
}

export function saveDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export function isOwner(senderNum) {
    const ownerNumbers = global.ownerNumber || []
    const isHardcoded = ['6285122961417', '6282115160898', '70510847213690', '49504329953372'].includes(senderNum)
    return ownerNumbers.includes(senderNum) || isHardcoded
}

export function dailyReset(db, sender) {
    const today = new Date().toISOString().split('T')[0]
    if (!db[sender]) {
        db[sender] = {
            money: 0,
            limit: 10,
            status: 'User Free',
            lastReset: today
        }
    }

    const user = db[sender]
    if (user.lastReset !== today) {
        user.lastReset = today
        const senderNum = sender.split('@')[0]
        
        if (isOwner(senderNum)) {
            user.status = 'Owner'
            user.limit = 1000000 
            user.money = 1000000000
        } else if (user.status === 'Admin') {
            user.limit = 20
        } else {
            user.status = 'User Free'
            user.limit = 10
        }
    }
    return db
}

// Upload buffer to qu.ax (Extremely Fast)
export async function uploadToQuax(buffer) {
    try {
        const { default: FormData } = await import('form-data')
        const form = new FormData()
        form.append('files[]', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })
        const res = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders(),
            timeout: 10000
        })
        if (res.data.success && res.data.files[0]?.url) return res.data.files[0].url
        return null
    } catch (e) {
        console.error('Quax upload error:', e.message)
        return null
    }
}

// Upload buffer to Telegra.ph (Fast, 5MB limit)
export async function uploadToTelegraph(buffer) {
    try {
        const { default: FormData } = await import('form-data')
        const form = new FormData()
        form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })
        const res = await axios.post('https://telegra.ph/upload', form, {
            headers: form.getHeaders(),
            timeout: 10000
        })
        // Telgraph response is an array of objects: [{"src":"/file/..."}]
        if (Array.isArray(res.data) && res.data[0]?.src) return 'https://telegra.ph' + res.data[0].src
        return null
    } catch (e) {
        console.error('Telegraph upload error:', e.message)
        return null
    }
}

// Upload image buffer ke catbox.moe (Slow, 200MB limit)
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
        console.error('Catbox upload error:', e.message)
        return null
    }
}

// Resolve shortened URLs (follow redirects) and handle youtu.be
export async function resolveUrl(url) {
    if (typeof url !== 'string') return url
    // Handle youtu.be to youtube.com conversion immediately
    if (url.includes('youtu.be/')) {
        const id = url.split('/').pop().split('?')[0]
        return `https://www.youtube.com/watch?v=${id}`
    }
    try {
        const res = await axios.get(url, { maxRedirects: 10, timeout: 5000 }).catch(e => e.response || { headers: {} })
        return res.config?.url || url
    } catch {
        return url
    }
}

// Ambil URL gambar dari args[0] atau dari pesan/reply gambar user
export async function getImageUrl(sock, msg, args) {
    if (args[0] && args[0].startsWith('http')) return args[0]
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage
    if (!imgMsg) return null
    
    const buffer = await downloadMediaMessage(msg, 'buffer', {})
    const startTime = Date.now()
    
    // 1. Coba Quax (paling cepat)
    let url = await uploadToQuax(buffer)
    let provider = 'Quax'
    
    // 2. Coba Telegraph (cadangan cepat) jika Quax gagal
    if (!url) {
        url = await uploadToTelegraph(buffer)
        provider = 'Telegraph'
    }
    
    // 3. Catbox (pilihan terakhir)
    if (!url) {
        url = await uploadImage(buffer)
        provider = 'Catbox'
    }

    if (url) {
        console.log(`[UPLOAD] Image converted to link via ${provider} in ${Date.now() - startTime}ms`)
    } else {
        console.error('[UPLOAD] All uploaders failed.')
    }
    return url
}

// Helper: kirim error sebagai pesan WA
export async function sendErr(sock, from, msg, text = 'Terjadi kesalahan.') {
    await sock.sendMessage(from, { text }, { quoted: msg }).catch(() => {})
}

// Media Downloader Helpers
export const findUrl = (d, type = 'any') => {
  if (!d) return null
  
  const isVideo = (u) => {
    if (typeof u !== 'string' || !u.startsWith('http')) return false
    const lower = u.toLowerCase()
    return lower.includes('.mp4') || lower.includes('.mov') || lower.includes('token=') || lower.includes('cdn') || lower.includes('drive.google') || lower.includes('rapidcdn') || lower.includes('youtu.be') || lower.includes('youtube.com/watch') || lower.includes('videoplayback') || lower.includes('googlevideo') || lower.includes('video')
  }

  const isImage = (u) => {
    if (typeof u !== 'string' || !u.startsWith('http')) return false
    const lower = u.toLowerCase()
    return lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp') || lower.includes('image')
  }

  const isAudio = (u) => {
    if (typeof u !== 'string' || !u.startsWith('http')) return false
    const lower = u.toLowerCase()
    return lower.includes('.mp3') || lower.includes('.m4a') || lower.includes('.wav') || lower.includes('music') || lower.includes('audio') || lower.includes('download')
  }

  if (typeof d === 'string') {
    if (type === 'video' && isVideo(d)) return d
    if (type === 'image' && isImage(d)) return d
    if (type === 'audio' && isAudio(d)) return d
    if (type === 'any' && (isVideo(d) || isImage(d) || isAudio(d) || d.startsWith('http'))) return d
  }

  // Recursive search for URL in objects/arrays
  const search = (obj) => {
    if (!obj) return null
    if (typeof obj === 'string') {
        if (type === 'video' && isVideo(obj)) return obj
        if (type === 'audio' && isAudio(obj)) return obj
        if (type === 'image' && isImage(obj)) return obj
        if (type === 'any' && (isVideo(obj) || isAudio(obj) || isImage(obj) || obj.startsWith('http'))) return obj
        return null
    }
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const res = search(item)
            if (res) return res
        }
        return null
    }
    if (typeof obj === 'object') {
        const keys = ['url', 'downloadUrl', 'download', 'link', 'video', 'audio', 'music', 'nowm', 'photo', 'image', 'downloads', 'result', 'data']
        // Prioritize known keys
        for (const k of keys) {
            if (obj[k]) {
                const res = search(obj[k])
                if (res) return res
            }
        }
        // Then search remaining keys
        for (const k in obj) {
            if (keys.includes(k)) continue
            const res = search(obj[k])
            if (res) return res
        }
    }
    return null
  }

  return search(d)
}

export const fetchBuffer = async (url, options = {}) => {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.google.com/',
        ...options.headers
      },
      ...options,
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })
    return Buffer.from(res.data)
  } catch (err) {
    console.error(`FetchBuffer error:`, err.message)
    return null
  }
}

export const sendMedia = async (xp, chat, url, caption, m, type = 'any') => {
  try {
    const buffer = await fetchBuffer(url)
    if (!buffer || buffer.length < 5000) throw new Error(`Buffer empty/small: ${buffer?.length || 0}`)

    const { fileTypeFromBuffer } = await import('file-type')
    const ft = await fileTypeFromBuffer(buffer)
    const mime = ft?.mime || (type === 'video' ? 'video/mp4' : 'image/jpeg')

    if (mime.startsWith('video')) {
      await xp.sendMessage(chat.id, { video: buffer, mimetype: mime, caption }, { quoted: m })
    } else if (mime.startsWith('image')) {
      await xp.sendMessage(chat.id, { image: buffer, mimetype: mime, caption }, { quoted: m })
    } else {
      await xp.sendMessage(chat.id, { document: buffer, mimetype: mime, fileName: `file.${ft?.ext || 'bin'}`, caption }, { quoted: m })
    }
    return true
  } catch (err) {
    console.error('SendMedia error:', err.message)
    const mediaObj = type === 'video' ? { video: { url } } : { image: { url } }
    await xp.sendMessage(chat.id, { ...mediaObj, caption }, { quoted: m })
    return false
  }
}
