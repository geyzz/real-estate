import * as geoPkg from 'phil-reg-prov-mun-brgy'

const geo = geoPkg?.default?.provinces
  ? geoPkg.default
  : geoPkg?.provinces
  ? geoPkg
  : geoPkg?.default || {}

// Export sorted provinces with popular Central Luzon provinces up top or alphabetically
export const getProvinces = () => {
  if (!geo || !geo.provinces || !Array.isArray(geo.provinces)) return []
  return [...geo.provinces].sort((a, b) => a.name.localeCompare(b.name))
}

// Get municipalities for a province
export const getMunicipalities = (provCode) => {
  if (!provCode || !geo || !geo.city_mun || !Array.isArray(geo.city_mun)) return []
  return geo.city_mun
    .filter((m) => m.prov_code === provCode)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Get barangays for a municipality
export const getBarangays = (munCode) => {
  if (!munCode || !geo || !geo.barangays || !Array.isArray(geo.barangays)) return []
  return geo.barangays
    .filter((b) => b.mun_code === munCode)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Helper to find province code by name (case-insensitive)
export const findProvinceCodeByName = (provName) => {
  if (!provName || !geo || !geo.provinces || !Array.isArray(geo.provinces)) return null
  const found = geo.provinces.find(
    (p) => p.name.trim().toLowerCase() === provName.trim().toLowerCase()
  )
  return found ? found.prov_code : null
}

// Helper to find municipality code by name and province code
export const findMunicipalityCodeByName = (munName, provCode) => {
  if (!munName || !geo || !geo.city_mun || !Array.isArray(geo.city_mun)) return null
  const list = provCode
    ? geo.city_mun.filter((m) => m.prov_code === provCode)
    : geo.city_mun
  const found = list.find(
    (m) => m.name.trim().toLowerCase() === munName.trim().toLowerCase()
  )
  return found ? found.mun_code : null
}

// Formatting helper: Robust Title Case (Proper Case) for Province, Municipality, Barangay names
export const toTitleCase = (str) => {
  if (!str) return ''
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s|-|\/|\()\S/g, (match) => match.toUpperCase())
}

// Consistent Proper Case formatter for multi-part location strings (Barangay, Municipality, Province)
export const formatLocation = (loc) => {
  if (!loc) return ''
  return String(loc)
    .split(',')
    .map((part) => toTitleCase(part.trim()))
    .filter(Boolean)
    .join(', ')
}

export default {
  toTitleCase,
  formatLocation,
  getProvinces,
  getMunicipalities,
  getBarangays,
  findProvinceCodeByName,
  findMunicipalityCodeByName,
}
