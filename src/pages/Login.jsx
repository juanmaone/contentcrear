import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardHeader } from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { toast } from 'sonner'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithOAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOAuthLoading] = useState(null)

  const validateForm = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido'
    if (!password) newErrors.password = 'Contraseña requerida'
    return newErrors
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    try {
      setLoading(true)
      await signIn(email, password)
      toast.success('¡Sesión iniciada!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    try {
      setOAuthLoading(provider)
      await signInWithOAuth(provider)
      toast.success(`Iniciando sesión con ${provider}...`)
    } catch (error) {
      toast.error(`Error con ${provider}: ${error.message}`)
    } finally {
      setOAuthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center border-0">
          <div className="mb-4 text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            ReelMaker Pro
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para crear reels virales</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              error={errors.email}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              error={errors.password}
            />

            <Button size="lg" loading={loading} disabled={loading}>
              Iniciar sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o continúa con</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="lg"
              loading={oauthLoading === 'google'}
              disabled={oauthLoading !== null}
              onClick={() => handleOAuthLogin('google')}
            >
              {oauthLoading === 'google' ? 'Conectando...' : '🔵 Google'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              loading={oauthLoading === 'twitter'}
              disabled={oauthLoading !== null}
              onClick={() => handleOAuthLogin('twitter')}
            >
              {oauthLoading === 'twitter' ? 'Conectando...' : '⚫ X (Twitter)'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              loading={oauthLoading === 'apple'}
              disabled={oauthLoading !== null}
              onClick={() => handleOAuthLogin('apple')}
            >
              {oauthLoading === 'apple' ? 'Conectando...' : '🍎 Apple'}
            </Button>
          </div>

          {/* Links */}
          <div className="space-y-2 text-center text-sm">
            <div>
              <Link to="/forgot-password" className="text-purple-600 hover:text-purple-700 font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                Crear cuenta
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
