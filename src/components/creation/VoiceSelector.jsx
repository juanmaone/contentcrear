/**
 * VoiceSelector.jsx
 * Component for selecting narration voice for the video
 */

import { useState } from 'react'
import Button from '../common/Button'

export default function VoiceSelector({ onVoiceSelect, selectedVoice, loading }) {
  const [playingVoice, setPlayingVoice] = useState(null)

  const voices = [
    {
      id: 'luna',
      name: 'Luna',
      description: 'Voz femenina clara y moderna',
      emoji: '👩‍🎤',
      accent: 'Neutral',
    },
    {
      id: 'diego',
      name: 'Diego',
      description: 'Voz masculina profesional',
      emoji: '👨‍💼',
      accent: 'Neutral',
    },
    {
      id: 'sofia',
      name: 'Sofía',
      description: 'Voz femenina cálida y cercana',
      emoji: '👩‍🎓',
      accent: 'Español',
    },
    {
      id: 'none',
      name: 'Sin narración',
      description: 'Solo música y sonidos',
      emoji: '🎵',
      accent: 'N/A',
    },
  ]

  const playVoiceSample = (voiceId) => {
    setPlayingVoice(voiceId)
    setTimeout(() => setPlayingVoice(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Selecciona voz en off</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {voices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => onVoiceSelect(voice)}
              disabled={loading}
              className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedVoice?.id === voice.id
                  ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-400'
                  : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{voice.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{voice.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Acento: {voice.accent}</p>
                </div>
                {selectedVoice?.id === voice.id && (
                  <div className="text-purple-600 font-semibold">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedVoice && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{selectedVoice.emoji}</span>
            <span className="font-semibold text-gray-900">
              Has seleccionado: <span className="text-purple-600">{selectedVoice.name}</span>
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Tu video usará {selectedVoice.id === 'none' ? 'solo música' : `la voz de ${selectedVoice.name}`}.
          </p>
        </div>
      )}
    </div>
  )
}
