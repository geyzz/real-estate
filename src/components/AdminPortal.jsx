import { useState, useEffect, useRef } from 'react'
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
} from '../lib/supabase'

const STANDARD_HIGHLIGHTS = [
  'Clean Title Verified',
  'Wide Road Access',
  'Direct Owner Negotiation',
  'Near San Basilio School',
  'Near Main Highway',
  'Electric & Water Ready',
  'Fishpond & Resthouse',
  'Fenced Perimeter',
]

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

  // Form State
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

  // Price & Terms
  const [listingPrice, setListingPrice] = useState(1500)
  const [terms, setTerms] = useState('Negotiable')

  // Feature Highlights
  const [selectedHighlights, setSelectedHighlights] = useState([
    'Clean Title Verified',
    'Wide Road Access',
    'Direct Owner Negotiation',
  ])
  const [customHighlights, setCustomHighlights] = useState([])
  const [customTagInputTop, setCustomTagInputTop] = useState('')
  const [customTagInputBottom, setCustomTagInputBottom] = useState('')

  // Showcase Photograph state
  const [selectedImageKey, setSelectedImageKey] = useState('property4')
  const [customImageData, setCustomImageData] = useState('')
  const [presetAltTexts, setPresetAltTexts] = useState({
    property1: 'Preset 1',
    property2: 'Preset 2',
    property3: 'Preset 3',
    property4: 'Preset 4 (Porac / Pulong)',
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
      localStorage.setItem('candj_admin_auth', 'true')
      setLoginError('')
      showToast('Admin access granted')
    } else {
      setLoginError('Invalid password. Hint: enter "candj2026" or "admin"')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('candj_admin_auth')
    showToast('Signed out of admin')
  }

  // Set up form to default for a fresh lot (Pampanga / Porac / Pulong Santol ready for user test)
  const initAddForm = () => {
    setFormId(null)
    setLabelInput('')
    setLabelTags(['Clean Title'])

    setMainInfoInput('')
    setMainInfoTags(['10 Hectares • 101,618 SQM'])

    setSubInfoInput('')
    setSubInfoTags(['90m W × 1.2km L • Near San Basilio School'])

    setListingPrice(1500)
    setTerms('Negotiable')

    setSelectedHighlights([
      'Clean Title Verified',
      'Wide Road Access',
      'Direct Owner Negotiation',
    ])
    setCustomHighlights([])
    setCustomTagInputTop('')
    setCustomTagInputBottom('')

    setSelectedImageKey('property4')
    setCustomImageData('')

    // Set to Pampanga -> Porac -> Pulong Santol as default
    const pCode = findProvinceCodeByName('PAMPANGA') || '0354'
    setSelectedProvCode(pCode)
    setProvinceName('PAMPANGA')

    const muns = getMunicipalities(pCode)
    setMunicipalitiesList(muns)

    const poracCode = findMunicipalityCodeByName('PORAC', pCode) || (muns[0] ? muns[0].mun_code : '')
    setSelectedMunCode(poracCode)
    setMunicipalityName('Porac')

    if (poracCode) {
      const brgys = getBarangays(poracCode)
      setBarangaysList(brgys)
      const pulong = brgys.find((b) => b.name.toLowerCase().includes('pulong'))
      setSelectedBarangay(pulong ? pulong.name : brgys[0]?.name || '')
    }

    setViewMode('form')
  }

  // Populate form with existing property for editing
  const initEditForm = (prop) => {
    setFormId(prop.id)

    // Label tags
    const rawLabel = prop.badge || prop.label || 'Clean Title'
    setLabelTags(rawLabel ? [rawLabel] : [])
    setLabelInput('')

    // Main info tags
    const rawMain = prop.main_info || prop.subtitle || ''
    setMainInfoTags(rawMain ? [rawMain] : [])
    setMainInfoInput('')

    // Sub info tags
    const rawSub = prop.sub_info || prop.specs || ''
    setSubInfoTags(rawSub ? [rawSub] : [])
    setSubInfoInput('')

    setListingPrice(prop.listing_price || 1500)
    setTerms(prop.terms || 'Negotiable')

    // Highlights
    if (prop.sub_labels && Array.isArray(prop.sub_labels)) {
      const names = prop.sub_labels.map((s) => (typeof s === 'string' ? s : s.text))
      setSelectedHighlights(names)
    }

    // Image
    setSelectedImageKey(prop.imageKey || 'property4')
    if (typeof prop.image === 'string' && (prop.image.startsWith('data:') || prop.image.startsWith('http'))) {
      setCustomImageData(prop.image)
    } else {
      setCustomImageData('')
    }

    // Geo resolution
    const provName = prop.province || 'PAMPANGA'
    setProvinceName(provName)
    const pCode = findProvinceCodeByName(provName) || '0354'
    setSelectedProvCode(pCode)

    const muns = getMunicipalities(pCode)
    setMunicipalitiesList(muns)

    const munName = prop.municipality || 'Porac'
    setMunicipalityName(munName)
    const mCode = findMunicipalityCodeByName(munName, pCode) || (muns[0] ? muns[0].mun_code : '')
    setSelectedMunCode(mCode)

    if (mCode) {
      const brgys = getBarangays(mCode)
      setBarangaysList(brgys)
    }
    setSelectedBarangay(prop.barangay || 'Pulong Santol')

    setViewMode('form')
  }

  // Geo cascading handlers
  const handleProvinceChange = (e) => {
    const pCode = e.target.value
    setSelectedProvCode(pCode)
    const prov = provincesList.find((p) => p.prov_code === pCode)
    const pName = prov ? prov.name : ''
    setProvinceName(pName)

    const muns = getMunicipalities(pCode)
    setMunicipalitiesList(muns)

    if (muns.length > 0) {
      const firstMun = muns[0]
      setSelectedMunCode(firstMun.mun_code)
      setMunicipalityName(firstMun.name)
      const brgys = getBarangays(firstMun.mun_code)
      setBarangaysList(brgys)
      setSelectedBarangay(brgys[0] ? brgys[0].name : '')
    } else {
      setSelectedMunCode('')
      setMunicipalityName('')
      setBarangaysList([])
      setSelectedBarangay('')
    }
  }

  const handleMunicipalityChange = (e) => {
    const mCode = e.target.value
    setSelectedMunCode(mCode)
    const mun = municipalitiesList.find((m) => m.mun_code === mCode)
    setMunicipalityName(mun ? mun.name : '')

    const brgys = getBarangays(mCode)
    setBarangaysList(brgys)
    setSelectedBarangay(brgys[0] ? brgys[0].name : '')
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

    const finalLabel = labelTags.length > 0 ? labelTags.join(' • ') : (labelInput.trim() || 'Clean Title')
    const finalMainInfo = mainInfoTags.length > 0 ? mainInfoTags.join(' • ') : (mainInfoInput.trim() || 'Prime Estate Lot')
    const finalSubInfo = subInfoTags.length > 0 ? subInfoTags.join(' • ') : subInfoInput.trim()

    const formattedPrice = `₱${Number(listingPrice || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} / SQM`

    const locationStr = `${selectedBarangay}, ${municipalityName}, ${provinceName}`

    const chosenImage =
      selectedImageKey === 'custom' && customImageData
        ? customImageData
        : PRESET_IMAGES[selectedImageKey] || PRESET_IMAGES.property4

    const propertyPayload = {
      province: provinceName,
      municipality: municipalityName,
      barangay: selectedBarangay,
      badge: finalLabel,
      label: finalLabel,
      location: locationStr,
      subtitle: finalMainInfo,
      main_info: finalMainInfo,
      specs: finalSubInfo,
      sub_info: finalSubInfo,
      listing_price: Number(listingPrice),
      price: formattedPrice,
      price_display: formattedPrice,
      terms: terms.trim() || 'Negotiable',
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
    showToast(`Deleted listing: ${title}`)
    if (onPropertiesUpdated) {
      await onPropertiesUpdated()
    }
  }

  if (!isOpen) return null

  // Filter properties in table
  const filteredTableProps = properties.filter((p) => {
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

  return (
    <div className='admin-full-page-wrap'>
      {/* Top Admin Navbar */}
      <header className='admin-portal-header'>
        <div className='admin-header-brand'>
          <span className='admin-gold-pill'>ADMIN PORTAL</span>
          <h1 className='admin-title'>C &amp; J Real Estate Management</h1>
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
                    localStorage.setItem('candj_admin_auth', 'true')
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
              <button
                type='button'
                className='admin-btn-add-property'
                onClick={initAddForm}
              >
                + Add Property
              </button>
            </div>

            <div className='admin-table-info-row'>
              <span>Showing <strong>{filteredTableProps.length}</strong> active listing(s) in database</span>
            </div>

            <div className='admin-table-responsive'>
              <table className='admin-simple-table'>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Photo</th>
                    <th>Location</th>
                    <th>Label</th>
                    <th>Main Info</th>
                    <th>Sub Info</th>
                    <th>Listing Price</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableProps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='admin-table-empty'>
                        No properties found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredTableProps.map((prop) => (
                      <tr key={prop.id}>
                        <td>
                          <img
                            src={prop.image}
                            alt={prop.location}
                            className='admin-table-thumb'
                          />
                        </td>
                        <td>
                          <div className='admin-cell-location'>
                            <strong>{prop.barangay || prop.location}</strong>
                            <span>{prop.municipality ? `${prop.municipality}, ${prop.province}` : prop.location}</span>
                          </div>
                        </td>
                        <td>
                          <span className='admin-table-badge'>
                            {prop.badge || prop.label || 'Clean Title'}
                          </span>
                        </td>
                        <td>
                          <span className='admin-cell-text'>{prop.main_info || prop.subtitle}</span>
                        </td>
                        <td>
                          <span className='admin-cell-text admin-cell-sub'>{prop.sub_info || prop.specs}</span>
                        </td>
                        <td>
                          <span className='admin-cell-price'>
                            {prop.price || prop.price_display}
                          </span>
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
              {/* 1. Cascading Location: Province, Municipal/City, Barangay */}
              <div className='admin-form-section'>
                <h3 className='admin-section-title'>1. Property Location</h3>
                <div className='admin-geo-grid'>
                  <div className='admin-field-group'>
                    <label>Province</label>
                    <select
                      value={selectedProvCode}
                      onChange={handleProvinceChange}
                      className='admin-select'
                      required
                    >
                      <option value=''>-- Select Province --</option>
                      {provincesList.map((p) => (
                        <option key={p.prov_code} value={p.prov_code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='admin-field-group'>
                    <label>Municipal / City</label>
                    <select
                      value={selectedMunCode}
                      onChange={handleMunicipalityChange}
                      className='admin-select'
                      disabled={!selectedProvCode || municipalitiesList.length === 0}
                      required
                    >
                      <option value=''>-- Select Municipality / City --</option>
                      {municipalitiesList.map((m) => (
                        <option key={m.mun_code} value={m.mun_code}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='admin-field-group'>
                    <label>Barangay</label>
                    <select
                      value={selectedBarangay}
                      onChange={(e) => setSelectedBarangay(e.target.value)}
                      className='admin-select'
                      disabled={!selectedMunCode || barangaysList.length === 0}
                      required
                    >
                      <option value=''>-- Select Barangay --</option>
                      {barangaysList.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
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

                {/* Add custom highlight feature... Add Tag (Top) */}
                <div className='admin-custom-feature-row'>
                  <input
                    type='text'
                    placeholder='Add custom highlight feature...'
                    value={customTagInputTop}
                    onChange={(e) => setCustomTagInputTop(e.target.value)}
                    className='admin-input'
                  />
                  <button
                    type='button'
                    className='admin-btn-add-tag'
                    onClick={() => {
                      handleAddCustomHighlight(customTagInputTop)
                      setCustomTagInputTop('')
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

                {/* Add custom highlight feature... Add Tag (Bottom) */}
                <div className='admin-custom-feature-row' style={{ marginTop: '14px' }}>
                  <input
                    type='text'
                    placeholder='Add custom highlight feature...'
                    value={customTagInputBottom}
                    onChange={(e) => setCustomTagInputBottom(e.target.value)}
                    className='admin-input'
                  />
                  <button
                    type='button'
                    className='admin-btn-add-tag'
                    onClick={() => {
                      handleAddCustomHighlight(customTagInputBottom)
                      setCustomTagInputBottom('')
                    }}
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* 4. Property Showcase Photograph */}
              <div className='admin-form-section'>
                <h3 className='admin-section-title'>4. Property Showcase Photograph</h3>
                <p className='admin-section-desc'>
                  Choose from preset clean drone lot photos (including Property 4 for Pulong Santol) or upload your own photo.
                </p>

                <div className='admin-photograph-grid'>
                  {/* Preset 1 */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property1' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property1')}
                  >
                    <img src={PRESET_IMAGES.property1} alt={presetAltTexts.property1} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset property1</span>
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
                    </div>
                  </div>

                  {/* Preset 2 */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property2' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property2')}
                  >
                    <img src={PRESET_IMAGES.property2} alt={presetAltTexts.property2} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset property2</span>
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
                    </div>
                  </div>

                  {/* Preset 3 */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property3' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property3')}
                  >
                    <img src={PRESET_IMAGES.property3} alt={presetAltTexts.property3} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset property3</span>
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
                    </div>
                  </div>

                  {/* Preset 4 (Porac / Pulong Santol) */}
                  <div
                    className={`admin-photo-card ${selectedImageKey === 'property4' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedImageKey('property4')}
                  >
                    <img src={PRESET_IMAGES.property4} alt={presetAltTexts.property4} className='admin-photo-thumb' />
                    <div className='admin-photo-footer'>
                      <span className='admin-photo-label-title'>Preset property4</span>
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
                      <span className='admin-porac-tag'>Porac / Pulong</span>
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
