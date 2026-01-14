#!/usr/bin/env node
// Simple diagnostic to query Cloudinary for images in a given series folder.
// Usage: CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... node scripts/check-cloudinary.js canopy-at-twilight

const fetch = require('node-fetch')

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node scripts/check-cloudinary.js <slug>')
  process.exit(1)
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
  process.exit(2)
}

async function run() {
  const credentials = `${apiKey}:${apiSecret}`
  const auth = Buffer.from(credentials).toString('base64')

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`
  const body = {
    expression: `folder:\"portfolio/${slug}\" AND resource_type:\"image\"`,
    max_results: 500
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify(body)
    })

    const text = await res.text()
    if (!res.ok) {
      console.error('Cloudinary API error', res.status, text)
      process.exit(3)
    }

    const data = JSON.parse(text)
    const resources = data.resources || []
    console.log(`Found ${resources.length} images in portfolio/${slug}`)
    resources.forEach(r => console.log(r.public_id + '.' + (r.format||'jpg')))
  } catch (err) {
    console.error('Error querying Cloudinary:', err)
    process.exit(4)
  }
}

run()
