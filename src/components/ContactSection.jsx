import { useState } from 'react'
import aboutBg from '../assets/about-bg.jpg'
import { getSupabaseClient } from '../lib/supabase'
import { sendInquiryEmail } from '../lib/emailService'
import { formatLocation } from '../lib/philippineGeo'

const DRAWER_ITEMS_PER_PAGE = 4
const DRAWER_MAX_PAGES = 4

export default function ContactSection({
  properties = [],
  inquiredProperties = [],
  onRemoveInquired,
  onToggleAddProperty,
}) {
  const [isAddingMore, setIsAddingMore] = useState(false)
  const [drawerPage, setDrawerPage] = useState(1)
  const [submittedStatus, setSubmittedStatus] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    message: '',
  })

  const totalDrawerPages = Math.min(
    DRAWER_MAX_PAGES,
    Math.ceil(properties.length / DRAWER_ITEMS_PER_PAGE)
  )
  const effectiveDrawerPage = Math.min(drawerPage, Math.max(1, totalDrawerPages))
  const startDrawerIdx = (effectiveDrawerPage - 1) * DRAWER_ITEMS_PER_PAGE
  const displayedDrawerProperties = properties.slice(
    startDrawerIdx,
    startDrawerIdx + DRAWER_ITEMS_PER_PAGE
  )

  const handleRemoveProperty = (propId) => {
    onRemoveInquired(propId)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const selectedProps = properties.filter((p) => inquiredProperties.includes(p.id))

    // 1. Send direct email notification to ghayzelle.dzn@gmail.com
    try {
      await sendInquiryEmail({
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        contactNumber: contactForm.contactNumber.trim(),
        message: contactForm.message.trim(),
        properties: selectedProps,
        formType: 'Direct Property Inquiry',
      })
    } catch (emailErr) {
      console.warn('Email dispatch notice:', emailErr)
    }

    // 2. Persist inquiry into Supabase database
    const client = getSupabaseClient()
    if (client) {
      try {
        const { data: inquiryData, error: inqError } = await client
          .from('inquiries')
          .insert([
            {
              full_name: contactForm.name.trim(),
              email: contactForm.email.trim(),
              contact_number: contactForm.contactNumber.trim(),
              message: contactForm.message.trim(),
              status: 'New',
            },
          ])
          .select()

        if (!inqError && inquiryData && inquiryData[0]) {
          const inquiryId = inquiryData[0].id
          if (inquiredProperties.length > 0) {
            const items = inquiredProperties.map((propId) => ({
              inquiry_id: inquiryId,
              property_id: typeof propId === 'number' ? propId : null,
            }))
            await client.from('inquiry_items').insert(items)
          }
        }
      } catch (err) {
        console.warn('Inquiry insert to Supabase notice:', err)
      }
    }

    setIsSubmitting(false)
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

  return (
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
              <div className='contact-col-title-group'>
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
                  const item = properties.find((p) => p.id === propId)
                  if (!item) return null
                  return (
                    <div
                      key={item.id}
                      className='contact-prop-card'
                      style={{ backgroundImage: `url(${item.image})` }}
                    >
                      <div className='contact-prop-overlay' />
                      <div className='contact-prop-details'>
                        {(item.badge || item.label) && (
                          <span className='contact-prop-badge'>{item.badge || item.label}</span>
                        )}
                        <h4 className='contact-prop-loc'>{formatLocation(item.location)}</h4>
                        <p className='contact-prop-specs'>{item.specs || item.sub_info}</p>
                        <div className='contact-prop-divider' />
                        <span className='contact-prop-price'>{item.price || item.price_display}</span>
                      </div>
                      <button
                        type='button'
                        className='contact-prop-remove-btn'
                        title='Remove property'
                        aria-label={`Remove ${formatLocation(item.location)}`}
                        onClick={() => handleRemoveProperty(item.id)}
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
                <div className='contact-drawer-grid' key={`drawer-page-${effectiveDrawerPage}`}>
                  {displayedDrawerProperties.map((prop, idx) => {
                    const isSelected = inquiredProperties.includes(prop.id)
                    return (
                      <div
                        key={prop.id}
                        className={`contact-drawer-item ${isSelected ? 'is-picked' : ''}`}
                        style={{ '--drawer-item-idx': idx }}
                        onClick={() => onToggleAddProperty(prop.id)}
                      >
                        <img src={prop.image} alt={formatLocation(prop.location)} />
                        <div className='contact-drawer-item-info'>
                          <p className='contact-drawer-title'>{formatLocation(prop.location)}</p>
                          <span className='contact-drawer-price'>{prop.price || prop.price_display}</span>
                        </div>
                        <span className={`contact-drawer-check ${isSelected ? 'checked' : ''}`}>
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {totalDrawerPages > 1 && (
                  <div className='contact-drawer-pagination'>
                    <button
                      type='button'
                      className='contact-drawer-page-arrow'
                      onClick={() => setDrawerPage((prev) => Math.max(prev - 1, 1))}
                      disabled={effectiveDrawerPage === 1}
                      aria-label='Previous properties'
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    <div className='contact-drawer-page-nums'>
                      {Array.from({ length: totalDrawerPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type='button'
                          className={`contact-drawer-page-num ${effectiveDrawerPage === num ? 'is-active' : ''}`}
                          onClick={() => setDrawerPage(num)}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      type='button'
                      className='contact-drawer-page-arrow'
                      onClick={() => setDrawerPage((prev) => Math.min(prev + 1, totalDrawerPages))}
                      disabled={effectiveDrawerPage === totalDrawerPages}
                      aria-label='Next properties'
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                )}
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

              <button
                type='submit'
                className={`contact-submit-btn ${inquiredProperties.length > 0 ? '' : 'is-hidden'}`}
                disabled={isSubmitting || inquiredProperties.length === 0}
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
                <span>
                  {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
