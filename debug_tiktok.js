import axios from 'axios'
const apiDanzy = 'https://api.danzy.web.id/api'
const url = 'https://vt.tiktok.com/ZSubskBvc/'

async function debug() {
  try {
    console.log('Fetching from Danzy for:', url)
    const res = await axios.get(`${apiDanzy}/download/tiktok?url=${encodeURIComponent(url)}`)
    console.log('Response Status:', res.status)
    console.log('Response Data:', JSON.stringify(res.data, null, 2))
  } catch (err) {
    console.error('Error fetching from Danzy:', err.message)
    if (err.response) {
      console.error('Error Status:', err.response.status)
      console.error('Error Data:', err.response.data)
    }
  }
}

debug()
