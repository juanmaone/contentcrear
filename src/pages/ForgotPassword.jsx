import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardHeader } from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { toast } from 'sonner'
import { isValidEmail } from '../utils/templates'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!email) {
      newErrors.email = 'Email requerido'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email inválido'
    }
    return newErrors
  }

  const handleReset = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    try {
      setLoading(true)
      await resetPassword(email)
      setSent(true)
      toast.success('¡Email enviado! Revisa tu bandeja de entrada')
    } catch (error) {
      toast.error(error.message || 'Error al enviar email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-4 text-5xl">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu email</h1>
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace para resetear tu contraseña a <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Si no ves el email, revisa tu carpeta de spam
            </p>
            <Link to="/login">
              <Button size="lg">Volver a iniciar sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center border-0">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="text-gray-600 mt-2">Te enviaremos un link para resetearla</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleReset} className="space-y-4">
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

            <Button size="lg" loading={loading} disabled={loading}>
              Enviar link de reset
            </Button>
          </form>

          {/* Links */}
          <div className="text-center text-sm space-y-2">
            <div>
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Volver a iniciar sesión
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
