'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { DomainEntry } from './manual-entry'
import { isValidDomain, isValidIPv4 } from '@/lib/validators'
import { cn } from '@/lib/utils'

interface CSVUploadProps {
  onUpload: (entries: DomainEntry[]) => void
}

export function CSVUpload({ onUpload }: CSVUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        const entries: DomainEntry[] = []
        const errors: string[] = []

        rows.forEach((row, index) => {
          const domain = row.domain || row.Domain || ''
          const ip = row.ip || row.IP || row.address || ''
          const vpsProvider = row.vps_provider || row.vpsProvider || 'mailcow'

          if (!domain || !ip) {
            errors.push(`Row ${index + 1}: Missing required columns (domain, ip)`)
            return
          }

          if (!isValidDomain(domain)) {
            errors.push(`Row ${index + 1}: Invalid domain "${domain}"`)
          }

          if (!isValidIPv4(ip)) {
            errors.push(`Row ${index + 1}: Invalid IP "${ip}"`)
          }

          entries.push({
            id: crypto.randomUUID(),
            domain: domain.toLowerCase().trim(),
            ip: ip.trim(),
            vpsProvider: vpsProvider.toLowerCase().trim()
          })
        })

        if (errors.length > 0) {
          setError(errors.slice(0, 3).join(', ') + (errors.length > 3 ? ` and ${errors.length - 3} more...` : ''))
        } else {
          onUpload(entries)
        }
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message)
      }
    })
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  })

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 transition-all duration-300 cursor-pointer group",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 rounded-2xl bg-primary/10 p-5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {isDragActive ? 'Drop the file here' : 'Import from CSV'}
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Drag and drop your domain list here or click to browse.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-card border border-border text-muted-foreground uppercase tracking-wider">domain</span>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-card border border-border text-muted-foreground uppercase tracking-wider">ip</span>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-card border border-border text-muted-foreground uppercase tracking-wider">vps_provider</span>
          </div>
        </div>
      </div>

      {fileName && (
        <div className={cn(
          "flex items-center justify-between rounded-xl p-5 animate-in slide-in-from-left-2 duration-300",
          error ? "bg-destructive/10 border border-destructive/20 text-destructive" : "bg-green-500/10 border border-green-500/20 text-green-600"
        )}>
          <div className="flex items-center">
            {error ? (
              <AlertCircle className="h-5 w-5 mr-4" />
            ) : (
              <CheckCircle2 className="h-5 w-5 mr-4" />
            )}
            <div>
              <p className="text-sm font-bold">{fileName}</p>
              {error && <p className="text-xs font-medium opacity-80 mt-1">{error}</p>}
              {!error && <p className="text-xs font-medium opacity-80 mt-1">Successfully parsed and ready to forge.</p>}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setFileName(null); setError(null); }}
            className="hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
