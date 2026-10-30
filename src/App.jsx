import { useState, useEffect, useRef } from 'react'
import aboutBg from './assets/about-bg.jpg'
import property1 from './assets/property1.jpg'
import property2 from './assets/property2.png'
import property3 from './assets/property3.jpg'
import property4 from './assets/property4.jpg'
import './App.css'

const LOCATION_OPTIONS = [
  'Bodega, Dinalupihan, Bataan',
  'San Simon, Dinalupihan, Bataan',
  'Sepung Bulaon, Porac, Pampanga',
  'Pulong Santol, Porac, Pampanga',
  'Dinalupihan, Bataan',
  'Porac, Pampanga',
]

const SLIDER_MIN = 500
const SLIDER_MAX = 2500

const PROPERTIES = [
  {
    id: 'carousel-property-1',
    propCardId: 'prop-card-1',
    image: property1,
    province: 'BATAAN',
    badge: 'Clean Title',
    location: 'Bodega, Dinalupihan, Bataan',
    subtitle: '2.9 Hectares • 29,870 SQM',
    specs: '197.7m Length × 150m Width • 6 Meters Roadwide',
    price: '₱1,000.00 / SQM',
  },
  {
    id: 'carousel-property-2',
    propCardId: 'prop-card-2',
    image: property2,
    province: 'BATAAN',
    badge: 'Clean Title',
    location: 'San Simon, Dinalupihan, Bataan',
    subtitle: '2.85 Hectares • 28,500 SQM',
    specs: '193.7m W × 150m L • 70 SQM Resthouse and 500 SQM Fishpond',
    price: '₱1,300.00 / SQM',
  },
  {
    id: 'carousel-property-3',
    propCardId: 'prop-card-3',
    image: property3,
    province: 'PAMPANGA',
    badge: 'Clean Title',
    location: 'Sepung Bulaon, Porac, Pampanga',
    subtitle: '2.8 Hectares • 28,083 SQM',
    specs: '156m Width × 123m Length • 8–10 Meters Roadwide',
    price: '₱1,600.00 / SQM',
  },
  {
    id: 'carousel-property-4',
    propCardId: 'prop-card-4',
    image: property4,
    province: 'PAMPANGA',
    badge: 'Clean Title',
    location: 'Pulong Santol, Porac, Pampanga',
    subtitle: '10 Hectares • 101,618 SQM',
    specs: '90m W × 1.2km L • Near San Basilio School',
    price: '₱1,500.00 / SQM',
  },
]

