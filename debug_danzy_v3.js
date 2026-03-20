import axios from 'axios'

const testUrl = 'https://vt.tiktok.com/ZSuggqYYB1/'

async function debug() {
  try {
    console.log('Testing URL (No Key):', testUrl)
    const res = await axios.get(`https://api.danzy.web.id/api/download/tiktok?url=${encodeURIComponent(testUrl)}`)
    console.log('Response Status:', res.status)
    console.log('Response Data:', JSON.stringify(res.data, null, 2))
    
    const dD = res.data?.data || res.data
    console.log('\nKeys in data:', Object.keys(dD))
    if (dD.links) console.log('Links:', dD.links)
    if (dD.nowm) console.log('nowm:', dD.nowm)
  } catch (e) {
    console.error('Error:', e.message)
    if (e.response) console.error('Data:', e.response.data)
  }
}

debug()
