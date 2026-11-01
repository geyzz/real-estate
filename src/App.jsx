import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AboutUs from './components/AboutUs'
import PropertiesSection from './components/PropertiesSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import PropertyModal from './components/PropertyModal'
import AdminPortal from './components/AdminPortal'
import { INITIAL_PROPERTIES } from './data/initialProperties'
import { fetchAllProperties } from './lib/supabase'
import './App.css'

export default function App() {
  // Reset old mock properties from local storage if resetting
  const [properties, setProperties] = useState(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('candj_clean_reset_v5') !== 'true') {
        localStorage.removeItem('candj_properties_v1')
        localStorage.setItem('candj_clean_reset_v5', 'true')
        return []
      }
      const local = localStorage.getItem('candj_properties_v1')
      if (local) {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {}
    return INITIAL_PROPERTIES
  })

  const [modalProperty, setModalProperty] = useState(null)
  
  // Inquiry list starts completely empty (zero default picked property)
  const [inquiredProperties, setInquiredProperties] = useState([])

  // Admin authentication state - uses sessionStorage so it automatically logs out when the website/browser is closed
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      localStorage.removeItem('candj_admin_auth') // purge legacy persistent storage
      return sessionStorage.getItem('candj_admin_auth') === 'true'
    } catch {
      return false
    }
  })

  // Secret Admin Portal route - accessible via secret path/hash (#cj-portal, #portal-2026, #cj-manage, /cj-portal, or /admin)
  const isSecretAdminRoute = () => {
    if (typeof window === 'undefined') return false
    const path = window.location.pathname.toLowerCase()
    const hash = window.location.hash.toLowerCase()
    const search = window.location.search.toLowerCase()
    return (
      path === '/admin' ||
      path === '/cj-portal' ||
      hash === '#admin' ||
      hash === '#cj-portal' ||
      hash === '#portal-2026' ||
      hash === '#cj-manage' ||
      search.includes('admin=true') ||
      search.includes('portal=true')
    )
  }

  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(isSecretAdminRoute)

  const loadProperties = async () => {
    try {
      const data = await fetchAllProperties()
      if (Array.isArray(data)) {
        setProperties(data)
      }
    } catch (err) {
      console.error('Failed to load properties from Supabase:', err)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  // Listen for direct URL navigation to secret portal
  useEffect(() => {
    const checkAdminRoute = () => {
      setIsAdminPortalOpen(isSecretAdminRoute())
    }

    checkAdminRoute()
    window.addEventListener('popstate', checkAdminRoute)
    window.addEventListener('hashchange', checkAdminRoute)
    return () => {
      window.removeEventListener('popstate', checkAdminRoute)
      window.removeEventListener('hashchange', checkAdminRoute)
    }
  }, [])

  // Secret hotkey shortcut (Ctrl + Alt + A or Ctrl + Shift + A) to open portal securely without typing URL in address bar
  useEffect(() => {
    const handleAdminHotKey = (e) => {
      if (
        (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault()
        setIsAdminPortalOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleAdminHotKey)
    return () => window.removeEventListener('keydown', handleAdminHotKey)
  }, [])

  // Inquire action (adds to inquiry cart and scrolls down)
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

  const handleCloseAdmin = () => {
    setIsAdminPortalOpen(false)
    if (isSecretAdminRoute()) {
      window.history.pushState(null, '', window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/cj-portal') ? '/' : '#')
    }
  }

  return (
    <>
      <div className='hero-shell'>
        <Navbar />
        <Hero properties={properties} />
      </div>

      <main>
        <AboutUs properties={properties} />

        {/* Public Properties Section: 100% clean for visitors, zero admin buttons */}
        <PropertiesSection
          properties={properties}
          onSelectPropertyModal={setModalProperty}
          onInquire={handleInquireProperty}
        />

        {/* Public Contact Section */}
        <ContactSection
          properties={properties}
          inquiredProperties={inquiredProperties}
          onRemoveInquired={handleRemoveInquired}
          onToggleAddProperty={handleToggleAddProperty}
        />
      </main>

      <Footer />

      {/* Property Details Modal */}
      <PropertyModal
        property={modalProperty}
        onClose={() => setModalProperty(null)}
        onInquire={handleInquireProperty}
      />

      {/* Admin Portal - strictly isolated to /admin or #admin link */}
      {isAdminPortalOpen && (
        <AdminPortal
          isOpen={isAdminPortalOpen}
          onClose={handleCloseAdmin}
          properties={properties}
          onPropertiesUpdated={loadProperties}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
        />
      )}
    </>
  )
}