function App() {
  const [activeIndex, setActiveIndex] = useState(1)
  const [prevIndex, setPrevIndex] = useState(null)
  const [leavingIndex, setLeavingIndex] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [modalProperty, setModalProperty] = useState(null)
  const [inquiredProperties, setInquiredProperties] = useState([PROPERTIES[0].id])
  const [isAddingMore, setIsAddingMore] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    message: '',
  })
  const [footerMsgForm, setFooterMsgForm] = useState({
    name: '',
    email: '',
    inquiry: '',
  })
  const [footerMsgSent, setFooterMsgSent] = useState(false)
  const [submittedStatus, setSubmittedStatus] = useState(false)
  const [isScrolledNavVisible, setIsScrolledNavVisible] = useState(false)
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

  const filteredLocationOptions = LOCATION_OPTIONS.filter((loc) =>
    loc.toLowerCase().includes(searchLocation.trim().toLowerCase())
  )

  const filteredProperties = PROPERTIES.filter((prop) => {
    const locTerm = searchLocation.trim().toLowerCase()
    if (locTerm) {
      const locMatch =
        prop.location.toLowerCase().includes(locTerm) ||
        prop.province.toLowerCase().includes(locTerm) ||
        prop.specs.toLowerCase().includes(locTerm)
      if (!locMatch) return false
    }

    const propNumPrice = parseFloat(prop.price.replace(/[^\d.]/g, ''))
    if (!isNaN(propNumPrice)) {
      if (propNumPrice < priceMin || propNumPrice > priceMax) {
        return false
      }
    }

    return true
  })
  const [expandOrigin, setExpandOrigin] = useState({
    top: '48.2%',
    right: '18.2%',
    bottom: '13.5%',
    left: '66.4%',
    originX: '75%',
    originY: '75%',
  })
  const activeProperty = PROPERTIES[activeIndex]
  const prevProperty = prevIndex !== null ? PROPERTIES[prevIndex] : null

  const handleInquireProperty = (prop) => {
    setInquiredProperties((prev) => {
      if (prev.includes(prop.id)) return prev
      return [...prev, prop.id]
    })
    setModalProperty(null)
    const target = document.getElementById('contact-page')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleRemoveInquired = (propId) => {
    setInquiredProperties((prev) => prev.filter((id) => id !== propId))
  }

  const handleToggleAddProperty = (propId) => {
    setInquiredProperties((prev) => {
      if (prev.includes(propId)) {
        return prev.filter((id) => id !== propId)
      } else {
        return [...prev, propId]
      }
    })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setSubmittedStatus(true)
    setTimeout(() => {
      setSubmittedStatus(false)
      setContactForm({
        name: '',
        email: '',
        contactNumber: '',
        message: '',
      })
    }, 4500)
  }

  const handleFooterMsgSubmit = (e) => {
    e.preventDefault()
    setFooterMsgSent(true)
    setTimeout(() => {
      setFooterMsgSent(false)
      setFooterMsgForm({
        name: '',
        email: '',
        inquiry: '',
      })
    }, 4000)
  }

  const handleSelectProperty = (propIdx) => {
    if (propIdx === activeIndex) return
    const carouselEl = document.getElementById('carousel-property')
    const heroSection = document.getElementById('home-page')
    if (carouselEl && heroSection) {
      const carouselRect = carouselEl.getBoundingClientRect()
      const heroRect = heroSection.getBoundingClientRect()
      const cardLeft = carouselRect.left + 24
      const cardTop = carouselRect.top + 28
      const cardWidth = 215
      const cardHeight = carouselRect.height - 120
      const topPct = Math.max(0, ((cardTop - heroRect.top) / heroRect.height) * 100)
      const leftPct = Math.max(0, ((cardLeft - heroRect.left) / heroRect.width) * 100)
      const rightPct = Math.max(0, ((heroRect.right - (cardLeft + cardWidth)) / heroRect.width) * 100)
      const bottomPct = Math.max(0, ((heroRect.bottom - (cardTop + cardHeight)) / heroRect.height) * 100)
      setExpandOrigin({
        top: `${topPct.toFixed(2)}%`,
        right: `${rightPct.toFixed(2)}%`,
        bottom: `${bottomPct.toFixed(2)}%`,
        left: `${leftPct.toFixed(2)}%`,
        originX: `${(leftPct + 7).toFixed(1)}%`,
        originY: `${(topPct + 18).toFixed(1)}%`,
      })
    }
    setLeavingIndex(activeIndex)
    setPrevIndex(activeIndex)
    setActiveIndex(propIdx)
  }

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      const nextIdx = (activeIndex + 1) % PROPERTIES.length
      handleSelectProperty(nextIdx)
    }, 5000)
    return () => clearInterval(timer)
  }, [activeIndex, isPaused])

  useEffect(() => {
    const handleScroll = () => {
      // Floating nav visibility toggle
      if (window.scrollY > 90) {
        setIsScrolledNavVisible(true)
      } else {
        setIsScrolledNavVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((centerY - y) / centerY) * 4.5
    const rotateY = ((x - centerX) / centerX) * 4.5
    card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`)
    card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`)
    card.classList.add('is-tilting')
  }

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget
    card.classList.remove('is-tilting')
    card.style.setProperty('--tilt-x', '0deg')
    card.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <>
      {/* Floating Glassmorphic Top Nav when original nav is scrolled away */}
      <nav
        className={`floating-glass-nav ${isScrolledNavVisible ? 'is-visible' : ''}`}
        aria-label='Floating Navigation'
      >
        <div className='floating-glass-inner'>
          <a href='#home-page' className='floating-logo-link'>
            <div className='title floating-nav-title'>
              <h3>C</h3>
              <h3 className='rotate-title'>AND</h3>
              <h3>J</h3>
              <div className='mix-font'>
                <h3>R</h3>
                <h3>eal Est.</h3>
              </div>
            </div>
          </a>
          <div className='floating-nav-links'>
            <a href="#home-page">Home</a>
            <a href="#abt-page">About Us</a>
            <a href="#properties-page">Properties</a>
            <a href="#contact-page">Contact Us</a>
          </div>
        </div>
      </nav>

      <div className='hero-shell'>
        <header>
          <div className='title' id='title'>
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
          <div className='nav-trapezoid' id='nav-trapezoid'>
            <nav className='navbar' id='navbar'>
              <a href="#home-page">Home</a>
              <a href="#abt-page">About Us</a>
              <a href="#properties-page">Properties</a>
              <a href="#contact-page">Contact Us</a>
            </nav>
          </div>
          <button className='property-btn' id='property-btn'>
            <svg className='btn-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            Find a Property
          </button>
        </header>
        <section className='home-page' id='home-page'>
          {prevProperty && (
            <img
              key={`prev-${prevProperty.id}`}
              className='background-img background-img-prev'
              src={prevProperty.image}
              alt=''
              aria-hidden='true'
            />
          )}
          <img
            key={`active-${activeProperty.id}`}
            className={`background-img ${prevProperty ? 'is-expanding' : ''}`}
            style={{
              '--clip-top': expandOrigin.top,
              '--clip-right': expandOrigin.right,
              '--clip-bottom': expandOrigin.bottom,
              '--clip-left': expandOrigin.left,
              '--origin-x': expandOrigin.originX,
              '--origin-y': expandOrigin.originY,
            }}
            src={activeProperty.image}
            alt={activeProperty.location}
          />
          <div className='home-msg' id='home-msg'>
            <h1>Find A Property <br />
              To Build Your Dream House</h1>
            <p>Discover prime residential lots and modern estates set in peaceful, thriving communities. <br />
              Whether you are ready to build from the ground up or move into a Forever Home, <br />
              C and J Real Estate makes every step simple, transparent, and rewarding.</p>
            <button className='start-btn' id='start-btn'>Get Started</button>
          </div>
          <div className='abt-icons' id='abt-icons'>
            <div className='icon'>
              <svg className='icon-svg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5 9v11h14V9" />
                <path d="M9 20v-6h6v6" />
              </svg>
              <div className='icon-text'>
                <h3>Quality Estates</h3>
                <p>Ready-to-build residential lots and durable modern homes crafted for family comfort.</p>
              </div>
            </div>
            <div className='icon'>
              <svg className='icon-svg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <div className='icon-text'>
                <h3>Prime Locations</h3>
                <p>Safe, accessible communities close to schools, markets, and daily essentials.</p>
              </div>
            </div>
            <div className='icon'>
              <svg className='icon-svg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <div className='icon-text'>
                <h3>Trusted Ownership</h3>
                <p>Verified clean titles, transparent pricing, and guided hassle-free turn-over.</p>
              </div>
            </div>
          </div>
          <div className='carousel-property' id='carousel-property'>
            {PROPERTIES.map((prop, propIdx) => {
              const slotIdx = (propIdx - activeIndex + PROPERTIES.length) % PROPERTIES.length
              const isFeatured = slotIdx === 0
              const isLeaving = propIdx === leavingIndex && !isFeatured
              const slotClass = isFeatured
                ? 'carousel-property-card is-featured'
                : `carousel-property-card is-side ${isLeaving ? 'is-leaving' : ''}`

              return (
                <div
                  key={prop.id}
                  id={prop.id}
                  className={slotClass}
                  style={{ '--slot': slotIdx }}
                  onMouseEnter={() => {
                    if (isFeatured) setIsPaused(true)
                  }}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={(e) => {
                    if (isFeatured) setIsPaused(false)
                    handleCardMouseLeave(e)
                  }}
                  onClick={(e) => {
                    setIsPaused(false)
                    handleCardMouseLeave(e)
                    if (isFeatured) {
                      const target = document.getElementById(prop.propCardId) || document.getElementById('properties-page')
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    } else {
                      handleSelectProperty(propIdx, e)
                    }
                  }}
                >
                  <div className='carousel-property-info'>
                    <span className='carousel-property-badge'>{prop.badge}</span>
                    <h4>{prop.location}</h4>
                    <hr className='carousel-property-line' />
                    <div className='carousel-property-footer'>
                      <button
                        type='button'
                        className='carousel-property-btn'
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsPaused(false)
                          const target = document.getElementById(prop.propCardId) || document.getElementById('properties-page')
                          if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className='carousel-property-media'>
                    <img
                      className='carousel-property-img'
                      src={prop.image}
                      alt={prop.location}
                    />
                    <svg
                      className='carousel-vertical-svg'
                      viewBox='0 0 215 260'
                      preserveAspectRatio='xMidYMid slice'
                      aria-hidden='true'
                    >
                      <defs>
                        <clipPath id={`text-clip-${prop.id}`}>
                          {prop.province.split('').map((char, i) => {
                            const step = 25
                            const startY = 30
                            return (
                              <text
                                key={i}
                                x='50'
                                y={startY + i * step}
                                textAnchor='middle'
                                dominantBaseline='central'
                                className='carousel-clip-letter'
                              >
                                {char}
                              </text>
                            )
                          })}
                        </clipPath>
                      </defs>
                      <image
                        className='carousel-clip-image'
                        href={prop.image}
                        width='215'
                        height='260'
                        preserveAspectRatio='xMidYMid slice'
                        clipPath={`url(#text-clip-${prop.id})`}
                      />
                      <g className='carousel-hover-letters'>
                        {prop.province.split('').map((char, i) => {
                          const step = 25
                          const startY = 30
                          return (
                            <text
                              key={i}
                              x='50'
                              y={startY + i * step}
                              textAnchor='middle'
                              dominantBaseline='central'
                              className='carousel-hover-letter'
                            >
                              {char}
                            </text>
                          )
                        })}
                      </g>
                    </svg>
                  </div>
                </div>
              )
            })}
            <div className='carousel-nav' aria-label='Property carousel controls'>
              <button
                type='button'
                className='carousel-arrow'
                aria-label='Previous property'
                onClick={(e) => {
                  const prevIdx = (activeIndex - 1 + PROPERTIES.length) % PROPERTIES.length
                  handleSelectProperty(prevIdx, e)
                }}
              >
                &#10094;
              </button>
              <div className='carousel-dots'>
                {PROPERTIES.map((prop, idx) => (
                  <button
                    key={prop.id}
                    type='button'
                    className={`carousel-dot ${idx === activeIndex ? 'is-active' : ''}`}
                    aria-label={`Select property ${idx + 1}`}
                    onClick={(e) => handleSelectProperty(idx, e)}
                  />
                ))}
              </div>
              <button
                type='button'
                className='carousel-arrow'
                aria-label='Next property'
                onClick={(e) => {
                  const nextIdx = (activeIndex + 1) % PROPERTIES.length
                  handleSelectProperty(nextIdx, e)
                }}
              >
                &#10095;
              </button>
            </div>
          </div>
        </section>
      </div>
      <main>
        <section
          className='abt-page'
          id='abt-page'
          style={{ backgroundImage: `url(${aboutBg})` }}
        >
          <div className='abt-layout'>
            <div className='abt-msg'>
              <div className='abt-msg-header'>
                <span className='abt-tag'>About Us</span>
                <h2>Crafting Spaces You Are Proud to Call Home</h2>
              </div>
              <p className='abt-lead'>
                At C and J Real Estate, we turn the search for your dream property into a seamless experience. We curate quality residential estates and vast prime parcels across Central Luzon—combining strategic locations, pristine titles, and honest guidance so your family can build lasting legacies.
              </p>
              <div className='abt-stats-row'>
                <div className='abt-stat-item'>
                  <span className='abt-stat-val'>18+</span>
                  <span className='abt-stat-lbl'>Hectares Curated</span>
                </div>
                <div className='abt-stat-divider'></div>
                <div className='abt-stat-item'>
                  <span className='abt-stat-val'>100%</span>
                  <span className='abt-stat-lbl'>Clean Titles</span>
                </div>
                <div className='abt-stat-divider'></div>
                <div className='abt-stat-item'>
                  <span className='abt-stat-val'>2</span>
                  <span className='abt-stat-lbl'>Key Provinces</span>
                </div>
              </div>
            </div>

            <div className='abt-facts-container'>
              <div className='abt-facts-list'>
                <div className='abt-fact-card'>
                  <div className='abt-fact-num'>
                    <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="m9 15 2 2 4-4" />
                    </svg>
                  </div>
                  <div className='abt-fact-content'>
                    <h4>Title Verification and Due Diligence</h4>
                    <p>Comprehensive title checks, Registry of Deeds validation, and tax clearance to ensure 100% clean, risk-free ownership before you commit.</p>
                  </div>
                </div>

                <div className='abt-fact-card'>
                  <div className='abt-fact-num'>
                    <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                      <line x1="9" y1="3" x2="9" y2="18" />
                      <line x1="15" y1="6" x2="15" y2="21" />
                    </svg>
                  </div>
                  <div className='abt-fact-content'>
                    <h4>Prime Estate and Land Acquisition</h4>
                    <p>Exclusive access to expansive agricultural, commercial, and residential parcels spanning Central Luzon’s fastest-growing corridors.</p>
                  </div>
                </div>

                <div className='abt-fact-card'>
                  <div className='abt-fact-num'>
                    <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="m9 16 2 2 4-4" />
                    </svg>
                  </div>
                  <div className='abt-fact-content'>
                    <h4>Guided Property Inspections and Site Visits</h4>
                    <p>Personalized on-ground walkthroughs, boundary line verifications, and road accessibility checks facilitated by knowledgeable local specialists.</p>
                  </div>
                </div>

                <div className='abt-fact-card'>
                  <div className='abt-fact-num'>
                    <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className='abt-fact-content'>
                    <h4>Flexible Financing and Direct Negotiations</h4>
                    <p>Tailored payment terms, transparent per-square-meter direct landowner pricing, and assistance in securing workable payment milestones.</p>
                  </div>
                </div>

                <div className='abt-fact-card'>
                  <div className='abt-fact-num'>
                    <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <polyline points="16 11 18 13 22 9" />
                    </svg>
                  </div>
                  <div className='abt-fact-content'>
                    <h4>End-to-End Transfer and Documentation</h4>
                    <p>Full support handling notarized Deeds of Absolute Sale, Bureau of Internal Revenue (BIR) processing, transfer taxes, and certificate issuance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className='properties-page' id='properties-page'>
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

                  {/* Bottom: Inputs from min here to max here */}
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

          <div className='prop-header'>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className='prop-eyebrow'>Featured Properties</span>
              {(searchLocation || priceMin > 1000 || priceMax < 1600) && (
                <div className='prop-active-filter-badge'>
                  <span>Filtered: {filteredProperties.length} of {PROPERTIES.length} found</span>
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

          <div className='prop-grid'>
            {filteredProperties.length === 0 ? (
              <div className='prop-no-results-card'>
                <svg className='prop-no-results-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <h3>No properties found matching your search</h3>
                <p>Try searching for a different town (e.g. "Dinalupihan", "Porac"), or reset the price filter.</p>
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
                id={prop.propCardId}
                style={{ backgroundImage: `url(${prop.image})` }}
              >
                <div
                  className='prop-photo-click-area'
                  role='button'
                  tabIndex={0}
                  aria-label={`View photo and details for ${prop.location}`}
                  onClick={() => setModalProperty(prop)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setModalProperty(prop)
                    }
                  }}
                />
                <span className='prop-badge'>{prop.badge}</span>
                <button
                  type='button'
                  className='prop-zoom-btn'
                  aria-label={`View details for ${prop.location}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setModalProperty(prop)
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
                    <p className='prop-subtitle'>{prop.subtitle}</p>
                    <p className='prop-specs'>{prop.specs}</p>
                  </div>
                  <div className='prop-footer'>
                    <div className='prop-price-row'>
                      <p className='prop-price'>{prop.price}</p>
                      <span className='prop-neg'>Negotiable</span>
                    </div>
                    <button
                      className='prop-card-btn'
                      type='button'
                      onClick={() => handleInquireProperty(prop)}
                    >
                      Inquire Now
                    </button>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </section>

        <section
          className='contact-section'
          id='contact-page'
          style={{ backgroundImage: `url(${aboutBg})` }}
        >
          <div className='contact-page-inner'>
            <div className='contact-header'>
              <span className='contact-eyebrow'>Direct Inquiry and Consultation</span>
              <h2>Let Us Assist You with Your Property Acquisition</h2>
              <p className='contact-desc'>
                Connect with our land specialists. Review the properties you are interested in below or add more listings before sending your inquiry.
              </p>
            </div>

            <div className='contact-grid'>
              {/* Left Column: Interested Properties & Add More */}
              <div className='contact-props-col'>
                <div className='contact-col-header'>
                  <div>
                    <h3 className='contact-col-title'>Interested Properties</h3>
                    <span className='contact-count-badge'>
                      {inquiredProperties.length} selected
                    </span>
                  </div>
                  <button
                    type='button'
                    className='contact-add-prop-btn'
                    onClick={() => setIsAddingMore((prev) => !prev)}
                  >
                    {isAddingMore ? 'Done Adding' : '+ Add Property'}
                  </button>
                </div>

                {/* Inquired Cards List */}
                {inquiredProperties.length === 0 ? (
                  <div className='contact-empty-state'>
                    <p>No properties selected yet.</p>
                    <button
                      type='button'
                      className='contact-browse-btn'
                      onClick={() => {
                        const el = document.getElementById('properties-page')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Browse Featured Properties ↑
                    </button>
                  </div>
                ) : (
                  <div className='contact-selected-list'>
                    {inquiredProperties.map((propId) => {
                      const item = PROPERTIES.find((p) => p.id === propId)
                      if (!item) return null
                      return (
                        <div
                          key={item.id}
                          className='contact-prop-card'
                          style={{ backgroundImage: `url(${item.image})` }}
                        >
                          <div className='contact-prop-overlay' />
                          <div className='contact-prop-details'>
                            <span className='contact-prop-badge'>{item.badge}</span>
                            <h4 className='contact-prop-loc'>{item.location}</h4>
                            <p className='contact-prop-specs'>{item.specs}</p>
                            <div className='contact-prop-divider' />
                            <span className='contact-prop-price'>{item.price}</span>
                          </div>
                          <button
                            type='button'
                            className='contact-prop-remove-btn'
                            title='Remove property'
                            aria-label={`Remove ${item.location}`}
                            onClick={() => handleRemoveInquired(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Picker Drawer with smooth collapsible transition */}
                <div className={`contact-drawer-collapse ${isAddingMore ? 'is-open' : ''}`}>
                  <div className='contact-add-drawer'>
                    <div className='contact-drawer-header'>
                      <h4>Select Additional Properties</h4>
                      <span className='contact-drawer-note'>Click to toggle</span>
                    </div>
                    <div className='contact-drawer-grid'>
                      {PROPERTIES.map((prop) => {
                        const isSelected = inquiredProperties.includes(prop.id)
                        return (
                          <div
                            key={prop.id}
                            className={`contact-drawer-item ${isSelected ? 'is-picked' : ''}`}
                            onClick={() => handleToggleAddProperty(prop.id)}
                          >
                            <img src={prop.image} alt={prop.location} />
                            <div className='contact-drawer-item-info'>
                              <p className='contact-drawer-title'>{prop.location}</p>
                              <span className='contact-drawer-price'>{prop.price}</span>
                            </div>
                            <span className={`contact-drawer-check ${isSelected ? 'checked' : ''}`}>
                              {isSelected ? '✓' : '+'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry Form */}
              <div className='contact-form-col'>
                <form className='contact-form-card' onSubmit={handleFormSubmit}>
                  <div className='contact-form-heading'>
                    <h3>Send Inquiry</h3>
                    <p>Fill out the details below and our team will get back to you promptly.</p>
                  </div>

                  {submittedStatus && (
                    <div className='contact-alert-success'>
                      ✓ Your inquiry for {inquiredProperties.length} property(s) has been submitted! Our representative will call or email you soon.
                    </div>
                  )}

                  <div className='contact-form-group'>
                    <label htmlFor='contact-name'>Full Name</label>
                    <input
                      id='contact-name'
                      type='text'
                      name='name'
                      placeholder='e.g. Maria Santos'
                      required
                      value={contactForm.name}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className='contact-form-group'>
                    <label htmlFor='contact-email'>Email Address</label>
                    <input
                      id='contact-email'
                      type='email'
                      name='email'
                      placeholder='e.g. maria.santos@gmail.com'
                      required
                      value={contactForm.email}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className='contact-form-group'>
                    <label htmlFor='contact-phone'>Contact Number</label>
                    <input
                      id='contact-phone'
                      type='tel'
                      name='contactNumber'
                      placeholder='e.g. +63 917 123 4567'
                      required
                      value={contactForm.contactNumber}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className='contact-form-group'>
                    <label htmlFor='contact-message'>Short Message</label>
                    <textarea
                      id='contact-message'
                      name='message'
                      rows={4}
                      placeholder='Tell us your preferred schedule for site viewing, questions regarding titles, or payment inquiries...'
                      value={contactForm.message}
                      onChange={handleFormChange}
                    />
                  </div>

                  {inquiredProperties.length > 0 && (
                    <button
                      type='submit'
                      className='contact-submit-btn'
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className='contact-send-icon'
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span>Submit Inquiry</span>
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className='site-footer'>
        <div className='footer-inner'>
          {/* Column 1: Logo & Brand Description */}
          <div className='footer-col footer-col-brand'>
            <div className='footer-logo-wrap'>
              <div className='title footer-title'>
                <h3>C</h3>
                <h3 className='rotate-title'>AND</h3>
                <h3>J</h3>
                <div className='mix-font'>
                  <h3>R</h3>
                  <h3>eal Est.</h3>
                </div>
              </div>
            </div>
            <p className='footer-brand-desc'>
              C and J Real Estate specializes in verified clean-titled agricultural, residential, and commercial estates across Central Luzon. We guide families and investors with honesty, seamless documentation, and reliable property acquisition.
            </p>
            <p className='footer-copyright'>
              © {new Date().getFullYear()} C and J Real Estate. All rights reserved.
            </p>
          </div>

          {/* Column 2: Message Us Form */}
          <div className='footer-col footer-col-message'>
            <h4 className='footer-heading'>Message Us</h4>
            {footerMsgSent && (
              <div className='footer-success-msg'>
                ✓ Message sent! We will get back to you shortly.
              </div>
            )}
            <form className='footer-form' onSubmit={handleFooterMsgSubmit}>
              <div className='footer-field'>
                <input
                  type='text'
                  placeholder='Your Name'
                  required
                  value={footerMsgForm.name}
                  onChange={(e) => setFooterMsgForm({ ...footerMsgForm, name: e.target.value })}
                />
              </div>
              <div className='footer-field'>
                <input
                  type='email'
                  placeholder='Email'
                  required
                  value={footerMsgForm.email}
                  onChange={(e) => setFooterMsgForm({ ...footerMsgForm, email: e.target.value })}
                />
              </div>
              <div className='footer-field'>
                <textarea
                  placeholder='Your Inquiry...'
                  rows={3}
                  required
                  value={footerMsgForm.inquiry}
                  onChange={(e) => setFooterMsgForm({ ...footerMsgForm, inquiry: e.target.value })}
                />
              </div>
              <button type='submit' className='footer-send-btn'>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className='footer-send-icon'
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send
              </button>
            </form>
          </div>

          {/* Column 3: Contact Us Details */}
          <div className='footer-col footer-col-contact'>
            <h4 className='footer-heading'>Contact Us</h4>
            <div className='footer-contact-list'>
              <div className='footer-contact-item'>
                <span className='footer-contact-lbl'>Contact Info</span>
                <a href='tel:09123456789' className='footer-contact-val'>
                  0912 345 6789
                </a>
              </div>

              <div className='footer-contact-item'>
                <span className='footer-contact-lbl'>Gmail</span>
                <a href='mailto:examplename@gmail.com' className='footer-contact-val'>
                  examplename@gmail.com
                </a>
              </div>

              <div className='footer-contact-item'>
                <span className='footer-contact-lbl'>Facebook Page</span>
                <a
                  href='https://www.facebook.com/profile.php?id=61560461644567'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='footer-contact-link'
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className='footer-fb-icon'
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Visit C and J Real Estate on Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {modalProperty && (
        <div className='prop-modal-overlay' onClick={() => setModalProperty(null)}>
          <div
            className='prop-modal-card'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-title'
          >
            <button
              type='button'
              className='prop-modal-close'
              aria-label='Close modal'
              onClick={() => setModalProperty(null)}
            >
              ✕
            </button>
            <div className='prop-modal-grid'>
              <div className='prop-modal-pic-col'>
                <img
                  className='prop-modal-img'
                  src={modalProperty.image}
                  alt={modalProperty.location}
                />
                <span className='prop-modal-badge'>{modalProperty.badge}</span>
                <span className='prop-modal-province'>{modalProperty.province}</span>
              </div>
              <div className='prop-modal-info-col'>
                <div className='prop-modal-header'>
                  <span className='prop-modal-eyebrow'>Property Overview</span>
                  <h3 id='modal-title'>{modalProperty.location}</h3>
                  <p className='prop-modal-sub'>{modalProperty.subtitle}</p>
                </div>

                <div className='prop-modal-specs-box'>
                  <h4>Dimensions and Features</h4>
                  <p>{modalProperty.specs}</p>
                </div>

                <div className='prop-modal-highlights'>
                  <div className='prop-modal-chip'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    Clean Title Verified
                  </div>
                  <div className='prop-modal-chip'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    </svg>
                    Wide Road Access
                  </div>
                  <div className='prop-modal-chip'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Direct Owner Negotiation
                  </div>
                </div>

                <div className='prop-modal-price-box'>
                  <div className='prop-modal-price-details'>
                    <span className='prop-modal-price-label'>Listing Price</span>
                    <span className='prop-modal-price-val'>{modalProperty.price}</span>
                  </div>
                  <span className='prop-modal-neg'>Terms Negotiable</span>
                </div>

                <div className='prop-modal-actions'>
                  <button
                    type='button'
                    className='prop-modal-btn-primary'
                    onClick={() => handleInquireProperty(modalProperty)}
                  >
                    Inquire About This Property
                  </button>
                  <button
                    type='button'
                    className='prop-modal-btn-secondary'
                    onClick={() => setModalProperty(null)}
                  >
                    Back to Listings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
