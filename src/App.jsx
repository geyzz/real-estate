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
  const [properties, setProperties] = useState(() => {
    try {
      const local = localStorage.getItem('candj_properties_v1')
      if (local) {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return INITIAL_PROPERTIES
  })

  const [modalProperty, setModalProperty] = useState(null)
  const [inquiredProperties, setInquiredProperties] = useState(() => {
    try {
      const local = localStorage.getItem('candj_properties_v1')
      if (local) {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length > 0) return [parsed[0].id]
      }
    } catch (e) {}
    return [INITIAL_PROPERTIES[0].id]
  })

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('candj_admin_auth') === 'true'
  })

  // Secret Admin Portal route - only accessible via direct link /admin or #admin
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true'))
    )
  })

  const loadProperties = async () => {
    try {
      const data = await fetchAllProperties()
      if (data && data.length > 0) {
        setProperties(data)
        setInquiredProperties((prev) => (prev.length === 0 ? [data[0].id] : prev))
      }
    } catch (err) {
      console.error('Failed to load properties from Supabase:', err)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  // Listen for direct URL navigation to /admin or #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const isRoute =
        window.location.pathname === '/admin' ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true')
      setIsAdminPortalOpen(isRoute)
    }

    checkAdminRoute()
    window.addEventListener('popstate', checkAdminRoute)
    window.addEventListener('hashchange', checkAdminRoute)
    return () => {
      window.removeEventListener('popstate', checkAdminRoute)
      window.removeEventListener('hashchange', checkAdminRoute)
    }
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
    if (
      window.location.pathname === '/admin' ||
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=true')
    ) {
      window.history.pushState(null, '', window.location.pathname === '/admin' ? '/' : '#')
    }
  }

  return (
    <>
      <div className='hero-shell'>
        <Navbar />
        <Hero properties={properties} />
      </div>

      <main>
        <AboutUs />

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
