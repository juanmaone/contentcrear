# 🚀 PHASE 5: Vision API Integration - Guía de Implementación

Este documento te guía paso a paso para implementar la integración de Vision API en `/crear` page (Step 2).

**Tiempo estimado:** 30-45 minutos  
**Dificultad:** Media (la lógica ya está, solo conectar)  
**Dependencias:** Todas completas ✅

---

## 📋 Pre-requisitos

Verifica que tengas:

1. **Dev server corriendo:** `npm run dev` en http://localhost:5174
2. **Archivo .env.local** con:
   ```
   VITE_SUPABASE_URL=https://[proyecto].supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
  OPENROUTER_API_KEY=or-...
  OPENROUTER_TEXT_MODEL=openai/gpt-4o-mini
  OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
   ```
3. **Supabase project activo** en https://supabase.com
4. **Edge Functions archivos creados** en `supabase/functions/`

---

## 🔧 Paso 1: Setup Supabase Local (5 min)

### Opción A: Usar Supabase Cloud (Recomendado para testing)

No hace falta hacer nada. Las Edge Functions se deployarán automáticamente a tu proyecto Supabase en la nube.

### Opción B: Supabase Local (Para desarrollo offline)

```bash
# Install CLI si no lo tienes
npm install -g supabase

# En la raíz del proyecto
supabase start

# En otra terminal, serve Edge Functions
supabase functions serve
```

Esto abre Edge Functions en `http://localhost:54321/functions/v1/`

---

## ✅ Paso 2: Deploy Edge Functions (5-10 min)

### Si estás usando Supabase Cloud:

```bash
# Desde raíz del proyecto
supabase link  # Conecta con tu proyecto cloud

# Deploy cada función
supabase functions deploy analyze-vision --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-ideas --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-copy --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-styles --project-ref YOUR_PROJECT_REF
```

### Si estás usando Supabase Local:

```bash
# Ya están servidas automáticamente en http://localhost:54321/functions/v1/
# Solo necesitas que `supabase functions serve` esté corriendo
```

---

## 🧪 Paso 3: Test de Edge Functions (10 min)

### Test `/analyze-vision` con curl:

```bash
curl -X POST http://localhost:54321/functions/v1/analyze-vision \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": ["data:image/jpeg;base64,..."],
    "category": "restaurante",
    "businessName": "Test Restaurant"
  }'
```

**Respuesta esperada:**
```json
[
  {
    "main_product": "plato",
    "detected_objects": ["comida", "presentación"],
    "colors": ["rojo", "dorado"],
    "emotion_style": "apetitoso",
    "viral_potential_score": 8,
    "suggested_trends": ["food porn"]
  }
]
```

Si ves errores sobre "Cannot find module", revisa que el `OPENROUTER_API_KEY` esté configurado en Supabase Dashboard → Settings → Edge Functions.

---

## 🔌 Paso 4: Verificar Integración en Código (5 min)

Abre `src/lib/openai.js` y verifica que las funciones llamen a Edge Functions:

```javascript
// ✅ Debe verse así:
export const analyzeImagesWithVision = async (imageUrls, category, businessName) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-vision`, {
    // ...
  })
}

