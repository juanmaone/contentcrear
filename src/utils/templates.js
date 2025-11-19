import { CTA_TEMPLATES } from './constants'

/**
 * Interpolate dynamic values in templates
 */
export const interpolateTemplate = (template, data) => {
  let result = template
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
  })
  return result
}

/**
 * Get CTA for business category
 */
export const getCTATemplate = (category, contactData) => {
  const template = CTA_TEMPLATES[category] || CTA_TEMPLATES.otro

  return interpolateTemplate(template, {
    telefono: contactData.phone || 'contacto',
    whatsapp: contactData.whatsapp || contactData.phone || 'contacto',
    email: contactData.email || 'email@negocio.com',
    instagram: contactData.instagram || '@negocio',
    facebook: contactData.facebook || 'facebook.com/negocio',
    sitio_web: contactData.website || 'www.negocio.com',
    direccion: contactData.address || 'nuestro local',
    nombre_negocio: contactData.businessName || 'Tu negocio',
  })
}

/**
 * Generate viral ideas prompt (used by OpenAI)
 */
export const generateViralIdeasPrompt = (businessCategory, products, businessName, trends, location) => {
  return `Eres un experto en marketing para redes sociales en Argentina/Chile 2025.

Contexto:
- Negocio: ${businessName}
- Rubro: ${businessCategory}
- Ubicación: ${location || 'Argentina'}
- Productos/Servicios detectados: ${products.join(', ')}
- Tendencias aplicables: ${trends.join(', ')}

Tu tarea: Genera EXACTAMENTE 6 ideas de Reels virales (máx 15 segundos cada uno) que ayuden a vender estos productos.

Para CADA idea, responde SOLO en JSON:
[
  {
    "id": "idea_1",
    "title": "Título atractivo en 5 palabras",
    "description": "Qué se ve en el video (1-2 líneas)",
    "why_viral": "Por qué explota en 2025 (explicación breve)",
    "estimated_duration_seconds": 12,
    "cta_template": "CTA dinámico para impulsar compra/acción"
  }
]

IMPORTANTE:
1. Cada idea debe ser radicalmente diferente
2. No repitas formatos
3. Adapta a la realidad de ${location}`
}

/**
 * Generate copy suggestions prompt
 */
export const generateCopyPrompt = (product, businessName, category, contactInfo, hashtag) => {
  return `Genera 5 copy optimizados para Instagram Reels (máx 2 líneas cada uno), con emojis estratégicos.

Contexto:
- Producto principal: ${product}
- Negocio: ${businessName}
- Rubro: ${category}
- Contacto recomendado: ${contactInfo}
- Hashtag: ${hashtag}

Responde SOLO en JSON:
[
  {
    "id": "copy_1",
    "text": "Copy con emojis aquí 🎯",
    "emoji_count": 3,
    "viral_score": 8.5
  }
]

Genera EXACTAMENTE 5 copies variados.`
}

/**
 * Generate video style suggestions prompt
 */
export const generateStylePrompt = (product, category, trend) => {
  return `Para un video mostrando "${product}" en un ${category}, con la tendencia "${trend}":

Genera EXACTAMENTE 4 estilos de video distintos en JSON:
[
  {
    "id": "style_1",
    "name": "Nombre del estilo",
    "description": "Descripción de cómo se vería",
    "duration_seconds": 12,
    "camera_movement": "tipo de movimiento de cámara",
    "music_tempo_bpm": 120,
    "music_mood": "adjetivo del mood"
  }
]

Genera variedad: ASMR, Cinematic, Split Screen, Montage, etc.`
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Format date for display
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Convert file to base64 URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Download file from URL
 */
export const downloadFile = (url, filename) => {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
