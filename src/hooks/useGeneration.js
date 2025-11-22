import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { analyzeImagesWithVision, generateViralIdeas, generateCopyOptions, generateVideoStyles } from '../lib/openai'
import { pollVideoStatus } from '../lib/replicate'
import { toast } from 'sonner'

const MAX_SCRIPT_CHARACTERS = 2000

const clampScript = (text = '') => {
  if (!text) return ''
  return text.length > MAX_SCRIPT_CHARACTERS ? text.slice(0, MAX_SCRIPT_CHARACTERS) : text
}

export const useGeneration = () => {
  const { user } = useAuth()

  // Generation workflow state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [analysisResults, setAnalysisResults] = useState(null)
  const [viralIdeas, setViralIdeas] = useState([])
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [copyOptions, setCopyOptions] = useState([])
  const [selectedCopy, setSelectedCopy] = useState(null)
  const [styleOptions, setStyleOptions] = useState([])
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [voiceOptions, setVoiceOptions] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [scriptVariants, setScriptVariants] = useState([])
  const [selectedScript, setSelectedScript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  // Job tracking state
  const [currentJobId, setCurrentJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null) // 'processing', 'succeeded', 'failed'
  const [jobProgress, setJobProgress] = useState(0)
  const pollIntervalRef = useRef(null)

  // Step 1: Upload and analyze images
  const uploadAndAnalyzeImages = useCallback(
    async (files, businessConfig) => {
      if (!files || files.length === 0) {
        throw new Error('No files selected')
      }

      if (!businessConfig?.business_name || !businessConfig?.category) {
        throw new Error('Debes completar la configuración del negocio antes de generar contenido')
      }

      try {
        setLoading(true)
        setError(null)
        setProgress(10)

        // Convert files to base64 for Vision API
        const imageUrls = await Promise.all(
          files.map((file) => {
            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target.result)
              reader.readAsDataURL(file)
            })
          }),
        )

        setProgress(30)

        // Call Vision analysis
        const analysis = await analyzeImagesWithVision(
          imageUrls,
          businessConfig.category,
          businessConfig.business_name,
        )
        setAnalysisResults(analysis)
        setUploadedFiles(files)

        setProgress(50)

        // Generate viral ideas based on category and analysis
        const ideas = await generateViralIdeas(
          businessConfig.category,
          analysis,
          businessConfig.business_name,
        )
        setViralIdeas(ideas)

        setProgress(100)
        return analysis
      } catch (err) {
        const errorMsg = err.message || 'Error analyzing images'
        setError(errorMsg)
        toast.error(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Step 2: Select idea and generate copies/styles
  const selectIdeaAndGenerate = useCallback(async (idea, businessConfig, analysis) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedIdea(idea)

      setProgress(20)

      // Generate copy options
      const mainProduct = analysis[0]?.main_product || 'nuestro producto'
      const copies = await generateCopyOptions(
        mainProduct,
        businessConfig.business_name,
        businessConfig.category,
        businessConfig.whatsapp || businessConfig.phone,
        businessConfig,
      )
      setCopyOptions(copies)

      setProgress(60)

      // Generate style options
      const styles = await generateVideoStyles(mainProduct, businessConfig.category, idea.title)
      setStyleOptions(styles)

      setProgress(100)
    } catch (err) {
      const errorMsg = err.message || 'Error generating options'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Step 3: Select copy
  const selectCopyOption = useCallback((copy) => {
    setSelectedCopy(copy)
    setSelectedStyle(null)
    setScriptVariants([])
    setSelectedScript(null)
    setSelectedVoice(null)
  }, [])

  // Step 4: Select style
  const selectStyleOption = useCallback((style) => {
    setSelectedStyle(style)
    setSelectedVoice(null)
  }, [])

  // Step 5: Select voice
  const selectVoiceOption = useCallback((voice) => {
    setSelectedVoice(voice)
  }, [])

  const generateScriptOptions = useCallback(({ idea, copy, style, businessConfig, analysis }) => {
    if (!idea || !copy || !style) {
      toast.error('Selecciona idea, copy y estilo antes de generar guiones')
      return []
    }

    const businessName = businessConfig?.business_name || 'Tu negocio'
    const location = businessConfig?.address || 'tu ciudad'
    const category = businessConfig?.category || 'negocio'
    const mainProduct = analysis?.[0]?.main_product || 'producto principal'
    const emotion = analysis?.[0]?.emotion_style || 'moderno'
    const contactLine =
      businessConfig?.whatsapp ||
      businessConfig?.phone ||
      businessConfig?.instagram ||
      businessConfig?.facebook ||
      businessConfig?.email ||
      businessConfig?.website ||
      '{{contacto}}'

    const scriptBodies = [
      {
        id: 'script_story',
        title: 'Guión storytelling',
        text: `[# Hook]
${copy.text}

[Escena 1 - Presentación]
${businessName} aparece con tomas ${style.camera_movement || 'dinámicas'} mostrando ${mainProduct}.

[Escena 2 - Desarrollo]
${idea.description}

[Escena 3 - Prueba]
${idea.why_viral || 'Muestra resultados y testimonios rápidos.'}

[CTA]
${copy.text}
Contacto: ${contactLine}`,
      },
      {
        id: 'script_benefits',
        title: 'Guión beneficios 1-2-3',
        text: `[Hook]
${businessName.toUpperCase()} presenta ${mainProduct}.

[Beneficio 1]
${analysis?.[0]?.detected_objects?.[0] || 'Detalle visual impactante'} con tono ${emotion}.

[Beneficio 2]
${analysis?.[0]?.detected_objects?.[1] || 'Experiencia del cliente'}.

[Beneficio 3]
${analysis?.[0]?.suggested_trends?.[0] || 'Tendencia del momento'} aplicada al ${category}.

[CTA]
${copy.text}
Escríbenos al ${contactLine}`,
      },
      {
        id: 'script_conversation',
        title: 'Guión conversacional',
        text: `[Hook]
"¿Sabías que ${businessName} puede ${idea.title.toLowerCase()}?"

[Diálogo]
Persona A: ${copy.text}
Persona B: "Suena increíble, ¿dónde los encuentro?"
Persona A: "Visítanos en ${location} o contáctanos ${contactLine}."

[Cierre]
${style.description}
${selectedVoice?.id === 'none' ? 'Solo música y subtítulos animados.' : 'Remata con voz cálida y llamada a la acción.'}`,
      },
    ]

    const normalizedScripts = scriptBodies.map((script) => ({
      ...script,
      text: clampScript(script.text.trim()),
    }))

    setScriptVariants(normalizedScripts)
    setSelectedScript(normalizedScripts[0] || null)

    return normalizedScripts
  }, [selectedVoice])

  const updateScriptVariant = useCallback((scriptId, newText) => {
    const safeText = clampScript(newText)
    setScriptVariants((prev) => prev.map((script) => (script.id === scriptId ? { ...script, text: safeText } : script)))
    setSelectedScript((prev) => {
      if (!prev || prev.id !== scriptId) return prev
      return { ...prev, text: safeText }
    })
  }, [])

  const selectScriptVariant = useCallback((scriptId) => {
    setSelectedScript((prev) => {
      if (prev?.id === scriptId) return prev
      return scriptVariants.find((script) => script.id === scriptId) || prev
    })
  }, [scriptVariants])

  // Save generation to history
  const saveToHistory = useCallback(
    async (generationData) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const { data, error: dbError } = await supabase
          .from('generation_history')
          .insert([
            {
              user_id: user.id,
              job_id: generationData.jobId,
              title: generationData.title,
              category: generationData.category,
              analysis_json: analysisResults,
              selected_idea: selectedIdea,
              selected_copy: selectedCopy,
              selected_style: selectedStyle,
              status: 'processing',
              metadata_json: {
                voice: selectedVoice,
                model: generationData.videoModel,
                script: selectedScript,
              },
            },
          ])
          .select()

        if (dbError) throw dbError

        // Set up job tracking
        const jobId = generationData.jobId
        setCurrentJobId(jobId)
        setJobStatus('processing')
        setJobProgress(0)

        // Start polling
        startPolling(jobId)

        return data?.[0]?.id
      } catch (err) {
        console.error('Error saving to history:', err)
        throw err
      }
    },
    [user, analysisResults, selectedIdea, selectedCopy, selectedStyle, selectedVoice, selectedScript],
  )

  // Start polling for job status
  const startPolling = useCallback((jobId) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    let pollCount = 0
    const maxPolls = 120 // 10 minutes at 5-second intervals

    pollIntervalRef.current = setInterval(async () => {
      pollCount++

      try {
        const statusData = await pollVideoStatus(jobId, 1) // Check once per interval
        setJobProgress(Math.min(pollCount * 2, 95)) // Estimate progress

        if (statusData.status === 'succeeded') {
          setJobStatus('succeeded')
          setJobProgress(100)
          clearInterval(pollIntervalRef.current)

          // Update database with video URL
          const { error: updateError } = await supabase
            .from('generation_history')
            .update({
              video_url: statusData.videoUrl,
              status: 'succeeded',
              updated_at: new Date().toISOString(),
            })
            .eq('job_id', jobId)

          if (updateError) {
            console.error('Error updating video URL:', updateError)
          } else {
            toast.success('¡Video generado exitosamente!')
          }
        } else if (statusData.status === 'failed') {
          setJobStatus('failed')
          clearInterval(pollIntervalRef.current)
          toast.error('Error al generar video. Por favor intenta de nuevo.')
        }
      } catch (err) {
        console.error('Polling error:', err)
        // Continue polling even on error
      }

      // Stop polling after max attempts
      if (pollCount >= maxPolls) {
        clearInterval(pollIntervalRef.current)
        setJobStatus('timeout')
        toast.error('Tiempo de espera agotado. Por favor intenta de nuevo.')
      }
    }, 5000) // Poll every 5 seconds
  }, [])

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  // Reset workflow
  const reset = useCallback(() => {
    setUploadedFiles([])
    setAnalysisResults(null)
    setViralIdeas([])
    setSelectedIdea(null)
    setCopyOptions([])
    setSelectedCopy(null)
    setStyleOptions([])
    setSelectedStyle(null)
    setVoiceOptions([])
    setSelectedVoice(null)
    setScriptVariants([])
    setSelectedScript(null)
    setError(null)
    setProgress(0)
    setCurrentJobId(null)
    setJobStatus(null)
    setJobProgress(0)
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
  }, [])

  return {
    // State
    uploadedFiles,
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

    // Job tracking state
    currentJobId,
    jobStatus,
    jobProgress,

    // Actions
    setUploadedFiles,
    uploadAndAnalyzeImages,
    selectIdeaAndGenerate,
    selectCopyOption,
    selectStyleOption,
    selectVoiceOption,
    generateScriptOptions,
    updateScriptVariant,
    selectScriptVariant,
    saveToHistory,
    startPolling,
    reset,
  }
}
