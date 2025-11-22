import { useState, useEffect, useRef } from 'react'
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
  const { config, loading: configLoading } = useBusinessConfig()
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
    scriptVariants,
    selectedScript,
    loading,
    error,
    progress,
    setUploadedFiles: setUploadedFilesHook,
    uploadAndAnalyzeImages,
    selectIdeaAndGenerate,
    selectCopyOption,
    selectStyleOption,
    selectVoiceOption,
    generateScriptOptions,
    updateScriptVariant,
    selectScriptVariant,
    saveToHistory,
    reset,
  } = useGeneration()

  const [step, setStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const steps = [
    { id: 1, label: 'Material' },
    { id: 2, label: 'Ideas' },
    { id: 3, label: 'Copy' },
    { id: 4, label: 'Estilo' },
    { id: 5, label: 'Guion' },
    { id: 6, label: 'Render' },
  ]

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // Validate config
  useEffect(() => {
    // Wait for loading to finish before validating
    if (configLoading) return
    
    // Only redirect if user has started config but didn't add business name
    if (config && !config.business_name) {
      toast.error('Por favor completa tu configuración primero')
      navigate('/configuracion')
    }
  }, [config, configLoading])

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
    console.log('Files selected:', files.length, files.map(f => ({ name: f.name, type: f.type, size: f.size })))
    handleFiles(files)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleFiles = (files) => {
    console.log('Processing files:', files)
    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isImage = SUPPORTED_FILE_TYPES.images.includes(file.type)
      const isVideo = SUPPORTED_FILE_TYPES.videos.includes(file.type)
      
      console.log(`File: ${file.name}, Type: ${file.type}, IsImage: ${isImage}, IsVideo: ${isVideo}`)
      
      if (!isImage && !isVideo) {
        toast.error(`Tipo de archivo no soportado: ${file.type}`)
        return false
      }

      const maxSize = isVideo ? MAX_FILE_SIZES.video : MAX_FILE_SIZES.image
      if (file.size > maxSize) {
        toast.error(`Archivo muy grande: ${file.name}`)
        return false
      }

      return true
    })

    console.log('Valid files:', validFiles.length)

    if (validFiles.length + uploadedFiles.length > 5) {
      toast.error('Máximo 5 archivos')
      return
    }

    setUploadedFiles((prev) => {
      const updated = [...prev, ...validFiles]
      console.log('Updated uploaded files:', updated.length)
      return updated
    })
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
    if (!selectedCopy || !selectedIdea) {
      toast.error('Selecciona primero una idea y un copy')
      return
    }

    selectStyleOption(style)
    const variants = generateScriptOptions({
      idea: selectedIdea,
      copy: selectedCopy,
      style,
      businessConfig: config,
      analysis: analysisResults,
    })

    if (!variants.length) {
      toast.error('No pudimos generar guiones. Intenta nuevamente.')
      return
    }

    setStep(5)
    toast.success('Estilo seleccionado. Generamos tus guiones 🎬')
  }

  const handleScriptChange = (scriptId, value) => {
    updateScriptVariant(scriptId, value)
  }

  const handleScriptSelect = (scriptId) => {
    selectScriptVariant(scriptId)
  }

  const handleDownloadScript = (script) => {
    const blob = new Blob([script.text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${script.title.replace(/\s+/g, '_').toLowerCase()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleConfirmScript = () => {
    if (!selectedScript) {
      toast.error('Selecciona un guión para continuar')
      return
    }

    toast.success('Guión guardado')
    setStep(6)
  }

  const handleGenerateVideo = async () => {
    if (!selectedIdea || !selectedCopy || !selectedStyle || !selectedVoice || !selectedScript) {
      toast.error('Por favor completa todas las selecciones (incluye guión y voz)')
      return
    }

    try {
      // Build generation request
      const generationRequest = createGenerationRequest({
        selectedIdea,
        selectedCopy,
        selectedStyle,
        selectedVoice,
        selectedScript,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-purple-500 font-semibold">Nuevo proyecto</p>
            <h1 className="text-4xl font-bold text-gray-900">Crear Reel o Story</h1>
            <p className="text-sm text-slate-600 mt-1">Procesamos tus fotos, proponemos ideas y renderizamos un video con tu marca.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            ← Volver al dashboard
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {steps.map(({ id, label }) => (
            <div
              key={id}
              className={`rounded-2xl border px-3 py-2 text-center text-sm font-semibold transition ${
                id <= step ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200/70' : 'border-slate-200 bg-white/70 text-slate-500'
              }`}
            >
              <span className="block text-xs opacity-70">Paso {id}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Step 1: Upload Images */}
        {step === 1 && (
          <Card className="shadow-2xl">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sube tus fotos o videos</h2>
                  <p className="text-gray-600 mt-1">Arrastra o haz clic para seleccionar (máx 5 archivos, hasta 50MB)</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 font-medium">
                  Tiempo estimado · 3 min
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onClick={openFileDialog}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openFileDialog()
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer bg-white/60 ${
                  dragActive
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50/80 to-white'
                    : 'border-slate-200 hover:border-purple-400 hover:bg-white'
                }`}
              >
                <div className="text-5xl mb-3">📸</div>
                <p className="text-gray-900 font-semibold mb-1">Arrastra imágenes o videos aquí</p>
                <p className="text-gray-500 text-sm mb-4">PNG, JPG, MP4 o WebM · Máx 5 archivos</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  ref={fileInputRef}
                />
                <Button
                  size="md"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openFileDialog()
                  }}
                >
                  Seleccionar archivos
                </Button>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {uploadedFiles.length} archivo(s) seleccionado(s)
                  </h3>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <div className="bg-slate-100 rounded-2xl overflow-hidden h-28 flex items-center justify-center">
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
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-2 right-2 bg-white text-rose-500 rounded-full w-7 h-7 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end pt-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancelar
                </Button>
                <Button
                  size="lg"
                  loading={loading}
                  disabled={loading || uploadedFiles.length === 0}
                  onClick={handleAnalyze}
                  className="sm:min-w-[220px]"
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

        {/* Step 5: Script Editor */}
        {step === 5 && (
          <Card className="shadow-xl">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">📝 Guiones para tu voz en off</h2>
              <p className="text-gray-600 mt-2">
                Generamos 3 variantes (máx. 2000 caracteres) usando tu idea, copy y estilo. Ajusta el texto, descárgalo y elige el que usarás en ElevenLabs.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {scriptVariants.length === 0 ? (
                <div className="text-center text-gray-600">Generando guiones...</div>
              ) : (
                <div className="space-y-5">
                  {scriptVariants.map((script) => (
                    <div
                      key={script.id}
                      className={`border rounded-lg p-4 space-y-3 ${selectedScript?.id === script.id ? 'border-purple-500 shadow-lg shadow-purple-100' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{script.title}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedStyle?.name ? `Pensado para un estilo ${selectedStyle.name.toLowerCase()}` : 'Variante sugerida'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedScript?.id === script.id ? 'default' : 'outline'}
                            onClick={() => handleScriptSelect(script.id)}
                          >
                            {selectedScript?.id === script.id ? 'Seleccionado' : 'Seleccionar'}
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => handleDownloadScript(script)}>
                            Descargar .txt
                          </Button>
                        </div>
                      </div>

                      <textarea
                        value={script.text}
                        maxLength={2000}
                        onChange={(e) => handleScriptChange(script.id, e.target.value)}
                        className="w-full min-h-[180px] rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm p-3"
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {script.text.length}/2000 caracteres
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" size="lg" onClick={() => setStep(4)}>
                  Volver
                </Button>
                <Button size="lg" onClick={handleConfirmScript} disabled={!selectedScript}>
                  Guardar guión y continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Voice & Review */}
        {step === 6 && (
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

                    {selectedScript && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600">📝 Guión:</span>
                        <span className="font-semibold text-gray-900 line-clamp-2">
                          {selectedScript.text}
                        </span>
                      </div>
                    )}

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
                  onClick={() => setStep(5)}
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
