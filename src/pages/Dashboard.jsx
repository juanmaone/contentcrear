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
    // Only redirect if user has no config at all
    // config will be null if user never created one, or will have data if they did
    // We allow empty configs now, so just let them proceed
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-sky-50">
      {/* Header */}
      <div className="backdrop-blur bg-white/80 border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-purple-500 font-semibold mb-1">Panel principal</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Hola, <span className="text-purple-600">{config?.business_name || user?.email}</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              {config?.category
                ? `Rubro: ${config.category.replace('_', ' ').charAt(0).toUpperCase() + config.category.slice(1)}`
                : 'Completa tu perfil para personalizar tu contenido'}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => navigate('/configuracion')} disabled={loading}>
              ⚙️ Configuración
            </Button>
            <Button variant="danger" onClick={handleLogout} loading={loading} disabled={loading}>
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="shadow-2xl mb-8 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-sky-500 text-white border-none">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-white/80">listo en minutos</p>
            <h2 className="text-3xl md:text-4xl font-bold">🎬 Crea tu próximo Reel en 3 pasos</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Sube tu material, deja que la IA proponga ideas y genera videos optimizados con tu identidad de marca.
            </p>
            <div className="flex justify-center">
              <Button size="lg" onClick={() => navigate('/crear')} fullWidth className="max-w-xs">
                ✨ Crear nuevo Reel/Story
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '📸',
              title: '1. Sube tus fotos',
              description: 'Carga fotos o videos de tus productos directo desde tu celular',
            },
            {
              icon: '✨',
              title: '2. IA analiza',
              description: 'GPT-4o Vision detecta productos y sugiere ideas virales optimizadas',
            },
            {
              icon: '🎥',
              title: '3. Genera video',
              description: 'Replica crea el Reel con tu branding y contactos en minutos',
            },
          ].map(({ icon, title, description }) => (
            <Card key={title} className="transition hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
              </CardContent>
            </Card>
          ))}
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
