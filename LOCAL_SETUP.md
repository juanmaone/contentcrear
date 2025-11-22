# ⚙️ Guía Local: Setup con OpenRouter

## Requisitos Previos
- Supabase local en ejecución: `npx supabase start`
- Node.js instalado

## Paso 1: Tener Supabase Ejecutándose
```bash
npx supabase start
```
✓ Debería mostrarte el API URL, Publishable key, etc.

## Paso 2: Iniciar el Servidor de Funciones Edge
Usa el script que configuramos para pasar las variables de entorno correctamente:
```bash
.\start-functions.ps1
```

Este script automaticamente:
- Establece `OPENROUTER_API_KEY` y otros valores
- Inicia `npx supabase functions serve` con esas variables

**Alternativa (si prefieres línea de comandos manual):**
```powershell
$env:OPENROUTER_API_KEY='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'
$env:OPENROUTER_VISION_MODEL='openai/gpt-4o-mini'
$env:OPENROUTER_TEXT_MODEL='openai/gpt-4o-mini'
$env:OPENROUTER_SITE_URL='http://localhost:5173'
$env:OPENROUTER_APP_NAME='ContentCreator'
npx supabase functions serve
```

## Paso 3: Iniciar la Aplicación Frontend
En otra terminal:
```bash
npm run dev
```
Abre http://localhost:5173 (o el puerto que indique)

## Paso 4: Probar el Flujo
1. Ve a http://localhost:5173/crear
2. Sube una imagen
3. Haz clic en "Analizar imágenes"
4. Debería llamar a OpenRouter y mostrar el análisis

## Variables de Entorno - Explicación

Las siguientes variables se cargan en el servidor de funciones:

| Variable | Valor | Propósito |
|----------|-------|----------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | API key para OpenRouter |
| `OPENROUTER_VISION_MODEL` | `openai/gpt-4o-mini` | Modelo para análisis de imágenes |
| `OPENROUTER_TEXT_MODEL` | `openai/gpt-4o-mini` | Modelo para generación de texto |
| `OPENROUTER_SITE_URL` | `http://localhost:5173` | Referer header para OpenRouter |
| `OPENROUTER_APP_NAME` | `ContentCreator` | App name header para OpenRouter |

## Troubleshooting

### ❌ "API configuration error"
→ El servidor de funciones no está viendo la `OPENROUTER_API_KEY`
→ Asegúrate de usar `start-functions.ps1` o establecer la variable antes de `npx supabase functions serve`

### ❌ "Missing apikey header"
→ El cliente no está enviando el `apikey` header correctamente
→ Verifica que `src/lib/openai.js` tenga `'apikey': SUPABASE_ANON_KEY` en los headers

### ❌ Conexión rechazada a localhost:54321
→ Supabase no está corriendo
→ Ejecuta `npx supabase start` en otra terminal

## Próximos Pasos

Una vez que el análisis funcione:
1. Prueba generar ideas (paso 2)
2. Prueba generar copy (paso 3)
3. Prueba generar estilos (paso 4)
4. Prueba la generación de video (requiere Replicate API)
