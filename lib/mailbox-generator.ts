export interface MailboxData {
  firstName: string
  fullName: string
  email: string
  password: string
}

export function generateMailboxes(
  subdomain: string,
  domain: string,
  inboxCount: number,
  names: { first_name: string, full_name: string }[]
): MailboxData[] {
  const mailboxes: MailboxData[] = []
  
  // 1. Shuffle names
  const shuffledNames = [...names].sort(() => 0.5 - Math.random())
  
  // 2. Map names to subdomains
  for (let i = 0; i < inboxCount; i++) {
    const nameIndex = i % shuffledNames.length
    const name = shuffledNames[nameIndex]
    
    // 3. Handle repeats with suffix
    const repeatCount = Math.floor(i / shuffledNames.length)
    const suffix = repeatCount > 0 ? (repeatCount + 1).toString() : ''
    
    const firstName = name.first_name
    const email = `${firstName.toLowerCase()}${suffix}@${subdomain}`
    
    mailboxes.push({
      firstName,
      fullName: name.full_name,
      email,
      password: generateSecurePassword()
    })
  }
  
  return mailboxes
}

export function generateSecurePassword(): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
  let password = ""
  
  // Ensure at least one of each required type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
  password += "0123456789"[Math.floor(Math.random() * 10)]
  password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)]
  
  for (let i = 0; i < 12; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('')
}
