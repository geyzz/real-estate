import { useState, useEffect, useRef, useMemo } from 'react'
import {
  getProvinces,
  getMunicipalities,
  getBarangays,
  findProvinceCodeByName,
  findMunicipalityCodeByName,
} from '../lib/philippineGeo'
import { PRESET_IMAGES } from '../data/initialProperties'
import {
  addProperty,
  updateProperty,
  deleteProperty,
  isSupabaseConfigured,
} from '../lib/supabase'

const STANDARD_HIGHLIGHTS = [
  'Clean Title Verified',
  'Wide Road Access',
  'Direct Owner Negotiation',
  'Near Main Highway',
  'Electric & Water Ready',
  'Fishpond & Resthouse',
  'Fenced Perimeter',
]

// Formatting helper: Title Case for Province, Municipality, Barangay names
const toTitleCase = (str) => {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .replace(/(?:^|\s|-|\/)\S/g, (match) => match.toUpperCase())
}

// Formatting helper: cleanly split tags joined by ' • ' or comma
const parseChips = (val) => {
  if (!val) return []
  if (Array.isArray(val)) {
    return val.map((v) => (typeof v === 'string' ? v : v.text || '')).map((s) => s.trim()).filter(Boolean)
  }
  return String(val)
    .split(/\s*•\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// Custom Searchable Combobox: single-click opens dropdown, live search as you type, and accepts custom input
function SearchableCombobox({
  label,
  sublabel = '(Click for list or type custom)',
  value = '',
  onChange,
  options = [],
  placeholder = 'Select or type...',
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  const filteredOptions = useMemo(() => {
    if (!value || !value.trim()) return options
    const query = value.trim().toLowerCase()
    return options.filter((opt) => {
      const text = typeof opt === 'string' ? opt : opt.name || opt.label || ''
      return text.toLowerCase().includes(query)
    })
  }, [options, value])

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className='admin-field-group admin-combobox-wrapper' ref={wrapperRef}>
      <label>
        {label} <span className='admin-field-sublabel'>{sublabel}</span>
      </label>
      <div className='admin-combobox-input-row'>
        <input
          type='text'
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          className='admin-input admin-custom-combobox-input'
          required={required}
        />
        <button
          type='button'
          className={`admin-combobox-toggle-btn ${isOpen ? 'is-open' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen((prev) => !prev)
          }}
          title='Toggle options'
          tabIndex={-1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className='admin-combobox-menu'>
          {filteredOptions.length > 0 ? (
            <div className='admin-combobox-options-list'>
              {filteredOptions.map((opt) => {
                const optText = typeof opt === 'string' ? opt : opt.name || opt.label
                const isSelected = value && value.trim().toLowerCase() === optText.trim().toLowerCase()
                return (
                  <button
                    key={optText}
                    type='button'
                    className={`admin-combobox-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      onChange(optText)
                      setIsOpen(false)
                    }}
                  >
                    <span>{optText}</span>
                    {isSelected && <span className='admin-combobox-check'>✓</span>}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className='admin-combobox-empty'>
              <span>No match found in list.</span>
              {value && value.trim() && (
                <button
                  type='button'
                  className='admin-combobox-custom-confirm-btn'
                  onClick={() => setIsOpen(false)}
                >
                  Use custom: <strong>"{value}"</strong>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminPortal({
  isOpen,
  onClose,
  properties = [],
  onPropertiesUpdated,
  isAdmin,
  setIsAdmin,
}) {
  const [viewMode, setViewMode] = useState('table') // 'table' | 'form'
  const [searchTerm, setSearchTerm] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Sort & Bulk Selection States
  const [sortBy, setSortBy] = useState('default') // 'default' | 'price-asc' | 'price-desc' | 'location-asc' | 'location-desc'
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef(null)

  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Form State - Truly clean initial states (no defaults)
  const [formId, setFormId] = useState(null)
  const [selectedProvCode, setSelectedProvCode] = useState('')
  const [selectedMunCode, setSelectedMunCode] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('')
  const [provinceName, setProvinceName] = useState('')
  const [municipalityName, setMunicipalityName] = useState('')

  // Label tags state
  const [labelInput, setLabelInput] = useState('')
  const [labelTags, setLabelTags] = useState([])

  // Main info tags state
  const [mainInfoInput, setMainInfoInput] = useState('')
  const [mainInfoTags, setMainInfoTags] = useState([])

  // Sub info tags state
  const [subInfoInput, setSubInfoInput] = useState('')
  const [subInfoTags, setSubInfoTags] = useState([])

  // Price & Terms - Clean defaults
  const [listingPrice, setListingPrice] = useState('')
  const [terms, setTerms] = useState('')

  // Feature Highlights - Clean defaults
  const [selectedHighlights, setSelectedHighlights] = useState([])
  const [customHighlights, setCustomHighlights] = useState([])
  const [customTagInput, setCustomTagInput] = useState('')

  // Showcase Photograph state - Preset 1 selected by default, presets safely preserved
  const [selectedImageKey, setSelectedImageKey] = useState('property1')
  const [customImageData, setCustomImageData] = useState('')
  const [presetAltTexts, setPresetAltTexts] = useState({
    property1: 'Preset 1',
    property2: 'Preset 2',
    property3: 'Preset 3',
    property4: 'Preset 4',
  })

  // Geo options
  const [provincesList, setProvincesList] = useState([])
  const [municipalitiesList, setMunicipalitiesList] = useState([])
  const [barangaysList, setBarangaysList] = useState([])

  const fileInputRef = useRef(null)

  useEffect(() => {
    const provs = getProvinces()
    setProvincesList(provs)
  }, [])

  // Close sort menu on click outside
  useEffect(() => {
    const handleSortOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleSortOutside)
    return () => document.removeEventListener('mousedown', handleSortOutside)
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (
      adminPassword.trim().toLowerCase() === 'candj2026' ||
      adminPassword.trim().toLowerCase() === 'admin' ||
      adminPassword.trim() === '1234'
    ) {
      setIsAdmin(true)
      sessionStorage.setItem('candj_admin_auth', 'true')
      localStorage.removeItem('candj_admin_auth')
      setLoginError('')
      showToast('Admin access granted (Session active)')
    } else {
      setLoginError('Invalid password. Hint: enter "candj2026" or "admin"')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    sessionStorage.removeItem('candj_admin_auth')
    localStorage.removeItem('candj_admin_auth')
    showToast('Signed out of admin')
  }

  // Set up form for a fresh property (completely clean & empty)
  const initAddForm = () => {
    setFormId(null)
    setLabelInput('')
    setLabelTags([])

    setMainInfoInput('')
    setMainInfoTags([])

    setSubInfoInput('')
    setSubInfoTags([])

    setListingPrice('')
    setTerms('')

    setSelectedHighlights([])
    setCustomHighlights([])
    setCustomTagInput('')

    setSelectedImageKey('property1')
    setCustomImageData('')

    setSelectedProvCode('')
    setProvinceName('')
    setSelectedMunCode('')
    setMunicipalityName('')
    setSelectedBarangay('')
    setMunicipalitiesList([])
    setBarangaysList([])

    setViewMode('form')
  }

  // Populate form with existing property for editing (parse chips & accurate casing)
  const initEditForm = (prop) => {
    setFormId(prop.id)

    // Label tags
    const rawLabel = prop.badge || prop.label || ''
    setLabelTags(parseChips(rawLabel))
    setLabelInput('')

    // Main info tags
    const rawMain = prop.main_info || prop.subtitle || ''
    setMainInfoTags(parseChips(rawMain))
    setMainInfoInput('')

    // Sub info tags
    const rawSub = prop.sub_info || prop.specs || ''
    setSubInfoTags(parseChips(rawSub))
    setSubInfoInput('')

    setListingPrice(prop.listing_price || '')
    setTerms(prop.terms || '')

    // Highlights
    if (prop.sub_labels && Array.isArray(prop.sub_labels) && prop.sub_labels.length > 0) {
      const names = prop.sub_labels.map((s) => (typeof s === 'string' ? s : s.text)).filter(Boolean)
      setSelectedHighlights(names)
    } else {
      setSelectedHighlights([])
    }

    // Image
    setSelectedImageKey(prop.imageKey || 'property1')
    if (typeof prop.image === 'string' && (prop.image.startsWith('data:') || prop.image.startsWith('http'))) {
      setCustomImageData(prop.image)
    } else {
      setCustomImageData('')
    }

    // Geo resolution
    const provName = prop.province || ''
    setProvinceName(provName ? toTitleCase(provName) : '')
    const pCode = provName ? findProvinceCodeByName(provName) : ''
    setSelectedProvCode(pCode || '')

    if (pCode) {
      const muns = getMunicipalities(pCode)
      setMunicipalitiesList(muns)
      const munName = prop.municipality || ''
      setMunicipalityName(munName ? toTitleCase(munName) : '')
      const mCode = munName ? findMunicipalityCodeByName(munName, pCode) : ''
      setSelectedMunCode(mCode || '')

      if (mCode) {
        const brgys = getBarangays(mCode)
        setBarangaysList(brgys)
      } else {
        setBarangaysList([])
      }
    } else {
      setMunicipalitiesList([])
      setBarangaysList([])
      setMunicipalityName(prop.municipality ? toTitleCase(prop.municipality) : '')
    }
    setSelectedBarangay(prop.barangay ? toTitleCase(prop.barangay) : '')

    setViewMode('form')
  }

  // Geo cascading handlers supporting both dropdown selection & custom text input
  const handleProvinceChange = (newVal) => {
    const val = typeof newVal === 'object' && newVal?.target ? newVal.target.value : String(newVal || '')
    setProvinceName(val)

    // Check if what was selected or typed matches any known province in provincesList
    const matched = provincesList.find(
      (p) =>
        p.name.trim().toLowerCase() === val.trim().toLowerCase() ||
        toTitleCase(p.name).trim().toLowerCase() === val.trim().toLowerCase() ||
        p.prov_code === val
    )

    if (matched) {
      setSelectedProvCode(matched.prov_code)
      setProvinceName(toTitleCase(matched.name))
      const muns = getMunicipalities(matched.prov_code)
      setMunicipalitiesList(muns)
    } else {
      setSelectedProvCode('')
    }
  }

  const handleMunicipalityChange = (newVal) => {
    const val = typeof newVal === 'object' && newVal?.target ? newVal.target.value : String(newVal || '')
    setMunicipalityName(val)

    // Check if what was selected or typed matches any known municipality
    const matched = municipalitiesList.find(
      (m) =>
        m.name.trim().toLowerCase() === val.trim().toLowerCase() ||
        toTitleCase(m.name).trim().toLowerCase() === val.trim().toLowerCase() ||
        m.mun_code === val
    )

    if (matched) {
      setSelectedMunCode(matched.mun_code)
      setMunicipalityName(toTitleCase(matched.name))
      const brgys = getBarangays(matched.mun_code)
      setBarangaysList(brgys)
    } else {
      setSelectedMunCode('')
    }
  }

  const handleBarangayChange = (newVal) => {
    const val = typeof newVal === 'object' && newVal?.target ? newVal.target.value : String(newVal || '')
    setSelectedBarangay(val)
  }

  // Label tag handlers
  const handleAddLabel = (e) => {
    e.preventDefault()
    if (labelInput.trim() && !labelTags.includes(labelInput.trim())) {
      setLabelTags([...labelTags, labelInput.trim()])
      setLabelInput('')
    }
  }

  const handleRemoveLabel = (tagToRemove) => {
    setLabelTags(labelTags.filter((t) => t !== tagToRemove))
  }

  // Main info tag handlers
  const handleAddMainInfo = (e) => {
    e.preventDefault()
    if (mainInfoInput.trim() && !mainInfoTags.includes(mainInfoInput.trim())) {
      setMainInfoTags([...mainInfoTags, mainInfoInput.trim()])
      setMainInfoInput('')
    }
  }

  const handleRemoveMainInfo = (tagToRemove) => {
    setMainInfoTags(mainInfoTags.filter((t) => t !== tagToRemove))
  }

  // Sub info tag handlers
  const handleAddSubInfo = (e) => {
    e.preventDefault()
    if (subInfoInput.trim() && !subInfoTags.includes(subInfoInput.trim())) {
      setSubInfoTags([...subInfoTags, subInfoInput.trim()])
      setSubInfoInput('')
    }
  }

  const handleRemoveSubInfo = (tagToRemove) => {
    setSubInfoTags(subInfoTags.filter((t) => t !== tagToRemove))
  }

  // Feature Highlights handlers
  const toggleHighlight = (item) => {
    if (selectedHighlights.includes(item)) {
      setSelectedHighlights(selectedHighlights.filter((h) => h !== item))
    } else {
      setSelectedHighlights([...selectedHighlights, item])
    }
  }

  const handleAddCustomHighlight = (tagText) => {
    const trimmed = tagText.trim()
    if (trimmed && !selectedHighlights.includes(trimmed)) {
      setSelectedHighlights([...selectedHighlights, trimmed])
      if (!STANDARD_HIGHLIGHTS.includes(trimmed) && !customHighlights.includes(trimmed)) {
        setCustomHighlights([...customHighlights, trimmed])
      }
    }
  }

  const handleRemoveCustomHighlight = (item) => {
    setSelectedHighlights(selectedHighlights.filter((h) => h !== item))
    setCustomHighlights(customHighlights.filter((h) => h !== item))
  }

  // Image Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        setCustomImageData(uploadEvent.target.result)
        setSelectedImageKey('custom')
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit Save
  const handleSaveProperty = async (e) => {
    e.preventDefault()
    if (!selectedBarangay || !municipalityName || !provinceName) {
      alert('Please select Province, Municipality, and Barangay')
      return
    }

    // Incorporate any uncommitted input currently in the fields
    const allLabels = [...labelTags]
    if (labelInput.trim() && !allLabels.includes(labelInput.trim())) {
      allLabels.push(labelInput.trim())
    }

    const allMain = [...mainInfoTags]
    if (mainInfoInput.trim() && !allMain.includes(mainInfoInput.trim())) {
      allMain.push(mainInfoInput.trim())
    }

    const allSub = [...subInfoTags]
    if (subInfoInput.trim() && !allSub.includes(subInfoInput.trim())) {
      allSub.push(subInfoInput.trim())
    }

    const finalLabel = allLabels.join(' • ')
    const finalMainInfo = allMain.join(' • ')
    const finalSubInfo = allSub.join(' • ')

    const cleanPrice = listingPrice ? Number(listingPrice) : 0
    const formattedPrice = cleanPrice > 0
      ? `₱${cleanPrice.toLocaleString('en-US')} / SQM`
      : ''

    const cleanProv = toTitleCase(provinceName)
    const cleanMun = toTitleCase(municipalityName)
    const cleanBrgy = toTitleCase(selectedBarangay)
    const locationStr = `${cleanBrgy}, ${cleanMun}, ${cleanProv}`

    const chosenImage =
      selectedImageKey === 'custom' && customImageData
        ? customImageData
        : PRESET_IMAGES[selectedImageKey] || PRESET_IMAGES.property1

    const propertyPayload = {
      province: cleanProv,
      municipality: cleanMun,
      barangay: cleanBrgy,
      badge: finalLabel,
      label: finalLabel,
      location: locationStr,
      subtitle: finalMainInfo,
      main_info: finalMainInfo,
      specs: finalSubInfo,
      sub_info: finalSubInfo,
      listing_price: cleanPrice,
      price: formattedPrice,
      price_display: formattedPrice,
      terms: terms.trim(),
      imageKey: selectedImageKey,
      image: chosenImage,
      sub_labels: selectedHighlights.map((txt) => ({ text: txt, icon: 'shield' })),
    }

    if (formId) {
      await updateProperty(formId, propertyPayload)
      showToast(`Updated "${locationStr}" successfully!`)
    } else {
      await addProperty(propertyPayload)
      showToast(`Added new lot: "${locationStr}" to database!`)
    }

    if (onPropertiesUpdated) {
      await onPropertiesUpdated()
    }
    setViewMode('table')
  }

  // Delete Action
  const handleDelete = async (id, title) => {
    await deleteProperty(id)
    setDeletingId(null)
    setSelectedIds((prev) => prev.filter((i) => i !== id))
    showToast(`Deleted listing: ${title}`)
    if (onPropertiesUpdated) {
      await onPropertiesUpdated()
    }
  }

  // Bulk Delete Action
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsBulkDeleting(true)
    const count = selectedIds.length

    for (const id of selectedIds) {
      await deleteProperty(id)
    }

    setSelectedIds([])
    setIsBulkDeleteOpen(false)
    setIsBulkDeleting(false)
    showToast(`Successfully deleted ${count} ${count === 1 ? 'property' : 'properties'}!`)

    if (onPropertiesUpdated) {
      await onPropertiesUpdated()
    }
  }

  if (!isOpen) return null

  // Filter & Sort properties in table
  const filteredTableProps = useMemo(() => {
    let result = properties.filter((p) => {
      if (!searchTerm.trim()) return true
      const term = searchTerm.toLowerCase()
      return (
        (p.location && p.location.toLowerCase().includes(term)) ||
        (p.province && p.province.toLowerCase().includes(term)) ||
        (p.municipality && p.municipality.toLowerCase().includes(term)) ||
        (p.barangay && p.barangay.toLowerCase().includes(term)) ||
        (p.label && p.label.toLowerCase().includes(term)) ||
        (p.main_info && p.main_info.toLowerCase().includes(term))
      )
    })

    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pa = Number(a.listing_price || 0)
        const pb = Number(b.listing_price || 0)
        return pa - pb
      })
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pa = Number(a.listing_price || 0)
        const pb = Number(b.listing_price || 0)
        return pb - pa
      })
    } else if (sortBy === 'location-asc') {
      result.sort((a, b) => {
        const locA = (a.barangay || a.location || '').toLowerCase()
        const locB = (b.barangay || b.location || '').toLowerCase()
        return locA.localeCompare(locB)
      })
    } else if (sortBy === 'location-desc') {
      result.sort((a, b) => {
        const locA = (a.barangay || a.location || '').toLowerCase()
        const locB = (b.barangay || b.location || '').toLowerCase()
        return locB.localeCompare(locA)
      })
    }

    return result
  }, [properties, searchTerm, sortBy])

  // Select all logic
  const allFilteredSelected =
    filteredTableProps.length > 0 &&
    filteredTableProps.every((p) => selectedIds.includes(p.id))

  const someFilteredSelected =
    filteredTableProps.some((p) => selectedIds.includes(p.id)) && !allFilteredSelected

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredTableProps.map((p) => p.id))
      setSelectedIds(selectedIds.filter((id) => !filteredIdSet.has(id)))
    } else {
      const newIds = new Set([...selectedIds, ...filteredTableProps.map((p) => p.id)])
      setSelectedIds(Array.from(newIds))
    }
  }

  const handleToggleRowSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const toggleLocationSort = () => {
    if (sortBy === 'location-asc') setSortBy('location-desc')
    else setSortBy('location-asc')
  }

  const togglePriceSort = () => {
    if (sortBy === 'price-asc') setSortBy('price-desc')
    else setSortBy('price-asc')
  }

  return (
    <div className='admin-full-page-wrap'>
      {/* Top Admin Navbar */}
      <header className='admin-portal-header'>
        <div className='admin-header-brand'>
          <div className='title' id='title' onClick={onClose} title='Back to public website' role='button' tabIndex={0} aria-label='C and J Real Est.' style={{ cursor: 'pointer', transform: 'none' }}>
            <h3>C</h3>
            <h3 className='rotate-title' id='rotate-title'>
              AND
            </h3>
            <h3>J</h3>
            <div className='mix-font' id='mix-font'>
              <h3>R</h3>
              <h3>eal Est.</h3>
            </div>
          </div>
          <span className='admin-brand-pill admin-gold-pill'>ADMIN PORTAL</span>
        </div>
        <div className='admin-header-right'>
          <button
            type='button'
            className='admin-nav-back-btn'
            onClick={onClose}
          >
            ← View Public Website
          </button>
          {isAdmin && (
            <button
              type='button'
              className='admin-logout-btn'
              onClick={handleLogout}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className='admin-toast-banner'>
          <span>✨ {toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className='admin-container'>
        {!isAdmin ? (
          /* Authentication Screen */
          <div className='admin-login-card'>
            <div className='title' id='title' aria-label='C and J Real Est.' style={{ justifyContent: 'center', margin: '0 auto 20px auto', transform: 'none' }}>
              <h3>C</h3>
              <h3 className='rotate-title' id='rotate-title'>
                AND
              </h3>
              <h3>J</h3>
              <div className='mix-font' id='mix-font'>
                <h3>R</h3>
                <h3>eal Est.</h3>
              </div>
            </div>
            <div className='admin-login-lock-icon'>🔐</div>
            <h2>Superuser Authorization Required</h2>
            <p>Enter administrative credentials to manage lots and modify Supabase listings.</p>
            <form onSubmit={handleLogin} className='admin-login-form'>
              <input
                type='password'
                placeholder='Enter password (candj2026 or admin)'
                className='admin-input'
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoFocus
              />
              {loginError && <p className='admin-error-text'>{loginError}</p>}
              <div className='admin-login-btns'>
                <button type='submit' className='admin-btn-primary'>
                  Unlock Admin Portal
                </button>
                <button
                  type='button'
                  className='admin-btn-secondary'
                  onClick={() => {
                    setIsAdmin(true)
                    sessionStorage.setItem('candj_admin_auth', 'true')
                    localStorage.removeItem('candj_admin_auth')
                    showToast('Quick demo access granted')
                  }}
                >
                  Quick Unlock
                </button>
              </div>
            </form>
          </div>
        ) : viewMode === 'table' ? (
          /* Simple Table View */
          <div className='admin-table-view-card'>
            <div className='admin-table-toolbar'>
              <button
                type='button'
                className='admin-btn-add-property'
                onClick={initAddForm}
              >
                + Add Property
              </button>

              {/* Sort Button & Dropdown */}
              <div className='admin-sort-dropdown-wrap' ref={sortRef}>
                <button
                  type='button'
                  className={`admin-btn-sort ${sortBy !== 'default' ? 'is-active' : ''}`}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  title='Sort listings'
                >
                  <span className='admin-btn-sort-icon'>⇅</span>
                  <span>
                    {sortBy === 'default' && 'Sort: Default'}
                    {sortBy === 'location-asc' && 'Sort: Location (A → Z)'}
                    {sortBy === 'location-desc' && 'Sort: Location (Z → A)'}
                    {sortBy === 'price-asc' && 'Sort: Price (Low → High)'}
                    {sortBy === 'price-desc' && 'Sort: Price (High → Low)'}
                  </span>
                  <span className='admin-sort-chevron'>▾</span>
                </button>

                {isSortOpen && (
                  <div className='admin-sort-menu'>
                    <div className='admin-sort-header'>Sort listings by</div>
                    <button
                      type='button'
                      className={`admin-sort-option ${sortBy === 'default' ? 'selected' : ''}`}
                      onClick={() => { setSortBy('default'); setIsSortOpen(false) }}
                    >
                      <span>Default Order</span>
                      {sortBy === 'default' && <span className='admin-sort-check'>✓</span>}
                    </button>
                    <button
                      type='button'
                      className={`admin-sort-option ${sortBy === 'location-asc' ? 'selected' : ''}`}
                      onClick={() => { setSortBy('location-asc'); setIsSortOpen(false) }}
                    >
                      <span>Location (A → Z)</span>
                      {sortBy === 'location-asc' && <span className='admin-sort-check'>✓</span>}
                    </button>
                    <button
                      type='button'
                      className={`admin-sort-option ${sortBy === 'location-desc' ? 'selected' : ''}`}
                      onClick={() => { setSortBy('location-desc'); setIsSortOpen(false) }}
                    >
                      <span>Location (Z → A)</span>
                      {sortBy === 'location-desc' && <span className='admin-sort-check'>✓</span>}
                    </button>
                    <button
                      type='button'
                      className={`admin-sort-option ${sortBy === 'price-asc' ? 'selected' : ''}`}
                      onClick={() => { setSortBy('price-asc'); setIsSortOpen(false) }}
                    >
                      <span>Price: Low to High</span>
                      {sortBy === 'price-asc' && <span className='admin-sort-check'>✓</span>}
                    </button>
                    <button
                      type='button'
                      className={`admin-sort-option ${sortBy === 'price-desc' ? 'selected' : ''}`}
                      onClick={() => { setSortBy('price-desc'); setIsSortOpen(false) }}
                    >
                      <span>Price: High to Low</span>
                      {sortBy === 'price-desc' && <span className='admin-sort-check'>✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk Delete Button when items selected */}
              {selectedIds.length > 0 && (
                <button
                  type='button'
                  className='admin-btn-bulk-delete'
                  onClick={() => setIsBulkDeleteOpen(true)}
                  title={`Delete ${selectedIds.length} selected listings`}
                >
                  🗑️ Delete Selected ({selectedIds.length})
                </button>
              )}

              {/* Search Box */}
              <div className='admin-search-box'>
                <svg className='admin-search-icon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type='text'
                  placeholder='Search properties by town, barangay, or keyword...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='admin-search-input'
                />
                {searchTerm && (
                  <button
                    type='button'
                    className='admin-clear-search'
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className='admin-table-info-row'>
              <div className='admin-table-info-left'>
                <span>
                  Showing <strong>{filteredTableProps.length}</strong> active listing(s){' '}
                  {isSupabaseConfigured() ? 'in Supabase Database' : '(Saved in Browser Local Storage)'}
                </span>
                {selectedIds.length > 0 && (
                  <span className='admin-selection-pill'>
                    <strong>{selectedIds.length}</strong> selected
                    <button
                      type='button'
                      className='admin-selection-clear-btn'
                      onClick={() => setSelectedIds([])}
                      title='Deselect all'
                    >
                      Clear
                    </button>
                  </span>
                )}
              </div>
              {!isSupabaseConfigured() && (
                <span className='admin-supabase-warning-pill' title='Supabase Anon Key is not set in .env yet'>
                  ⚠️ Supabase Not Connected (Add Anon Key)
                </span>
              )}
            </div>

            <div className='admin-table-responsive'>
              <table className='admin-simple-table'>
                <thead>
                  <tr>
                    <th style={{ width: '46px', textAlign: 'center' }}>
                      <input
                        type='checkbox'
                        className='admin-table-checkbox'
                        aria-label='Select all properties'
                        checked={allFilteredSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someFilteredSelected
                        }}
                        onChange={handleToggleSelectAll}
                      />
                    </th>
                    <th style={{ width: '80px' }}>Photo</th>
                    <th
                      className='admin-th-sortable'
                      onClick={toggleLocationSort}
                      title='Click to sort by Location'
                    >
                      <div className='admin-th-content'>
                        <span>Location</span>
                        <span className='admin-th-sort-arrow'>
                          {sortBy === 'location-asc' ? '▲' : sortBy === 'location-desc' ? '▼' : '⇅'}
                        </span>
                      </div>
                    </th>
                    <th>Label</th>
                    <th>Main Info</th>
                    <th>Sub Info</th>
                    <th
                      className='admin-th-sortable'
                      onClick={togglePriceSort}
                      title='Click to sort by Listing Price'
                    >
                      <div className='admin-th-content'>
                        <span>Listing Price</span>
                        <span className='admin-th-sort-arrow'>
                          {sortBy === 'price-asc' ? '▲' : sortBy === 'price-desc' ? '▼' : '⇅'}
                        </span>
                      </div>
                    </th>
                    <th style={{ width: '150px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableProps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='admin-table-empty'>
                        {properties.length === 0
                          ? 'No properties in database yet. Click "+ Add Property" to create your first listing.'
                          : 'No properties found matching your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTableProps.map((prop) => (
                      <tr key={prop.id} className={selectedIds.includes(prop.id) ? 'admin-row-selected' : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type='checkbox'
                            className='admin-table-checkbox'
                            aria-label={`Select property in ${prop.location || 'listing'}`}
                            checked={selectedIds.includes(prop.id)}
                            onChange={() => handleToggleRowSelect(prop.id)}
                          />
                        </td>
                        <td>
                          <img
                            src={prop.image}
                            alt={prop.location || 'Property'}
                            className='admin-table-thumb'
                          />
                        </td>
                        <td>
                          <div className='admin-cell-location'>
                            <strong>{toTitleCase(prop.barangay || prop.location || '—')}</strong>
                            <span>
                              {prop.municipality && prop.province
                                ? `${toTitleCase(prop.municipality)}, ${toTitleCase(prop.province)}`
                                : (prop.barangay ? '' : toTitleCase(prop.location))}
                            </span>
                          </div>
                        </td>
                        <td>
                          {prop.badge || prop.label ? (
                            <span className='admin-table-badge'>
                              {prop.badge || prop.label}
                            </span>
                          ) : (
                            <span className='admin-cell-empty'>—</span>
                          )}
                        </td>
                        <td>
                          <span className='admin-cell-text'>{prop.main_info || prop.subtitle || '—'}</span>
                        </td>
                        <td>
                          <span className='admin-cell-text admin-cell-sub'>{prop.sub_info || prop.specs || '—'}</span>
                        </td>
                        <td>
                          <div className='admin-cell-price-block'>
                            <span className='admin-cell-price'>
                              {prop.price || (prop.listing_price ? `₱${Number(prop.listing_price).toLocaleString()} / SQM` : '—')}
                            </span>
                            {prop.terms && (
                              <span className='admin-cell-terms'>{prop.terms}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className='admin-table-actions'>
                            <button
                              type='button'
                              className='admin-action-edit'
                              onClick={() => initEditForm(prop)}
                              title='Edit property'
                            >
                              Edit
                            </button>
                            {deletingId === prop.id ? (
                              <div className='admin-confirm-delete-box'>
                                <span>Confirm?</span>
                                <button
                                   type='button'
                                   className='admin-action-delete-confirm'
                                   onClick={() => handleDelete(prop.id, prop.location)}
                                >
                                  Yes
                                </button>
                                <button
                                  type='button'
                                  className='admin-action-delete-cancel'
                                  onClick={() => setDeletingId(null)}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type='button'
                                className='admin-action-delete'
                                onClick={() => setDeletingId(prop.id)}
                                title='Delete property'
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bulk Delete Confirmation Modal */}
            {isBulkDeleteOpen && (
              <div className='admin-modal-overlay' role='dialog' aria-modal='true'>
                <div className='admin-modal-card'>
                  <div className='admin-modal-icon-danger'>⚠️</div>
                  <h3 className='admin-modal-title'>Delete {selectedIds.length} Properties?</h3>
                  <p className='admin-modal-text'>
                    You are about to permanently delete <strong>{selectedIds.length}</strong> selected property listing{selectedIds.length > 1 ? 's' : ''}.
                    This action removes the listings and images from Supabase and cannot be undone.
                  </p>
                  <div className='admin-modal-actions'>
                    <button
                      type='button'
                      className='admin-modal-btn-cancel'
                      onClick={() => setIsBulkDeleteOpen(false)}
                      disabled={isBulkDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      className='admin-modal-btn-delete'
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                    >
                      {isBulkDeleting ? 'Deleting...' : `Yes, Delete ${selectedIds.length} Listing${selectedIds.length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Add / Edit Property Form View */
          <div className='admin-form-view-card'>
            <div className='admin-form-header'>
              <div>
                <h2>{formId ? 'Edit Property Listing' : 'Add New Property'}</h2>
                <p>Fill in the required information. Changes will reflect directly on the website listings and database.</p>
              </div>
              <button
                type='button'
                className='admin-btn-secondary'
                onClick={() => setViewMode('table')}
              >
                ← Back to Listings Table
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className='admin-prop-form'>
              {/* 1. Cascading Location: Province, Municipal/City, Barangay (Custom Combobox with Single-Click Open) */}
              <div className='admin-form-section'>
                <h3 className='admin-section-title'>1. Property Location</h3>
                <p className='admin-section-desc'>
                  Click once to open the dropdown list or type your own custom location if you can't find it.
                </p>

                <div className='admin-geo-grid'>
                  <SearchableCombobox
                    label='Province'
                    value={provinceName}
                    onChange={handleProvinceChange}
                    options={provincesList.map((p) => toTitleCase(p.name))}
                    placeholder='Select or type province...'
                    required
                  />

                  <SearchableCombobox
                    label='Municipal / City'
                    value={municipalityName}
                    onChange={handleMunicipalityChange}
                    options={municipalitiesList.map((m) => toTitleCase(m.name))}
                    placeholder='Select or type town / city...'
                    required
                  />

                  <SearchableCombobox
                    label='Barangay / Sitio'
                    value={selectedBarangay}
                    onChange={handleBarangayChange}
                    options={barangaysList.map((b) => toTitleCase(b.name))}
                    placeholder='Select or type barangay / sitio...'
                    required
                  />
                </div>

                <div className='admin-location-pill-summary'>
                  <span className='admin-loc-icon'>📍</span>
                  <span>
                    Selected Location:{' '}
                    <strong>
                      {selectedBarangay
                        ? `${selectedBarangay}, ${municipalityName}, ${provinceName}`
                        : 'Choose province, municipality, and barangay above'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* 2. Label Input Field & Add Button + Display Added Label with X */}
              <div className='admin-form-section'>
                <h3 className='admin-section-title'>2. Property Information Details</h3>

                <div className='admin-field-group'>
                  <label>Label</label>
                  <div className='admin-input-add-row'>
                    <input
                      type='text'
                      placeholder='e.g. Clean Title'
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      className='admin-input'
                    />
                    <button
                      type='button'
                      className='admin-btn-add-chip'
                      onClick={handleAddLabel}
                    >
                      Add
                    </button>
                  </div>
                  {/* Display added label and also an x to delete */}
                  <div className='admin-chips-display'>
                    {labelTags.map((tag) => (
                      <span key={tag} className='admin-chip-item'>
                        {tag}
                        <button
                          type='button'
                          className='admin-chip-delete'
                          onClick={() => handleRemoveLabel(tag)}
                          aria-label={`Delete label ${tag}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Input field for main info and add button + display added with x */}
                <div className='admin-field-group'>
                  <label>Main Info</label>
                  <div className='admin-input-add-row'>
                    <input
                      type='text'
                      placeholder='e.g. 10 Hectares • 101,618 SQM'
                      value={mainInfoInput}
                      onChange={(e) => setMainInfoInput(e.target.value)}
                      className='admin-input'
                    />
                    <button
                      type='button'
                      className='admin-btn-add-chip'
                      onClick={handleAddMainInfo}
                    >
                      Add
                    </button>
                  </div>
                  {/* Display added main info and also an x to delete */}
                  <div className='admin-chips-display'>
                    {mainInfoTags.map((tag) => (
                      <span key={tag} className='admin-chip-item'>
                        {tag}
                        <button
                          type='button'
                          className='admin-chip-delete'
                          onClick={() => handleRemoveMainInfo(tag)}
                          aria-label={`Delete main info ${tag}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sub info input field and add button + display added with x */}
                <div className='admin-field-group'>
                  <label>Sub Info</label>
                  <div className='admin-input-add-row'>
                    <input
                      type='text'
                      placeholder='e.g. 90m W × 1.2km L • Near San Basilio School'
                      value={subInfoInput}
                      onChange={(e) => setSubInfoInput(e.target.value)}
                      className='admin-input'
                    />
                    <button
                      type='button'
                      className='admin-btn-add-chip'
                      onClick={handleAddSubInfo}
                    >
                      Add
                    </button>
                  </div>
                  {/* Display added sub info and also an x to delete */}
                  <div className='admin-chips-display'>
                    {subInfoTags.map((tag) => (
                      <span key={tag} className='admin-chip-item'>
                        {tag}
                        <button
                          type='button'
                          className='admin-chip-delete'
                          onClick={() => handleRemoveSubInfo(tag)}
                          aria-label={`Delete sub info ${tag}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Listing Price & Terms */}
                <div className='admin-price-row-grid'>
                  <div className='admin-field-group'>
                    <label>Listing Price per SQM (₱)</label>
                    <input
                      type='number'
                      min='100'
                      max='100000'
                      step='50'
                      value={listingPrice}
                      onChange={(e) => setListingPrice(Number(e.target.value))}
                      className='admin-input'
                      required
                    />
                  </div>
                  <div className='admin-field-group'>
                    <label>Payment Terms</label>
                    <input
                      type='text'
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder='Negotiable / Cash / Installment'
                      className='admin-input'
                    />
                  </div>
                </div>
              </div>

              {/* 3. Verified Feature Highlights */}
              <div className='admin-form-section'>
                <h3 className='admin-section-title'>3. Verified Feature Highlights</h3>

                {/* Single custom highlight feature input */}
                <div className='admin-custom-feature-row'>
                  <input
                    type='text'
                    placeholder='Add custom highlight feature...'
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomHighlight(customTagInput)
                        setCustomTagInput('')
                      }
                    }}
                    className='admin-input'
                  />
                  <button
                    type='button'
                    className='admin-btn-add-tag'
                    onClick={() => {
                      handleAddCustomHighlight(customTagInput)
                      setCustomTagInput('')
                    }}
                  >
                    Add Tag
                  </button>
                </div>

                {/* Highlight Pills Grid with ✓ or + */}
                <div className='admin-highlights-pills-list'>
                  {STANDARD_HIGHLIGHTS.map((item) => {
                    const isChecked = selectedHighlights.includes(item)
                    return (
                      <button
                        key={item}
                        type='button'
                        className={`admin-highlight-pill ${isChecked ? 'is-checked' : 'is-unchecked'}`}
                        onClick={() => toggleHighlight(item)}
                      >
                        <span className='admin-pill-symbol'>{isChecked ? '✓' : '+'}</span>
                        <span className='admin-pill-text'>{item}</span>
                      </button>
                    )
                  })}

                  {/* Custom Highlights */}
                  {customHighlights.map((item) => {
                    const isChecked = selectedHighlights.includes(item)
                    return (
                      <div
                        key={item}
                        className={`admin-highlight-pill is-custom ${isChecked ? 'is-checked' : 'is-unchecked'}`}
                      >
                        <span
                          className='admin-pill-click-area'
                          onClick={() => toggleHighlight(item)}
                        >
                          <span className='admin-pill-symbol'>{isChecked ? '✓' : '+'}</span>
                          <span className='admin-pill-text'>{item}</span>
                        </span>
                        <button
                          type='button'
                          className='admin-pill-delete'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveCustomHighlight(item)
                          }}
                          title={`Delete custom highlight ${item}`}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 4. Property Showcase Photograph */}
              <div className='admin-form-section'>
                <h3 className='admin-section-title'>4. Property Showcase Photograph</h3>
                <p className='admin-section-desc'>
                  All 4 preset drone photos are kept safe and preserved. You can click <strong>"💾 Save Photo"</strong> on any preset below to download it directly to your computer.
                </p>

                <div className='admin-photograph-grid'>
                  {/* Preset 1 */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property1' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property1')}
                  >
                    <img src={PRESET_IMAGES.property1} alt={presetAltTexts.property1} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset 1</span>
                      <input
                        type='text'
                        value={presetAltTexts.property1}
                        onChange={(e) =>
                          setPresetAltTexts({ ...presetAltTexts, property1: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className='admin-alt-text-input'
                        title='Edit alt text for image'
                      />
                      <a
                        href={PRESET_IMAGES.property1}
                        download='preset-property-1.jpg'
                        target='_blank'
                        rel='noreferrer'
                        className='admin-save-photo-link'
                        onClick={(e) => e.stopPropagation()}
                      >
                        💾 Save Photo
                      </a>
                    </div>
                  </div>

                  {/* Preset 2 */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property2' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property2')}
                  >
                    <img src={PRESET_IMAGES.property2} alt={presetAltTexts.property2} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset 2</span>
                      <input
                        type='text'
                        value={presetAltTexts.property2}
                        onChange={(e) =>
                          setPresetAltTexts({ ...presetAltTexts, property2: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className='admin-alt-text-input'
                        title='Edit alt text for image'
                      />
                      <a
                        href={PRESET_IMAGES.property2}
                        download='preset-property-2.png'
                        target='_blank'
                        rel='noreferrer'
                        className='admin-save-photo-link'
                        onClick={(e) => e.stopPropagation()}
                      >
                        💾 Save Photo
                      </a>
                    </div>
                  </div>

                  {/* Preset 3 */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property3' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property3')}
                  >
                    <img src={PRESET_IMAGES.property3} alt={presetAltTexts.property3} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset 3</span>
                      <input
                        type='text'
                        value={presetAltTexts.property3}
                        onChange={(e) =>
                          setPresetAltTexts({ ...presetAltTexts, property3: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className='admin-alt-text-input'
                        title='Edit alt text for image'
                      />
                      <a
                        href={PRESET_IMAGES.property3}
                        download='preset-property-3.jpg'
                        target='_blank'
                        rel='noreferrer'
                        className='admin-save-photo-link'
                        onClick={(e) => e.stopPropagation()}
                      >
                        💾 Save Photo
                      </a>
                    </div>
                  </div>

                  {/* Preset 4 */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property4' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property4')}
                  >
                    <img src={PRESET_IMAGES.property4} alt={presetAltTexts.property4} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset 4</span>
                      <input
                        type='text'
                        value={presetAltTexts.property4}
                        onChange={(e) =>
                          setPresetAltTexts({ ...presetAltTexts, property4: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className='admin-alt-text-input'
                        title='Edit alt text for image'
                      />
                      <a
                        href={PRESET_IMAGES.property4}
                        download='preset-property-4.jpg'
                        target='_blank'
                        rel='noreferrer'
                        className='admin-save-photo-link'
                        onClick={(e) => e.stopPropagation()}
                      >
                        💾 Save Photo
                      </a>
                    </div>
                  </div>

                  {/* Upload File */}
                  <div
                    className={`admin-photo-card admin-photo-upload-card ${selectedImageKey === 'custom' ? 'is-selected' : ''}`}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    {customImageData ? (
                      <img src={customImageData} alt='Custom Upload' className='admin-photo-thumb' />
                    ) : (
                      <div className='admin-upload-placeholder'>
                        <span className='admin-upload-camera-icon'>📷</span>
                        <strong>Upload File</strong>
                        <span>Browse Local...</span>
                      </div>
                    )}
                    <input
                      type='file'
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept='image/*'
                      style={{ display: 'none' }}
                    />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>
                        {customImageData ? 'Custom Photo Loaded' : 'Local Photo'}
                      </span>
                      {customImageData && (
                        <a
                          href={customImageData}
                          download='custom-photo.jpg'
                          target='_blank'
                          rel='noreferrer'
                          className='admin-save-photo-link'
                          onClick={(e) => e.stopPropagation()}
                        >
                          💾 Save Photo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className='admin-form-actions-bar'>
                <button type='submit' className='admin-btn-primary admin-btn-save'>
                  {formId ? 'Update Property Listing' : 'Save Property Listing'}
                </button>
                <button
                  type='button'
                  className='admin-btn-secondary'
                  onClick={() => setViewMode('table')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
