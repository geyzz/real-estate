import { useState, useRef, useEffect } from 'react'

const SLIDER_MIN = 500
const SLIDER_MAX = 2500

export default function PropertiesSection({
  properties = [],
  onSelectPropertyModal,
  onInquire,
}) {
  const [searchLocation, setSearchLocation] = useState('')
  const [priceMin, setPriceMin] = useState(1000)
  const [priceMax, setPriceMax] = useState(1600)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isPriceOpen, setIsPriceOpen] = useState(false)

  const locationGroupRef = useRef(null)
  const priceGroupRef = useRef(null)

  const minPercent = Math.min(100, Math.max(0, ((priceMin - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100))
  const maxPercent = Math.min(100, Math.max(0, ((priceMax - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100))
  const isOverlapping = maxPercent - minPercent < 18

  // Dynamic location options derived from current properties
  const dynamicLocations = Array.from(
    new Set(
      properties
        .flatMap((p) => [
          p.location,
          p.municipality && p.province ? `${p.municipality}, ${p.province}` : null,
          p.province,
          p.municipality,
        ])
        .filter(Boolean)
    )
  )

  const filteredLocationOptions = dynamicLocations.filter((loc) =>
    loc.toLowerCase().includes(searchLocation.trim().toLowerCase())
  )

  // Filter properties based on search and price
  const filteredProperties = properties.filter((prop) => {
    const locTerm = searchLocation.trim().toLowerCase()
    if (locTerm) {
      const locMatch =
        (prop.location && prop.location.toLowerCase().includes(locTerm)) ||
        (prop.province && prop.province.toLowerCase().includes(locTerm)) ||
        (prop.municipality && prop.municipality.toLowerCase().includes(locTerm)) ||
        (prop.barangay && prop.barangay.toLowerCase().includes(locTerm)) ||
        (prop.specs && prop.specs.toLowerCase().includes(locTerm)) ||
        (prop.subtitle && prop.subtitle.toLowerCase().includes(locTerm))
      if (!locMatch) return false
    }

    const propNumPrice = prop.listing_price || parseFloat(String(prop.price || '').replace(/[^\d.]/g, ''))
    if (!isNaN(propNumPrice) && propNumPrice > 0) {
      if (propNumPrice < priceMin || propNumPrice > priceMax) {
        return false
      }
    }

    return true
  })

  const handleMinSlider = (e) => {
    const val = Math.min(Number(e.target.value), priceMax - 50)
    setPriceMin(val)
  }

  const handleMaxSlider = (e) => {
    const val = Math.max(Number(e.target.value), priceMin + 50)
    setPriceMax(val)
  }

  const handleMinInput = (val) => {
    if (val === '') {
      setPriceMin(SLIDER_MIN)
      return
    }
    const num = Number(val)
    if (!isNaN(num)) {
      setPriceMin(Math.min(Math.max(num, SLIDER_MIN), priceMax - 50))
    }
  }

  const handleMaxInput = (val) => {
    if (val === '') {
      setPriceMax(SLIDER_MAX)
      return
    }
    const num = Number(val)
    if (!isNaN(num)) {
      setPriceMax(Math.max(Math.min(num, SLIDER_MAX), priceMin + 50))
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationGroupRef.current && !locationGroupRef.current.contains(e.target)) {
        setIsLocationOpen(false)
      }
      if (priceGroupRef.current && !priceGroupRef.current.contains(e.target)) {
        setIsPriceOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  return (
    <section className='properties-page' id='properties-page'>
      {/* 2-in-1 Location & Price Search Bar */}
      <div className='prop-search-bar'>
        {/* 2-in-1 Location Dropdown & Search Field */}
        <div className='search-group' ref={locationGroupRef}>
          <div className='search-label-row'>
            <svg className='search-label-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <label>Location / Keyword</label>
          </div>
          <div className='search-controls search-combobox'>
            <input
              type='text'
              autoComplete='off'
              spellCheck='false'
              placeholder='Search town, barangay or pick...'
              value={searchLocation}
              onChange={(e) => {
                setSearchLocation(e.target.value)
                setIsLocationOpen(true)
              }}
              onFocus={() => setIsLocationOpen(true)}
              onClick={() => setIsLocationOpen(true)}
            />
            {searchLocation && (
              <button
                type='button'
                className='search-combo-clear-btn'
                aria-label='Clear location search'
                onClick={(e) => {
                  e.stopPropagation()
                  setSearchLocation('')
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              type='button'
              className={`search-combo-chevron-btn ${isLocationOpen ? 'is-open' : ''}`}
              aria-label='Toggle location options'
              onClick={(e) => {
                e.stopPropagation()
                setIsLocationOpen((prev) => !prev)
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {isLocationOpen && (
            <div className='search-dropdown-menu'>
              <div className='search-dropdown-header'>Select or search location</div>
              <div className='search-dropdown-list'>
                {filteredLocationOptions.length > 0 ? (
                  filteredLocationOptions.map((loc) => {
                    const isSelected = searchLocation.trim().toLowerCase() === loc.toLowerCase()
                    return (
                      <button
                        type='button'
                        key={loc}
                        className={`search-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSearchLocation(loc)
                          setIsLocationOpen(false)
                        }}
                      >
                        <span className='search-dropdown-item-title'>{loc}</span>
                        {isSelected && (
                          <svg className='search-dropdown-item-check' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className='search-dropdown-custom-notice'>
                    <span>Filtering keyword: <strong>"{searchLocation}"</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='search-divider'></div>

        {/* 2-in-1 Price Range Dropdown & Slider Component */}
        <div className='search-group' ref={priceGroupRef}>
          <div className='search-label-row'>
            <svg className='search-label-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
            <label>Price Range</label>
          </div>
          <div className='search-controls search-combobox' onClick={() => setIsPriceOpen((prev) => !prev)}>
            <input
              type='text'
              readOnly
              placeholder='Pick price range...'
              value={`₱${priceMin.toLocaleString()} – ₱${priceMax.toLocaleString()} / SQM`}
              style={{ cursor: 'pointer' }}
            />
            {(priceMin !== 1000 || priceMax !== 1600) && (
              <button
                type='button'
                className='search-combo-clear-btn'
                aria-label='Reset price range'
                onClick={(e) => {
                  e.stopPropagation()
                  setPriceMin(1000)
                  setPriceMax(1600)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              type='button'
              className={`search-combo-chevron-btn ${isPriceOpen ? 'is-open' : ''}`}
              aria-label='Toggle price options'
              onClick={(e) => {
                e.stopPropagation()
                setIsPriceOpen((prev) => !prev)
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {isPriceOpen && (
            <div
              className='search-dropdown-menu price-slider-dropdown'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='price-slider-header-wrap'>
                <div className='price-slider-eyebrow-row'>
                  <span className='price-slider-eyebrow'>Pricing Filter</span>
                  <span className='price-slider-unit'>SQM Rate</span>
                </div>
                <h4 className='price-slider-heading'>Price Range Slider</h4>
              </div>

              {/* Top: Slider line with tooltips & dual thumb knobs */}
              <div className='price-slider-track-wrap'>
                {/* Tooltip badges with down arrow */}
                <div
                  className={`price-slider-tooltip ${isOverlapping ? 'is-staggered' : ''}`}
                  style={{ left: `calc(${minPercent}% + ${13 - minPercent * 0.26}px)` }}
                >
                  <span>₱{priceMin.toLocaleString()}</span>
                </div>
                <div
                  className='price-slider-tooltip'
                  style={{ left: `calc(${maxPercent}% + ${13 - maxPercent * 0.26}px)` }}
                >
                  <span>₱{priceMax.toLocaleString()}</span>
                </div>

                {/* Track line & active progress */}
                <div className='price-slider-rail'>
                  <div
                    className='price-slider-fill'
                    style={{
                      left: `${minPercent}%`,
                      width: `${maxPercent - minPercent}%`,
                    }}
                  />
                </div>

                {/* Draggable dual range slider inputs */}
                <input
                  type='range'
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  step={50}
                  value={priceMin}
                  onChange={handleMinSlider}
                  className='price-range-native range-native-min'
                  aria-label='Minimum price slider'
                />
                <input
                  type='range'
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  step={50}
                  value={priceMax}
                  onChange={handleMaxSlider}
                  className='price-range-native range-native-max'
                  aria-label='Maximum price slider'
                />
              </div>

              {/* Bottom: Inputs from min to max */}
              <div className='price-input-cards-row'>
                <div className='price-input-card'>
                  <span className='price-card-prefix'>₱</span>
                  <input
                    type='number'
                    value={priceMin}
                    min={SLIDER_MIN}
                    max={priceMax - 50}
                    step={50}
                    onChange={(e) => handleMinInput(e.target.value)}
                    aria-label='Minimum price value'
                  />
                </div>
                <div className='price-cards-divider'>–</div>
                <div className='price-input-card'>
                  <span className='price-card-prefix'>₱</span>
                  <input
                    type='number'
                    value={priceMax}
                    min={priceMin + 50}
                    max={SLIDER_MAX}
                    step={50}
                    onChange={(e) => handleMaxInput(e.target.value)}
                    aria-label='Maximum price value'
                  />
                </div>
              </div>

              {/* Preset quick buttons and Apply */}
              <div className='price-slider-actions'>
                <div className='price-chips-group'>
                  <button
                    type='button'
                    className={`price-preset-chip ${priceMin === 1000 && priceMax === 1600 ? 'is-active' : ''}`}
                    onClick={() => {
                      setPriceMin(1000)
                      setPriceMax(1600)
                    }}
                  >
                    All Featured
                  </button>
                  <button
                    type='button'
                    className={`price-preset-chip ${priceMin === 500 && priceMax === 1300 ? 'is-active' : ''}`}
                    onClick={() => {
                      setPriceMin(500)
                      setPriceMax(1300)
                    }}
                  >
                    Under ₱1.3k
                  </button>
                  <button
                    type='button'
                    className={`price-preset-chip ${priceMin === 1500 && priceMax === 2500 ? 'is-active' : ''}`}
                    onClick={() => {
                      setPriceMin(1500)
                      setPriceMax(2500)
                    }}
                  >
                    ₱1.5k+
                  </button>
                </div>
                <button
                  type='button'
                  className='price-apply-btn'
                  onClick={() => setIsPriceOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Action Button */}
        <button
          className='prop-search-btn'
          type='button'
          onClick={() => {
            setIsLocationOpen(false)
            setIsPriceOpen(false)
            const target = document.querySelector('.prop-header')
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          <svg className='btn-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span>Find Properties</span>
        </button>
      </div>

      {/* Header */}
      <div className='prop-header'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className='prop-eyebrow'>Featured Properties</span>
          {(searchLocation || priceMin > 1000 || priceMax < 1600) && (
            <div className='prop-active-filter-badge'>
              <span>Filtered: {filteredProperties.length} of {properties.length} found</span>
              <button
                type='button'
                className='prop-clear-filter-btn'
                onClick={() => {
                  setSearchLocation('')
                  setPriceMin(1000)
                  setPriceMax(1600)
                }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
        <h2>Expansive Lots and Prime Estates Ready for Your Vision</h2>
      </div>

      {/* Property Cards Grid */}
      <div className='prop-grid'>
        {filteredProperties.length === 0 ? (
          <div className='prop-no-results-card'>
            <svg className='prop-no-results-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <h3>No properties found matching your search</h3>
            <p>Try searching for a different town, or reset the price filter.</p>
            <button
              type='button'
              className='prop-reset-search-btn'
              onClick={() => {
                setSearchLocation('')
                setPriceMin(1000)
                setPriceMax(1600)
              }}
            >
              Reset Search Criteria
            </button>
          </div>
        ) : (
          filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className='prop-card'
              id={prop.propCardId || `prop-card-${prop.id}`}
              style={{ backgroundImage: `url(${prop.image})` }}
            >
              <div
                className='prop-photo-click-area'
                role='button'
                tabIndex={0}
                aria-label={`View photo and details for ${prop.location}`}
                onClick={() => onSelectPropertyModal(prop)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectPropertyModal(prop)
                  }
                }}
              />
              <span className='prop-badge'>{prop.badge || prop.label || 'Clean Title'}</span>
              <button
                type='button'
                className='prop-zoom-btn'
                aria-label={`View details for ${prop.location}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPropertyModal(prop)
                }}
              >
                <svg className='prop-zoom-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>

              <div className='prop-body' onClick={(e) => e.stopPropagation()}>
                <div className='prop-details-top'>
                  <h3 className='prop-location'>{prop.location}</h3>
                  <p className='prop-subtitle'>{prop.subtitle || prop.main_info}</p>
                  <p className='prop-specs'>{prop.specs || prop.sub_info}</p>
                </div>
                <div className='prop-footer'>
                  <div className='prop-price-row'>
                    <p className='prop-price'>{prop.price || prop.price_display}</p>
                    <span className='prop-neg'>{prop.terms || 'Negotiable'}</span>
                  </div>
                  <button
                    className='prop-card-btn'
                    type='button'
                    onClick={() => onInquire(prop)}
                  >
                    Inquire Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
