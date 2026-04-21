import { ServerType } from '@/types'

export interface VPSRequest {
  email: string
  localPart: string
  domain: string
  fullName: string
  password: string
  quotaMb: number
}

export async function createVPSMailbox(
  adapter: ServerType,
  baseUrl: string,
  apiKey: string,
  data: VPSRequest
) {
  switch (adapter) {
    case 'mailcow':
      return await fetch(`${baseUrl}/api/v1/add/mailbox`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local_part: data.localPart,
          domain: data.domain,
          name: data.fullName,
          password: data.password,
          password2: data.password,
          quota: data.quotaMb,
          active: '1',
          force_pw_update: '0',
          tls_enforce_in: '0',
          tls_enforce_out: '0'
        })
      })

    case 'mailu':
      const auth = Buffer.from(`admin:${apiKey}`).toString('base64')
      return await fetch(`${baseUrl}/api/v1/user`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localPart: data.localPart,
          domain: data.domain,
          password: data.password,
          displayedName: data.fullName,
          quota: data.quotaMb
        })
      })

    case 'iredmail':
      return await fetch(`${baseUrl}/api/create_user`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.email,
          password: data.password,
          display_name: data.fullName,
          mailQuota: data.quotaMb
        })
      })

    default:
      throw new Error(`Unsupported VPS adapter: ${adapter}`)
  }
}

export async function fetchDKIMKey(
  adapter: ServerType,
  baseUrl: string,
  apiKey: string,
  domain: string
): Promise<string> {
  let res
  switch (adapter) {
    case 'mailcow':
      res = await fetch(`${baseUrl}/api/v1/get/dkim/${domain}`, {
        headers: { 'X-API-Key': apiKey }
      })
      const mcData = await res.json()
      return mcData.pubkey

    case 'mailu':
      res = await fetch(`${baseUrl}/api/v1/domain/${domain}`, {
        headers: { 'Authorization': `Basic ${Buffer.from(`admin:${apiKey}`).toString('base64')}` }
      })
      const mailuData = await res.json()
      return mailuData.dkim_key

    default:
      return "DKIM_MANUAL_FETCH_REQUIRED"
  }
}
