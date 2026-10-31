import { useState, useRef, useEffect, useMemo } from 'react'
import { formatLocation } from '../lib/philippineGeo'

const SLIDER_MIN = 500
const SLIDER_MAX = 2500
const ITEMS_PER_PAGE = 4
const FEATURED_LIMIT = 4

export default function PropertiesSection({
  properties = [],
  onSelectPropertyModal,
  onInquire,
}) {
  const [searchLocation, setSearchLocation] = useState('')
  const [priceMin, setPriceMin] = useState(SLIDER_MIN)
  const [priceMax, setPriceMax] = useState(SLIDER_MAX)
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isPriceOpen, setIsPriceOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const locationGroupRef = useRef(null)
  const priceGroupRef = useRef(null)

  const minPercent = Math.min(100, Math.max(0, ((priceMin - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100))
  const maxPercent = Math.min(100, Math.max(0, ((priceMax - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100))
  const isOverlapping = maxPercent - minPercent < 18

  // Dynamic location options derived from current properties formatted consistently in Proper Case
  const dynamicLocations = Array.from(
    new Set(
      properties
        .flatMap((p) => [
          p.location ? formatLocation(p.location) : null,
          p.municipality && p.province ? formatLocation(`${p.municipality}, ${p.province}`) : null,
          p.province ? formatLocation(p.province) : null,
          p.municipality ? formatLocation(p.municipality) : null,
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

    if (isPriceFilterActive) {
      const propNumPrice = prop.listing_price || parseFloat(String(prop.price || '').replace(/[^\d.]/g, ''))
      if (!isNaN(propNumPrice) && propNumPrice > 0) {
        if (propNumPrice < priceMin || propNumPrice > priceMax) {
          return false
        }
      }
    }

    return true
  })

  const totalFiltered = filteredProperties.length
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE)

  // Reset pagination when search or price filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchLocation, priceMin, priceMax, isPriceFilterActive])

  // Automatically reset expanded mode if properties drop to 4 or fewer
  useEffect(() => {
    if (totalFiltered <= FEATURED_LIMIT && isExpanded) {
      setIsExpanded(false)
      setCurrentPage(1)
    }
  }, [totalFiltered, isExpanded])

  const displayedProperties = useMemo(() => {
    if (!isExpanded) {
      return filteredProperties.slice(0, FEATURED_LIMIT)
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProperties, isExpanded, currentPage])

  const handleMinSlider = (e) => {
    setIsPriceFilterActive(true)
    const val = Math.min(Number(e.target.value), priceMax - 50)
    setPriceMin(val)
  }

  const handleMaxSlider = (e) => {
    setIsPriceFilterActive(true)
    const val = Math.max(Number(e.target.value), priceMin + 50)
    setPriceMax(val)
  }

  const handleMinInput = (val) => {
    setIsPriceFilterActive(true)
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
    setIsPriceFilterActive(true)
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

          <div className={`search-dropdown-menu ${isLocationOpen ? 'is-open' : ''}`}>
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
              value={isPriceFilterActive ? `₱${priceMin.toLocaleString()} – ₱${priceMax.toLocaleString()} / SQM` : 'Any Price (All Available)'}
              style={{ cursor: 'pointer' }}
            />
            {isPriceFilterActive && (
              <button
                type='button'
                className='search-combo-clear-btn'
                aria-label='Reset price range'
                onClick={(e) => {
                  e.stopPropagation()
                  setIsPriceFilterActive(false)
                  setPriceMin(SLIDER_MIN)
                  setPriceMax(SLIDER_MAX)
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

          <div
            className={`search-dropdown-menu price-slider-dropdown ${isPriceOpen ? 'is-open' : ''}`}
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
                    className={`price-preset-chip ${isPriceFilterActive && priceMin === 1000 && priceMax === 1600 ? 'is-active' : ''}`}
                    onClick={() => {
                      setIsPriceFilterActive(true)
                      setPriceMin(1000)
                      setPriceMax(1600)
                    }}
                  >
                    ₱1.0k - ₱1.6k
                  </button>
                  <button
                    type='button'
                    className={`price-preset-chip ${isPriceFilterActive && priceMin === 500 && priceMax === 1300 ? 'is-active' : ''}`}
                    onClick={() => {
                      setIsPriceFilterActive(true)
                      setPriceMin(500)
                      setPriceMax(1300)
                    }}
                  >
                    Under ₱1.3k
                  </button>
                  <button
                    type='button'
                    className={`price-preset-chip ${isPriceFilterActive && priceMin === 1500 && priceMax === 2500 ? 'is-active' : ''}`}
                    onClick={() => {
                      setIsPriceFilterActive(true)
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
          <span className='prop-eyebrow'>
            <span key={isExpanded ? 'all' : 'featured'} className='prop-eyebrow-text'>
              {isExpanded ? 'All Available Properties' : 'Featured Properties'}
            </span>
          </span>
          {(searchLocation || isPriceFilterActive) && (
            <div className='prop-active-filter-badge'>
              <span>Filtered: {filteredProperties.length} of {properties.length} found</span>
              <button
                type='button'
                className='prop-clear-filter-btn'
                onClick={() => {
                  setSearchLocation('')
                  setIsPriceFilterActive(false)
                  setPriceMin(SLIDER_MIN)
                  setPriceMax(SLIDER_MAX)
                }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        <div className='prop-header-row'>
          <h2>Expansive Lots and Prime Estates Ready for Your Vision</h2>
          {(totalFiltered > FEATURED_LIMIT || properties.length > FEATURED_LIMIT) && (
            <div
              className={`prop-view-toggle ${isExpanded ? 'is-all-view' : 'is-featured-view'}`}
              role='tablist'
              aria-label='Properties display mode'
            >
              <div className='prop-view-toggle-slider' aria-hidden='true' />
              <button
                type='button'
                role='tab'
                aria-selected={!isExpanded}
                className={`prop-view-pill ${!isExpanded ? 'is-active' : ''}`}
                onClick={() => {
                  setIsExpanded(false)
                  setCurrentPage(1)
                }}
              >
                <svg
                  className='prop-view-pill-icon'
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className='prop-view-pill-label'>Featured</span>
              </button>

              <button
                type='button'
                role='tab'
                aria-selected={isExpanded}
                className={`prop-view-pill ${isExpanded ? 'is-active' : ''}`}
                onClick={() => {
                  setIsExpanded(true)
                  setCurrentPage(1)
                }}
              >
                <svg
                  className='prop-view-pill-icon'
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span className='prop-view-pill-label'>All Properties</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className='prop-grid' key={`${isExpanded ? 'all' : 'featured'}-p${currentPage}`}>
        {properties.length === 0 ? (
          <div className='prop-no-results-card'>
            <svg className='prop-no-results-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h3>No Properties Currently Listed</h3>
            <p>New estate parcels and residential lots will appear here once added in the Admin Portal.</p>
          </div>
        ) : filteredProperties.length === 0 ? (
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
          displayedProperties.map((prop, idx) => (
            <div
              key={prop.id}
              className='prop-card'
              id={prop.propCardId || `prop-card-${prop.id}`}
              style={{
                backgroundImage: `url(${prop.image})`,
                '--card-index': idx,
              }}
            >
              <div
                className='prop-photo-click-area'
                role='button'
                tabIndex={0}
                aria-label={`View photo and details for ${formatLocation(prop.location)}`}
                onClick={() => onSelectPropertyModal(prop)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectPropertyModal(prop)
                  }
                }}
              />
              {(prop.badge || prop.label) && (
                <span className='prop-badge'>{prop.badge || prop.label}</span>
              )}
              <button
                type='button'
                className='prop-zoom-btn'
                aria-label={`View details for ${formatLocation(prop.location)}`}
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
                  <h3 className='prop-location'>{formatLocation(prop.location)}</h3>
                  <p className='prop-subtitle'>{prop.subtitle || prop.main_info || '\u00A0'}</p>
                  <p className='prop-specs'>{prop.specs || prop.sub_info || '\u00A0'}</p>
                </div>
                <div className='prop-footer'>
                  <div className='prop-price-row'>
                    <p className='prop-price'>{prop.price || prop.price_display}</p>
                    {prop.terms && <span className='prop-neg'>{prop.terms}</span>}
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

      {/* Pagination Guidance Controls at bottom (when expanded & multiple pages exist) */}
      {isExpanded && totalPages > 1 && (
        <div className='prop-pagination-wrap'>
          <div className='prop-pagination-bar' aria-label='Properties pagination guidance'>
            <button
              type='button'
              className='prop-page-arrow'
              aria-label='Previous page'
              disabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage((p) => p - 1)
                  const el = document.querySelector('.prop-header')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className='prop-page-numbers'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={`page-${pageNum}`}
                  type='button'
                  className={`prop-page-num ${pageNum === currentPage ? 'is-active' : ''}`}
                  onClick={() => {
                    setCurrentPage(pageNum)
                    const el = document.querySelector('.prop-header')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type='button'
              className='prop-page-arrow'
              aria-label='Next page'
              disabled={currentPage === totalPages}
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage((p) => p + 1)
                  const el = document.querySelector('.prop-header')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
