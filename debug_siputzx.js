import axios from 'axios'
const url = 'https://vt.tiktok.com/ZSubskBvc/'

async function debugSiputzx() {
  try {
    console.log('Fetching from Siputzx for:', url)
    const res = await axios.get(`https://api.siputzx.my.id/api/dwnld/tiktok?url=${encodeURIComponent(url)}`)
    console.log('Response Status:', res.status)
    console.log('Response Data:', JSON.stringify(res.data, null, 2))
  } catch (err) {
    console.error('Error fetching from Siputzx:', err.message)
  }
}

debugSiputzx()
