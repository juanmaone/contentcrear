# ReelMaker Pro 2025 🎬✨

**La herramienta #1 en LatAm para generar Reels y Stories virales con IA en <4 minutos**

Cualquier comercio local puede crear contenido de calidad sin experiencia en edición. Sube tus fotos, la IA analiza y genera videos listos para Instagram.

---

## Stack Tecnológico

- **Frontend:** React 19 + Vite 7 + Tailwind CSS + shadcn/ui + Sonner
- **Auth & Backend:** Supabase (Auth + DB + Storage + Edge Functions)
- **AI:** GPT-4o Vision + GPT-4o (via Supabase Edge Functions para seguridad)
- **Video Gen:** Replicate API (Luma, Kling, Runway, Pika)
- **TTS:** ElevenLabs
- **Deployment:** Vercel

---

## Instalación Local

### 1. Requisitos
- Node.js 18+ y npm/yarn
- Cuenta Supabase gratuita (https://supabase.com)
- API keys de OpenAI, Replicate, ElevenLabs

### 2. Setup Inicial

```bash
# Clone o descarga este repo
cd ContentCreator

# Instala dependencias
npm install --legacy-peer-deps

# Copia el archivo de env y configura tus keys
cp .env.example .env.local
```

**En `.env.local`, llena estos valores:**

```
VITE_SUPABASE_URL=https://[tu-proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_OPENAI_API_KEY=sk-... (para Edge Functions)
VITE_REPLICATE_API_TOKEN=...
VITE_ELEVENLABS_API_KEY=...
```

### 3. Configurar Supabase con Edge Functions

#### Paso 1: Database Schema
En Supabase, ve a SQL Editor y ejecuta:

```sql
-- Business Configuration (datos del negocio)
CREATE TABLE business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  logo_url TEXT,
  address TEXT,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  website TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  music_url TEXT,
  hashtag VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Generation History (videos generados)
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  category VARCHAR(50),
  analysis_json JSONB,
  selected_idea JSONB,
  selected_copy JSONB,
  selected_style JSONB,
  status VARCHAR(50),
  video_url TEXT,
  metadata_json JSONB,
  replicate_job_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products Catalog (productos del usuario)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies (usuarios ven solo sus datos)
CREATE POLICY "Users see own business config" ON business_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own business config" ON business_config
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users insert business config" ON business_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own history" ON generation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own history" ON generation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Paso 2: Crear Storage Buckets
En Supabase Storage, crea estos buckets (todos private):
- `business-logos`
- `background-music`
- `generated-videos`
- `product-images`

#### Paso 3: Configurar Edge Functions
1. En Supabase Dashboard → Edge Functions → Nueva Función
2. Ó en local con `supabase functions serve`
3. Las funciones ya están creadas en `supabase/functions/`:
   - `analyze-vision` - Análisis con GPT-4o Vision
   - `generate-ideas` - Genera 6 ideas virales
   - `generate-copy` - Crea 5 variaciones de copy
   - `generate-styles` - Propone 4 estilos de video

#### Paso 4: Variables de Entorno para Edge Functions
En Supabase Dashboard → Settings → Edge Functions → Environment Variables:

```
OPENAI_API_KEY=sk-...
```

**Nota:** Las Edge Functions usan `OPENAI_API_KEY` en el servidor, lo que mantiene tu clave segura. El cliente NUNCA toca directamente OpenAI.

#### Paso 5: Deploy de Edge Functions (Producción)
```bash
supabase functions deploy analyze-vision
supabase functions deploy generate-ideas
supabase functions deploy generate-copy
supabase functions deploy generate-styles
```


#### 3.1 Crear Proyecto
1. Ve a https://supabase.com y crea un proyecto
2. En **Settings → API**, copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

#### 3.2 Crear Tablas (SQL)
Ve a **SQL Editor** en Supabase y ejecuta:

```sql
-- Tabla: business_config
CREATE TABLE business_config (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  website TEXT,
  primary_color TEXT DEFAULT '#a855f7',
  secondary_color TEXT DEFAULT '#0ea5e9',
  music_url TEXT,
  hashtag TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: generation_history
CREATE TABLE generation_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  category TEXT,
  analysis_json JSONB,
  selected_idea JSONB,
  selected_copy JSONB,
  selected_style JSONB,
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  metadata_json JSONB
);

-- Tabla: products
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  price TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own business_config" 
  ON business_config FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business_config" 
  ON business_config FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business_config" 
  ON business_config FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generation_history" 
  ON generation_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation_history" 
  ON generation_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own products" 
  ON products FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" 
  ON products FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" 
  ON products FOR UPDATE 
  USING (auth.uid() = user_id);
```

#### 3.3 Crear Storage Buckets
En **Storage**, crea estos buckets (todos privados):
- `business-logos`
- `background-music`
- `generated-videos`
- `product-images`

#### 3.4 Configurar OAuth (Google, X, Apple)
En **Authentication → Providers**:

**Google:**
1. Ve a https://console.cloud.google.com
2. Crea proyecto nuevo
3. Activa Google+ API
4. En OAuth 2.0, crea credenciales (Web)
5. Copia Client ID y Client Secret a Supabase
6. En URL autorizadas, agrega: `https://[tu-proyecto].supabase.co/auth/v1/callback`

**X (Twitter):**
1. Ve a https://developer.twitter.com/en/portal/dashboard
2. Crea app nueva
3. Activa "OAuth 2.0"
4. En User authentication settings:
   - Callback URI: `https://[tu-proyecto].supabase.co/auth/v1/callback`
   - Website: `https://tudominio.com`
5. Copia Client ID y Secret a Supabase

**Apple:**
1. Ve a https://developer.apple.com
2. En Keys, crea nueva key con "Sign in with Apple"
3. Sigue instrucciones de Supabase para configurar

### 4. Ejecutar Dev Server

```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador.

---

## Flujo de la App

1. **Login/Register** → Autenticación con Supabase
2. **Configuración** → Datos fijos del negocio (obligatorio en primer login)
3. **Dashboard** → Home con botón "Crear Reel/Story"
4. **Crear** (En desarrollo)
   - Sube fotos/videos
   - IA analiza con GPT-4o Vision
   - Elige 1 de 6 ideas virales
   - Elige copy, estilo de video, voiceover
   - Replica genera MP4 en 1-3 minutos
   - Descarga/comparte a Instagram

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── auth/          # Login, Register, ProtectedRoute
│   ├── business/      # BusinessConfigForm
│   ├── creation/      # ImageUploader, IdeaCards, etc
│   ├── dashboard/     # VideoCard, HistoryList
│   └── common/        # Button, Card, Input, etc
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── Configuracion.jsx
│   ├── Crear.jsx
│   └── Dashboard.jsx
├── hooks/
│   ├── useAuth.jsx          # Auth context
│   ├── useBusinessConfig.js # Business data
│   └── useGeneration.js     # Generation workflow
├── lib/
│   ├── supabase.js          # Supabase client
│   ├── openai.js            # GPT-4o wrapper (→ Edge Functions)
│   ├── replicate.js         # Video gen API (próxima)
│   └── utils.js
├── utils/
│   ├── constants.js         # Categories, CTA templates
│   └── templates.js         # Dynamic prompt generation
└── App.jsx                  # Router setup
```

---

## Deploy a Vercel

```bash
# 1. Push a GitHub
git add .
git commit -m "Initial ReelMaker Pro 2025"
git push origin main

# 2. Ve a vercel.com, conecta tu repo
# 3. En Environment Variables, agrega tus keys (.env.local)
# 4. Deploy automático ✅
```

---

**Creado con ❤️ para comercios locales en LatAm** 🚀
