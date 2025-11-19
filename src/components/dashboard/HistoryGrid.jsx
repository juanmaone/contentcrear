import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import GenerationCard from './GenerationCard'
import { Loader2 } from 'lucide-react'

export default function HistoryGrid() {
  const { user } = useAuth()
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'processing', 'succeeded', 'failed'
  const pollIntervalRef = useRef(null)

  // Fetch generations from database
  const fetchGenerations = async () => {
    if (!user) return

    try {
      let query = supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setGenerations(data || [])
    } catch (error) {
      console.error('Error fetching generations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchGenerations()
  }, [user, filter])

  // Poll for updates every 5 seconds
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchGenerations()
    }, 5000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [user, filter])

  // Count generations by status
  const statusCounts = {
    all: generations.length,
    processing: generations.filter((g) => g.status === 'processing').length,
    succeeded: generations.filter((g) => g.status === 'succeeded').length,
    failed: generations.filter((g) => g.status === 'failed').length,
  }

  if (loading && generations.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Aún no tienes videos generados</p>
        <p className="text-sm text-gray-500">Crea tu primer reel en la sección "Crear"</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all'
              ? `Todos (${count})`
              : status === 'processing'
                ? `Generando (${count})`
                : status === 'succeeded'
                  ? `Completados (${count})`
                  : `Errores (${count})`}
          </button>
        ))}
      </div>

      {/* Grid of generations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((generation) => (
          <GenerationCard
            key={generation.id}
            generation={generation}
            isGenerating={generation.status === 'processing'}
            onUpdate={fetchGenerations}
          />
        ))}
      </div>
    </div>
  )
}
