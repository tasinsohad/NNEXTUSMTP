export type ServerType = 'mailcow' | 'mailu' | 'iredmail' | 'custom'
export type JobType = 'dns_push' | 'mailbox_create' | 'dkim_fetch' | 'dkim_inject'
export type JobStatus = 'pending' | 'processing' | 'done' | 'failed'
export type MailboxStatus = 'pending' | 'processing' | 'created' | 'failed'
export type DNSStatus = 'pending' | 'created' | 'skipped' | 'failed'

export interface DomainEntry {
  id: string
  domain: string
  ip: string
  vpsProvider: string
}

export interface SubdomainPrefix {
  id: string
  prefix: string
  is_default: boolean
  created_at: string
}

export interface NameBankEntry {
  id: string
  first_name: string
  full_name: string
  created_at: string
}

export interface VPSConfig {
  id: string
  label: string
  ip: string
  api_base_url: string
  server_type: ServerType
  api_key_secret_id: string | null
  custom_template: Record<string, unknown> | null
  quota_mb: number
  created_at: string
}

export interface CloudflareAccount {
  id: string
  label: string
  email: string | null
  api_key_secret_id: string | null
  created_at: string
}

export interface Stage1Payload {
  entries: DomainEntry[]
}

export interface Stage2Payload {
  plans: DomainPlan[]
  settings: RangeSettings
  selectedPrefixes: string[]
}

export interface Stage3Payload {
  cfAccountId: string
  overwrite: boolean
}

export interface Stage4Payload {
  subdomainMailboxes: Record<string, MailboxData[]>
}

export interface Stage5Payload {
  vpsMapping: Record<string, string>
}

export interface Session {
  id: string
  user_id: string
  stage: number
  payload: {
    stage1?: Stage1Payload
    stage2?: Stage2Payload
    stage3?: Stage3Payload
    stage4?: Stage4Payload
    stage5?: Stage5Payload
    completedStages?: number[]
    [key: string]: unknown
  }
  created_at: string
  updated_at: string
}

export interface MailboxData {
  email: string
  password: string
  firstName: string
  fullName: string
}

export interface Plan {
  id: string
  session_id: string
  user_id: string
  created_at: string
  summary: Record<string, unknown>
}

export interface PlanDomain {
  id: string
  plan_id: string
  domain: string
  ip: string
  vps_provider: string | null
  vps_config_id: string | null
  cf_account_id: string | null
  cf_zone_id: string | null
  dkim_key: string | null
  total_inboxes: number | null
  created_at: string
}

export interface PlanSubdomain {
  id: string
  domain_id: string
  subdomain: string
  full_subdomain: string
  inbox_count: number
  created_at: string
}

export interface Mailbox {
  id: string
  subdomain_id: string
  email: string
  first_name: string | null
  full_name: string | null
  password: string | null
  status: MailboxStatus
  error_message: string | null
  created_at: string
}

export interface RangeSettings {
  minSubdomains: number
  maxSubdomains: number
  minInboxes: number
  maxInboxes: number
}

export interface Job {
  id: string
  plan_id: string
  job_type: JobType
  entity_type: string | null
  entity_id: string | null
  status: JobStatus
  attempts: number
  error_message: string | null
  result: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface DNSRecord {
  id: string
  domain_id: string
  subdomain_id: string | null
  record_name: string
  record_type: string
  record_content: string
  cf_record_id: string | null
  status: DNSStatus
  is_dkim: boolean
  created_at: string
}
