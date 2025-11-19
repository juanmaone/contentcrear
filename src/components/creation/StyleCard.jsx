/**
 * StyleCard.jsx
 * Displays video style option with cinematography details
 */

export default function StyleCard({ style, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-400'
          : 'border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
      } p-4 rounded-lg`}
    >
      <div className="space-y-2">
        {/* Title */}
        <h4 className="font-bold text-gray-900">{style.name}</h4>

        {/* Description */}
        <p className="text-sm text-gray-600">{style.description}</p>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Duración</p>
            <p className="text-sm font-semibold text-gray-900">
              {style.duration_seconds || '15'}s
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Música</p>
            <p className="text-sm font-semibold text-gray-900">
              {style.music_tempo_bpm || '120'} BPM
            </p>
          </div>
          {style.camera_movement && (
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Cámara</p>
              <p className="text-sm font-semibold text-gray-900">{style.camera_movement}</p>
            </div>
          )}
          {style.mood && (
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Vibe</p>
              <p className="text-sm font-semibold text-gray-900">{style.mood}</p>
            </div>
          )}
        </div>

        {/* Best For */}
        {style.best_for && (
          <div className="pt-2">
            <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
              ✓ {style.best_for}
            </span>
          </div>
        )}

        {isSelected && (
          <div className="text-purple-600 font-semibold text-sm pt-2">✓ Seleccionado</div>
        )}
      </div>
    </button>
  )
}
