export const COMMON_DOMAIN_TYPOS = {
  // Gmail typos
  'gmal.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gamail.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmaio.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'gmaol.com': 'gmail.com',
  'gmaiil.com': 'gmail.com',
  'g-mail.com': 'gmail.com',
  'gma.com': 'gmail.com',
  'gml.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.cmo': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.coom': 'gmail.com',
  'gmail.comm': 'gmail.com',
  'gmail.ocm': 'gmail.com',
  'gmal.co': 'gmail.com',
  'gmai.co': 'gmail.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'ymail.cmo': 'ymail.com',
  'yahoo.cmo': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yahoo.coom': 'yahoo.com',
  'yahoo.comm': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',
  'uahoo.com': 'yahoo.com',
  'tahoo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',

  // Hotmail / Outlook typos
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'homail.com': 'hotmail.com',
  'hitmail.com': 'hotmail.com',
  'hotmail.cmo': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'putlook.com': 'outlook.com',
  'outlook.cmo': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlook.co': 'outlook.com',

  // iCloud typos
  'icoud.com': 'icloud.com',
  'iclud.com': 'icloud.com',
  'icluod.com': 'icloud.com',
  'icloud.cmo': 'icloud.com',
  'icloud.con': 'icloud.com',
  'icloud.co': 'icloud.com',
}

export const COMMON_TLD_TYPOS = {
  'cmo': 'com',
  'con': 'com',
  'coom': 'com',
  'comm': 'com',
  'ocm': 'com',
  'xom': 'com',
  'cpm': 'com',
  'vom': 'com',
}

const VALID_COMMON_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.com.ph',
  'ymail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'email.com',
])

const POPULAR_TARGETS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
]

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export const isLikelyDomainTypo = (domainLower) => {
  if (VALID_COMMON_DOMAINS.has(domainLower)) return false
  if (COMMON_DOMAIN_TYPOS[domainLower]) return true

  for (const target of POPULAR_TARGETS) {
    const dist = levenshtein(domainLower, target)
    if (dist === 1 || (dist === 2 && Math.abs(domainLower.length - target.length) <= 1)) {
      return true
    }
  }
  return false
}

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Invalid email address. Please enter a valid email address.'
  const val = email.trim()

  if (/\s/.test(val) || !val.includes('@')) {
    return 'Invalid email address. Please enter a valid email address.'
  }
  const [localPart, domainPart] = val.split('@')
  if (!localPart || !domainPart || !domainPart.includes('.')) {
    return 'Invalid email address. Please enter a valid email address.'
  }

  const domainLower = domainPart.toLowerCase()
  if (isLikelyDomainTypo(domainLower)) {
    return 'Invalid email address. Please enter a valid email address.'
  }

  const parts = domainLower.split('.')
  const tld = parts[parts.length - 1]
  if (COMMON_TLD_TYPOS[tld]) {
    return 'Invalid email address. Please enter a valid email address.'
  }

  if (!tld || tld.length < 2) {
    return 'Invalid email address. Please enter a valid email address.'
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(val)) {
    return 'Invalid email address. Please enter a valid email address.'
  }
  return ''
}

export const validatePhoneNumber = (number, countryCode = '+63') => {
  if (!number || !number.trim()) return 'Contact number is required.'
  const raw = number.trim()
  if (/[a-zA-Z]/.test(raw)) {
    return 'Invalid contact number. Please enter digits only.'
  }
  const digits = raw.replace(/[\s-().+]/g, '')
  if (!/^\d+$/.test(digits)) {
    return 'Invalid contact number. Please check your number.'
  }

  if (countryCode === '+63') {
    if (digits.startsWith('09')) {
      if (digits.length !== 11) {
        return 'Invalid contact number. Please check your 11-digit number (e.g. 0917 123 4567).'
      }
      return ''
    }
    if (digits.startsWith('9')) {
      if (digits.length !== 10) {
        return 'Invalid contact number. Please check your 10-digit number (e.g. 917 123 4567).'
      }
      return ''
    }
    return 'Invalid contact number. Philippine mobile numbers must start with 9 or 09.'
  }

  if (digits.length < 7 || digits.length > 15) {
    return 'Invalid contact number. Please check your number (7 to 15 digits).'
  }
  return ''
}

export const formatFullPhoneNumber = (countryCode, number) => {
  const digits = number.replace(/[\s-()]/g, '')
  if (countryCode === '+63') {
    const clean10 = digits.startsWith('0') ? digits.slice(1) : digits
    if (clean10.length === 10) {
      return `+63 ${clean10.slice(0, 3)} ${clean10.slice(3, 6)} ${clean10.slice(6)}`
    }
  }
  return `${countryCode} ${digits}`
}
