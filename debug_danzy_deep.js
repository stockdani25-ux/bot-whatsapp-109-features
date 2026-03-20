import axios from 'axios'

const testUrl = 'https://vt.tiktok.com/ZSuggqYYB1/'
const danzyKey = 'isi_apikey_disini' // User specified Danzy API key usage

async function debug() {
  try {
    console.log('Testing URL:', testUrl)
    const res = await axios.get(`https://api.danzy.web.id/api/download/tiktok?url=${encodeURIComponent(testUrl)}&apikey=${danzyKey}`)
    console.log('Response:', JSON.stringify(res.data, null, 2))
    
    // Check the first link if available
    const dD = res.data?.data || res.data
    const links = dD.links || []
    if (links.length > 0) {
      console.log('\nChecking first link headers:')
      const head = await axios.head(links[0]).catch(e => ({ status: e.response?.status, headers: e.response?.headers }))
      console.log('Status:', head.status)
      console.log('Content-Length:', head.headers?.['content-length'])
      console.log('Content-Type:', head.headers?.['content-type'])
    }
  } catch (e) {
    console.error('Error:', e.message)
    if (e.response) console.error('Data:', e.response.data)
  }
}

debug()
