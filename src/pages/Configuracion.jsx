import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { Card, CardContent, CardHeader, CardFooter } from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { BUSINESS_CATEGORIES, DEFAULT_COLORS, FREE_MUSIC_LIBRARY } from '../utils/constants'
import { toast } from 'sonner'

export default function Configuracion() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { config, saveConfig, loading: configLoading } = useBusinessConfig()

  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    logo_url: null,
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    facebook: '',
    website: '',
    primary_color: DEFAULT_COLORS.primary,
    secondary_color: DEFAULT_COLORS.secondary,
    music_url: null,
    hashtag: '',
  })

  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => {
    if (config) {
      setFormData({
        business_name: config.business_name || '',
        category: config.category || '',
        logo_url: config.logo_url,
        address: config.address || '',
        phone: config.phone || '',
        whatsapp: config.whatsapp || '',
        email: config.email || '',
        instagram: config.instagram || '',
        facebook: config.facebook || '',
        website: config.website || '',
        primary_color: config.primary_color || DEFAULT_COLORS.primary,
        secondary_color: config.secondary_color || DEFAULT_COLORS.secondary,
        music_url: config.music_url,
        hashtag: config.hashtag || '',
      })
      if (config.logo_url) {
        setLogoPreview(config.logo_url)
      }
    }
  }, [config])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }))
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMusicUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        music: file,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.business_name || !formData.category) {
      toast.error('El nombre del negocio y rubro son requeridos')
      return
    }

    try {
      setLoading(true)
      await saveConfig(formData)
      toast.success('¡Configuración guardada!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configura tu negocio</h1>
          <p className="text-gray-600">
            Estos datos se usarán en todos tus reels para contactos y branding
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Section 1: Business Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del negocio</h2>
              <div className="space-y-4">
                <Input
                  label="Nombre del negocio"
                  placeholder="Mi increíble negocio"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Rubro</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecciona un rubro</option>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Logo</label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleLogoUpload}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">PNG o JPG, máx 5MB</p>
                    </div>
                    {logoPreview && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Section 2: Address & Contact */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y contacto</h2>
              <div className="space-y-4">
                <Input
                  label="Dirección completa"
                  placeholder="Calle X 123, Barrio Y, Ciudad, País"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="+54 11 2345 6789"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />

                <Input
                  label="WhatsApp"
                  type="tel"
                  placeholder="+54 9 11 2345 6789"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="contacto@negocio.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />

                <Input
                  label="Instagram (@usuario)"
                  placeholder="@miusuario"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                />

                <Input
                  label="Facebook (URL)"
                  placeholder="https://facebook.com/mi-pagina"
                  value={formData.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                />

                <Input
                  label="Sitio web"
                  placeholder="https://miwebsite.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Section 3: Branding */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Color primario</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{formData.primary_color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Color secundario</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{formData.secondary_color}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Hashtag principal</label>
                  <Input
                    placeholder="#MiNegocioTop"
                    value={formData.hashtag}
                    onChange={(e) => handleInputChange('hashtag', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Música de fondo</label>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/ogg"
                    onChange={handleMusicUpload}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">MP3, WAV u OGG, máx 20MB</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Saltar
              </Button>
              <Button size="lg" loading={loading} disabled={loading} className="flex-1">
                Guardar configuración
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
