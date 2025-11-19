/**
 * IdeaCard.jsx
 * Displays a viral idea suggestion with title, description, and recommendations
 */

export default function IdeaCard({ idea, isSelected, onSelect, loading }) {
  return (
    <button
      onClick={onSelect}
      disabled={loading}
      className={`w-full text-left transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-400'
          : 'border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
      } p-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex gap-4 items-start">
        {/* Icon/Badge */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
            💡
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-gray-900 text-lg leading-tight flex-1">
              {idea.title}
            </h4>
            <div className="flex-shrink-0 text-right">
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                {idea.estimated_duration_seconds || '15'}s
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-2">{idea.description}</p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              💡 {idea.why_viral}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              {idea.recommended_model && (
                <span className="text-xs text-gray-500 font-medium">
                  🎬 {idea.recommended_model}
                </span>
              )}
            </div>
            {isSelected && (
              <div className="text-purple-600 font-semibold text-sm">✓ Seleccionado</div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
