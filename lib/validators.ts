export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i
  return domainRegex.test(domain)
}

export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/
  return ipv4Regex.test(ip)
}

export function getDuplicates(domains: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const domain of domains) {
    const normalized = domain.toLowerCase().trim()
    if (seen.has(normalized)) {
      duplicates.add(normalized)
    }
    seen.add(normalized)
  }
  return Array.from(duplicates)
}
