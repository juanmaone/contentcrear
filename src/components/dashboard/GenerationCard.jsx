/**
 * GenerationCard.jsx
 * Displays a video generation with status and progress
 */

import { useState } from 'react'
import { Download, Eye, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function GenerationCard({ generation, isGenerating, onUpdate }) {
  const [showPreview, setShowPreview] = useState(false)

  const getStatusBadge = () => {
    switch (generation.status) {
      case 'succeeded':
        return <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">✓ Completado</span>
      case 'processing':
        return <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">⏳ Procesando</span>
      case 'failed':
        return <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">✗ Error</span>
      case 'queued':
        return <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">📋 En cola</span>
      default:
        return <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{generation.status}</span>
    }
  }

  const createdDate = generation.created_at
    ? new Date(generation.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Hace poco'

  const handleDownload = async () => {
    if (!generation.video_url) {
      toast.error('URL de video no disponible')
      return
    }

    try {
      const response = await fetch(generation.video_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${generation.title || 'video'}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Video descargado')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Error al descargar video')
    }
  }

  const handleRetry = async () => {
    // Could implement retry logic here
    toast.info('Reintentar funcionalidad - próxima versión')
  }

  // Calculate estimated progress
  const getProgressEstimate = () => {
    if (generation.metadata_json?.estimated_progress) {
      return generation.metadata_json.estimated_progress
    }
    // Estimate based on time since creation
    const createdTime = new Date(generation.created_at).getTime()
    const nowTime = new Date().getTime()
    const elapsedSeconds = (nowTime - createdTime) / 1000
    return Math.min(Math.floor((elapsedSeconds / 180) * 100), 95) // Assume 3 min average
  }

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden transition-all shadow-md hover:shadow-lg ${
        isGenerating ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
      }`}
    >
      {/* Video Preview */}
      {generation.status === 'succeeded' && generation.video_url && (
        <div className="relative w-full aspect-video bg-black">
          <video
            src={generation.video_url}
            className="w-full h-full object-cover"
            controls
            controlsList="nodownload"
          />
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 transition"
          >
            <Eye className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      )}

      {/* Placeholder for processing videos */}
      {generation.status !== 'succeeded' && (
        <div className="w-full aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            {generation.status === 'processing' && (
              <div className="animate-spin">
                <RotateCcw className="w-8 h-8 text-purple-600" />
              </div>
            )}
            {generation.status === 'failed' && <span className="text-3xl">❌</span>}
            <p className="text-xs text-gray-600 mt-2 font-medium">
              {generation.status === 'processing'
                ? 'Generando...'
                : generation.status === 'failed'
                  ? 'Error en generación'
                  : 'Video generado'}
            </p>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 line-clamp-1">{generation.title || 'Video sin título'}</h4>
            <p className="text-xs text-gray-500 mt-1">{createdDate}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description */}
        {generation.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{generation.description}</p>
        )}

        {/* Progress Bar */}
        {generation.status === 'processing' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Generando...</span>
              <span className="text-xs font-semibold text-purple-600">{getProgressEstimate()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                style={{
                  width: `${getProgressEstimate()}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex gap-2">
            {generation.category && (
              <span className="bg-gray-100 px-2 py-1 rounded">📁 {generation.category}</span>
            )}
            {generation.metadata_json?.model && (
              <span className="bg-gray-100 px-2 py-1 rounded">🎬 {generation.metadata_json.model}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {generation.status === 'succeeded' && generation.video_url && (
            <>
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 transition px-3 py-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                Descargar
              </button>
              <button
                onClick={() => window.open(generation.video_url, '_blank')}
                className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 transition px-3 py-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Abrir
              </button>
            </>
          )}
          {generation.status === 'failed' && (
            <button
              onClick={handleRetry}
              className="flex-1 bg-orange-100 text-orange-700 hover:bg-orange-200 transition px-3 py-2 rounded text-xs font-semibold"
            >
              🔄 Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
