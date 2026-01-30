
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
try {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const envVars: Record<string, string> = {}

    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
            let value = match[2].trim()
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            envVars[match[1].trim()] = value
        }
    })

    const supabase = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL!,
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.from('brands').select('name, favicon_url').then(({ data, error }) => {
        if (error) {
            console.error('DB Error:', error.message)
            return
        }
        console.log('--- START BRAND CHECK ---')
        data?.forEach((b: any) => {
            const url = b.favicon_url || ''
            const isValid = url.startsWith('http')
            console.log(`Brand: ${b.name}`)
            console.log(`URL:   ${url} (Length: ${url.length})`)
            console.log(`Valid: ${isValid ? 'YES' : 'NO'}`)
            console.log('---')
        })
        console.log('--- END BRAND CHECK ---')
    })
} catch (err) {
    console.error('Setup Error:', err)
}
