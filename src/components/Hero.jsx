import { useState, useEffect, useMemo, useRef } from 'react'
import aboutBg from '../assets/about-bg.jpg'
import { formatLocation } from '../lib/philippineGeo'

// Helper to format vertical province letters for non-featured carousel cards
// Supports 1-column (e.g. BATAAN, PAMPANGA) and balanced 2-column (e.g. AGUSAN DEL SUR, ILOCOS SUR)
function getVerticalProvinceLetters(provinceInput) {
  const prov = String(provinceInput || 'ESTATE').trim().toUpperCase()
  const words = prov.split(/\s+/).filter(Boolean)

  if (words.length <= 1) {
    const chars = (words[0] || 'ESTATE').split('')
    const isLong = chars.length > 8
    const step = isLong ? 23 : 25
    const startY = isLong ? 24 : 30
    return {
      isTwoCol: false,
      letters: chars.map((char, i) => ({
        char,
        x: 50,
        y: startY + i * step,
      })),
    }
  }

  // Multi-word province (e.g. "AGUSAN DEL SUR", "NUEVA ECIJA", "ILOCOS SUR")
  // Col 1: First word (e.g. "AGUSAN") at x=50 to align with all other cards
  // Col 2: Remaining words joined by space (e.g. "DEL SUR", retaining the space between words)
  const col1Chars = words[0].split('')
  const col2Chars = words.slice(1).join(' ').split('')

  const maxRows = Math.max(col1Chars.length, col2Chars.length)
  const step = maxRows > 7 ? 23 : 25
  const startY = maxRows > 7 ? 24 : 30
  // Column 1 aligns at x=50 (exact alignment of the other cards in the carousel)
  const x1 = 50
  const x2 = 80

  const letters = []

  // Column 1
  col1Chars.forEach((char, row) => {
    if (char && char.trim()) {
      letters.push({
        char,
        x: x1,
        y: startY + row * step,
        col: 1,
      })
    }
  })

  // Column 2
  col2Chars.forEach((char, row) => {
    if (char && char.trim()) {
      letters.push({
        char,
        x: x2,
        y: startY + row * step,
        col: 2,
      })
    }
  })

  return {
    isTwoCol: true,
    letters,
  }
}

