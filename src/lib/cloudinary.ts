const CLOUD_NAME = import.meta.env.CLOUDINARY_CLOUD_NAME || 'mathis-portfolio'

export interface ImageTransformOptions {
  width?: number
  quality?: string
  format?: string
}

// Get responsive width based on connection speed
export function getResponsiveWidth(baseWidth: number): number {
  if (typeof navigator === 'undefined') return baseWidth
  
  const connection = (navigator as any).connection
  if (!connection) return baseWidth
  
  const effectiveType = connection.effectiveType
  // On slow connections, reduce image size
  if (effectiveType === '4g') return baseWidth
  if (effectiveType === '3g') return Math.floor(baseWidth * 0.75)
  if (effectiveType === '2g') return Math.floor(baseWidth * 0.5)
  
  return baseWidth
}

export function cld(id: string, slug: string, options?: ImageTransformOptions) {
  // Wenn die ID schon eine Endung hat, nicht doppelt anhängen
  const file = id.includes('.') ? id : `${id}.webp`
  
  // Cloudinary-Transformationen für Performance
  const transforms = []
  if (options?.width) {
    transforms.push(`w_${options.width}`)
  }
  if (options?.quality) {
    transforms.push(`q_${options.quality}`)
  } else {
    transforms.push('q_auto') // Automatische Qualitätsoptimierung
  }
  // Explizit WebP Format erzwingen für kleinere Dateigrößen
  transforms.push('f_webp')
  
  const transformString = transforms.length > 0 ? `/${transforms.join('/')}` : ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload${transformString}/portfolio/${slug}/${file}`
}

// Generate blur-up thumbnail
export function getCldThumb(id: string, slug: string): string {
  const file = id.includes('.') ? id : `${id}.webp`
  // Small, blurred placeholder
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_50,h_50,q_auto,f_webp,e_blur:300/portfolio/${slug}/${file}`
}

export async function getCloudinaryImages(slug: string): Promise<string[]> {
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME
  const apiKey = import.meta.env.CLOUDINARY_API_KEY
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary credentials missing - returning empty array for slug:', slug)
    return []
  }

  try {
    // Basic Auth Header
    const credentials = `${apiKey}:${apiSecret}`
    const auth = typeof window !== 'undefined' 
      ? btoa(credentials) 
      : Buffer.from(credentials).toString('base64')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          expression: `folder:"portfolio/${slug}" AND resource_type:"image"`,
          max_results: 500,
        }),
      }
    )

    if (!response.ok) {
      console.error('Cloudinary API Fehler:', response.status, await response.text())
      return []
    }

    const data = (await response.json()) as any
    const images = (data.resources || [])
      .filter((r: any) => r.resource_type === 'image')
      .map((r: any) => {
        const name = (r.public_id || '').split('/').pop() || r.filename || ''
        const ext = r.format ? `.${r.format}` : '.webp'
        return name.endsWith(ext) ? name : `${name}${ext}`
      })
      .filter(Boolean)
      .sort()

    return images
  } catch (error) {
    console.error('Fehler beim Laden von Cloudinary Bildern for slug', slug, ':', error)
    return []
  }
}