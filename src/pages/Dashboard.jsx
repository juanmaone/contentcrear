import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { Card, CardContent } from '../components/common/Card'
import Button from '../components/common/Button'
import HistoryGrid from '../components/dashboard/HistoryGrid'
import { toast } from 'sonner'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { config, isConfigured } = useBusinessConfig()
  const [loading, setLoading] = useState(false)

  // Redirect to config if not set up
  useEffect(() => {
    if (!isConfigured()) {
      toast.info('Por favor completa tu configuración primero')
      navigate('/configuracion')
    }
  }, [config])

  const handleLogout = async () => {
    try {
      setLoading(true)
      await signOut()
      navigate('/login')
      toast.success('Sesión cerrada')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido, <span className="text-purple-600">{config?.business_name || user?.email}</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {config?.category
                ? `Rubro: ${config.category.replace('_', ' ').charAt(0).toUpperCase() + config.category.slice(1)}`
                : 'Completa tu perfil'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/configuracion')}
              disabled={loading}
            >
              ⚙️ Configuración
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              loading={loading}
              disabled={loading}
            >
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="shadow-xl mb-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🎬 Crear tu primer Reel</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              En menos de 4 minutos, transforma tus fotos de productos en Reels y Stories virales con IA.
              No necesitas experiencia en edición.
            </p>
            <Button size="lg" onClick={() => navigate('/crear')}>
              ✨ Crear nuevo Reel/Story
            </Button>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Sube tus fotos</h3>
              <p className="text-sm text-gray-600">
                Carga fotos o videos de tus productos con la cámara del celular
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-gray-900 mb-2">2. IA analiza</h3>
              <p className="text-sm text-gray-600">
                GPT-4o Vision detecta productos y sugiere 6 ideas virales
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">🎥</div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Genera video</h3>
              <p className="text-sm text-gray-600">
                Replica crea el Reel en 1-3 minutos con tu logo y contactos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📹 Historial de Videos</h2>
          <HistoryGrid />
        </div>
      </div>
    </div>
  )
}
