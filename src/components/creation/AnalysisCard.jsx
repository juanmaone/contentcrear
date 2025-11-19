/**
 * AnalysisCard.jsx
 * Displays Vision API analysis results with detected products, colors, and emotions
 */

export default function AnalysisCard({ analysis }) {
  if (!analysis || !Array.isArray(analysis) || analysis.length === 0) {
    return null
  }

  const item = analysis[0] // Usually one item per batch

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-xl">📊</span> Análisis de tu imagen
      </h3>

      <div className="space-y-4">
        {/* Main Product */}
        <div>
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
            Producto Principal
          </p>
          <div className="bg-white p-3 rounded border-l-4 border-purple-600">
            <p className="font-semibold text-gray-900">{item.main_product || 'Producto'}</p>
          </div>
        </div>

        {/* Detected Objects */}
        {item.detected_objects && item.detected_objects.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
              Elementos Detectados
            </p>
            <div className="flex flex-wrap gap-2">
              {item.detected_objects.map((obj, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-white text-purple-700 text-sm font-medium px-3 py-1 rounded-full border border-purple-200"
                >
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {item.colors && item.colors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
              Paleta de Colores
            </p>
            <div className="flex gap-2">
              {item.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-purple-200"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{
                      backgroundColor: colorNameToHex(color),
                    }}
                  ></div>
                  <span className="text-sm text-gray-700">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotion/Style */}
        {item.emotion_style && (
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
              Estilo Emocional
            </p>
            <div className="bg-white p-3 rounded border-l-4 border-pink-400">
              <p className="text-gray-900">{item.emotion_style}</p>
            </div>
          </div>
        )}

        {/* Viral Potential Score */}
        <div>
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
            Potencial Viral
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white rounded-full h-3 overflow-hidden border border-purple-200">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all"
                style={{
                  width: `${(item.viral_potential_score || 0) * 10}%`,
                }}
              ></div>
            </div>
            <span className="font-bold text-gray-900 w-12 text-right">
              {item.viral_potential_score || 0}/10
            </span>
          </div>
        </div>

        {/* Suggested Trends */}
        {item.suggested_trends && item.suggested_trends.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
              Tendencias Sugeridas
            </p>
            <div className="flex flex-wrap gap-2">
              {item.suggested_trends.map((trend, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  #{trend}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Simple color name to hex mapping for visualization
 */
function colorNameToHex(colorName) {
  const colorMap = {
    rojo: '#EF4444',
    'rojo oscuro': '#991B1B',
    rosa: '#EC4899',
    naranja: '#F97316',
    amarillo: '#FBBF24',
    'amarillo oscuro': '#D97706',
    verde: '#10B981',
    'verde oscuro': '#065F46',
    azul: '#3B82F6',
    'azul oscuro': '#1E40AF',
    morado: '#A855F7',
    púrpura: '#A855F7',
    marrón: '#92400E',
    gris: '#6B7280',
    blanco: '#F3F4F6',
    negro: '#1F2937',
    beige: '#E5DCC8',
    dorado: '#D4A574',
    plata: '#C0C0C0',
    cobre: '#B87333',
  }

  const lower = colorName.toLowerCase().trim()
  return colorMap[lower] || '#6366F1'
}
