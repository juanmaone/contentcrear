/**
 * CopyCard.jsx
 * Displays copy option with text, viral score, and audience target
 */

export default function CopyCard({ copy, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-400'
          : 'border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
      } p-5 rounded-lg`}
    >
      <div className="space-y-3">
        {/* Text */}
        <div className="text-lg font-semibold text-gray-900 leading-relaxed">
          {copy.text}
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-3 items-center">
            <span className="text-sm text-gray-600">
              <span className="font-semibold">{copy.emoji_count || 0}</span> emojis
            </span>
            {copy.audience_target && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                👥 {copy.audience_target}
              </span>
            )}
          </div>

          {/* Viral Score */}
          <div className="flex items-center gap-2">
            <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all"
                style={{
                  width: `${(copy.viral_score || 0) * 10}%`,
                }}
              ></div>
            </div>
            <span className="font-bold text-orange-600 w-10 text-right">
              {copy.viral_score || 0}/10
            </span>
          </div>
        </div>

        {/* Style Badge */}
        {copy.style && (
          <div className="text-xs font-semibold text-purple-700 uppercase">
            Estilo: {copy.style}
          </div>
        )}

        {isSelected && <div className="text-purple-600 font-semibold text-sm mt-2">✓ Seleccionado</div>}
      </div>
    </button>
  )
}
