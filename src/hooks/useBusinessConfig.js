import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useBusinessConfig = () => {
  const { user } = useAuth()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchConfig = async () => {
      try {
        setError(null)
        setLoading(true)

        const { data, error } = await supabase
          .from('business_config')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found (expected for new users)
          throw error
        }

        setConfig(data || null)
      } catch (err) {
        console.error('Error fetching business config:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [user])

  const saveConfig = async (configData) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setError(null)

      // Upload logo if provided and is a File
      let logoUrl = configData.logo_url
      if (configData.logo && typeof configData.logo === 'object' && configData.logo instanceof File) {
        const fileName = `${user.id}/${Date.now()}_logo.jpg`
        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(fileName, configData.logo, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicUrl } = supabase.storage
          .from('business-logos')
          .getPublicUrl(fileName)

        logoUrl = publicUrl.publicUrl
      }

      // Upload music if provided and is a File
      let musicUrl = configData.music_url
      if (configData.music && typeof configData.music === 'object' && configData.music instanceof File) {
        const fileName = `${user.id}/${Date.now()}_music.mp3`
        const { error: uploadError } = await supabase.storage
          .from('background-music')
          .upload(fileName, configData.music, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicUrl } = supabase.storage
          .from('background-music')
          .getPublicUrl(fileName)

        musicUrl = publicUrl.publicUrl
      }

      const dataToSave = {
        user_id: user.id,
        business_name: configData.business_name,
        category: configData.category,
        logo_url: logoUrl,
        address: configData.address,
        phone: configData.phone,
        whatsapp: configData.whatsapp,
        email: configData.email,
        instagram: configData.instagram,
        facebook: configData.facebook,
        website: configData.website,
        primary_color: configData.primary_color,
        secondary_color: configData.secondary_color,
        music_url: musicUrl,
        hashtag: configData.hashtag,
        updated_at: new Date().toISOString(),
      }

      let result
      if (config) {
        // Update existing
        const { data, error } = await supabase
          .from('business_config')
          .update(dataToSave)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('business_config')
          .insert([{ ...dataToSave, created_at: new Date().toISOString() }])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      setConfig(result)
      return result
    } catch (err) {
      console.error('Error saving business config:', err)
      setError(err.message)
      throw err
    }
  }

  const isConfigured = () => {
    return !!config && config.business_name && config.category
  }

  return {
    config,
    loading,
    error,
    saveConfig,
    isConfigured,
  }
}
