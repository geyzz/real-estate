import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isScrolledNavVisible, setIsScrolledNavVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 90) {
        setIsScrolledNavVisible(true)
      } else {
        setIsScrolledNavVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile drawer on Escape key or resize > 900px
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    const handleResize = () => {
      if (window.innerWidth > 1080) setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scrollToProperties = () => {
    setMobileMenuOpen(false)
    const target = document.getElementById('properties-page')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Floating Glassmorphic Top Nav when original nav is scrolled away */}
      <nav
        className={`floating-glass-nav ${isScrolledNavVisible ? 'is-visible' : ''}`}
        aria-label='Floating Navigation'
      >
        <div className='floating-glass-inner'>
          <a href='#home-page' className='floating-logo-link' onClick={handleNavClick}>
            <div className='title floating-nav-title' id='title'>
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
          </a>
          <div className='floating-nav-links'>
            <a href="#home-page" onClick={handleNavClick}>Home</a>
            <a href="#abt-page" onClick={handleNavClick}>About Us</a>
            <a href="#properties-page" onClick={handleNavClick}>Properties</a>
            <a href="#contact-page" onClick={handleNavClick}>Contact Us</a>
          </div>
          <button
            className='floating-mobile-toggle'
            aria-label='Toggle mobile navigation'
            type='button'
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

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
        <button
          className='property-btn'
          id='property-btn'
          type='button'
          onClick={scrollToProperties}
        >
          <svg className='btn-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Find a Property
        </button>

        {/* Mobile Hamburger Button */}
        <button
          className='mobile-nav-toggle'
          aria-label='Toggle mobile menu'
          type='button'
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? 'is-open' : ''}`} />
          <span className={`hamburger-bar ${mobileMenuOpen ? 'is-open' : ''}`} />
          <span className={`hamburger-bar ${mobileMenuOpen ? 'is-open' : ''}`} />
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className='mobile-nav-links'>
          <a href="#home-page" onClick={handleNavClick}>Home</a>
          <a href="#abt-page" onClick={handleNavClick}>About Us</a>
          <a href="#properties-page" onClick={handleNavClick}>Properties</a>
          <a href="#contact-page" onClick={handleNavClick}>Contact Us</a>
        </div>
        <button
          className='mobile-nav-cta'
          type='button'
          onClick={scrollToProperties}
        >
          <svg className='btn-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Find a Property
        </button>
      </div>
      {mobileMenuOpen && (
        <div
          className='mobile-nav-backdrop'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
