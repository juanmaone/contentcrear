import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { Card, CardContent } from '../components/common/Card'
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

    if (!formData.business_name) {
      toast.error('El nombre del negocio es requerido')
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-purple-500 font-semibold">Brand kit</p>
          <h1 className="text-4xl font-bold text-slate-900">Configura tu negocio</h1>
          <p className="text-slate-600 max-w-2xl">
            Personaliza colores, contactos y estilo para que cada Reel incluya tu identidad y datos actualizados.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-purple-500 tracking-[0.3em]">01</span>
                <h2 className="text-xl font-semibold text-slate-900">Información del negocio</h2>
                <p className="text-sm text-slate-500">Lo usaremos en los créditos y presentaciones automáticas.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Nombre del negocio"
                    placeholder="Mi increíble negocio"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Rubro</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecciona un rubro</option>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Hashtag principal</label>
                  <Input
                    placeholder="#MiNegocioTop"
                    value={formData.hashtag}
                    onChange={(e) => handleInputChange('hashtag', e.target.value)}
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-start">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Logo</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleLogoUpload}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG o JPG, máx 5MB</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="mx-auto h-24 object-contain" />
                  ) : (
                    <p className="text-sm text-slate-500">Se mostrará tu logo aquí</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-purple-500 tracking-[0.3em]">02</span>
                <h2 className="text-xl font-semibold text-slate-900">Ubicación y contacto</h2>
                <p className="text-sm text-slate-500">Se añadirá al final de cada video y en plantillas descargables.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Dirección completa"
                    placeholder="Calle X 123, Barrio Y, Ciudad, País"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
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
                <div className="md:col-span-2">
                  <Input
                    label="Sitio web"
                    placeholder="https://miwebsite.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-purple-500 tracking-[0.3em]">03</span>
                  <h2 className="text-xl font-semibold text-slate-900">Colores de marca</h2>
                  <p className="text-sm text-slate-500">Define el degradado principal de tus animaciones.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[{ label: 'Color primario', field: 'primary_color' }, { label: 'Color secundario', field: 'secondary_color' }].map(
                    ({ label, field }) => (
                      <div key={field} className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">{label}</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="h-14 w-20 rounded-xl border border-slate-200 cursor-pointer"
                          />
                          <span className="text-sm text-slate-600 font-mono">{formData[field]}</span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-purple-500 tracking-[0.3em]">04</span>
                  <h2 className="text-xl font-semibold text-slate-900">Audio y ritmo</h2>
                  <p className="text-sm text-slate-500">Agrega una pista para usarla como referencia al generar tus Reels.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Música de fondo</label>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/ogg"
                      onChange={handleMusicUpload}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">MP3, WAV u OGG, máx 20MB</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Biblioteca sugerida</label>
                    <div className="flex flex-wrap gap-2">
                      {FREE_MUSIC_LIBRARY.map((track) => (
                        <button
                          type="button"
                          key={track.id}
                          onClick={() => handleInputChange('music_url', track.url)}
                          className="px-3 py-1.5 rounded-full text-sm border border-slate-200 bg-white/70 hover:border-purple-400"
                        >
                          {track.name} · {track.genre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" onClick={() => navigate('/dashboard')} disabled={loading}>
              Saltar por ahora
            </Button>
            <Button size="lg" loading={loading} disabled={loading} className="sm:min-w-[220px]">
              Guardar configuración
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
