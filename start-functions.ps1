# Script para iniciar el servidor de funciones con las variables de entorno correctas
# Este script mantiene la consola abierta para que puedas ver los logs

$env:OPENROUTER_API_KEY='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'
$env:OPENROUTER_TEXT_MODEL='openai/gpt-4o-mini'
$env:OPENROUTER_VISION_MODEL='openai/gpt-4o-mini'
$env:OPENROUTER_SITE_URL='http://localhost:5173'
$env:OPENROUTER_APP_NAME='ContentCreator'

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 SUPABASE EDGE FUNCTIONS SERVER - Local Development" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Configuración OpenRouter:" -ForegroundColor Yellow
Write-Host "  • API Key: $($env:OPENROUTER_API_KEY.Substring(0, 25))..."
Write-Host "  • Vision Model: $($env:OPENROUTER_VISION_MODEL)"
Write-Host "  • Text Model: $($env:OPENROUTER_TEXT_MODEL)"
Write-Host "  • Site URL: $($env:OPENROUTER_SITE_URL)"
Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""

# Iniciar el servidor y mantener la ventana abierta
& npx supabase functions serve
