import { useState, useEffect } from 'react'

export default function Hero({ properties = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(null)
  const [leavingIndex, setLeavingIndex] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  const [expandOrigin, setExpandOrigin] = useState({
    top: '48.2%',
    right: '18.2%',
    bottom: '13.5%',
    left: '66.4%',
    originX: '75%',
    originY: '75%',
  })

  const propCount = properties.length
  const safeActiveIndex = propCount > 0 ? ((activeIndex % propCount) + propCount) % propCount : 0
  const activeProperty = propCount > 0 ? properties[safeActiveIndex] : null
  const prevProperty = prevIndex !== null && propCount > 0 ? properties[((prevIndex % propCount) + propCount) % propCount] : null

  const handleSelectProperty = (propIdx, event) => {
    if (propIdx === activeIndex) return

    if (event) {
      const card = event.currentTarget.closest('.carousel-property-card')
      const carousel = document.getElementById('carousel-property')
      if (card && carousel) {
        const cardRect = card.getBoundingClientRect()
        const carouselRect = carousel.getBoundingClientRect()
        const topPct = ((cardRect.top - carouselRect.top) / carouselRect.height) * 100
        const leftPct = ((cardRect.left - carouselRect.left) / carouselRect.width) * 100
        const rightPct = 100 - (((cardRect.right - carouselRect.left) / carouselRect.width) * 100)
        const bottomPct = 100 - (((cardRect.bottom - carouselRect.top) / carouselRect.height) * 100)

        setExpandOrigin({
          top: `${Math.max(0, topPct).toFixed(1)}%`,
          right: `${Math.max(0, rightPct).toFixed(1)}%`,
          bottom: `${Math.max(0, bottomPct).toFixed(1)}%`,
          left: `${Math.max(0, leftPct).toFixed(1)}%`,
          originX: `${(leftPct + 14).toFixed(1)}%`,
          originY: `${(topPct + 18).toFixed(1)}%`,
        })
      }
    } else {
      const topPct = 48.2
      const leftPct = 66.4
      setExpandOrigin({
        top: `${topPct}%`,
        right: '18.2%',
        bottom: '13.5%',
        left: `${leftPct}%`,
        originX: `${(leftPct + 14).toFixed(1)}%`,
        originY: `${(topPct + 18).toFixed(1)}%`,
      })
    }
    setLeavingIndex(activeIndex)
    setPrevIndex(activeIndex)
    setActiveIndex(propIdx)
  }

  // Carousel autoplay timer
  useEffect(() => {
    if (isPaused || properties.length === 0) return
    const timer = setInterval(() => {
      const nextIdx = (activeIndex + 1) % properties.length
      handleSelectProperty(nextIdx)
    }, 5000)
    return () => clearInterval(timer)
  }, [activeIndex, isPaused, properties.length])

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

  const scrollToProperties = () => {
    const target = document.getElementById('properties-page')
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
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
      {activeProperty && (
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
      )}

      <div className='home-msg' id='home-msg'>
        <h1>
          Find A Property <br />
          To Build Your Dream House
        </h1>
        <p>
          Discover prime residential lots and modern estates set in peaceful, thriving communities. <br />
          Whether you are ready to build from the ground up or move into a Forever Home, <br />
          C and J Real Estate makes every step simple, transparent, and rewarding.
        </p>
        <button className='start-btn' id='start-btn' onClick={scrollToProperties}>
          Get Started
        </button>
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

      {/* Hero Carousel */}
      <div className='carousel-property' id='carousel-property'>
        {properties.map((prop, propIdx) => {
          const slotIdx = (propIdx - safeActiveIndex + properties.length) % properties.length
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
                <span className='carousel-property-badge'>{prop.badge || prop.label || 'Clean Title'}</span>
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
                      {(prop.province || 'ESTATE').split('').map((char, i) => {
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
                    {(prop.province || 'ESTATE').split('').map((char, i) => {
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
              if (properties.length === 0) return
              const prevIdx = (safeActiveIndex - 1 + properties.length) % properties.length
              handleSelectProperty(prevIdx, e)
            }}
          >
            &#10094;
          </button>
          <div className='carousel-dots'>
            {properties.map((prop, idx) => (
              <button
                key={prop.id}
                type='button'
                className={`carousel-dot ${idx === safeActiveIndex ? 'is-active' : ''}`}
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
              if (properties.length === 0) return
              const nextIdx = (safeActiveIndex + 1) % properties.length
              handleSelectProperty(nextIdx, e)
            }}
          >
            &#10095;
          </button>
        </div>
      </div>
    </section>
  )
}
