# ReelMaker Pro 2025 🎬✨

**La herramienta #1 en LatAm para generar Reels y Stories virales con IA en <4 minutos**

Cualquier comercio local puede crear contenido de calidad profesional sin experiencia en edición. Sube tus fotos, la IA analiza y genera videos listos para Instagram, TikTok y YouTube Shorts.

---

## ✨ Características

- ✅ **Upload Inteligente:** Sube fotos/videos de tus productos
- 📊 **Análisis con IA:** Modelos vision vía OpenRouter detectan productos, colores, emociones
- 💡 **6 Ideas Virales:** Generadas automáticamente según tu industria
- ✍️ **5 Variantes de Copy:** Mensajes optimizados para conversión
- 🎨 **4 Estilos de Video:** Desde energético hasta cinematic
- 🎤 **4 Voces en Off:** Luna, Diego, Sofía o sin narración
- 🚀 **Video Listo en <4min:** Replicate genera videos de alta calidad
- 💾 **Historial:** Guarda y revisa todas tus generaciones
- 📱 **100% Responsive:** Funciona perfectamente en móvil

---

## 🚀 Inicio Rápido

### 1. Setup Local
```bash
# Clona o descarga el repo
cd ContentCreator

# Instala dependencias
npm install --legacy-peer-deps

# Crea el archivo .env
cp .env.example .env.local
```

### 2. Configurar Variables de Entorno
Edit `.env.local`:
```
VITE_SUPABASE_URL=https://[tu-proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
OPENROUTER_API_KEY=or-...
OPENROUTER_TEXT_MODEL=openai/gpt-4o-mini
OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=ContentCreator
VITE_REPLICATE_API_TOKEN=r8_...
VITE_ELEVENLABS_API_KEY=...
```

### 3. Ejecutar Dev Server
```bash
npm run dev
# Abre http://localhost:5174
```

### 4. Compilar para Producción
```bash
npm run build
# Output en `dist/` listo para Vercel
```

---

## 🔐 Seguridad - Edge Functions

**Importante:** Las claves de OpenRouter NUNCA se exponen al navegador.

Todos los llamados a los modelos (vía OpenRouter) se hacen server-side mediante Supabase Edge Functions:
- `analyze-vision` → Detecta productos en imágenes
- `generate-ideas` → Crea 6 ideas virales
- `generate-copy` → Genera 5 variantes de mensaje
- `generate-styles` → Propone 4 estilos de video

**Resultado:** 100% seguro para producción ✅

---

## 📋 Flujo de Uso

### Paso 1: Registro/Login
- Email + contraseña con validación de seguridad
- ó OAuth (Google, X, Apple)

### Paso 2: Configuración del Negocio (1-2 min)
- Nombre del negocio
- Categoría (6 opciones: restaurante, peluquería, moda, gym, inmuebles, viajes)
- Logo, ubicación, contactos (WhatsApp, email, instagram, facebook, web)
- Colores y música de fondo
- Hashtag del negocio

### Paso 3: Crear Reel (2-3 min)
**Step 1:** Sube fotos/videos de tus productos
- Drag & drop o click
- Max 5 archivos

**Step 2:** IA analiza y sugiere 6 ideas virales
- Cada idea con descripción y por qué sería viral
- Selecciona la que más te guste

**Step 3:** Elige tu copy (mensaje)
- 5 variaciones con diferentes enfoques
- Cada una con viral score

**Step 4:** Elige el estilo visual
- 4 opciones: Fast & Energetic, Smooth & Professional, Playful, Cinematic
- Con info de cámara, BPM de música y duración

**Step 5:** Selecciona voz en off
- Luna (cálida argentina), Diego (profesional), Sofía (energética)
- O solo música sin voz

### Paso 6: Generar Video (1 min)
- Presiona "Generar Video"
- La IA ensamblará: producto + copy + estilo + voz + logo + contactos
- En <1 minuto tendrás tu video listo

### Paso 7: Descargar o Compartir
- Descarga directo desde el browser
- ó comparte en Instagram, TikTok, Facebook

