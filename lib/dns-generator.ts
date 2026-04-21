import { DNSRecord } from '@/types'

const DMARC_RUA = "mailto:05a6d690d35a4df48cfedcc0c4f04291@dmarc-reports.cloudflare.net;"
const TLSA_CONTENT = "3 1 1 548b660bef4641fac42f51f21126622e0b96a63257fd2a29ea1acbc96343867e"

export function generateDNSRecords(
  domainId: string,
  domain: string,
  ip: string,
  subdomains: { id: string, subdomain: string, fullSubdomain: string }[]
): Partial<DNSRecord>[] {
  const records: Partial<DNSRecord>[] = []

  // --- BASE DOMAIN RECORDS ---
  
  // A record for mail.{domain}
  records.push({
    domain_id: domainId,
    record_name: `mail.${domain}`,
    record_type: 'A',
    record_content: ip
  })

  // TLSA for mail.{domain}
  records.push({
    domain_id: domainId,
    record_name: `_25._tcp.mail.${domain}`,
    record_type: 'TLSA',
    record_content: TLSA_CONTENT
  })

  // DKIM placeholder for base domain
  records.push({
    domain_id: domainId,
    record_name: `dkim._domainkey.${domain}`,
    record_type: 'TXT',
    record_content: "v=DKIM1;k=rsa;t=s;s=email;p=DKIM_PENDING_MAILBOX_CREATION",
    is_dkim: true
  })

  // DMARC for base domain
  records.push({
    domain_id: domainId,
    record_name: `_dmarc.${domain}`,
    record_type: 'TXT',
    record_content: `v=DMARC1; p=none; rua=${DMARC_RUA}`
  })

  // --- SUBDOMAIN RECORDS ---

  for (const sub of subdomains) {
    // A record for {subdomain}.{domain}
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: sub.fullSubdomain,
      record_type: 'A',
      record_content: ip
    })

    // MX record
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: sub.fullSubdomain,
      record_type: 'MX',
      record_content: `10 mail.${domain}.`
    })

    // SPF record
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: sub.fullSubdomain,
      record_type: 'TXT',
      record_content: `v=spf1 ip4:${ip} -all`
    })

    // DMARC for subdomain
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: `_dmarc.${sub.fullSubdomain}`,
      record_type: 'TXT',
      record_content: `v=DMARC1; p=none; rua=${DMARC_RUA}`
    })

    // Autodiscover CNAME
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: `autodiscover.${sub.fullSubdomain}`,
      record_type: 'CNAME',
      record_content: `mail.${domain}`
    })

    // Autoconfig CNAME
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: `autoconfig.${sub.fullSubdomain}`,
      record_type: 'CNAME',
      record_content: `mail.${domain}`
    })

    // Autodiscover SRV
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: `_autodiscover._tcp.${sub.fullSubdomain}`,
      record_type: 'SRV',
      record_content: `0 0 443 mail.${domain}`
    })

    // DKIM placeholder for subdomain
    records.push({
      domain_id: domainId,
      subdomain_id: sub.id,
      record_name: `dkim._domainkey.${sub.fullSubdomain}`,
      record_type: 'TXT',
      record_content: "DKIM_PENDING_MAILBOX_CREATION",
      is_dkim: true
    })
  }

  return records
}