// ✅ NUNCA debería importar OpenAI client:
// ❌ import OpenAI from 'openai'  // NO - esto sería inseguro
```

---

## 🎨 Paso 5: Actualizar Crear.jsx (10-15 min)

El archivo ya tiene la estructura lista. Solo necesitas verificar que `handleAnalyze` haga lo correcto.

### Current code (verifica en `src/pages/Crear.jsx`):

```javascript
const handleAnalyze = async () => {
  if (uploadedFiles.length === 0) {
    toast.error('Por favor sube al menos una imagen')
    return
  }

  try {
    await uploadAndAnalyzeImages(uploadedFiles, config)
    setStep(2)
    toast.success('¡Imágenes analizadas!')
  } catch (err) {
    toast.error('Error al analizar imágenes')
  }
}
```

Este código ya debería:
1. ✅ Llamar a `uploadAndAnalyzeImages` del hook
2. ✅ Esperar respuesta de Edge Function
3. ✅ Pasar a Step 2
4. ✅ Mostrar toast de éxito

Si no funciona, verifica los logs del servidor.

---

## 🧠 Paso 6: Debugging (Si algo falla)

### Error: "Cannot fetch Edge Function"

```
Error: fetch failed
```

**Solución:**
1. Verifica que `VITE_SUPABASE_URL` es correcto
2. Verifica que `VITE_SUPABASE_ANON_KEY` es correcto
3. Si usas local: `supabase functions serve` está corriendo?
4. Si usas cloud: Edge Functions están deployadas?

### Error: "OPENROUTER_API_KEY not found"

```json
{"error": "API configuration error"}
```

**Solución:**
1. Supabase Cloud: Ve a Settings → Edge Functions → Environment Variables
2. Agrega `OPENROUTER_API_KEY=or-...`
3. Espera 30 segundos
4. Reinicia Edge Functions
5. Re-test

### Error: "Vision analysis failed"

```json
{"error": "Vision analysis failed"}
```

**Solución:**
1. Verifica que tu OpenRouter key tenga quota
2. Verifica que el modelo definido en `OPENROUTER_VISION_MODEL` está disponible
3. Revisa logs de Supabase: Dashboard → Edge Functions → Logs
4. Intenta con una imagen más pequeña

### Error: "Invalid JSON in response"

Esto significa que OpenRouter (o el modelo seleccionado) no devolvió JSON válido. Probablemente por:
1. Imágenes en formato incorrecto (usa base64 o URL HTTPS)
2. Prompts muy largo
3. Rate limit del modelo en OpenRouter

---

## ✨ Paso 7: Test del Flujo Completo (5 min)

1. Abre http://localhost:5174 en navegador
2. Login o Register
3. Ve a `/configuracion`, llena datos, guarda
4. Ve a `/crear`
5. Sube 1-2 imágenes (usa fotos reales)
6. Presiona "Analizar imágenes"
7. Espera... (debería tardar 10-30 segundos)
8. Verifica que aparezca "Análisis completado" en Step 2
9. Verifica que se muestren 6 idea cards

**Si todo funciona:** ¡Phase 5 completada! 🎉

---

## 🐛 Troubleshooting Avanzado

### Si quieres ver los logs de Edge Functions en local:

```bash
supabase functions serve --debug
```

Verás logs como:
```
[analyze-vision] POST /functions/v1/analyze-vision
[analyze-vision] Request: {"imageUrls": [...], ...}
[analyze-vision] Response: [{"main_product": "...", ...}]
```

### Si quieres hacer mock de Vision API para testing:

En `supabase/functions/analyze-vision/index.ts`, puedes reemplazar la llamada a OpenAI con:

```typescript
// MOCK para testing (reemplaza la llamada real a OpenAI)
const analysisResults: AnalysisResult[] = [
  {
    main_product: "Plato Demostrativo",
    detected_objects: ["comida", "presentación", "tabla"],
    colors: ["rojo", "dorado", "blanco"],
    emotion_style: "apetitoso",
    viral_potential_score: 9,
    suggested_trends: ["food porn", "close-up", "ASMR"],
  }
]
```

Esto es útil para testing sin gastar créditos de OpenAI.

---

## 📊 Paso 8: Validación y Checklist Final

Antes de mover a Phase 6, verifica:

- [ ] Imágenes se suben correctamente
- [ ] "Analizar imágenes" button hace algo
- [ ] No hay errores en consola del browser
- [ ] Edge Function responde en Supabase logs
- [ ] Step 2 muestra "Análisis completado"
- [ ] Se muestran productos detectados
- [ ] Se muestran 6 idea cards
- [ ] Click en idea card va a Step 3 (aunque paso 3 esté vacío)
- [ ] Volver funciona

---

## 🎯 Próximo Paso (Phase 6)

Una vez Phase 5 esté funcionando, el siguiente paso es mejorar la UI de Steps 3 y 4:

**Phase 6 - Idea/Copy/Style Selection:**
1. Hacer idea cards más bonitas (mejor UI/UX)
2. Implementar selección de copy (5 opciones)
3. Implementar selección de estilo (4 opciones)
4. Agregar animaciones entre steps
5. Better progress indicators

Vuelve a ejecutar `supabase functions serve` y repite el proceso para la siguiente fase.

---

## 📚 Recursos Adicionales

- **Supabase Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Supabase CLI:** https://supabase.com/docs/reference/cli/introduction
- **OpenAI Vision API:** https://platform.openai.com/docs/guides/vision
- **Debugging React Hooks:** https://react.dev/reference/react/useEffect

---

## 🆘 Si Necesitas Ayuda

Abre un issue en GitHub con:
1. Pantalla completa del error
2. Logs de Supabase Edge Functions
3. Logs de console del browser (F12)
4. Tu `.env.local` (sin API keys por supuesto)

---

**¡Buena suerte! You're almost there! 🚀**

Una vez Phase 5 esté live, el app será completamente funcional desde el punto de vista del usuario.
