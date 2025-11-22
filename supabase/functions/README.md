# ReelMaker Pro 2025 - Supabase Edge Functions

Este directorio contiene todas las funciones serverless para mantener seguras las claves de API de OpenRouter.

## Funciones Disponibles

### 1. `analyze-vision`
**POST** `/functions/v1/analyze-vision`

Analiza imágenes usando modelos vision disponibles en OpenRouter (por defecto `openai/gpt-4o-mini`) para detectar productos, colores, emociones y potencial viral.

**Request:**
```json
{
  "imageUrls": ["https://...", "https://..."],
  "category": "restaurante",
  "businessName": "Mi Negocio"
}
```

**Response:**
```json
[
  {
    "main_product": "Plato Principal",
    "detected_objects": ["comida", "presentación", "iluminación"],
    "colors": ["rojo", "dorado"],
    "emotion_style": "apetitoso",
    "viral_potential_score": 8,
    "suggested_trends": ["food porn", "ASMR"]
  }
]
```

### 2. `generate-ideas`
**POST** `/functions/v1/generate-ideas`

Genera 6 ideas virales basadas en el análisis de imágenes y categoría de negocio utilizando los modelos de texto configurados en OpenRouter.

**Request:**
```json
{
  "category": "restaurante",
  "analysisData": [...],
  "businessName": "Mi Restaurante"
}
```

**Response:**
```json
[
  {
    "id": "idea_1",
    "title": "Plato Estrella",
    "description": "Video corto del plato en su mejor ángulo",
    "why_viral": "Los videos de comida obtienen 3x más engagement",
    "cta_template": "Reserva en {{whatsapp}}",
    "estimated_duration_seconds": 15,
    "recommended_model": "Kling 1.6"
  }
]
```

### 3. `generate-copy`
**POST** `/functions/v1/generate-copy`

Genera 5 variaciones de copy viral para el video con el modelo de texto seleccionado vía OpenRouter.

**Request:**
```json
{
  "mainProduct": "Plato Principal",
  "businessName": "Mi Restaurante",
  "category": "restaurante",
  "whatsappOrPhone": "+5491234567",
  "businessConfig": {...}
}
```

**Response:**
```json
[
  {
    "id": "copy_1",
    "text": "🍽️ Prueba nuestro plato estrella. WhatsApp: +549...",
    "emoji_count": 1,
    "viral_score": 8,
    "style": "urgency",
    "audience_target": "impulse buyers"
  }
]
```

### 4. `generate-styles`
**POST** `/functions/v1/generate-styles`

Genera 4 estilos diferentes de video (cinematografía, música, mood) usando el mismo modelo de texto configurable en OpenRouter.

**Request:**
```json
{
  "mainProduct": "Plato Principal",
  "category": "restaurante",
  "ideaTitle": "Plato Estrella"
}
```

**Response:**
```json
[
  {
    "id": "style_1",
    "name": "Fast & Energetic",
    "description": "Cortes rápidos con transiciones dinámicas",
    "camera_movement": "dynamic",
    "music_tempo_bpm": 140,
    "duration_seconds": 15,
    "mood": "energetic",
    "best_for": "Trend followers"
  }
]
```

## Deployment

### Local Development
```bash
supabase functions serve
```

### Deploy to Production
```bash
supabase functions deploy analyze-vision --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-ideas --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-copy --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-styles --project-ref YOUR_PROJECT_REF
```

## Environment Variables

Cada función requiere las variables de OpenRouter configuradas en Supabase:

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a Settings → Edge Functions
4. Agrega `OPENROUTER_API_KEY` con tu clave de OpenRouter
5. Opcional: `OPENROUTER_TEXT_MODEL`, `OPENROUTER_VISION_MODEL`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`

## Testing

Las funciones pueden ser testeadas usando:

```bash
# Usando curl
curl -X POST http://localhost:54321/functions/v1/analyze-vision \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageUrls": ["..."], "category": "restaurante", "businessName": "Test"}'
```

## Notas de Seguridad

- Las claves de API **NUNCA** se exponen al cliente
- Todas las llamadas a OpenRouter se realizan server-side
- Las funciones validan los datos de entrada
- Fallback responses si las llamadas a OpenAI fallan
- CORS habilitado solo para dominios autorizados

## Errors

Cada función devuelve errores en este formato:
```json
{
  "error": "Descripción del error"
}
```

Códigos HTTP comunes:
- 200: Éxito
- 400: Datos inválidos
- 500: Error del servidor (API)
