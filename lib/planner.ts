export interface DomainPlan {
  domain: string
  ip: string
  vpsProvider: string
  subdomainCount: number
  totalInboxes: number
  subdomains: SubdomainPlan[]
}

export interface SubdomainPlan {
  prefix: string
  fullSubdomain: string
  inboxCount: number
}

export function generatePlan(
  domain: string,
  ip: string,
  vpsProvider: string,
  minSubdomains: number,
  maxSubdomains: number,
  minInboxes: number,
  maxInboxes: number,
  availablePrefixes: string[]
): DomainPlan {
  // 1. Pick random subdomain count N
  const subdomainCount = Math.floor(Math.random() * (maxSubdomains - minSubdomains + 1)) + minSubdomains
  
  // 2. Pick random total inbox count T
  const totalInboxes = Math.floor(Math.random() * (maxInboxes - minInboxes + 1)) + minInboxes
  
  // 3. Randomly select N unique prefixes
  const shuffledPrefixes = [...availablePrefixes].sort(() => 0.5 - Math.random())
  const selectedPrefixes = shuffledPrefixes.slice(0, subdomainCount)
  
  // 4. Distribute T inboxes across N subdomains (minimum 1 per subdomain)
  const distribution = distributeInboxes(totalInboxes, subdomainCount)
  
  // 5. Combine
  const subdomains = selectedPrefixes.map((prefix, i) => ({
    prefix,
    fullSubdomain: `${prefix}.${domain}`,
    inboxCount: distribution[i]
  }))
  
  return {
    domain,
    ip,
    vpsProvider,
    subdomainCount,
    totalInboxes,
    subdomains
  }
}

function distributeInboxes(total: number, parts: number): number[] {
  if (parts === 1) return [total]
  
  // N positive integers summing to T
  // Algorithm: pick N-1 random points between 1 and T-1, sort them, calculate differences
  const points = []
  for (let i = 0; i < parts - 1; i++) {
    points.push(Math.floor(Math.random() * (total - 1)) + 1)
  }
  points.sort((a, b) => a - b)
  
  const result = []
  let last = 0
  for (let i = 0; i < parts - 1; i++) {
    result.push(points[i] - last)
    last = points[i]
  }
  result.push(total - last)
  
  // Ensure no zeros (though the algorithm above avoids them if points are unique)
  // Let's use a safer approach for small totals
  if (result.some(r => r === 0)) {
     const safeResult = new Array(parts).fill(1)
     let remaining = total - parts
     while (remaining > 0) {
       safeResult[Math.floor(Math.random() * parts)]++
       remaining--
     }
     return safeResult
  }
  
  return result
}
