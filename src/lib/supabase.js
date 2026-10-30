import { createClient } from '@supabase/supabase-js'
import { INITIAL_PROPERTIES, PRESET_IMAGES } from '../data/initialProperties'

export const LOCAL_STORAGE_KEY = 'candj_properties_v1'
export const SUPABASE_CREDS_KEY = 'candj_supabase_creds'

// Helper to retrieve credentials from env or local storage
export const getSupabaseCredentials = () => {
  let url = import.meta.env.VITE_SUPABASE_URL || ''
  let key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    try {
      const saved = localStorage.getItem(SUPABASE_CREDS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.url && parsed.key) {
          url = parsed.url
          key = parsed.key
        }
      }
    } catch (e) {
      console.warn('Could not read saved Supabase credentials:', e)
    }
  }

  return { url: url.trim(), key: key.trim() }
}

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseCredentials()
  return Boolean(url && key)
}

let cachedClient = null
let cachedUrl = null
let cachedKey = null

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseCredentials()
  if (!url || !key) return null

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient
  }

  try {
    cachedClient = createClient(url, key)
    cachedUrl = url
    cachedKey = key
    return cachedClient
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err)
    return null
  }
}

// Backwards-compatible export
export const supabase = getSupabaseClient()

// Save credentials from UI
export const saveSupabaseCredentials = (url, key) => {
  try {
    localStorage.setItem(
      SUPABASE_CREDS_KEY,
      JSON.stringify({ url: url.trim(), key: key.trim() })
    )
    cachedClient = null
    return true
  } catch (e) {
    console.error('Error saving credentials:', e)
    return false
  }
}

// Helper to normalize images
export const resolvePropertyImage = (prop) => {
  if (prop.image && typeof prop.image === 'string' && prop.image.startsWith('data:')) {
    return prop.image
  }
  if (prop.image && typeof prop.image === 'string' && (prop.image.startsWith('http') || prop.image.startsWith('/'))) {
    return prop.image
  }
  if (prop.imageKey && PRESET_IMAGES[prop.imageKey]) {
    return PRESET_IMAGES[prop.imageKey]
  }
  if (prop.image && typeof prop.image === 'object') {
    return prop.image
  }
  return PRESET_IMAGES.property1
}

// Fetch properties from Supabase or localStorage fallback
export async function fetchAllProperties() {
  const client = getSupabaseClient()

  if (client) {
    try {
      // 1. Try relational query (with province_id, municipality_id, barangay_id foreign keys)
      const { data, error } = await client
        .from('properties')
        .select(`
          *,
          provinces (name),
          municipalities (name),
          barangays (name)
        `)
        .order('id', { ascending: false })

      if (!error && data && data.length > 0) {
        return data.map((p) => {
          const provName = p.provinces?.name || p.province || ''
          const munName = p.municipalities?.name || p.municipality || ''
          const brgyName = p.barangays?.name || p.barangay || ''
          const locationStr = `${brgyName ? brgyName + ', ' : ''}${munName ? munName + ', ' : ''}${provName}`

          return {
            ...p,
            propCardId: `prop-card-${p.id}`,
            province: provName,
            municipality: munName,
            barangay: brgyName,
            location: locationStr,
            badge: p.label || 'Clean Title',
            subtitle: p.main_info,
            specs: p.sub_info || '',
            price: p.price_display || `₱${Number(p.listing_price || 0).toLocaleString()} / SQM`,
            image: p.image_url && PRESET_IMAGES[p.image_url] ? PRESET_IMAGES[p.image_url] : (p.image_url || resolvePropertyImage(p)),
            sub_labels: p.property_sub_labels || [],
          }
        })
      } else if (error) {
        // Fallback to flat query if joins fail
        const { data: flatData, error: flatError } = await client
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })

        if (!flatError && flatData && flatData.length > 0) {
          return flatData.map((p) => ({
            ...p,
            propCardId: `prop-card-${p.id}`,
            location: `${p.barangay ? p.barangay + ', ' : ''}${p.municipality || ''}, ${p.province || ''}`,
            badge: p.label || 'Clean Title',
            subtitle: p.main_info,
            specs: p.sub_info || '',
            price: p.price_display || `₱${Number(p.listing_price || 0).toLocaleString()} / SQM`,
            image: p.image_url && PRESET_IMAGES[p.image_url] ? PRESET_IMAGES[p.image_url] : (p.image_url || resolvePropertyImage(p)),
          }))
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err)
    }
  }

  // Local storage fallback (initialized with 3 properties, excluding Pulong Santol)
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (local) {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({
          ...p,
          image: resolvePropertyImage(p),
        }))
      }
    }
  } catch (e) {
    console.error('Local storage read error:', e)
  }

  // Initialize with initial 3 properties
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES))
  } catch (e) {
    console.error('Local storage write error:', e)
  }

  return INITIAL_PROPERTIES
}

