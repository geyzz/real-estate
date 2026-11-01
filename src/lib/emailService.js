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
 * Builds a luxury branded HTML email matching C & J Real Estate website UI/UX
 */
function buildBrandedHtmlEmail({ name, email, contactNumber, message, properties, formType, submittedAt }) {
  const propertyCardsHtml =
    properties && properties.length > 0
      ? properties
          .map(
            (p, idx) => `
            <div style="background: #FFFFFF; border: 1.5px solid rgba(61, 59, 54, 0.12); border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(45, 42, 38, 0.04);">
              <div style="color: #3D3B36; font-size: 15px; font-weight: 700; margin-bottom: 4px;">
                #${idx + 1} — ${p.location || 'Location Not Specified'}
              </div>
              <div style="color: #6B6861; font-size: 12.5px; margin-bottom: 8px;">
                ${p.subtitle || p.main_info || ''} ${p.specs || p.sub_info ? '• ' + (p.specs || p.sub_info) : ''}
              </div>
              <div style="display: inline-block; padding: 4px 10px; background: rgba(79, 109, 58, 0.1); color: #4F6D3A; border: 1px solid rgba(79, 109, 58, 0.22); border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;">
                Listing Rate: ${p.price || p.price_display || 'N/A'}
              </div>
            </div>
          `
          )
          .join('')
      : '<p style="color: #8C8880; font-style: italic; margin: 0;">General inquiry (no specific properties attached).</p>'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>C &amp; J Real Estate Inquiry</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@700&family=Alegreya+Sans+SC:wght@700;800&family=Alegreya+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@700&family=Alegreya+Sans+SC:wght@700;800&family=Alegreya+Sans:wght@400;500;700&display=swap');
    
    .title {
      display: inline-flex !important;
      align-items: center !important;
      font-family: 'Alegreya Sans SC', 'alegreya sans sc', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 30px !important;
      color: #3D3B36 !important;
      line-height: 1 !important;
    }
    .title h3 {
      margin: 0 !important;
      line-height: 1 !important;
      display: inline-block !important;
    }
    .title > h3:nth-child(3) {
      transform: translateX(-13px) !important;
      -webkit-transform: translateX(-13px) !important;
    }
    .rotate-title {
      transform: translateX(-7px) rotate(90deg) !important;
      -webkit-transform: translateX(-7px) rotate(90deg) !important;
      font-size: 15px !important;
      color: #3D3B36 !important;
      display: inline-block !important;
    }
    .mix-font {
      display: inline-flex !important;
      flex-direction: row !important;
      align-items: center !important;
      transform: translateX(-8px) !important;
      -webkit-transform: translateX(-8px) !important;
      font-size: 23px !important;
    }
    .mix-font > h3:first-child {
      font-family: 'Alegreya SC', 'alegreya sc', Georgia, serif !important;
      font-size: 27px !important;
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 28px 12px; color: #3D3B36;">
  <div style="max-width: 620px; margin: 0 auto; background: #FFFFFF; border: 1.5px solid rgba(61, 59, 54, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px rgba(45, 42, 38, 0.08), 0 4px 12px rgba(45, 42, 38, 0.04);">
    
    <!-- Signature Luxury Header matching Website -->
    <div style="background: #FAF9F6; padding: 32px 24px; text-align: center; border-bottom: 3px solid #4F6D3A;">
      <div style="display: inline-block; padding: 4px 14px; background: rgba(79, 109, 58, 0.1); border: 1px solid rgba(79, 109, 58, 0.25); border-radius: 999px; color: #4F6D3A; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
        EXCLUSIVE INQUIRY
      </div>
      <!-- Header Title Logo matching Website Header -->
      <div style="text-align: center; margin: 0 auto 8px auto;">
        <div class="title" id="title" style="display: inline-flex; align-items: center; justify-content: center; font-family: 'Alegreya Sans SC', 'Segoe UI', Arial, sans-serif; font-size: 30px; color: #3D3B36; line-height: 1; text-align: center; margin: 0 auto;">
          <h3 style="margin: 0; line-height: 1; font-family: 'Alegreya Sans SC', 'Segoe UI', Arial, sans-serif; font-size: 30px; font-weight: 800; color: #3D3B36; display: inline-block;">C</h3>
          <h3 class="rotate-title" id="rotate-title" style="margin: 0; line-height: 1; font-family: 'Alegreya Sans SC', 'Segoe UI', Arial, sans-serif; font-size: 15px; font-weight: 800; color: #3D3B36; transform: translateX(-7px) rotate(90deg); -webkit-transform: translateX(-7px) rotate(90deg); display: inline-block;">
            AND
          </h3>
          <h3 style="margin: 0; line-height: 1; font-family: 'Alegreya Sans SC', 'Segoe UI', Arial, sans-serif; font-size: 30px; font-weight: 800; color: #3D3B36; transform: translateX(-13px); -webkit-transform: translateX(-13px); display: inline-block;">J</h3>
          <div class="mix-font" id="mix-font" style="display: inline-flex; flex-direction: row; align-items: center; transform: translateX(-8px); -webkit-transform: translateX(-8px); font-size: 23px; line-height: 1;">
            <h3 style="margin: 0; line-height: 1; font-family: 'Alegreya SC', Georgia, serif; font-size: 27px; font-weight: 700; color: #3D3B36; display: inline-block;">R</h3>
            <h3 style="margin: 0; line-height: 1; font-family: 'Alegreya Sans SC', 'Segoe UI', Arial, sans-serif; font-size: 23px; font-weight: 700; color: #3D3B36; display: inline-block;">eal Est.</h3>
          </div>
        </div>
      </div>
      <p style="margin: 6px 0 0 0; color: #6B6861; font-size: 13.5px; font-weight: 500;">
        Prime Land &amp; Verified Clean-Titled Estates
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 28px 24px;">
      
      <!-- Notification Banner -->
      <div style="background: rgba(79, 109, 58, 0.08); border-left: 4px solid #4F6D3A; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
        <span style="color: #4F6D3A; font-weight: 700; font-size: 13.5px;">
          🔔 New Website Inquiry Received
        </span>
        <div style="color: #6B6861; font-size: 12.5px; margin-top: 3px;">
          Submitted on ${submittedAt} (Philippine Standard Time)
        </div>
      </div>

      <!-- Section: Client Details -->
      <div style="color: #4F6D3A; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid rgba(61, 59, 54, 0.1); padding-bottom: 6px;">
        1. Prospective Client Details
      </div>
      <table style="width: 100%; border-collapse: collapse; background: #FAF9F6; border: 1px solid rgba(61, 59, 54, 0.1); border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
        <tr>
          <td style="padding: 10px 14px; color: #6B6861; font-size: 13px; font-weight: 600; width: 140px; border-bottom: 1px solid rgba(61, 59, 54, 0.08);">Full Name:</td>
          <td style="padding: 10px 14px; color: #3D3B36; font-size: 13px; font-weight: 700; border-bottom: 1px solid rgba(61, 59, 54, 0.08);">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #6B6861; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(61, 59, 54, 0.08);">Email Address:</td>
          <td style="padding: 10px 14px; color: #4F6D3A; font-size: 13px; font-weight: 700; border-bottom: 1px solid rgba(61, 59, 54, 0.08);"><a href="mailto:${email}" style="color: #4F6D3A; text-decoration: none; font-weight: 700;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #6B6861; font-size: 13px; font-weight: 600;">Contact Number:</td>
          <td style="padding: 10px 14px; color: #3D3B36; font-size: 13px; font-weight: 700;">${contactNumber || 'Not provided'}</td>
        </tr>
      </table>

      <!-- Section: Interested Properties -->
      <div style="color: #4F6D3A; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid rgba(61, 59, 54, 0.1); padding-bottom: 6px;">
        2. Selected Properties of Interest
      </div>
      <div style="margin-bottom: 24px;">
        ${propertyCardsHtml}
      </div>

      <!-- Section: Client Message -->
      <div style="color: #4F6D3A; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid rgba(61, 59, 54, 0.1); padding-bottom: 6px;">
        3. Client Message / Preferred Schedule
      </div>
      <div style="background: #FAF9F6; border: 1px solid rgba(61, 59, 54, 0.1); border-left: 4px solid #4F6D3A; padding: 14px 16px; border-radius: 6px; font-size: 13.5px; line-height: 1.5; color: #3D3B36; font-style: italic; margin-bottom: 28px;">
        "${message || 'No additional message provided.'}"
      </div>

      <!-- Quick Action Button matching website pill CTA -->
      <div style="text-align: center; margin-bottom: 10px;">
        <a href="mailto:${email}?subject=Re:%20C%26J%20Real%20Estate%20Inquiry" style="display: inline-block; padding: 12px 32px; background: linear-gradient(180deg, #5E8146 0%, #4F6D3A 55%, #435E31 100%); color: #FFFFFF; font-weight: 800; font-size: 13px; letter-spacing: 0.8px; text-decoration: none; border-radius: 999px; text-transform: uppercase; box-shadow: 0 6px 18px rgba(79, 109, 58, 0.28);">
          ✉️ Direct Reply to ${name}
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 18px 24px; font-size: 12px; color: #8C8880; background: #FAF9F6; border-top: 1px solid rgba(61, 59, 54, 0.08);">
      &copy; ${new Date().getFullYear()} C and J Real Estate. Powered by Brevo.
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
