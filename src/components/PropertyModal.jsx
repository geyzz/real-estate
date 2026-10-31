import { formatLocation, toTitleCase } from '../lib/philippineGeo'

export default function PropertyModal({ property, onClose, onInquire }) {
  if (!property) return null

  return (
    <div className='prop-modal-overlay' onClick={onClose}>
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
          onClick={onClose}
        >
          ✕
        </button>
        <div className='prop-modal-grid'>
          <div className='prop-modal-pic-col'>
            <img
              className='prop-modal-img'
              src={property.image}
              alt={formatLocation(property.location)}
            />
            {(property.badge || property.label) && (
              <span className='prop-modal-badge'>{property.badge || property.label}</span>
            )}
            {property.province && <span className='prop-modal-province'>{toTitleCase(property.province)}</span>}
          </div>
          <div className='prop-modal-info-col'>
            <div className='prop-modal-header'>
              <span className='prop-modal-eyebrow'>Property Overview</span>
              <h3 id='modal-title'>{formatLocation(property.location)}</h3>
              {Boolean(property.subtitle || property.main_info) && (
                <p className='prop-modal-sub'>{property.subtitle || property.main_info}</p>
              )}
            </div>

            {Boolean(property.specs || property.sub_info) && (
              <div className='prop-modal-specs-box'>
                <h4>Dimensions and Features</h4>
                <p>{property.specs || property.sub_info}</p>
              </div>
            )}

            {property.sub_labels && property.sub_labels.length > 0 && (
              <div className='prop-modal-highlights'>
                {property.sub_labels.map((sub, idx) => (
                  <div key={idx} className='prop-modal-chip'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    {typeof sub === 'string' ? sub : sub.text}
                  </div>
                ))}
              </div>
            )}

            <div className='prop-modal-price-box'>
              <div className='prop-modal-price-details'>
                <span className='prop-modal-price-label'>Listing Price</span>
                <span className='prop-modal-price-val'>{property.price || property.price_display}</span>
              </div>
              {property.terms && <span className='prop-modal-neg'>{property.terms}</span>}
            </div>

            <div className='prop-modal-actions'>
              <button
                type='button'
                className='prop-modal-btn-primary'
                onClick={() => {
                  onInquire(property)
                  onClose()
                }}
              >
                Inquire About This Property
              </button>
              <button
                type='button'
                className='prop-modal-btn-secondary'
                onClick={onClose}
              >
                Back to Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