export default function Hero({ properties = [] }) {
  const propCount = properties.length

  // Build virtual queue for carousel display only (never touches DB):
  // When propCount >= 2, repeats items so there are at least 6 cards to keep the tray full
  const virtualQueue = useMemo(() => {
    if (propCount === 0) return []
    if (propCount === 1) {
      return [{ ...properties[0], virtualId: `${properties[0].id}-v0`, originalIndex: 0 }]
    }

    const minCards = 6
    const repeatCount = Math.max(2, Math.ceil(minCards / propCount))
    const list = []
    for (let r = 0; r < repeatCount; r++) {
      properties.forEach((p, idx) => {
        list.push({
          ...p,
          virtualId: `${p.id}-v${r}`,
          originalIndex: idx,
        })
      })
    }
    return list
  }, [properties, propCount])

  const virtualCount = virtualQueue.length

  const [activeVirtualIndex, setActiveVirtualIndex] = useState(0)
  const [prevVirtualIndex, setPrevVirtualIndex] = useState(null)
  const [leavingVirtualIndex, setLeavingVirtualIndex] = useState(null)
  const [direction, setDirection] = useState('next')
  const [isEnteringPrev, setIsEnteringPrev] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Spam protection lock & timer refs
  const isTransitioningRef = useRef(false)
  const cooldownTimerRef = useRef(null)

  const [expandOrigin, setExpandOrigin] = useState({
    top: '48.2%',
    right: '18.2%',
    bottom: '13.5%',
    left: '66.4%',
    originX: '75%',
    originY: '75%',
  })

  const safeVirtualActive = virtualCount > 0 ? ((activeVirtualIndex % virtualCount) + virtualCount) % virtualCount : 0
  const realActiveIndex = virtualQueue[safeVirtualActive]?.originalIndex ?? 0
  const activeProperty = propCount > 0 ? properties[realActiveIndex] : null

  const prevRealIndex = prevVirtualIndex !== null && virtualQueue[prevVirtualIndex]
    ? virtualQueue[prevVirtualIndex].originalIndex
    : null
  const prevProperty = prevRealIndex !== null && propCount > 0 ? properties[prevRealIndex] : null

  // Ensure active index is always valid if properties list changes
  useEffect(() => {
    if (virtualCount > 0 && activeVirtualIndex >= virtualCount) {
      setActiveVirtualIndex(0)
    }
  }, [virtualCount, activeVirtualIndex])

  // Cleanup throttle timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    }
  }, [])

  const handleSelectVirtualCard = (vIdx, event, customDir = 'next') => {
    if (isTransitioningRef.current) return
    if (vIdx === safeVirtualActive || virtualCount < 2) return

    // Lock transitions for 450ms to prevent spamming glitches
    isTransitioningRef.current = true
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    cooldownTimerRef.current = setTimeout(() => {
      isTransitioningRef.current = false
      setIsEnteringPrev(false)
    }, 450)

    setDirection(customDir)
    if (customDir === 'prev') {
      setIsEnteringPrev(true)
    } else {
      setIsEnteringPrev(false)
    }

    if (event && event.currentTarget && event.currentTarget.closest('.carousel-property-card')) {
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
      const leftPct = customDir === 'prev' ? 62.0 : 70.0
      setExpandOrigin({
        top: `${topPct}%`,
        right: '18.2%',
        bottom: '13.5%',
        left: `${leftPct}%`,
        originX: `${(leftPct + 14).toFixed(1)}%`,
        originY: `${(topPct + 18).toFixed(1)}%`,
      })
    }
    setLeavingVirtualIndex(safeVirtualActive)
    setPrevVirtualIndex(safeVirtualActive)
    setActiveVirtualIndex(vIdx)
  }

  // Carousel autoplay timer - active when 2 or more real properties exist
  useEffect(() => {
    if (isPaused || propCount < 2 || virtualCount < 2) return
    const timer = setInterval(() => {
      if (isTransitioningRef.current) return
      setDirection('next')
      setIsEnteringPrev(false)
      isTransitioningRef.current = true
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
      cooldownTimerRef.current = setTimeout(() => {
        isTransitioningRef.current = false
      }, 450)

      setActiveVirtualIndex((curr) => {
        const next = (curr + 1) % virtualCount
        setLeavingVirtualIndex(curr)
        setPrevVirtualIndex(curr)
        return next
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, propCount, virtualCount])

  const handleNext = (e) => {
    if (virtualCount < 2 || isTransitioningRef.current) return
    const nextVIdx = (safeVirtualActive + 1) % virtualCount
    handleSelectVirtualCard(nextVIdx, e, 'next')
  }

  const handlePrev = (e) => {
    if (virtualCount < 2 || isTransitioningRef.current) return
    const prevVIdx = (safeVirtualActive - 1 + virtualCount) % virtualCount
    handleSelectVirtualCard(prevVIdx, e, 'prev')
  }

  // Smart max-5 dots navigation based on real properties
  const visibleDots = useMemo(() => {
    if (propCount <= 1) return []
    if (propCount <= 5) {
      return Array.from({ length: propCount }, (_, i) => i)
    }
    // Max 5 dots: sliding window centered around realActiveIndex
    let start = realActiveIndex - 2
    if (start < 0) start = 0
    if (start > propCount - 5) start = propCount - 5
    return Array.from({ length: 5 }, (_, i) => start + i)
  }, [propCount, realActiveIndex])

  const handleSelectRealDot = (targetRealIdx, event) => {
    if (targetRealIdx === realActiveIndex || isTransitioningRef.current) return
    const dir = targetRealIdx < realActiveIndex ? 'prev' : 'next'

    let bestVIdx = safeVirtualActive
    let minDistance = Infinity

    virtualQueue.forEach((vItem, vIdx) => {
      if (vItem.originalIndex === targetRealIdx) {
        const dist = dir === 'prev'
          ? (safeVirtualActive - vIdx + virtualCount) % virtualCount
          : (vIdx - safeVirtualActive + virtualCount) % virtualCount
        if (dist > 0 && dist < minDistance) {
          minDistance = dist
          bestVIdx = vIdx
        }
      }
    })

    handleSelectVirtualCard(bestVIdx, event, dir)
  }

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
      {/* Background: Fallback to aboutBg if 0 properties, otherwise activeProperty image */}
      {!activeProperty && (
        <img
          className='background-img'
          src={aboutBg}
          alt='C and J Real Estate'
        />
      )}
      {prevProperty && (
        <img
          key={`prev-${prevProperty.id}-${prevVirtualIndex}`}
          className='background-img background-img-prev'
          src={prevProperty.image}
          alt=''
          aria-hidden='true'
        />
      )}
      {activeProperty && (
        <img
          key={`active-${activeProperty.id}-${safeVirtualActive}`}
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
          alt={formatLocation(activeProperty.location)}
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

      {/* Hero Carousel: Rendered whenever 1 or more properties exist */}
      {propCount >= 1 && (
        <div className='carousel-property' id='carousel-property'>
          {virtualQueue.map((vCard, vIdx) => {
            const slotIdx = (vIdx - safeVirtualActive + virtualCount) % virtualCount
            const isFeatured = slotIdx === 0
            const isLeaving = direction === 'next' && vIdx === leavingVirtualIndex && !isFeatured
            const isSlotHidden = slotIdx >= 4

            let slotClass = 'carousel-property-card'
            if (isFeatured) {
              slotClass += ' is-featured'
              if (isEnteringPrev) {
                slotClass += ' is-entering-prev'
              }
            } else {
              slotClass += ' is-side'
              if (isLeaving) slotClass += ' is-leaving'
              if (isSlotHidden) slotClass += ' is-slot-hidden'
            }

            return (
              <div
                key={vCard.virtualId}
                id={vCard.virtualId}
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
                    const target = document.getElementById(vCard.propCardId) || document.getElementById('properties-page')
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                  } else {
                    handleSelectVirtualCard(vIdx, e, 'next')
                  }
                }}
              >
                <div className='carousel-property-info'>
                  {(vCard.badge || vCard.label) && (
                    <span className='carousel-property-badge'>{vCard.badge || vCard.label}</span>
                  )}
                  <h4>{formatLocation(vCard.location)}</h4>
                  <hr className='carousel-property-line' />
                  <div className='carousel-property-footer'>
                    <button
                      type='button'
                      className='carousel-property-btn'
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsPaused(false)
                        const target = document.getElementById(vCard.propCardId) || document.getElementById('properties-page')
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
                    src={vCard.image}
                    alt={formatLocation(vCard.location)}
                  />
                  {(() => {
                    const rawProvince = vCard.province || (vCard.location ? vCard.location.split(',').pop().trim() : 'ESTATE')
                    const lettersData = getVerticalProvinceLetters(rawProvince)
                    return (
                      <svg
                        className='carousel-vertical-svg'
                        viewBox='0 0 215 260'
                        preserveAspectRatio='xMidYMid slice'
                        aria-hidden='true'
                      >
                        <defs>
                          <clipPath id={`text-clip-${vCard.virtualId}`}>
                            {lettersData.letters.map((item, i) => (
                              <text
                                key={i}
                                x={item.x}
                                y={item.y}
                                textAnchor='middle'
                                dominantBaseline='central'
                                className='carousel-clip-letter'
                              >
                                {item.char}
                              </text>
                            ))}
                          </clipPath>
                        </defs>
                        <image
                          className='carousel-clip-image'
                          href={vCard.image}
                          width='215'
                          height='260'
                          preserveAspectRatio='xMidYMid slice'
                          clipPath={`url(#text-clip-${vCard.virtualId})`}
                        />
                        <g className='carousel-hover-letters'>
                          {lettersData.letters.map((item, i) => (
                            <text
                              key={i}
                              x={item.x}
                              y={item.y}
                              textAnchor='middle'
                              dominantBaseline='central'
                              className='carousel-hover-letter'
                            >
                              {item.char}
                            </text>
                          ))}
                        </g>
                      </svg>
                    )
                  })()}
                </div>
              </div>
            )
          })}

          {propCount >= 2 && (
            <div className='carousel-nav' aria-label='Property carousel controls'>
              <button
                type='button'
                className='carousel-arrow'
                aria-label='Previous property'
                onClick={handlePrev}
              >
                &#10094;
              </button>
              <div className='carousel-dots'>
                {visibleDots.map((realIdx) => (
                  <button
                    key={`dot-${realIdx}`}
                    type='button'
                    className={`carousel-dot ${realIdx === realActiveIndex ? 'is-active' : ''}`}
                    aria-label={`Select property ${realIdx + 1}`}
                    onClick={(e) => handleSelectRealDot(realIdx, e)}
                  />
                ))}
              </div>
              <button
                type='button'
                className='carousel-arrow'
                aria-label='Next property'
                onClick={handleNext}
              >
                &#10095;
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