---

## 🏗️ Stack Tecnológico

| Layer | Tech |
|-------|------|
| **Frontend** | React 19 + Vite 7 + Tailwind CSS |
| **UI Components** | shadcn/ui + Sonner (toasts) |
| **Auth** | Supabase Auth (email/OAuth) |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage (logos, music, videos) |
| **AI Analysis** | Modelos GPT vía OpenRouter |
| **Serverless** | Supabase Edge Functions (Deno) |
| **Video Gen** | Replicate API (4 modelos) |
| **TTS** | ElevenLabs (4 voces) |
| **Deployment** | Vercel + Supabase |

---

## 📚 Documentación

- [`SETUP.md`](./SETUP.md) - Configuración detallada de Supabase, OAuth, Edge Functions
- [`supabase/functions/README.md`](./supabase/functions/README.md) - Docs de Edge Functions
- [`src/hooks/`](./src/hooks/) - Hooks de React (auth, business config, generation)
- [`src/lib/`](./src/lib/) - Librerías (supabase client, AI wrapper vía OpenRouter)

---

## 🎯 Categorías Soportadas

1. **Restaurante** - CTA: "Pedí ya", "Reserva tu mesa"
2. **Peluquería** - CTA: "Agendate", "Consulta gratuita"
3. **Tienda de Ropa** - CTA: "Compra ahora", "Ver colección"
4. **Gimnasio** - CTA: "Empezá hoy", "Clase gratis"
5. **Inmobiliaria** - CTA: "Ver propiedad", "Agenda tour"
6. **Agencia de Viajes** - CTA: "Reserva tu viaje", "Consulta destinos"

Cada categoría tiene prompts optimizados y templates de CTA específicos.

---

## 🔧 Customización

### Agregar nuevas categorías
Edit `src/utils/constants.js`:
```javascript
export const BUSINESS_CATEGORIES = [
  // ...
  { value: 'nueva-categoria', label: 'Nueva Categoría' }
]
```

### Cambiar colores de tema
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#faf5ff',
    600: '#a855f7', // Cambiar aquí
  }
}
```

### Agregar nuevas voces
Edit `src/utils/constants.js` y luego actualizar ElevenLabs IDs.

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
npm run build
# Conecta tu repo de GitHub a Vercel
# Auto-deploys en cada push a main
```

### Supabase (Backend + Edge Functions)
```bash
# Install CLI
npm install -g supabase

# Deploy functions
supabase functions deploy --project-ref YOUR_REF
```

---

## 🐛 Troubleshooting

**"Error analyzing images"**
- ✅ Verifica que tus imágenes sean < 5MB
- ✅ Formatos soportados: JPG, PNG, WebP
- ✅ Comprueba que `OPENROUTER_API_KEY` esté en Edge Functions

**"Cannot connect to database"**
- ✅ Verifica `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- ✅ Revisa que el proyecto Supabase esté activo
- ✅ Comprueba RLS policies en las tablas

**"Video generation timeout"**
- ✅ Replicate puede tardar 1-3 minutos en generar
- ✅ La polling revisa cada 5 segundos
- ✅ Vuelve al dashboard y revisa "Historial"

---

## 📊 Estadísticas

- **Promedio de generación:** 2-3 minutos
- **Tamaño de video:** 5-50MB (depende del modelo)
- **Formatos soportados:** MP4 (Instagram, TikTok, YouTube)
- **Resolución:** 1080x1920 (vertical, Reels/Stories)

---

## 🤝 Contribuir

Las pull requests son bienvenidas. Para cambios mayores, abre un issue primero.

```bash
git checkout -b feature/tu-feature
git commit -am 'Add some feature'
git push origin feature/tu-feature
```

---

## 📄 Licencia

Proyecto privado para ReelMaker Pro 2025 LatAm.

---

## 📞 Soporte

- Email: support@reelmaker.pro
- WhatsApp: +54 9 1234 5678
- Instagram: @reelmakerpro

---

**Made with ❤️ in LatAm | 2024**
