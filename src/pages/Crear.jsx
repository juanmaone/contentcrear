import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { useGeneration } from '../hooks/useGeneration'
import { Card, CardContent, CardHeader } from '../components/common/Card'
import Button from '../components/common/Button'
import AnalysisCard from '../components/creation/AnalysisCard'
import IdeaCard from '../components/creation/IdeaCard'
import CopyCard from '../components/creation/CopyCard'
import StyleCard from '../components/creation/StyleCard'
import VoiceSelector from '../components/creation/VoiceSelector'
import { submitVideoJob, pollVideoStatus, createGenerationRequest, getEstimatedDuration } from '../lib/replicate'
import { toast } from 'sonner'
import { MAX_FILE_SIZES, SUPPORTED_FILE_TYPES } from '../utils/constants'

export default function Crear() {
  const navigate = useNavigate()
  const { config } = useBusinessConfig()
  const {
    uploadedFiles: uploadedFilesState,
    analysisResults,
    viralIdeas,
    selectedIdea,
    copyOptions,
    selectedCopy,
    styleOptions,
    selectedStyle,
    voiceOptions,
    selectedVoice,
    loading,
    error,
    progress,
    setUploadedFiles: setUploadedFilesHook,
    uploadAndAnalyzeImages,
    selectIdeaAndGenerate,
    selectCopyOption,
    selectStyleOption,
    selectVoiceOption,
    saveToHistory,
    reset,
  } = useGeneration()

  const [step, setStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)

  // Validate config
  useEffect(() => {
    if (!config || !config.business_name) {
      toast.error('Por favor completa tu configuración primero')
      navigate('/configuracion')
    }
  }, [config])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files) => {
    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!SUPPORTED_FILE_TYPES.images.includes(file.type) && !SUPPORTED_FILE_TYPES.videos.includes(file.type)) {
        toast.error(`Tipo de archivo no soportado: ${file.type}`)
        return false
      }

      const maxSize = file.type.startsWith('video') ? MAX_FILE_SIZES.video : MAX_FILE_SIZES.image
      if (file.size > maxSize) {
        toast.error(`Archivo muy grande: ${file.name}`)
        return false
      }

      return true
    })

    if (validFiles.length + uploadedFiles.length > 5) {
      toast.error('Máximo 5 archivos')
      return
    }

    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

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

  const handleSelectIdea = async (idea) => {
    try {
      await selectIdeaAndGenerate(idea, config, analysisResults)
      setStep(3)
      toast.success('Idea seleccionada')
    } catch (err) {
      toast.error('Error al seleccionar idea')
    }
  }

  const handleSelectCopy = (copy) => {
    selectCopyOption(copy)
    setStep(4)
  }

  const handleSelectStyle = (style) => {
    selectStyleOption(style)
    setStep(5)
  }

  const handleGenerateVideo = async () => {
    if (!selectedIdea || !selectedCopy || !selectedStyle || !selectedVoice) {
      toast.error('Por favor completa todas las selecciones')
      return
    }

    try {
      // Build generation request
      const generationRequest = createGenerationRequest({
        selectedIdea,
        selectedCopy,
        selectedStyle,
        selectedVoice,
        analysisResults,
        businessConfig: config,
      })

      // Submit to Replicate
      toast.loading('Enviando video a generar...')
      const jobId = await submitVideoJob({
        videoModel: generationRequest.metadata.ideaId.includes('asmr') ? 'kling-1.6' : 'luma-ray-2',
        prompt: generationRequest.prompt,
        duration: selectedStyle.duration_seconds || 15,
        aspectRatio: '16:9',
        metadata: generationRequest.metadata,
      })

      // Save to history
      await saveToHistory({
        title: generationRequest.title,
        category: config.category,
        jobId,
      })

      toast.success('¡Video en generación!')
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar video')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crear Reel/Story</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            ← Volver
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition ${s <= step ? 'bg-purple-600' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>

        {/* Step 1: Upload Images */}
        {step === 1 && (
          <Card className="shadow-xl">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">Sube tus fotos o videos</h2>
              <p className="text-gray-600 mt-2">Arrastra o haz clic para seleccionar (máx 5 archivos)</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                  dragActive ? 'border-purple-500 bg-purple-50' : 'border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="text-5xl mb-3">📸</div>
                <p className="text-gray-900 font-semibold mb-1">Arrastra imágenes aquí o haz clic</p>
                <p className="text-gray-600 text-sm mb-4">PNG, JPG, MP4, WebM</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button size="sm">Seleccionar archivos</Button>
                </label>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {uploadedFiles.length} archivo(s) seleccionado(s)
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <div className="bg-gray-100 rounded-lg overflow-hidden h-24 flex items-center justify-center">
                          {file.type.startsWith('image') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-2xl">🎬</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
                  Cancelar
                </Button>
                <Button
                  size="lg"
                  loading={loading}
                  disabled={loading || uploadedFiles.length === 0}
                  onClick={handleAnalyze}
                >
                  Analizar imágenes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Analysis Results & Idea Selection */}
        {step === 2 && analysisResults && (
          <Card className="shadow-xl">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">📊 Análisis completado</h2>
              <p className="text-gray-600 mt-2">Elige una de las 6 ideas virales sugeridas</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Analysis Card */}
              <AnalysisCard analysis={analysisResults} />

              {/* Idea Cards */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ideas virales sugeridas</h3>
                <div className="space-y-3">
                  {viralIdeas && viralIdeas.length > 0 ? (
                    viralIdeas.map((idea, idx) => (
                      <IdeaCard
                        key={idea.id || idx}
                        idea={idea}
                        isSelected={selectedIdea?.id === idea.id}
                        onSelect={() => handleSelectIdea(idea)}
                        loading={loading}
                      />
                    ))
                  ) : (
                    <p className="text-gray-600">Generando ideas...</p>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Volver
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Copy Selection */}
        {step === 3 && copyOptions.length > 0 && (
          <Card className="shadow-xl">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">✍️ Elige tu copy</h2>
              <p className="text-gray-600 mt-2">Selecciona el mensaje que más te guste</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {copyOptions.map((copy, idx) => (
                  <CopyCard
                    key={copy.id || idx}
                    copy={copy}
                    isSelected={selectedCopy?.id === copy.id}
                    onSelect={() => handleSelectCopy(copy)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
              >
                Volver
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Style Selection */}
        {step === 4 && styleOptions.length > 0 && (
          <Card className="shadow-xl">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">🎨 Elige el estilo</h2>
              <p className="text-gray-600 mt-2">¿Cómo quieres que se vea tu video?</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {styleOptions.map((style, idx) => (
                  <StyleCard
                    key={style.id || idx}
                    style={style}
                    isSelected={selectedStyle?.id === style.id}
                    onSelect={() => handleSelectStyle(style)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(3)}
              >
                Volver
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Voice & Review */}
        {step === 5 && (
          <Card className="shadow-xl">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">🎤 Elige voz y revisa</h2>
              <p className="text-gray-600 mt-2">Último paso: selecciona voz en off y genera tu video</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Voice Selector */}
              <VoiceSelector
                onVoiceSelect={selectVoiceOption}
                selectedVoice={selectedVoice}
                loading={loading}
              />

              {/* Summary */}
              {selectedIdea && selectedCopy && selectedStyle && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-900">📋 Resumen de tu video</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">💡 Idea:</span>
                      <span className="font-semibold text-gray-900">{selectedIdea.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">✍️ Copy:</span>
                      <span className="font-semibold text-gray-900 line-clamp-1">
                        {selectedCopy.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">🎨 Estilo:</span>
                      <span className="font-semibold text-gray-900">{selectedStyle.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">🎤 Voz:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedVoice ? selectedVoice.name : 'Por seleccionar'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 pt-2 border-t border-purple-200">
                    ✓ Tu video será generado usando todos los elementos seleccionados
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(4)}
                  disabled={loading}
                >
                  Volver
                </Button>
                <Button
                  size="lg"
                  disabled={!selectedVoice || loading}
                  loading={loading}
                  onClick={handleGenerateVideo}
                >
                  Generar Video
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