// Add a new property
export async function addProperty(newProp) {
  const propertyId = `prop-${Date.now()}`
  const formatted = {
    ...newProp,
    id: propertyId,
    propCardId: `prop-card-${propertyId}`,
    image: resolvePropertyImage(newProp),
    created_at: new Date().toISOString(),
  }

  const client = getSupabaseClient()
  if (client) {
    try {
      // 1. Resolve province_id
      let province_id = null
      if (formatted.province) {
        const { data: provData } = await client
          .from('provinces')
          .select('id')
          .ilike('name', formatted.province.trim())
          .maybeSingle()

        if (provData) {
          province_id = provData.id
        } else {
          const { data: newProv } = await client
            .from('provinces')
            .insert([{ name: formatted.province.trim().toUpperCase() }])
            .select()
          if (newProv && newProv[0]) province_id = newProv[0].id
        }
      }

      // 2. Resolve municipality_id
      let municipality_id = null
      if (formatted.municipality && province_id) {
        const { data: munData } = await client
          .from('municipalities')
          .select('id')
          .eq('province_id', province_id)
          .ilike('name', formatted.municipality.trim())
          .maybeSingle()

        if (munData) {
          municipality_id = munData.id
        } else {
          const { data: newMun } = await client
            .from('municipalities')
            .insert([{ province_id, name: formatted.municipality.trim() }])
            .select()
          if (newMun && newMun[0]) municipality_id = newMun[0].id
        }
      }

      // 3. Resolve barangay_id
      let barangay_id = null
      if (formatted.barangay && municipality_id) {
        const { data: brgyData } = await client
          .from('barangays')
          .select('id')
          .eq('municipality_id', municipality_id)
          .ilike('name', formatted.barangay.trim())
          .maybeSingle()

        if (brgyData) {
          barangay_id = brgyData.id
        } else {
          const { data: newBrgy } = await client
            .from('barangays')
            .insert([{ municipality_id, name: formatted.barangay.trim() }])
            .select()
          if (newBrgy && newBrgy[0]) barangay_id = newBrgy[0].id
        }
      }

      // 4. Insert into properties table
      const insertPayload = {
        label: formatted.label || formatted.badge || 'Clean Title',
        main_info: formatted.main_info || formatted.subtitle,
        sub_info: formatted.sub_info || formatted.specs,
        listing_price: formatted.listing_price,
        price_display: formatted.price_display || formatted.price,
        terms: formatted.terms || 'Negotiable',
        province_id,
        municipality_id,
        barangay_id,
        status: formatted.status || 'Available',
        image_url: formatted.imageKey || formatted.image || 'property4',
      }

      const { data, error } = await client
        .from('properties')
        .insert([insertPayload])
        .select()

      if (!error && data && data[0]) {
        formatted.id = data[0].id
        formatted.propCardId = `prop-card-${data[0].id}`
      } else if (error) {
        console.error('Supabase relational insert error:', error)
      }
    } catch (err) {
      console.warn('Supabase insert failed, keeping local copy:', err)
    }
  }

  // Update local storage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY)
    const list = local ? JSON.parse(local) : [...INITIAL_PROPERTIES]
    const updated = [formatted, ...list]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Local storage error:', e)
  }

  return formatted
}

// Update an existing property
export async function updateProperty(propertyId, updatedData) {
  let updatedRecord = null
  const client = getSupabaseClient()

  if (client) {
    try {
      const { data, error } = await client
        .from('properties')
        .update({
          label: updatedData.label || updatedData.badge,
          main_info: updatedData.main_info || updatedData.subtitle,
          sub_info: updatedData.sub_info || updatedData.specs,
          listing_price: updatedData.listing_price,
          price_display: updatedData.price_display || updatedData.price,
          terms: updatedData.terms,
          image_url: updatedData.imageKey || updatedData.image,
        })
        .eq('id', propertyId)
        .select()

      if (!error && data && data[0]) {
        updatedRecord = {
          ...data[0],
          propCardId: `prop-card-${data[0].id}`,
          image: data[0].image_url || resolvePropertyImage(data[0]),
          price: data[0].price_display,
          subtitle: data[0].main_info,
          specs: data[0].sub_info,
          location: `${data[0].barangay ? data[0].barangay + ', ' : ''}${data[0].municipality || ''}, ${data[0].province || ''}`,
        }
      }
    } catch (err) {
      console.warn('Supabase update failed:', err)
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (local) {
      const list = JSON.parse(local)
      const index = list.findIndex((p) => p.id === propertyId)
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...updatedData,
          image: resolvePropertyImage(updatedData),
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
        if (!updatedRecord) {
          updatedRecord = list[index]
        }
      }
    }
  } catch (e) {
    console.error('Local storage update error:', e)
  }

  return updatedRecord || { id: propertyId, ...updatedData }
}

// Delete a property
export async function deleteProperty(propertyId) {
  const client = getSupabaseClient()
  if (client) {
    try {
      await client.from('properties').delete().eq('id', propertyId)
    } catch (err) {
      console.warn('Supabase delete failed:', err)
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (local) {
      const list = JSON.parse(local)
      const updated = list.filter((p) => p.id !== propertyId)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    }
  } catch (e) {
    console.error('Local storage delete error:', e)
  }
}

// Sync all local properties to Supabase
export async function syncLocalToSupabase() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase is not configured yet. Please enter your Project URL and Anon Key.')
  }

  const local = localStorage.getItem(LOCAL_STORAGE_KEY)
  const list = local ? JSON.parse(local) : [...INITIAL_PROPERTIES]

  let uploadedCount = 0
  for (const item of list) {
    await addProperty(item)
    uploadedCount++
  }

  return uploadedCount
}

// Upload image file to Supabase Cloud Storage
export async function uploadPropertyImage(file) {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase is not connected')
  }

  const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
  const fileName = `lot-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `lots/${fileName}`

  const { data, error } = await client.storage
    .from('property-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.warn('Storage upload error:', error)
    throw error
  }

  const { data: publicData } = client.storage
    .from('property-images')
    .getPublicUrl(filePath)

  return publicData?.publicUrl || ''
}

// Reset properties to default initial set
export function resetProperties() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES))
  } catch (e) {
    console.error('Reset error:', e)
  }
  return INITIAL_PROPERTIES
}
