// Recipient email configuration
export const INQUIRY_RECIPIENT_EMAIL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_INQUIRY_EMAIL) ||
  'ghayzelle.dzn@gmail.com'

// Brevo API Configuration
export const BREVO_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BREVO_API_KEY) || ''

export const BREVO_SENDER_EMAIL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BREVO_SENDER_EMAIL) ||
  'ghayzelled@gmail.com'

export const BREVO_SENDER_NAME =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BREVO_SENDER_NAME) ||
  'C & J Real Estate'

/**
 * Builds a luxury gold & dark branded HTML email for C & J Real Estate
 */
function buildBrandedHtmlEmail({ name, email, contactNumber, message, properties, formType, submittedAt }) {
  const propertyCardsHtml =
    properties && properties.length > 0
      ? properties
          .map(
            (p, idx) => `
            <div style="background: #1C202A; border: 1px solid rgba(230, 198, 135, 0.35); border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;">
              <div style="color: #E6C687; font-size: 15px; font-weight: 700; margin-bottom: 4px;">
                #${idx + 1} — ${p.location || 'Location Not Specified'}
              </div>
              <div style="color: #CBD5E1; font-size: 12.5px; margin-bottom: 6px;">
                ${p.subtitle || p.main_info || ''} ${p.specs || p.sub_info ? '• ' + (p.specs || p.sub_info) : ''}
              </div>
              <div style="display: inline-block; padding: 3px 8px; background: rgba(230, 198, 135, 0.18); color: #E6C687; border-radius: 4px; font-size: 12px; font-weight: 700;">
                Listing Rate: ${p.price || p.price_display || 'N/A'}
              </div>
            </div>
          `
          )
          .join('')
      : '<p style="color: #94A3B8; font-style: italic; margin: 0;">General inquiry (no specific properties attached).</p>'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>C & J Real Estate Inquiry</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0E1015; margin: 0; padding: 24px 12px; color: #F3F4F6;">
  <div style="max-width: 620px; margin: 0 auto; background: #15181F; border: 1px solid rgba(230, 198, 135, 0.35); border-radius: 14px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.6);">
    
    <!-- Luxury Header -->
    <div style="background: linear-gradient(135deg, #1C2028 0%, #111318 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #E6C687;">
      <div style="display: inline-block; padding: 4px 12px; background: rgba(230, 198, 135, 0.15); border: 1px solid #E6C687; border-radius: 999px; color: #E6C687; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;">
        EXCLUSIVE INQUIRY
      </div>
      <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">
        C &amp; J Real Estate
      </h1>
      <p style="margin: 6px 0 0 0; color: #E6C687; font-size: 13px; font-weight: 500;">
        Prime Land &amp; Verified Clean-Titled Estates
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 28px 24px;">
      
      <!-- Notification Banner -->
      <div style="background: rgba(230, 198, 135, 0.1); border-left: 4px solid #E6C687; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
        <span style="color: #E6C687; font-weight: 700; font-size: 13.5px;">
          🔔 New Website Inquiry Received
        </span>
        <div style="color: #CBD5E1; font-size: 12.5px; margin-top: 2px;">
          Submitted on ${submittedAt} (Philippine Standard Time)
        </div>
      </div>

      <!-- Section: Client Details -->
      <div style="color: #E6C687; font-size: 12.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
        1. Prospective Client Details
      </div>
      <table style="width: 100%; border-collapse: collapse; background: #1C202A; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 14px; color: #94A3B8; font-size: 13px; font-weight: 600; width: 140px; border-bottom: 1px solid rgba(255,255,255,0.05);">Full Name:</td>
          <td style="padding: 10px 14px; color: #FFFFFF; font-size: 13px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05);">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #94A3B8; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.05);">Email Address:</td>
          <td style="padding: 10px 14px; color: #E6C687; font-size: 13px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05);"><a href="mailto:${email}" style="color: #E6C687; text-decoration: none;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #94A3B8; font-size: 13px; font-weight: 600;">Contact Number:</td>
          <td style="padding: 10px 14px; color: #FFFFFF; font-size: 13px; font-weight: 700;">${contactNumber || 'Not provided'}</td>
        </tr>
      </table>

      <!-- Section: Interested Properties -->
      <div style="color: #E6C687; font-size: 12.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
        2. Selected Properties of Interest
      </div>
      <div style="margin-bottom: 24px;">
        ${propertyCardsHtml}
      </div>

      <!-- Section: Client Message -->
      <div style="color: #E6C687; font-size: 12.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
        3. Client Message / Preferred Schedule
      </div>
      <div style="background: #1C202A; border-left: 3px solid #E6C687; padding: 14px 16px; border-radius: 4px; font-size: 13.5px; line-height: 1.5; color: #F1F5F9; font-style: italic; margin-bottom: 28px;">
        "${message || 'No additional message provided.'}"
      </div>

      <!-- Quick Action Button -->
      <div style="text-align: center; margin-bottom: 10px;">
        <a href="mailto:${email}?subject=Re:%20C%26J%20Real%20Estate%20Inquiry" style="display: inline-block; padding: 13px 32px; background: linear-gradient(135deg, #E6C687 0%, #C5A880 100%); color: #12141A; font-weight: 800; font-size: 13.5px; letter-spacing: 0.8px; text-decoration: none; border-radius: 8px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(230,198,135,0.35);">
          ✉️ Direct Reply to ${name}
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 18px 24px; font-size: 11.5px; color: #64748B; background: #111318; border-top: 1px solid rgba(255,255,255,0.06);">
      © ${new Date().getFullYear()} C and J Real Estate. Powered by Brevo.
    </div>

  </div>
</body>
</html>
`
}

/**
 * Dispatches inquiry emails exclusively via Brevo Transactional Email API.
 */
export async function sendInquiryEmail({
  name,
  email,
  contactNumber = 'N/A',
  message,
  properties = [],
  formType = 'Property Consultation Inquiry',
}) {
  const recipient = (INQUIRY_RECIPIENT_EMAIL || 'ghayzelle.dzn@gmail.com').trim()
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  if (!BREVO_API_KEY) {
    console.error('Brevo API Key (VITE_BREVO_API_KEY) is missing in .env file.')
    return {
      success: false,
      error: 'Brevo API key not configured in .env',
    }
  }

  try {
    const htmlContent = buildBrandedHtmlEmail({
      name,
      email,
      contactNumber,
      message,
      properties,
      formType,
      submittedAt,
    })

    const brevoPayload = {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: recipient,
          name: 'C & J Real Estate Admin',
        },
      ],
      replyTo: {
        email: email,
        name: name,
      },
      subject: `[C&J Real Estate] ${formType} from ${name}`,
      htmlContent: htmlContent,
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY.trim(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    })

    const data = await response.json()
    if (response.ok) {
      return { success: true, method: 'brevo', data }
    } else {
      console.error('Brevo API error:', data)
      return { success: false, error: data.message || 'Brevo API error' }
    }
  } catch (err) {
    console.error('Failed to send via Brevo:', err)
    return { success: false, error: err.message }
  }
}
