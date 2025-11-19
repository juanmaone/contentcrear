// Business categories
export const BUSINESS_CATEGORIES = [
  { value: 'restaurante', label: 'Restaurante / Hamburguesería' },
  { value: 'peluqueria', label: 'Peluquería / Estética' },
  { value: 'tienda_ropa', label: 'Tienda de Ropa' },
  { value: 'gimnasio', label: 'Gimnasio / Centro de Yoga' },
  { value: 'inmobiliaria', label: 'Inmobiliaria / Bienes Raíces' },
  { value: 'agencia_viaje', label: 'Agencia de Viajes / Turismo' },
  { value: 'otro', label: 'Otro' },
]

// CTA templates by category (dynamic interpolation)
export const CTA_TEMPLATES = {
  restaurante: 'Pedí ya al {{whatsapp}} en {{direccion}}',
  peluqueria: 'Agendá por {{telefono}} en {{direccion}}',
  tienda_ropa: 'Comprá en {{instagram}} o visitanos en {{direccion}}',
  gimnasio: 'Inscribite por {{email}}',
  inmobiliaria: 'Tour virtual → llamá al {{telefono}} o visitá {{sitio_web}}',
  agencia_viaje: 'Reservá por {{whatsapp}} – {{nombre_negocio}} te espera!',
  otro: 'Contactanos: {{telefono}} o {{email}}',
}

// Voice options (ElevenLabs)
export const VOICE_OPTIONS = [
  {
    id: 'luna',
    name: 'Luna',
    description: 'Warm, friendly, Argentine accent',
    gender: 'Female',
    language: 'Spanish (Argentina)',
  },
  {
    id: 'diego',
    name: 'Diego',
    description: 'Deep, professional, natural',
    gender: 'Male',
    language: 'Spanish (Argentina)',
  },
  {
    id: 'sofia',
    name: 'Sofía',
    description: 'Energetic, youthful, upbeat',
    gender: 'Female',
    language: 'Spanish (Argentina)',
  },
  {
    id: 'none',
    name: 'Sin narración',
    description: 'Solo música de fondo + texto',
    gender: 'N/A',
    language: 'N/A',
  },
]

// Video models available
export const VIDEO_MODELS = {
  luma: 'Luma Ray 2 (cinematic quality)',
  kling: 'Kling 1.6 (trendy, fast)',
  runway: 'Runway Gen-3 (smooth transitions)',
  pika: 'Pika 2.1 (animated, stylized)',
}

// Default colors
export const DEFAULT_COLORS = {
  primary: '#a855f7', // Purple
  secondary: '#0ea5e9', // Cyan
}

// Free music library (can expand)
export const FREE_MUSIC_LIBRARY = [
  { id: 'upbeat_1', name: 'Upbeat Energetic', genre: 'Pop', bpm: 128 },
  { id: 'chill_1', name: 'Chill Vibes', genre: 'Lofi', bpm: 90 },
  { id: 'epic_1', name: 'Epic Cinematic', genre: 'Cinematic', bpm: 100 },
  { id: 'latin_1', name: 'Latin Fiesta', genre: 'Latin', bpm: 120 },
  { id: 'asmr_1', name: 'ASMR Ambient', genre: 'Ambient', bpm: 60 },
]

// Max file sizes (in bytes)
export const MAX_FILE_SIZES = {
  logo: 5 * 1024 * 1024, // 5 MB
  image: 10 * 1024 * 1024, // 10 MB
  video: 50 * 1024 * 1024, // 50 MB
  music: 20 * 1024 * 1024, // 20 MB
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp'],
  videos: ['video/mp4', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
}

// Replicate model configurations
export const REPLICATE_MODELS = {
  'luma-ray': 'lumaai/luma-ray-2',
  kling: 'minimax/kling-video',
  runway: 'runwayml/gen-3-text-to-video',
  pika: 'pika-labs/pika-1-0',
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
}
