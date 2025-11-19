import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { analyzeImagesWithVision, generateViralIdeas, generateCopyOptions, generateVideoStyles } from '../lib/openai'
import { pollVideoStatus } from '../lib/replicate'
import { toast } from 'sonner'

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
        const analysis = await analyzeImagesWithVision(imageUrls)
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
  }, [])

  // Step 4: Select style
  const selectStyleOption = useCallback((style) => {
    setSelectedStyle(style)
  }, [])

  // Step 5: Select voice
  const selectVoiceOption = useCallback((voice) => {
    setSelectedVoice(voice)
  }, [])

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
    [user, analysisResults, selectedIdea, selectedCopy, selectedStyle, selectedVoice],
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
    saveToHistory,
    startPolling,
    reset,
  }
}
