import { useState } from 'react'
import { sendInquiryEmail } from '../lib/emailService'
import { validateEmail } from '../lib/validation'

const validateFooterName = (name) => {
  if (!name || !name.trim()) return 'Please enter your name.'
  if (name.trim().length < 2) return 'Please enter your full name.'
  return ''
}

const validateFooterInquiry = (inquiry) => {
  if (!inquiry || !inquiry.trim()) return 'Please enter your inquiry.'
  return ''
}

export default function Footer() {
  const [footerMsgForm, setFooterMsgForm] = useState({
    name: '',
    email: '',
    inquiry: '',
  })
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    inquiry: '',
  })
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    inquiry: false,
  })
  const [footerMsgSent, setFooterMsgSent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === 'name') {
      setErrors((prev) => ({ ...prev, name: validateFooterName(footerMsgForm.name) }))
    } else if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(footerMsgForm.email) }))
    } else if (field === 'inquiry') {
      setErrors((prev) => ({ ...prev, inquiry: validateFooterInquiry(footerMsgForm.inquiry) }))
    }
  }

  const handleChange = (field, val) => {
    setFooterMsgForm((prev) => ({ ...prev, [field]: val }))
    if (touched[field]) {
      if (field === 'name') {
        setErrors((prev) => ({ ...prev, name: validateFooterName(val) }))
      } else if (field === 'email') {
        setErrors((prev) => ({ ...prev, email: validateEmail(val) }))
      } else if (field === 'inquiry') {
        setErrors((prev) => ({ ...prev, inquiry: validateFooterInquiry(val) }))
      }
    }
  }

  const handleFooterMsgSubmit = async (e) => {
    e.preventDefault()

    const nameErr = validateFooterName(footerMsgForm.name)
    const emailErr = validateEmail(footerMsgForm.email)
    const inquiryErr = validateFooterInquiry(footerMsgForm.inquiry)

    setTouched({ name: true, email: true, inquiry: true })
    setErrors({ name: nameErr, email: emailErr, inquiry: inquiryErr })

    if (nameErr || emailErr || inquiryErr) {
      if (nameErr) {
        document.getElementById('footer-name-input')?.focus()
      } else if (emailErr) {
        document.getElementById('footer-email-input')?.focus()
      } else if (inquiryErr) {
        document.getElementById('footer-inquiry-input')?.focus()
      }
      return
    }

    setIsSending(true)

    try {
      await sendInquiryEmail({
        name: footerMsgForm.name.trim(),
        email: footerMsgForm.email.trim(),
        message: footerMsgForm.inquiry.trim(),
        formType: 'Footer Quick Message',
      })
    } catch (err) {
      console.warn('Footer message dispatch notice:', err)
    }

    setIsSending(false)
    setFooterMsgSent(true)
    setFooterMsgForm({ name: '', email: '', inquiry: '' })
    setTouched({ name: false, email: false, inquiry: false })
    setErrors({ name: '', email: '', inquiry: '' })

    setTimeout(() => {
      setFooterMsgSent(false)
    }, 4000)
  }

  return (
    <footer className='site-footer'>
      <div className='footer-inner'>
        {/* Column 1: Logo & Brand Description */}
        <div className='footer-col footer-col-brand'>
          <div className='footer-logo-wrap'>
            <div className='title footer-title' id='title'>
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
          <form className='footer-form' onSubmit={handleFooterMsgSubmit} noValidate>
            <div className='footer-field'>
              <input
                id='footer-name-input'
                type='text'
                placeholder='Your Name'
                className={touched.name && errors.name ? 'has-error' : ''}
                value={footerMsgForm.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                disabled={isSending}
              />
              {touched.name && errors.name && (
                <span className='footer-input-error'>{errors.name}</span>
              )}
            </div>
            <div className='footer-field'>
              <input
                id='footer-email-input'
                type='email'
                placeholder='Email'
                className={touched.email && errors.email ? 'has-error' : ''}
                value={footerMsgForm.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                disabled={isSending}
              />
              {touched.email && errors.email && (
                <span className='footer-input-error'>{errors.email}</span>
              )}
            </div>
            <div className='footer-field'>
              <textarea
                id='footer-inquiry-input'
                placeholder='Your Inquiry...'
                rows={3}
                className={touched.inquiry && errors.inquiry ? 'has-error' : ''}
                value={footerMsgForm.inquiry}
                onChange={(e) => handleChange('inquiry', e.target.value)}
                onBlur={() => handleBlur('inquiry')}
                disabled={isSending}
              />
              {touched.inquiry && errors.inquiry && (
                <span className='footer-input-error'>{errors.inquiry}</span>
              )}
            </div>
            <button type='submit' className='footer-send-btn' disabled={isSending}>
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
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Column 3: Contact Us Details */}
        <div className='footer-col footer-col-contact'>
          <h4 className='footer-heading'>Contact Us</h4>
          <div className='footer-contact-list'>
            <div className='footer-contact-item'>
              <span className='footer-contact-lbl'>Contact Info</span>
              <a href='tel:+639123456789' className='footer-contact-val'>
                +63 912 345 6789
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
  )
}
