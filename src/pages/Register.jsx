import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardHeader } from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { toast } from 'sonner'
import { isValidEmail, isValidPassword } from '../utils/templates'

export default function Register() {
  const navigate = useNavigate()
  const { signUp, signInWithOAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOAuthLoading] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = 'Email requerido'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email inválido'
    }

    if (!password) {
      newErrors.password = 'Contraseña requerida'
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return newErrors
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    try {
      setLoading(true)
      await signUp(email, password)
      toast.success('¡Cuenta creada! Revisa tu email para confirmar')
      // Redirect to configuracion (onboarding)
      setTimeout(() => navigate('/configuracion'), 1000)
    } catch (error) {
      toast.error(error.message || 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthRegister = async (provider) => {
    try {
      setOAuthLoading(provider)
      await signInWithOAuth(provider)
      toast.success(`Registrándote con ${provider}...`)
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
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-600 mt-2">¡Empieza a crear reels virales en segundos!</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={handleRegister} className="space-y-4">
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

            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
              }}
              error={errors.confirmPassword}
            />

            <p className="text-xs text-gray-500">
              Mínimo 8 caracteres, con mayúscula, minúscula y número
            </p>

            <Button size="lg" loading={loading} disabled={loading}>
              Crear cuenta
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o regístrate con</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="lg"
              loading={oauthLoading === 'google'}
              disabled={oauthLoading !== null}
              onClick={() => handleOAuthRegister('google')}
            >
              {oauthLoading === 'google' ? 'Conectando...' : '🔵 Google'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              loading={oauthLoading === 'twitter'}
              disabled={oauthLoading !== null}
              onClick={() => handleOAuthRegister('twitter')}
            >
              {oauthLoading === 'twitter' ? 'Conectando...' : '⚫ X (Twitter)'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              loading={oauthLoading === 'apple'}
              disabled={oauthLoading !== null}
              onClick={() => handleOAuthRegister('apple')}
            >
              {oauthLoading === 'apple' ? 'Conectando...' : '🍎 Apple'}
            </Button>
          </div>

          {/* Links */}
          <div className="text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Iniciar sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
